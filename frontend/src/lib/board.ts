export type BoardCard = {
  id: string;
  title: string;
  details: string;
};

export type BoardColumn = {
  id: string;
  title: string;
  cards: BoardCard[];
};

export type Board = {
  id: string;
  title: string;
  columns: BoardColumn[];
};

export const initialColumns: BoardColumn[] = [
  {
    id: "ideas",
    title: "Inbox",
    cards: [
      {
        id: "card-01",
        title: "Map the first-time user journey",
        details: "Outline the key moments from signup to the first successful project.",
      },
      {
        id: "card-02",
        title: "Collect early customer feedback",
        details: "Prepare a short interview guide and schedule a few conversations.",
      },
    ],
  },
  {
    id: "planning",
    title: "To Do",
    cards: [
      {
        id: "card-03",
        title: "Sketch the onboarding flow",
        details: "Explore a clear path that helps new teams get started quickly.",
      },
      {
        id: "card-04",
        title: "Set launch success metrics",
        details: "Agree on a small set of outcomes to review after launch.",
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    cards: [
      {
        id: "card-05",
        title: "Build the shared UI kit",
        details: "Create consistent buttons, form fields, and board cards.",
      },
      {
        id: "card-06",
        title: "Refine the mobile board",
        details: "Make the board comfortable to scan and use on smaller screens.",
      },
    ],
  },
  {
    id: "review",
    title: "Review",
    cards: [
      {
        id: "card-07",
        title: "Review the account settings",
        details: "Check the latest layout and keyboard navigation before release.",
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    cards: [
      {
        id: "card-08",
        title: "Set up the project workspace",
        details: "The team space and initial project structure are ready.",
      },
    ],
  },
];

export const initialBoard: Board = {
  id: "product-launch",
  title: "Product Launch",
  columns: initialColumns,
};

export function createBoard(id: string, title: string): Board | null {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) return null;

  return {
    id,
    title: trimmedTitle,
    columns: [
      { id: `${id}-inbox`, title: "Inbox", cards: [] },
      { id: `${id}-planning`, title: "To Do", cards: [] },
      { id: `${id}-in-progress`, title: "In Progress", cards: [] },
      { id: `${id}-review`, title: "Review", cards: [] },
      { id: `${id}-done`, title: "Done", cards: [] },
    ],
  };
}

export function renameColumn(
  columns: BoardColumn[],
  columnId: string,
  title: string,
): BoardColumn[] {
  const nextTitle = title.trim();
  if (!nextTitle) return columns;

  return columns.map((column) =>
    column.id === columnId ? { ...column, title: nextTitle } : column,
  );
}

export function addCard(
  columns: BoardColumn[],
  columnId: string,
  card: BoardCard,
): BoardColumn[] {
  return columns.map((column) =>
    column.id === columnId
      ? { ...column, cards: [...column.cards, card] }
      : column,
  );
}

export function deleteCard(
  columns: BoardColumn[],
  cardId: string,
): BoardColumn[] {
  return columns.map((column) => ({
    ...column,
    cards: column.cards.filter((card) => card.id !== cardId),
  }));
}

export function moveCard(
  columns: BoardColumn[],
  cardId: string,
  targetColumnId: string,
  targetIndex?: number,
): BoardColumn[] {
  const sourceColumn = columns.find((column) =>
    column.cards.some((card) => card.id === cardId),
  );
  const destinationColumn = columns.find(
    (column) => column.id === targetColumnId,
  );
  if (!sourceColumn || !destinationColumn) return columns;

  const sourceIndex = sourceColumn.cards.findIndex(
    (card) => card.id === cardId,
  );
  const card = sourceColumn.cards[sourceIndex];
  if (sourceColumn.id === destinationColumn.id && targetIndex === sourceIndex) {
    return columns;
  }

  const nextColumns = columns.map((column) => ({
    ...column,
    cards: [...column.cards],
  }));
  const nextSource = nextColumns.find(
    (column) => column.id === sourceColumn.id,
  )!;
  const nextDestination = nextColumns.find(
    (column) => column.id === destinationColumn.id,
  )!;
  nextSource.cards.splice(sourceIndex, 1);

  const insertionIndex =
    targetIndex === undefined
      ? nextDestination.cards.length
      : Math.max(
          0,
          Math.min(targetIndex, nextDestination.cards.length),
        );
  nextDestination.cards.splice(insertionIndex, 0, card);

  return nextColumns;
}
