export type TrendDirection = "up" | "down" | "stable";

export interface TrendInfo {
  symbol: "+" | "-" | "=";
  direction: TrendDirection;
  change: number;
  displayText: string;
}

export function getTrendInfo(
  direction: TrendDirection,
  change: number
): TrendInfo {
  const absChange = Math.abs(change);

  switch (direction) {
    case "up":
      return {
        symbol: "+",
        direction: "up",
        change,
        displayText: `Trending up by ${absChange}%`
      };
    case "down":
      return {
        symbol: "-",
        direction: "down",
        change,
        displayText: `Trending down by ${absChange}%`
      };
    case "stable":
    default:
      return {
        symbol: "=",
        direction: "stable",
        change: 0,
        displayText: "No significant change"
      };
  }
}

export function getTrendSymbol(direction: TrendDirection): "+" | "-" | "=" {
  switch (direction) {
    case "up":
      return "+";
    case "down":
      return "-";
    case "stable":
    default:
      return "=";
  }
}

export function formatTrendText(
  direction: TrendDirection,
  change: number,
  label?: string
): string {
  const info = getTrendInfo(direction, change);
  return label ? `${info.displayText} in ${label}` : info.displayText;
}
