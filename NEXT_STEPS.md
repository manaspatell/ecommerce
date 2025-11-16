# 🚀 Next Steps - Getting Your E-Commerce Platform Running

Follow these steps in order to get your Tushar Electronics platform up and running!

## ✅ Step 1: Set Up MongoDB (Choose One Option)

### Option A: MongoDB Atlas (Cloud - Recommended) ⭐

**Time: 5-10 minutes**

1. **Sign up for free MongoDB Atlas**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Create a free account (no credit card needed)

2. **Create a Free Cluster**
   - Click "Build a Database"
   - Choose "FREE" (M0 Sandbox)
   - Select a region closest to you
   - Click "Create"

3. **Create Database User**
   - Go to "Database Access" → "Add New Database User"
   - Username: `tushar_admin` (or any name)
   - Password: Create a strong password (SAVE IT!)
   - Database User Privileges: "Atlas admin"
   - Click "Add User"

4. **Whitelist Your IP**
   - Go to "Network Access" → "Add IP Address"
   - Click "Add Current IP Address" (or "Allow Access from Anywhere" for testing)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

6. **Update .env File**
   - Open `.env` in your project
   - Find: `MONGODB_URI=mongodb://localhost:27017/tushar_electronics`
   - Replace with your Atlas connection string
   - Add database name: `...mongodb.net/tushar_electronics?retryWrites=true&w=majority`
   - Replace `<password>` with your database user password
   
   Example:
   ```
   MONGODB_URI=mongodb+srv://tushar_admin:YourPassword123@cluster0.xxxxx.mongodb.net/tushar_electronics?retryWrites=true&w=majority
   ```

### Option B: Install MongoDB Locally

**Time: 10-15 minutes**

1. **Download MongoDB**
   - Windows: https://www.mongodb.com/try/download/community
   - Mac: `brew install mongodb-community`
   - Linux: `sudo apt-get install mongodb`

2. **Start MongoDB**
   - Windows: Should start automatically as a service
   - Mac: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

3. **Verify it's running**
   - Check if MongoDB is running on port 27017
   - Your `.env` file should already have: `MONGODB_URI=mongodb://localhost:27017/tushar_electronics`

---

## ✅ Step 2: Configure Gmail App Password (For Email)

**Time: 5 minutes**

1. **Enable 2-Step Verification**
   - Go to: https://myaccount.google.com/
   - Sign in with: `tusharelectronics8439@gmail.com`
   - Go to "Security" → Enable "2-Step Verification"

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Click "Generate"
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

3. **Update .env File**
   - Open `.env`
   - Find: `EMAIL_PASS=your-app-password-here`
   - Replace with your 16-character password (remove spaces)
   - Example: `EMAIL_PASS=abcdefghijklmnop`

---

## ✅ Step 3: Run the Seed Script

This creates the admin account and sample data.

```bash
npm run seed
```

**Expected Output:**
```
✅ MongoDB Connected
✅ Default admin created (username: admin, password: admin123)
✅ Category created: Televisions
✅ Category created: Air Conditioners
...
✅ Seeding completed!
```

**If you see errors:**
- Check MongoDB connection in `.env`
- Make sure MongoDB is running (if local)
- Verify connection string is correct (if Atlas)

---

## ✅ Step 4: Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

**Expected Output:**
```
✅ Created directory: public/uploads/products
✅ Created directory: public/uploads/categories
...
✅ MongoDB Connected
🚀 Server running on http://localhost:3000
```

---

## ✅ Step 5: Access Your Application

### Customer Website
Open in browser: **http://localhost:3000**

You should see:
- Homepage with banner slider
- Featured categories
- Product listings
- Blog section

### Admin Panel
Open in browser: **http://localhost:3000/admin/login**

**Default Login:**
- Username: `admin`
- Password: `admin123`

⚠️ **IMPORTANT**: Change this password immediately after first login!

---

## ✅ Step 6: Test Everything

### Test Customer Features:
1. ✅ Browse products
2. ✅ View product details
3. ✅ Add products to cart
4. ✅ Send an inquiry
5. ✅ Subscribe to newsletter
6. ✅ Read blog articles

### Test Admin Features:
1. ✅ Login to admin panel
2. ✅ View dashboard
3. ✅ Add a new category
4. ✅ Add a new product (with images)
5. ✅ View inquiries
6. ✅ Create a blog article
7. ✅ Add a banner

### Test Email:
1. ✅ Send an inquiry from customer site
2. ✅ Check `tusharelectronics8439@gmail.com` for the inquiry email
3. ✅ Check for auto-reply to customer

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
❌ MongoDB Connection Error: connect ECONNREFUSED
```
**Solution:**
- If using Atlas: Check connection string and IP whitelist
- If using local: Make sure MongoDB is running
- Verify `.env` file has correct `MONGODB_URI`

### Email Not Sending
```
Error sending inquiry email
```
**Solution:**
- Verify Gmail App Password is correct in `.env`
- Check 2-Step Verification is enabled
- Ensure `EMAIL_PASS` is the 16-character app password (not regular password)

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:**
- Change `PORT=3000` to another port (e.g., `PORT=3001`) in `.env`
- Or stop the process using port 3000

### Images Not Uploading
**Solution:**
- Check `public/uploads/` directories exist
- Verify file size is under 5MB
- Ensure file is an image (JPEG, PNG, GIF, WebP)

---

## 📋 Quick Checklist

Before you start:
- [ ] MongoDB is set up (Atlas or local)
- [ ] `.env` file has correct `MONGODB_URI`
- [ ] Gmail App Password is configured in `.env`
- [ ] All dependencies installed (`npm install`)

To run:
- [ ] Run `npm run seed` (creates admin account)
- [ ] Run `npm run dev` (starts server)
- [ ] Access http://localhost:3000
- [ ] Login to admin panel
- [ ] Change admin password

---

## 🎉 You're Done!

Once everything is running:
1. ✅ Add your products and categories
2. ✅ Create homepage banners
3. ✅ Write blog articles
4. ✅ Customize the design
5. ✅ Deploy to production

---

## 📞 Need Help?

If you encounter issues:
1. Check the error message
2. Review `MONGODB_SETUP.md` for MongoDB help
3. Review `SECURITY.md` for security info
4. Check console logs for detailed errors

**Good luck! 🚀**

