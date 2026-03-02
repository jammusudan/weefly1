/**
 * Formats a number as Indian Rupee (INR) currency.
 * Using Intl.NumberFormat ensures the correct symbol (₹) is used and
 * follows the Indian numbering system (e.g., 1,00,000 instead of 100,000).
 */
export const formatINR = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'decimal',
        maximumFractionDigits: 0,
    }).format(amount);
};
