export type TrendDirection = "up" | "down" | "stable";

export interface TrendInfo {
  symbol: "+" | "-" | "=";
  direction: TrendDirection;
  change: number;
  displayText: string;
}

/**
 * Get trend information with symbol and formatted display text
 * @param direction - Trend direction (up/down/stable)
 * @param change - Percentage change value
 * @returns Trend information object
 */
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

/**
 * Get trend symbol based on direction
 * @param direction - Trend direction (up/down/stable)
 * @returns Symbol representing the trend
 */
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

/**
 * Format trend change text
 * @param direction - Trend direction
 * @param change - Percentage change
 * @param label - Optional label to append (e.g., "this month")
 * @returns Formatted text string
 */
export function formatTrendText(
  direction: TrendDirection,
  change: number,
  label?: string
): string {
  const info = getTrendInfo(direction, change);
  return label ? `${info.displayText} in ${label}` : info.displayText;
}
