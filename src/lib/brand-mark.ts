export const brandPalette = {
  paper: "#fafdfc",
  ink: "#182039",
  pink: "#ff5c93",
  citrus: "#ff7838",
  violet: "#9b6bff",
  yellow: "#fff056",
  mint: "#10c486",
  amber: "#ff9f1c",
} as const;

export type BrandDotColor = keyof Pick<
  typeof brandPalette,
  "pink" | "citrus" | "violet" | "yellow" | "mint" | "amber"
>;

export type BrandBurstDot = {
  readonly color: BrandDotColor;
  readonly size: number;
  readonly x: number;
  readonly y: number;
};

const ringSize = 26;
const ringRadius = 29;

function ringDot(index: number, color: BrandDotColor): BrandBurstDot {
  const angle = ((-90 + index * 60) * Math.PI) / 180;
  const centerX = 50 + Math.cos(angle) * ringRadius;
  const centerY = 50 + Math.sin(angle) * ringRadius;

  return {
    color,
    size: ringSize,
    x: centerX - ringSize / 2,
    y: centerY - ringSize / 2,
  };
}

export const brandBurstDots: readonly BrandBurstDot[] = [
  ringDot(0, "citrus"),
  ringDot(1, "violet"),
  ringDot(2, "yellow"),
  ringDot(3, "mint"),
  ringDot(4, "amber"),
  ringDot(5, "pink"),
  { color: "pink", size: 42, x: 29, y: 29 },
];
