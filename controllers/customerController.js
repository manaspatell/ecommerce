const Product = require('../models/Product');
const Category = require('../models/Category');
const Article = require('../models/Article');
const Banner = require('../models/Banner');
const Testimonial = require('../models/Testimonial');
const Newsletter = require('../models/Newsletter');
const { sanitizeText } = require('../middleware/validation');

// Helper function to convert Map to object
const convertSpecsToObject = (product) => {
  if (product.specifications && product.specifications instanceof Map) {
    const specsObj = {};
    product.specifications.forEach((value, key) => {
      specsObj[key] = value;
    });
    product.specifications = specsObj;
  }
  return product;
};

// Homepage
exports.home = async (req, res) => {
  try {
    const [banners, categories, featuredProducts, latestArticles, testimonials] = await Promise.all([
      Banner.find({ status: 'active' }).sort({ order: 1, created_at: -1 }).limit(10).catch(() => []),
      Category.find({ status: 'active' }).limit(8).catch(() => []),
      Product.find({ status: 'active' }).populate('category_id').sort({ created_at: -1 }).limit(8).catch(() => []),
      Article.find({ status: 'published' }).sort({ created_at: -1 }).limit(3).catch(() => []),
      Testimonial.find({ status: 'active' }).sort({ created_at: -1 }).limit(6).catch(() => [])
    ]);

    // Convert specifications Map to object for all products
    const processedProducts = (featuredProducts || []).map(convertSpecsToObject);

    res.render('customer/index', {
      banners: banners || [],
      categories: categories || [],
      featuredProducts: processedProducts,
      latestArticles: latestArticles || [],
      testimonials: testimonials || []
    });
  } catch (error) {
    console.error(error);
    res.render('customer/index', { 
      banners: [],
      categories: [],
      featuredProducts: [],
      latestArticles: [],
      testimonials: [],
      error: 'Failed to load homepage. Please check MongoDB connection.' 
    });
  }
};

// Category page
exports.category = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    
    if (!category) {
      return res.status(404).render('customer/404');
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    const products = await Product.find({ 
      category_id: category._id, 
      status: 'active' 
    })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    // Convert specifications Map to object
    const processedProducts = products.map(convertSpecsToObject);

    const total = await Product.countDocuments({ 
      category_id: category._id, 
      status: 'active' 
    });

    res.render('customer/pages/category', {
      category,
      products: processedProducts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Error loading category:', error);
    res.status(404).render('customer/404');
  }
};

// Product listing
exports.products = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || 'all';

    let query = { status: 'active' };

    if (search) {
      query.$text = { $search: search };
    }

    if (category !== 'all') {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category_id = categoryDoc._id;
      }
    }

    const products = await Product.find(query)
      .populate('category_id')
      .sort(search ? { score: { $meta: 'textScore' } } : { created_at: -1 })
      .skip(skip)
      .limit(limit);

    // Convert specifications Map to object
    const processedProducts = products.map(convertSpecsToObject);

    const total = await Product.countDocuments(query);
    const categories = await Category.find({ status: 'active' });

    res.render('customer/pages/products', {
      products: processedProducts,
      categories,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
      search,
      currentCategory: category
    });
  } catch (error) {
    res.render('customer/pages/products', { error: 'Failed to load products' });
  }
};

// Product details
exports.product = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, status: 'active' })
      .populate('category_id');

    if (!product) {
      return res.status(404).render('customer/404');
    }

    // Convert specifications Map to plain object for easier template rendering
    const processedProduct = convertSpecsToObject(product);

    // Get related products
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category_id: product.category_id,
      status: 'active'
    }).limit(4);

    // Convert specifications for related products too
    const processedRelatedProducts = relatedProducts.map(convertSpecsToObject);

    res.render('customer/pages/product', { product: processedProduct, relatedProducts: processedRelatedProducts });
  } catch (error) {
    console.error('Error loading product:', error);
    res.status(404).render('customer/404');
  }
};

