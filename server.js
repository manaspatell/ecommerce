const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Security middleware
const { securityHeaders, apiLimiter } = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure upload directories exist
const uploadDirs = [
  'public/uploads/products',
  'public/uploads/categories',
  'public/uploads/articles',
  'public/uploads/banners',
  'public/uploads/testimonials'
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tushar_electronics')
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  console.error('\n⚠️  Please make sure MongoDB is running!');
  console.error('   Option 1: Start local MongoDB');
  console.error('   Option 2: Use MongoDB Atlas (cloud) and update MONGODB_URI in .env');
});

// Security Middleware (must be first)
app.use(securityHeaders);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files - serve uploads directory and logo
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/logo', express.static(path.join(__dirname, 'logo')));

// API rate limiting
app.use('/api', apiLimiter);
app.use('/inquiry', require('./middleware/security').inquiryLimiter);
app.use('/newsletter', require('./middleware/security').newsletterLimiter);

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/tushar_electronics',
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/api', require('./routes/api'));
app.use('/admin', require('./routes/admin'));
app.use('/', require('./routes/customer'));

// 404 Handler
app.use((req, res) => {
  try {
    res.status(404).render('customer/404');
  } catch (err) {
    res.status(404).send(`
      <html>
        <head><title>404 - Page Not Found</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>404</h1>
          <p>Page Not Found</p>
          <a href="/">Go to Homepage</a>
        </body>
      </html>
    `);
  }
});

// Error Handling (must be last)
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // If it's a view rendering error, try to render error page
  if (err.message && err.message.includes('Failed to lookup view')) {
    return res.status(404).render('customer/404');
  }
  
  // For AJAX requests, return JSON
  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    return res.status(err.status || 500).json({ 
      error: isDevelopment ? err.message : 'Something went wrong!',
      ...(isDevelopment && { stack: err.stack })
    });
  }
  
  // For regular requests, try to render error page
  try {
    res.status(err.status || 500).render('customer/404', {
      error: isDevelopment ? err.message : 'Something went wrong!'
    });
  } catch (renderErr) {
    // If rendering fails, send simple HTML
    res.status(err.status || 500).send(`
      <html>
        <head><title>Error</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>Error</h1>
          <p>${isDevelopment ? err.message : 'Something went wrong!'}</p>
          <a href="/">Go to Homepage</a>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

