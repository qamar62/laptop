/**
 * Safely formats a price value to a string with two decimal places
 * Handles both string and number inputs
 */
export const formatPrice = (price: string | number | null | undefined): string => {
  if (price === null || price === undefined) {
    return '0.00';
  }
  
  // Convert string to number if needed
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Check if it's a valid number after conversion
  if (isNaN(numericPrice)) {
    return '0.00';
  }
  
  // Format to 2 decimal places
  return numericPrice.toFixed(2);
};
