export function measureLabel(text: string): {
  width: number;
  height: number;
} {
  const width = Math.max(24, text.length * 7);

  return { width, height: 14 };
}
