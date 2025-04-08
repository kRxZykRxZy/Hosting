const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from the "uploads" folder
app.use(express.static(path.join(__dirname, 'uploads')));

// Import route files
const authRoutes = require('./auth');
const uploadRoutes = require('./upload');
const homeRoutes = require('./home');

// Mount routes
app.use(authRoutes);
app.use(uploadRoutes);
app.use(homeRoutes);

// ONE app.listen here
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
