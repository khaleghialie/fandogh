"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlignLeft,
  ChevronDown,
  Grip,
  LayoutDashboard,
  ListTodo,
  MoreHorizontal,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  addCard,
  Board,
  BoardCard,
  BoardColumn,
  createBoard,
  deleteCard,
  initialBoard,
  moveCard,
  renameColumn,
} from "@/lib/board";

type CardModalState = {
  columnId: string;
} | null;

function BoardCardView({
  card,
  columnId,
  onDelete,
}: {
  card: BoardCard;
  columnId: string;
  onDelete: (cardId: string) => void;
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: card.id,
    data: { columnId },
  });

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`task-card${isDragging ? " task-card--dragging" : ""}`}
      data-testid={`card-${card.id}`}
    >
      <div className="task-card__topline">
        <span className="task-card__tag">
          <span className="task-card__tag-dot" />
          Task
        </span>
        <button
          type="button"
          className="icon-button task-card__more"
          aria-label={`Delete card ${card.title}`}
          onClick={() => onDelete(card.id)}
        >
          <Trash2 size={15} />
        </button>
      </div>
      <h3 className="task-card__title">{card.title}</h3>
      {card.details && <p className="task-card__details">{card.details}</p>}
      <div className="task-card__footer">
        <div className="task-card__activity">
          <AlignLeft size={14} />
          <span>Details</span>
        </div>
        <button
          type="button"
          className="drag-handle"
          aria-label={`Move card ${card.title}`}
          {...attributes}
          {...listeners}
        >
          <Grip size={16} />
        </button>
      </div>
    </article>
  );
}

