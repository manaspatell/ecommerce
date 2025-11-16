const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Inquiry = require('../models/Inquiry');
const Article = require('../models/Article');
const Banner = require('../models/Banner');
const Testimonial = require('../models/Testimonial');
const Newsletter = require('../models/Newsletter');

// Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.render('admin/login', { error: 'Invalid credentials' });
    }

    req.session.admin = {
      id: admin._id,
      username: admin.username,
      role: admin.role
    };

    res.redirect('/admin/dashboard');
  } catch (error) {
    res.render('admin/login', { error: 'Login failed' });
  }
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
};

// Dashboard
exports.dashboard = async (req, res) => {
  try {
    const [
      totalProducts,
      totalCategories,
      totalInquiries,
      totalArticles,
      newInquiries,
      activeProducts,
      recentInquiries,
      categoryStats
    ] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Inquiry.countDocuments(),
      Article.countDocuments(),
      Inquiry.countDocuments({ status: 'new' }),
      Product.countDocuments({ status: 'active' }),
      Inquiry.find().sort({ created_at: -1 }).limit(5).populate('product_ids'),
      Product.aggregate([
        { $group: { _id: '$category_id', count: { $sum: 1 } } },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
        { $unwind: '$category' },
        { $project: { name: '$category.name', count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    res.render('admin/dashboard', {
      totalProducts,
      totalCategories,
      totalInquiries,
      totalArticles,
      newInquiries,
      activeProducts,
      recentInquiries,
      categoryStats
    });
  } catch (error) {
    console.error(error);
    res.render('admin/dashboard', { error: 'Failed to load dashboard' });
  }
};

