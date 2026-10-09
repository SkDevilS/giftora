export const formatPrice = (price) => {
  if (price === null || price === undefined || isNaN(price)) {
    return '₹0';
  }
  return `₹${Number(price).toLocaleString('en-IN')}`;
};

export const formatPriceWithDecimals = (price) => {
  if (price === null || price === undefined || isNaN(price)) {
    return '₹0.00';
  }
  return `₹${Number(price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

