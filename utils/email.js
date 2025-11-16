const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'tusharelectronics8439@gmail.com',
    pass: process.env.EMAIL_PASS
  }
});

// Send inquiry email to admin
const sendInquiryEmail = async (inquiryData) => {
  try {
    const productList = inquiryData.product_ids && inquiryData.product_ids.length > 0
      ? inquiryData.product_ids.map(p => `- ${p.name || 'Product'}`).join('\n')
      : 'General inquiry (no specific products)';

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'tusharelectronics8439@gmail.com',
      to: 'tusharelectronics8439@gmail.com',
      subject: `New Product Inquiry from ${inquiryData.name}`,
      html: `
        <h2>New Product Inquiry</h2>
        <p><strong>Name:</strong> ${inquiryData.name}</p>
        <p><strong>Email:</strong> ${inquiryData.email}</p>
        <p><strong>Phone:</strong> <a href="tel:${inquiryData.phone}">${inquiryData.phone}</a></p>
        <p><strong>Products:</strong></p>
        <pre>${productList}</pre>
        <p><strong>Message:</strong></p>
        <p>${inquiryData.message || 'No message provided'}</p>
        <hr>
        <p><strong>Contact Customer:</strong> <a href="tel:${inquiryData.phone}">${inquiryData.phone}</a> | <a href="mailto:${inquiryData.email}">${inquiryData.email}</a></p>
        <p><small>Received at: ${new Date().toLocaleString()}</small></p>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending inquiry email:', error);
    return false;
  }
};

// Send auto-reply to customer
const sendAutoReply = async (customerEmail, customerName, productDetails = null) => {
  try {
    let productInfo = '';
    if (productDetails) {
      productInfo = `
        <h3>Product Details:</h3>
        <p>${productDetails}</p>
      `;
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'tusharelectronics8439@gmail.com',
      to: customerEmail,
      subject: 'Thank you for your inquiry - Tushar Electronics',
      html: `
        <h2>Thank you for contacting Tushar Electronics!</h2>
        <p>Dear ${customerName},</p>
        <p>We have received your inquiry and our team will get back to you shortly.</p>
        ${productInfo}
        <p>For immediate assistance, please contact us at:</p>
        <p><strong>Phone:</strong> <a href="tel:+919171310766">+91 9171310766</a></p>
        <p><strong>Email:</strong> tusharelectronics8439@gmail.com</p>
        <p>Best regards,<br>Tushar Electronics Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending auto-reply:', error);
    return false;
  }
};

module.exports = { sendInquiryEmail, sendAutoReply };

