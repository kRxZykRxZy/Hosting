const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: false }));

// Static folder for uploads
app.use(express.static(path.join(__dirname, 'uploads')));

// Import route files (these are the 2 separate scripts)
const authRoutes = require('./auth.js');
const uploadRoutes = require('./upload.js');

// Mount routes
app.use(authRoutes);
app.use(uploadRoutes);

// ONE app.listen here
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