function BoardColumnView({
  column,
  onAddCard,
  onDeleteCard,
  onRename,
}: {
  column: BoardColumn;
  onAddCard: (columnId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onRename: (columnId: string, title: string) => void;
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(column.title);
  const { isOver, setNodeRef } = useDroppableColumn(column.id);
  const cardIds = useMemo(() => column.cards.map((card) => card.id), [column.cards]);

  function saveTitle() {
    onRename(column.id, draftTitle);
    setDraftTitle(column.title.trim() ? draftTitle.trim() : column.title);
    setIsRenaming(false);
  }

  function handleRenameKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") saveTitle();
    if (event.key === "Escape") {
      setDraftTitle(column.title);
      setIsRenaming(false);
    }
  }

  return (
    <section
      ref={setNodeRef}
      className={`board-column${isOver ? " board-column--over" : ""}`}
      aria-label={`Column ${column.title}`}
    >
      <header className="column-header">
        <div className="column-heading">
          <span className={`column-indicator column-indicator--${column.id}`} />
          {isRenaming ? (
            <input
              autoFocus
              className="column-rename-input"
              aria-label="Column name"
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              onBlur={saveTitle}
              onKeyDown={handleRenameKeyDown}
              maxLength={28}
            />
          ) : (
            <button
              type="button"
              className="column-title-button"
              onClick={() => {
                setDraftTitle(column.title);
                setIsRenaming(true);
              }}
              aria-label={`Rename column ${column.title}`}
            >
              <span className="column-title">{column.title}</span>
              <span className="column-count">{column.cards.length}</span>
            </button>
          )}
        </div>
        <button
          type="button"
          className="icon-button column-menu"
          aria-label={`Add card to ${column.title}`}
          onClick={() => onAddCard(column.id)}
        >
          <Plus size={17} />
        </button>
      </header>
      <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
        <div className="column-cards">
          {column.cards.map((card) => (
            <BoardCardView
              key={card.id}
              card={card}
              columnId={column.id}
              onDelete={onDeleteCard}
            />
          ))}
          {column.cards.length === 0 && (
            <div className="column-empty">Drop a task here</div>
          )}
        </div>
      </SortableContext>
      <button
        type="button"
        className="column-add"
        onClick={() => onAddCard(column.id)}
      >
        <Plus size={16} />
        <span>Add a task</span>
      </button>
    </section>
  );
}

function useDroppableColumn(columnId: string) {
  return useDroppable({
    id: `column:${columnId}`,
    data: { columnId },
  });
}

function NewCardDialog({
  columns,
  initialColumnId,
  onClose,
  onCreate,
}: {
  columns: BoardColumn[];
  initialColumnId: string;
  onClose: () => void;
  onCreate: (columnId: string, title: string, details: string) => void;
}) {
  const [columnId, setColumnId] = useState(initialColumnId);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    onCreate(columnId, title.trim(), details.trim());
  }

  return (
    <div className="dialog-backdrop" onMouseDown={onClose}>
      <section
        className="card-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="card-dialog__header">
          <div>
            <span className="eyebrow">New task</span>
            <h2 id="dialog-title">Add a task to your board</h2>
          </div>
          <button type="button" className="icon-button" aria-label="Close" onClick={onClose}>
            <X size={20} />
          </button>
        </header>
        <form onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Task title</span>
            <input
              autoFocus
              required
              maxLength={90}
              placeholder="e.g. Draft the welcome screen"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>Details</span>
            <textarea
              rows={4}
              maxLength={360}
              placeholder="Add a few helpful details..."
              value={details}
              onChange={(event) => setDetails(event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>Stage</span>
            <select value={columnId} onChange={(event) => setColumnId(event.target.value)}>
              {columns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.title}
                </option>
              ))}
            </select>
          </label>
          <div className="card-dialog__actions">
            <button type="button" className="button button--quiet" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button button--primary">
              <Plus size={17} />
              Add task
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function NewBoardDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (title: string) => void;
}) {
  const [title, setTitle] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    onCreate(title.trim());
  }

  return (
    <div className="dialog-backdrop" onMouseDown={onClose}>
      <section
        className="card-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-board-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="card-dialog__header">
          <div>
            <span className="eyebrow">New board</span>
            <h2 id="new-board-title">Create a project board</h2>
          </div>
          <button type="button" className="icon-button" aria-label="Close" onClick={onClose}>
            <X size={20} />
          </button>
        </header>
        <form onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Board name</span>
            <input
              autoFocus
              required
              maxLength={60}
              placeholder="e.g. Website Refresh"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <p className="board-dialog-hint">
            Your board starts with five stages: Inbox, To Do, In Progress, Review, and Done.
          </p>
          <div className="card-dialog__actions">
            <button type="button" className="button button--quiet" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button button--primary">
              <Plus size={17} />
              Create board
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function Home() {
  const [boards, setBoards] = useState<Board[]>([initialBoard]);
  const [activeBoardId, setActiveBoardId] = useState(initialBoard.id);
  const [boardModal, setBoardModal] = useState(false);
  const [cardModal, setCardModal] = useState<CardModalState>(null);
  const [activeCard, setActiveCard] = useState<BoardCard | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const activeBoard = boards.find((board) => board.id === activeBoardId) ?? boards[0];
  const columns = activeBoard.columns;
  const cardCount = columns.reduce((total, column) => total + column.cards.length, 0);

  function updateActiveColumns(
    update: (current: BoardColumn[]) => BoardColumn[],
  ) {
    setBoards((current) =>
      current.map((board) =>
        board.id === activeBoardId
          ? { ...board, columns: update(board.columns) }
          : board,
      ),
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const sourceColumn = columns.find((column) =>
      column.cards.some((card) => card.id === activeId),
    );
    const targetColumnId =
      typeof over.data.current?.columnId === "string"
        ? over.data.current.columnId
        : columns.find((column) => column.cards.some((card) => card.id === overId))?.id;

    if (!sourceColumn || !targetColumnId) return;
    const targetColumn = columns.find((column) => column.id === targetColumnId);
    if (!targetColumn) return;
    if (sourceColumn.id === targetColumnId && overId === activeId) return;

    const targetIndex =
      overId.startsWith("column:")
        ? targetColumn.cards.length
        : targetColumn.cards.findIndex((card) => card.id === overId);

    setColumns((current) =>
      moveCard(
        current,
        activeId,
        targetColumnId,
        targetIndex < 0 ? undefined : targetIndex,
      ),
    );
  }

  function handleCreateBoard(title: string) {
    const board = createBoard(crypto.randomUUID(), title);
    if (!board) return;
    setBoards((current) => [...current, board]);
    setActiveBoardId(board.id);
    setBoardModal(false);
  }

  function handleCreateCard(columnId: string, title: string, details: string) {
    updateActiveColumns((current) =>
      addCard(current, columnId, {
        id: crypto.randomUUID(),
        title,
        details,
      }),
    );
    setCardModal(null);
  }

  return (
    <main className="app-shell" dir="ltr">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <LayoutDashboard size={21} strokeWidth={2.2} />
          </span>
          <span className="brand-name">Fandogh</span>
          <span className="brand-plan">WORKSPACE</span>
        </div>

        <div className="workspace-picker">
          <span className="workspace-avatar">F</span>
          <span className="workspace-copy">
            <span className="workspace-label">WORKSPACE</span>
            <strong>Alieh&apos;s workspace</strong>
          </span>
          <ChevronDown size={16} />
        </div>

        <nav className="side-nav" aria-label="Workspace boards">
          <div className="nav-section-heading">
            <span className="nav-section-label">YOUR BOARDS</span>
            <button
              type="button"
              className="icon-button sidebar-add"
              aria-label="Create board"
              onClick={() => setBoardModal(true)}
            >
              <Plus size={16} />
            </button>
          </div>
          {boards.map((board) => (
            <button
              type="button"
              key={board.id}
              className={`side-nav__item${board.id === activeBoardId ? " side-nav__item--active" : ""}`}
              aria-current={board.id === activeBoardId ? "page" : undefined}
              onClick={() => setActiveBoardId(board.id)}
            >
              <LayoutDashboard size={17} />
              <span>{board.title}</span>
              <span className="nav-count">{board.columns.reduce((total, column) => total + column.cards.length, 0)}</span>
            </button>
          ))}
          <button
            type="button"
            className="side-nav__item side-nav__item--create"
            onClick={() => setBoardModal(true)}
          >
            <Plus size={17} />
            <span>Create a board</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-icon"><Sparkles size={16} /></span>
            <strong>Keep the work moving.</strong>
            <span>Small steps add up.</span>
          </div>
          <div className="profile">
            <span className="profile-avatar">AK</span>
            <span className="profile-copy">
              <strong>Alieh Khaleghi</strong>
              <span>Workspace owner</span>
            </span>
            <MoreHorizontal size={19} />
          </div>
        </div>
      </aside>

      <section className="main-area" id="board">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-separator">/</span>
            <strong>{activeBoard.title}</strong>
          </div>
          <div className="topbar-actions">
            <button
              type="button"
              className="button button--topbar"
              onClick={() => setBoardModal(true)}
            >
              <Plus size={16} />
              Create
            </button>
            <span className="topbar-divider" />
            <span className="topbar-avatar">AK</span>
          </div>
        </header>

        <div className="board-content">
          <section className="board-intro">
            <div className="board-intro__copy">
              <div className="board-kicker">
                <span className="board-kicker-dot" />
                YOUR PROJECT BOARD
              </div>
              <h1>{activeBoard.title}</h1>
              <p>Keep every project moving, one task at a time.</p>
            </div>
            <div className="board-intro__actions">
              <div className="team-avatars" aria-label="Project members">
                <span className="team-avatar team-avatar--one">A</span>
                <span className="team-avatar team-avatar--two">J</span>
                <span className="team-avatar team-avatar--three">M</span>
                <span className="team-avatar team-avatar--more">+2</span>
              </div>
              <span className="intro-divider" />
              <button
                type="button"
                className="button button--primary board-add-button"
                onClick={() => setCardModal({ columnId: columns[0].id })}
              >
                <Plus size={18} />
                Add a task
              </button>
            </div>
          </section>

          <section className="board-summary" aria-label="Board summary">
            <div className="summary-stat">
              <span className="summary-stat__icon summary-stat__icon--blue">
                <LayoutDashboard size={17} />
              </span>
              <span><strong>{columns.length}</strong> stages</span>
            </div>
            <span className="summary-separator" />
            <div className="summary-stat">
              <span className="summary-stat__icon summary-stat__icon--purple">
                <ListTodo size={17} />
              </span>
              <span><strong>{cardCount}</strong> tasks</span>
            </div>
            <div className="summary-note">
              <span className="summary-note__dot" />
              All changes are up to date
            </div>
          </section>

          <div className="board-toolbar">
            <div className="board-view-label">
              <span className="view-icon"><LayoutDashboard size={16} /></span>
              <strong>Board view</strong>
              <ChevronDown size={15} />
            </div>
            <div className="board-toolbar__right">
              <span className="drag-hint"><Grip size={15} /> Drag and drop tasks to update their stage</span>
              <span className="toolbar-divider" />
            </div>
          </div>

          <DndContext
            id="kanban-board"
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={(event: DragStartEvent) => {
              const { active } = event;
              const card = columns
                .flatMap((column) => column.cards)
                .find((item) => item.id === active.id);
              setActiveCard(card ?? null);
            }}
            onDragCancel={() => setActiveCard(null)}
            onDragEnd={handleDragEnd}
          >
            <div className="board-columns" aria-label="Board stages">
              {columns.map((column) => (
                <BoardColumnView
                  key={column.id}
                  column={column}
                  onAddCard={(columnId) => setCardModal({ columnId })}
                  onDeleteCard={(cardId) =>
                    updateActiveColumns((current) => deleteCard(current, cardId))
                  }
                  onRename={(columnId, title) =>
                    updateActiveColumns((current) => renameColumn(current, columnId, title))
                  }
                />
              ))}
            </div>
            <DragOverlay>
              {activeCard ? (
                <div className="drag-preview">
                  <strong>{activeCard.title}</strong>
                  {activeCard.details && <span>{activeCard.details}</span>}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          <footer className="board-footer">
            <span><span className="footer-dot" /> Board is up to date</span>
            <span>Made for focused work</span>
          </footer>
        </div>
      </section>

      {cardModal && (
        <NewCardDialog
          columns={columns}
          initialColumnId={cardModal.columnId}
          onClose={() => setCardModal(null)}
          onCreate={handleCreateCard}
        />
      )}
      {boardModal && (
        <NewBoardDialog
          onClose={() => setBoardModal(false)}
          onCreate={handleCreateBoard}
        />
      )}
    </main>
  );
}
