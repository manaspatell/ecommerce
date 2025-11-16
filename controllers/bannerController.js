const Banner = require('../models/Banner');
const fs = require('fs');
const path = require('path');

// List all banners
exports.list = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, created_at: -1 });
    res.render('admin/banners/list', { banners });
  } catch (error) {
    res.render('admin/banners/list', { error: 'Failed to load banners' });
  }
};

// Show create form
exports.createForm = (req, res) => {
  res.render('admin/banners/form', { banner: null });
};

// Create banner
exports.create = async (req, res) => {
  try {
    const { title, subtitle, link, status, order } = req.body;
    
    if (!req.file) {
      return res.render('admin/banners/form', { 
        banner: null, 
        error: 'Image is required' 
      });
    }

    const banner = new Banner({
      title,
      subtitle,
      image: `/uploads/banners/${req.file.filename}`,
      link: link || '',
      status: status || 'active',
      order: parseInt(order) || 0
    });

    await banner.save();
    res.redirect('/admin/banners');
  } catch (error) {
    console.error(error);
    res.render('admin/banners/form', { 
      banner: null, 
      error: 'Failed to create banner' 
    });
  }
};

// Show edit form
exports.editForm = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    res.render('admin/banners/form', { banner });
  } catch (error) {
    res.redirect('/admin/banners');
  }
};

// Update banner
exports.update = async (req, res) => {
  try {
    const { title, subtitle, link, status, order } = req.body;
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.redirect('/admin/banners');
    }

    banner.title = title;
    banner.subtitle = subtitle;
    banner.link = link || '';
    banner.status = status || 'active';
    banner.order = parseInt(order) || 0;

    if (req.file) {
      // Delete old image
      if (banner.image) {
        const oldPath = path.join(__dirname, '..', 'public', banner.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      banner.image = `/uploads/banners/${req.file.filename}`;
    }

    await banner.save();
    res.redirect('/admin/banners');
  } catch (error) {
    console.error(error);
    res.redirect('/admin/banners');
  }
};

// Delete banner
exports.delete = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    
    if (banner) {
      // Delete image
      if (banner.image) {
        const imagePath = path.join(__dirname, '..', 'public', banner.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      
      await Banner.findByIdAndDelete(req.params.id);
    }
    
    res.redirect('/admin/banners');
  } catch (error) {
    res.redirect('/admin/banners');
  }
};