// Newsletter subscription
exports.newsletter = async (req, res) => {
  try {
    const { email } = req.body;
    const sanitizedEmail = email.toLowerCase().trim();

    const existing = await Newsletter.findOne({ email: sanitizedEmail });
    if (existing) {
      return res.json({ 
        success: false, 
        message: 'Email already subscribed' 
      });
    }

    const newsletter = new Newsletter({ email: sanitizedEmail });
    await newsletter.save();

    res.json({ 
      success: true, 
      message: 'Successfully subscribed to newsletter!' 
    });
  } catch (error) {
    res.json({ 
      success: false, 
      message: 'Failed to subscribe. Please try again.' 
    });
  }
};

// Support pages
exports.about = (req, res) => {
  try {
    res.render('customer/pages/about');
  } catch (error) {
    console.error('Error rendering about page:', error);
    res.status(500).render('customer/404', { error: 'Failed to load page' });
  }
};

exports.contact = (req, res) => {
  try {
    res.render('customer/pages/contact');
  } catch (error) {
    console.error('Error rendering contact page:', error);
    res.status(500).render('customer/404', { error: 'Failed to load page' });
  }
};

exports.faq = (req, res) => {
  try {
    res.render('customer/pages/faq');
  } catch (error) {
    console.error('Error rendering FAQ page:', error);
    res.status(500).render('customer/404', { error: 'Failed to load page' });
  }
};

exports.privacy = (req, res) => {
  try {
    res.render('customer/pages/privacy');
  } catch (error) {
    console.error('Error rendering privacy page:', error);
    res.status(500).render('customer/404', { error: 'Failed to load page' });
  }
};

exports.terms = (req, res) => {
  try {
    res.render('customer/pages/terms');
  } catch (error) {
    console.error('Error rendering terms page:', error);
    res.status(500).render('customer/404', { error: 'Failed to load page' });
  }
};

exports.shipping = (req, res) => {
  try {
    res.render('customer/pages/shipping');
  } catch (error) {
    console.error('Error rendering shipping page:', error);
    res.status(500).render('customer/404', { error: 'Failed to load page' });
  }
};

exports.returns = (req, res) => {
  try {
    res.render('customer/pages/returns');
  } catch (error) {
    console.error('Error rendering returns page:', error);
    res.status(500).render('customer/404', { error: 'Failed to load page' });
  }
};

// Sitemap for SEO
exports.sitemap = async (req, res) => {
  try {
    const baseUrl = process.env.SITE_URL || `http://${req.headers.host}`;
    const [products, categories, articles] = await Promise.all([
      Product.find({ status: 'active' }).select('slug updated_at').catch(() => []),
      Category.find({ status: 'active' }).select('slug updated_at').catch(() => []),
      Article.find({ status: 'published' }).select('slug updated_at').catch(() => [])
    ]);

    const urls = [
      { loc: `${baseUrl}/`, changefreq: 'daily', priority: '1.0' },
      { loc: `${baseUrl}/products`, changefreq: 'daily', priority: '0.9' },
      { loc: `${baseUrl}/blog`, changefreq: 'weekly', priority: '0.8' },
      { loc: `${baseUrl}/about`, changefreq: 'monthly', priority: '0.7' },
      { loc: `${baseUrl}/contact`, changefreq: 'monthly', priority: '0.7' },
      ...products.map(p => ({
        loc: `${baseUrl}/product/${p.slug}`,
        changefreq: 'weekly',
        priority: '0.8',
        lastmod: p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      })),
      ...categories.map(c => ({
        loc: `${baseUrl}/category/${c.slug}`,
        changefreq: 'weekly',
        priority: '0.8',
        lastmod: c.updated_at ? new Date(c.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      })),
      ...articles.map(a => ({
        loc: `${baseUrl}/article/${a.slug}`,
        changefreq: 'monthly',
        priority: '0.7',
        lastmod: a.updated_at ? new Date(a.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      }))
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
};

