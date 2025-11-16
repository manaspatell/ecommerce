// Generate slug from string
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

// Truncate text
const truncate = (text, length = 100) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

module.exports = { generateSlug, formatCurrency, truncate };

