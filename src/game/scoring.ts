/** NES-style line clear score multipliers × current level */
export function computeLineClearScore(
  linesCleared: number,
  level: number,
): number {
  const table = [0, 100, 300, 500, 800];
  const index = Math.min(linesCleared, 4);
  return table[index]! * level;
}
