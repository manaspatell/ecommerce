const Inquiry = require('../models/Inquiry');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const { sendInquiryEmail, sendAutoReply } = require('../utils/email');
const { sanitizeText } = require('../middleware/validation');

// List all inquiries (Admin)
exports.list = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const status = req.query.status || 'all';

    const query = status !== 'all' ? { status } : {};

    const inquiries = await Inquiry.find(query)
      .populate('product_ids')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Inquiry.countDocuments(query);
    const stats = {
      new: await Inquiry.countDocuments({ status: 'new' }),
      contacted: await Inquiry.countDocuments({ status: 'contacted' }),
      closed: await Inquiry.countDocuments({ status: 'closed' })
    };

    res.render('admin/inquiries/list', {
      inquiries,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
      stats,
      currentStatus: status
    });
  } catch (error) {
    res.render('admin/inquiries/list', { error: 'Failed to load inquiries' });
  }
};

// View inquiry details (Admin)
exports.view = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id).populate('product_ids');
    res.render('admin/inquiries/view', { inquiry });
  } catch (error) {
    res.redirect('/admin/inquiries');
  }
};

// Update inquiry status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await Inquiry.findByIdAndUpdate(req.params.id, { status });
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

// Delete inquiry
exports.delete = async (req, res) => {
  try {
    await Inquiry.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

// Create inquiry (Customer)
exports.create = async (req, res) => {
  try {
    const { name, email, phone, message, product_ids } = req.body;

    // Validate and sanitize product_ids
    let productIdsArray = [];
    if (product_ids) {
      const ids = Array.isArray(product_ids) ? product_ids : [product_ids];
      productIdsArray = ids
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .map(id => new mongoose.Types.ObjectId(id));
    }

    const inquiry = new Inquiry({
      name: sanitizeText(name),
      email: email.toLowerCase().trim(),
      phone: sanitizeText(phone),
      message: sanitizeText(message),
      product_ids: productIdsArray
    });

    await inquiry.save();

    // Respond immediately to user (don't wait for emails)
    res.json({ 
      success: true, 
      message: 'Your inquiry has been sent successfully! We will contact you shortly.' 
    });

    // Send emails in background (non-blocking)
    setImmediate(async () => {
      try {
        // Populate products for email
        const populatedInquiry = await Inquiry.findById(inquiry._id).populate('product_ids');

        // Prepare product details for email
        const productDetails = populatedInquiry.product_ids && populatedInquiry.product_ids.length > 0
          ? populatedInquiry.product_ids.map(p => `- ${p.name || 'Product'} (ID: ${p._id})`).join('\n')
          : 'General inquiry (no specific products)';

        // Send emails in parallel (faster)
        await Promise.all([
          sendInquiryEmail({
            name,
            email,
            phone,
            message,
            product_ids: populatedInquiry.product_ids.map(p => ({ name: p.name || 'Product' }))
          }),
          sendAutoReply(email, name, productDetails)
        ]);
      } catch (error) {
        console.error('Error sending inquiry emails:', error);
        // Don't throw - emails are sent in background
      }
    });
  } catch (error) {
    console.error(error);
    res.json({ 
      success: false, 
      message: 'Failed to send inquiry. Please try again.' 
    });
  }
};

