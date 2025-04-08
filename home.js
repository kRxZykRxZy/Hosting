const express = require('express');
const router = express.Router();

// Home page route
router.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>UBBload Home</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet" />
    </head>
    <body class="bg-dark text-white">
      <div class="container text-center mt-5">
        <h1>Welcome to UBBload</h1>
        <p>Upload your images and share the links easily!</p>

        <!-- Upload Button (only visible if logged in) -->
        <a href="/upload" class="btn btn-primary btn-lg my-3" id="uploadBtn" style="display: none;">Go to Image Upload</a>

        <!-- Login Button (only visible if not logged in) -->
        <a href="/login" class="btn btn-secondary btn-lg my-3" id="loginBtn">Login</a>

        <!-- Signup Button (only visible if not logged in) -->
        <a href="/signup" class="btn btn-success btn-lg my-3" id="signupBtn">Signup</a>
      </div>

      <script>
        // Check if user is logged in by checking localStorage
        const loggedIn = localStorage.getItem('loggedIn');
        
        if (loggedIn) {
          // If logged in, show upload button, hide login/signup
          document.getElementById('loginBtn').style.display = 'none';
          document.getElementById('signupBtn').style.display = 'none';
          document.getElementById('uploadBtn').style.display = 'inline-block';
        } else {
          // If not logged in, show login/signup buttons, hide upload button
          document.getElementById('loginBtn').style.display = 'inline-block';
          document.getElementById('signupBtn').style.display = 'inline-block';
          document.getElementById('uploadBtn').style.display = 'none';
        }
      </script>

      <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.min.js"></script>
    </body>
    </html>
  `);
});

module.exports = router;
