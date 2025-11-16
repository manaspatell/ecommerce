const express = require('express');
const router = express.Router();

// Controllers
const customerController = require('../controllers/customerController');
const inquiryController = require('../controllers/inquiryController');
const articleController = require('../controllers/articleController');

// Validation middleware
const { validateInquiry, validateNewsletter } = require('../middleware/validation');

// Homepage
router.get('/', customerController.home);

// Products
router.get('/products', customerController.products);
router.get('/product/:slug', customerController.product);

// Categories
router.get('/category/:slug', customerController.category);

// Blog/Articles
router.get('/blog', articleController.list);
router.get('/article/:slug', articleController.view);

// Inquiry
router.post('/inquiry', validateInquiry, inquiryController.create);

// Newsletter
router.post('/newsletter', validateNewsletter, customerController.newsletter);

// Support pages
router.get('/about', customerController.about);
router.get('/contact', customerController.contact);
router.get('/faq', customerController.faq);
router.get('/privacy-policy', customerController.privacy);
router.get('/terms-conditions', customerController.terms);
router.get('/shipping-policy', customerController.shipping);
router.get('/return-refund-policy', customerController.returns);

// SEO - Sitemap and Robots
router.get('/sitemap.xml', customerController.sitemap);
router.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.sendFile(require('path').join(__dirname, '../public/robots.txt'));
});

module.exports = router;

