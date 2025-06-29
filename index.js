require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting: max 5 requests per IP per hour
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Too many submissions from this IP, please try again later.' }
});
app.use('/api/contact', limiter);

// CORS: allow your frontend domains
app.use(cors({
  origin: [
    'http://localhost:5500', // Live Server default
    'http://localhost:4000',
    'https://https://ayodeyforyou.github.io/Trussmediagroup', // Replace with your actual GitHub Pages URL
    'https://trussmediagroup.com' // Replace with your custom domain if you have one
  ]
}));

// Use helmet for secure HTTP headers
app.use(helmet());

// Simple in-memory error logging for now (since file system is read-only)
app.use((err, req, res, next) => {
  const logEntry = `[${new Date().toISOString()}] ${req.method} ${req.url} - ${err.message}`;
  console.error(logEntry);
  res.status(500).json({ error: 'Internal server error' });
});

app.post('/api/contact',
  // Input validation and sanitization
  [
    body('name').trim().escape().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('message').trim().escape().notEmpty().withMessage('Message is required.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(' ') });
    }
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // List of admin emails to notify
    const adminEmails = [
      process.env.GMAIL_USER,
      'cocojess3030@gmail.com' // Add more admin emails as needed
    ];

    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    // Email to admins
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: adminEmails.join(','),
      replyTo: email,
      subject: `New Contact Form Message from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `
    };

    // Confirmation email to user
    const userMailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Thank you for contacting Truss Media Group',
      html: `
        <h2>Thank you for reaching out, ${name}!</h2>
        <p>We have received your message and will get back to you soon.</p>
        <hr>
        <p><strong>Your message:</strong></p>
        <p>${message}</p>
        <br>
        <p>Best regards,<br>Truss Media Group Team</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions); // Notify admins
      await transporter.sendMail(userMailOptions); // Auto-reply to user
      res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  }
);

// Use /tmp directory for Render (temporary storage)
const BLOGS_FILE = path.join('/tmp', 'blogs.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';

// Helper: Read blogs
function readBlogs() {
  try {
    return JSON.parse(fs.readFileSync(BLOGS_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}
// Helper: Write blogs
function writeBlogs(blogs) {
  fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2));
}

// Get all blogs
app.get('/api/blogs', (req, res) => {
  res.json(readBlogs());
});
// Get single blog
app.get('/api/blogs/:id', (req, res) => {
  const blogs = readBlogs();
  const blog = blogs.find(b => b.id == req.params.id);
  if (!blog) return res.status(404).json({ error: 'Blog not found' });
  res.json(blog);
});
// Add new blog (admin only)
app.post('/api/blogs', (req, res) => {
  const { password, title, author, content, image } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  if (!title || !author || !content) return res.status(400).json({ error: 'Missing fields' });
  const blogs = readBlogs();
  const newBlog = {
    id: Date.now(),
    title,
    author,
    date: new Date().toISOString().slice(0,10),
    content,
    image: image || ''
  };
  blogs.unshift(newBlog);
  writeBlogs(blogs);
  res.json({ success: true, blog: newBlog });
});
// Edit blog (admin only)
app.put('/api/blogs/:id', (req, res) => {
  const { password, title, author, content, image } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  const blogs = readBlogs();
  const idx = blogs.findIndex(b => b.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Blog not found' });
  blogs[idx] = {
    ...blogs[idx],
    title: title || blogs[idx].title,
    author: author || blogs[idx].author,
    content: content || blogs[idx].content,
    image: image !== undefined ? image : blogs[idx].image
  };
  writeBlogs(blogs);
  res.json({ success: true, blog: blogs[idx] });
});

// Set up multer for file uploads to /tmp directory
const uploadDir = path.join('/tmp', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, base + '-' + Date.now() + ext);
  }
});
const upload = multer({ storage });

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// Logo upload endpoint (admin only)
app.post('/api/upload/logo', upload.single('logo'), (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ success: true, url: `/uploads/${req.file.filename}` });
});

// Media upload endpoint (admin only)
app.post('/api/upload/media', upload.single('media'), (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ success: true, url: `/uploads/${req.file.filename}` });
});

// List uploaded media
app.get('/api/media', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to list media' });
    const urls = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f)).map(f => `/uploads/${f}`);
    res.json(urls);
  });
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Truss Media Group backend running on port ${PORT}`);
});

// For HTTPS in production, use a reverse proxy (like Nginx) or Node.js HTTPS server with SSL certificates.