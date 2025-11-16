const Category = require('../models/Category');
const Product = require('../models/Product');
const { generateSlug } = require('../utils/helpers');
const { sanitizeText, sanitizeHtml } = require('../middleware/validation');
const fs = require('fs');
const path = require('path');

// List all categories
exports.list = async (req, res) => {
  try {
    const categories = await Category.find().sort({ created_at: -1 });
    res.render('admin/categories/list', { categories });
  } catch (error) {
    res.render('admin/categories/list', { error: 'Failed to load categories' });
  }
};

// Show create form
exports.createForm = (req, res) => {
  res.render('admin/categories/form', { category: null });
};

// Create category
exports.create = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const image = req.file ? `/uploads/categories/${req.file.filename}` : '';

    const category = new Category({
      name: sanitizeText(name),
      slug: generateSlug(name),
      description: description ? sanitizeHtml(description) : '',
      image,
      status: (status === 'active' || status === 'inactive') ? status : 'active'
    });

    await category.save();
    res.redirect('/admin/categories');
  } catch (error) {
    console.error(error);
    res.render('admin/categories/form', { 
      category: null, 
      error: 'Failed to create category' 
    });
  }
};

// Show edit form
exports.editForm = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    res.render('admin/categories/form', { category });
  } catch (error) {
    res.redirect('/admin/categories');
  }
};

// Update category
exports.update = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.redirect('/admin/categories');
    }

    category.name = sanitizeText(name);
    category.slug = generateSlug(name);
    category.description = description ? sanitizeHtml(description) : category.description;
    category.status = (status === 'active' || status === 'inactive') ? status : category.status;

    if (req.file) {
      // Delete old image
      if (category.image) {
        const oldPath = path.join(__dirname, '..', 'public', category.image);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (err) {
            console.error('Error deleting old image:', err);
          }
        }
      }
      category.image = `/uploads/categories/${req.file.filename}`;
    }

    await category.save();
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Error updating category:', error);
    res.render('admin/categories/form', {
      category: await Category.findById(req.params.id),
      error: 'Failed to update category: ' + error.message
    });
  }
};

// Delete category
exports.delete = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (category) {
      // Check if category has products
      const productCount = await Product.countDocuments({ category_id: category._id });
      
      if (productCount > 0) {
        return res.json({ 
          success: false, 
          error: 'Cannot delete category with existing products' 
        });
      }

      // Delete image
      if (category.image) {
        const imagePath = path.join(__dirname, '..', 'public', category.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      
      await Category.findByIdAndDelete(req.params.id);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

