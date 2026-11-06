import { describe, expect, it } from "vitest";
import {
  addCard,
  createBoard,
  deleteCard,
  initialBoard,
  initialColumns,
  moveCard,
  renameColumn,
} from "./board";

const card = { id: "new-card", title: "A new task", details: "Helpful context" };

describe("board operations", () => {
  it("starts with five workflow stages and sample tasks", () => {
    expect(initialColumns).toHaveLength(5);
    expect(initialColumns.flatMap((column) => column.cards).length).toBeGreaterThan(0);
    expect(initialBoard.title).toBe("Product Launch");
  });

  it("creates an empty board with five workflow stages", () => {
    const board = createBoard("board-2", "  Website Refresh  ");

    expect(board?.title).toBe("Website Refresh");
    expect(board?.columns.map((column) => column.title)).toEqual([
      "Inbox",
      "To Do",
      "In Progress",
      "Review",
      "Done",
    ]);
    expect(board?.columns.every((column) => column.cards.length === 0)).toBe(true);
    expect(createBoard("board-3", "   ")).toBeNull();
  });

  it("renames a column and ignores a blank name", () => {
    const renamed = renameColumn(initialColumns, "ideas", "Research");

    expect(renamed[0].title).toBe("Research");
    expect(renameColumn(renamed, "ideas", "   ")).toBe(renamed);
    expect(renamed).toHaveLength(5);
  });

  it("adds a card only to the selected column", () => {
    const next = addCard(initialColumns, "planning", card);

    expect(next[1].cards.at(-1)).toEqual(card);
    expect(next[0].cards).toBe(initialColumns[0].cards);
    expect(next).toHaveLength(5);
  });

  it("deletes a card without changing the column count", () => {
    const next = deleteCard(initialColumns, "card-01");

    expect(next[0].cards.some((item) => item.id === "card-01")).toBe(false);
    expect(next).toHaveLength(5);
  });

  it("moves a card between columns and inserts it at the requested position", () => {
    const next = moveCard(initialColumns, "card-01", "planning", 1);
    const destination = next.find((column) => column.id === "planning");
    const source = next.find((column) => column.id === "ideas");

    expect(source?.cards.map((item) => item.id)).not.toContain("card-01");
    expect(destination?.cards.map((item) => item.id)).toEqual([
      "card-03",
      "card-01",
      "card-04",
    ]);
    expect(next).toHaveLength(5);
  });

  it("reorders a card in the same column", () => {
    const next = moveCard(initialColumns, "card-01", "ideas", 1);

    expect(next[0].cards.map((item) => item.id)).toEqual(["card-02", "card-01"]);
  });

  it("leaves the board unchanged when a card or destination does not exist", () => {
    expect(moveCard(initialColumns, "missing-card", "ideas")).toBe(initialColumns);
    expect(moveCard(initialColumns, "card-01", "missing-column")).toBe(initialColumns);
  });
});
