import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("shows a board with five stages and sample tasks", async ({ page }) => {
  await expect(page.locator(".board-column")).toHaveCount(5);
  await expect(page.getByText("Map the first-time user journey")).toBeVisible();
  await expect(page.getByText("Set up the project workspace")).toBeVisible();
});

test("creates a card in the selected column", async ({ page }) => {
  await page.getByRole("button", { name: "Add card to In Progress" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Task title").fill("Test task creation");
  await dialog.getByLabel("Details").fill("Short description");
  await dialog.getByRole("button", { name: "Add task" }).click();

  await expect(
    page.getByRole("region", { name: "Column In Progress" }).getByText("Test task creation"),
  ).toBeVisible();
});

test("renames a column and deletes a card", async ({ page }) => {
  await page.getByRole("button", { name: "Rename column Inbox" }).click();
  const renameInput = page.getByRole("textbox", { name: "Column name" });
  await renameInput.fill("New ideas");
  await renameInput.press("Enter");

  await expect(page.getByRole("region", { name: "Column New ideas" })).toBeVisible();
  await page.getByRole("button", { name: "Delete card Map the first-time user journey" }).click();
  await expect(page.getByText("Map the first-time user journey")).toHaveCount(0);
});

test("creates and switches between boards", async ({ page }) => {
  await page.getByRole("button", { name: "Create board" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Board name").fill("Website Refresh");
  await dialog.getByRole("button", { name: "Create board" }).click();

  await expect(page.getByRole("heading", { name: "Website Refresh" })).toBeVisible();
  await expect(page.locator(".board-column")).toHaveCount(5);
  await expect(page.getByText("Drop a task here").first()).toBeVisible();
  await page.getByRole("button", { name: /Product Launch/ }).click();
  await expect(page.getByRole("heading", { name: "Product Launch" })).toBeVisible();
});

test("moves a card to another column with drag and drop", async ({ page }) => {
  const card = page.getByTestId("card-card-01");
  const handle = card.getByRole("button", {
    name: "Move card Map the first-time user journey",
  });
  const target = page.getByTestId("card-card-05");
  const from = await handle.boundingBox();
  const to = await target.boundingBox();

  if (!from || !to) throw new Error("Could not locate drag-and-drop targets.");

  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2 + 5, from.y + from.height / 2, {
    steps: 2,
  });
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 12 });
  await page.mouse.up();

  await expect(page.getByRole("region", { name: "Column Inbox" }).getByTestId("card-card-01")).toHaveCount(0);
  await expect(
    page.getByRole("region", { name: "Column In Progress" }).getByTestId("card-card-01"),
  ).toBeVisible();
});
