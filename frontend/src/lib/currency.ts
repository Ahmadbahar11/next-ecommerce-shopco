export function formatPrice(amount: number) {
  return `Rs ${Math.round(amount).toLocaleString("en-PK")}`;
}
