const cleanString = (input: unknown): string => {
  if (typeof input !== "string") return String(input ?? "");

  return input
    .replace(/\u00A0/g, " ") // non-breaking spaces
    .replace(/[\r\n]+/g, " ") // newlines → space
    .replace(/\s+/g, " ") // collapse whitespace
    .trim();
};

const normalizeKey = (key: string) =>
  cleanString(key)
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

export const cleanData = (
  data: Record<string, string | number>[]
): Record<string, string>[] => {
  return data.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        normalizeKey(key),
        cleanString(value)
      ])
    )
  );
};

const parseDDMMYY = (value: unknown): Date | null => {
  if (typeof value !== "string") return null;

  const [dd, mm, yy] = value.split("/").map(Number);
  if (!dd || !mm || !yy) return null;

  const fullYear = yy < 50 ? 2000 + yy : 1900 + yy;
  return new Date(fullYear, mm - 1, dd);
};

type ExpenseCreateInput = {
  date: Date;
  expense_title: string;
  amount: number;
  categoryId: number;
  userId: number;
};

export const transformToExpense = (
  rows: Record<string, unknown>[],
  userId: number,
  categoryId: number
): ExpenseCreateInput[] => {
  return rows
    .map((row): ExpenseCreateInput | null => {
      const date = parseDDMMYY(row["date"]);
      if (!date) return null;

      const title = String(row["narration"] ?? "").trim();
      if (!title) return null;

      const amount = Number(row["debit_amount"]);
      if (!Number.isFinite(amount) || amount <= 0) return null;

      return {
        date,
        expense_title: title,
        amount,
        categoryId,
        userId
      };
    })
    .filter((e): e is ExpenseCreateInput => e !== null);
};
