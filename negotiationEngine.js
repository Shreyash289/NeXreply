export function calculateOffer(product) {
  const discount = Math.floor(Math.random() * 3000) + 1000;
  const offer = Math.max(product.min_price, product.price - discount);

  return { offer };
}
