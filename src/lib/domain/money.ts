const MONEY_SCALE = 2;

const normalizeMoneyInput = (value: number | string): string => {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("Money value must be finite.");
    }

    return value.toFixed(MONEY_SCALE);
  }

  const trimmed = value.trim();

  if (!/^-?\d+(\.\d{1,2})?$/.test(trimmed)) {
    throw new Error("Money value must be a decimal with up to two fractional digits.");
  }

  return Number(trimmed).toFixed(MONEY_SCALE);
};

export const toMoneyString = (value: number | string): string =>
  normalizeMoneyInput(value);

export const parseMoney = (value: number | string): number =>
  Number(normalizeMoneyInput(value));

export const multiplyMoney = (unitPrice: number | string, quantity: number): number => {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive integer.");
  }

  const unitCents = Math.round(parseMoney(unitPrice) * 100);
  return (unitCents * quantity) / 100;
};

export const sumMoney = (values: Array<number | string>): number => {
  const totalCents = values.reduce<number>((sum, value) => {
    return sum + Math.round(parseMoney(value) * 100);
  }, 0);

  return totalCents / 100;
};
