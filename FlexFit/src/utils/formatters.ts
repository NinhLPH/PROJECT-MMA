export function formatVnd(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

export function formatDateVi(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
  if (
    date.getFullYear() !== Number(match[1])
    || date.getMonth() !== Number(match[2]) - 1
    || date.getDate() !== Number(match[3])
  ) {
    return value;
  }

  const formatted = new Intl.DateTimeFormat("vi-VN", { dateStyle: "full" }).format(date);
  return formatted.charAt(0).toLocaleUpperCase("vi") + formatted.slice(1);
}
