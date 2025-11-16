const Article = require('../models/Article');
const { generateSlug, truncate } = require('../utils/helpers');
const { sanitizeText, sanitizeHtml } = require('../middleware/validation');
const fs = require('fs');
const path = require('path');

// List all articles (Admin)
exports.listAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const articles = await Article.find()
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Article.countDocuments();

    res.render('admin/articles/list', {
      articles,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.render('admin/articles/list', { error: 'Failed to load articles' });
  }
};

// Show create form
exports.createForm = (req, res) => {
  res.render('admin/articles/form', { article: null });
};

// Create article
exports.create = async (req, res) => {
  try {
    const { title, content, excerpt, tags, category, status } = req.body;
    const image = req.file ? `/uploads/articles/${req.file.filename}` : '';
    const tagArray = tags ? tags.split(',').map(t => sanitizeText(t.trim())).filter(t => t) : [];

    const article = new Article({
      title: sanitizeText(title),
      slug: generateSlug(title),
      content: sanitizeHtml(content),
      excerpt: excerpt ? sanitizeText(excerpt) : truncate(content, 150),
      image,
      tags: tagArray,
      category: sanitizeText(category || 'general'),
      status: (status === 'published' || status === 'draft') ? status : 'draft'
    });

    await article.save();
    res.redirect('/admin/articles');
  } catch (error) {
    console.error(error);
    res.render('admin/articles/form', { 
      article: null, 
      error: 'Failed to create article' 
    });
  }
};

// Show edit form
exports.editForm = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    res.render('admin/articles/form', { article });
  } catch (error) {
    res.redirect('/admin/articles');
  }
};

// Update article
exports.update = async (req, res) => {
  try {
    const { title, content, excerpt, tags, category, status } = req.body;
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.redirect('/admin/articles');
    }

    const tagArray = tags ? tags.split(',').map(t => t.trim()) : '';

    article.title = title;
    article.slug = generateSlug(title);
    article.content = content;
    article.excerpt = excerpt || truncate(content, 150);
    article.tags = tagArray;
    article.category = category || 'general';
    article.status = status || 'draft';
    article.updated_at = Date.now();

    if (req.file) {
      // Delete old image
      if (article.image) {
        const oldPath = path.join(__dirname, '..', 'public', article.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      article.image = `/uploads/articles/${req.file.filename}`;
    }

    await article.save();
    res.redirect('/admin/articles');
  } catch (error) {
    console.error(error);
    res.redirect('/admin/articles');
  }
};

// Delete article
exports.delete = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (article) {
      // Delete image
      if (article.image) {
        const imagePath = path.join(__dirname, '..', 'public', article.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      
      await Article.findByIdAndDelete(req.params.id);
    }
    
    res.redirect('/admin/articles');
  } catch (error) {
    res.redirect('/admin/articles');
  }
};

// View article (Customer)
exports.view = async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug, status: 'published' });
    
    if (!article) {
      return res.status(404).render('customer/404');
    }

    // Increment views
    article.views += 1;
    await article.save();

    // Get related articles
    const relatedArticles = await Article.find({
      _id: { $ne: article._id },
      status: 'published',
      $or: [
        { category: article.category },
        { tags: { $in: article.tags } }
      ]
    }).limit(3).sort({ views: -1 });

    res.render('customer/pages/article', { article, relatedArticles });
  } catch (error) {
    res.status(404).render('customer/404');
  }
};

// List articles (Customer)
exports.list = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const skip = (page - 1) * limit;
    const category = req.query.category || 'all';

    const query = { status: 'published' };
    if (category !== 'all') {
      query.category = category;
    }

    const articles = await Article.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Article.countDocuments(query);
    const categories = await Article.distinct('category', { status: 'published' });

    res.render('customer/pages/blog', {
      articles,
      categories,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
      currentCategory: category
    });
  } catch (error) {
    res.render('customer/pages/blog', { error: 'Failed to load articles' });
  }
};

