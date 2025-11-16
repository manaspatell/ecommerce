const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');

// Search suggestions API
router.get('/search-suggestions', async (req, res) => {
  try {
    const query = (req.query.q || '').trim();
    if (!query || query.length < 2) {
      return res.json({ categories: [], products: [] });
    }

    const searchRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    
    // Get matching categories
    const categories = await Category.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex }
      ],
      status: 'active'
    }).limit(5).select('name slug image').lean();

    // Get matching products
    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex }
      ],
      status: 'active'
    }).limit(5).select('name slug images price category_id').populate('category_id', 'name slug').lean();

    res.json({ categories: categories || [], products: products || [] });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.json({ categories: [], products: [] });
  }
});

module.exports = router;

