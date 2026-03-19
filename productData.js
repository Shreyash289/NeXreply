export const products = {
  iphone14: {
    id: "iphone14",
    name: "iPhone 14",
    price: 65000,
    min_price: 62000
  }
};

export function getProductFromMessage(message) {
  if (message.toLowerCase().includes("iphone")) return products.iphone14;
  return null;
}
