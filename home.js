const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

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

        <a href="/upload" class="btn btn-primary btn-lg my-3" id="uploadBtn" style="display: none;">Go to Image Upload</a>
        <a href="/login" class="btn btn-secondary btn-lg my-3" id="loginBtn">Login</a>
        <a href="/signup" class="btn btn-success btn-lg my-3" id="signupBtn">Signup</a>
      </div>

      <script>
        const loggedIn = localStorage.getItem('loggedIn');
        if (loggedIn) {
          document.getElementById('loginBtn').style.display = 'none';
          document.getElementById('signupBtn').style.display = 'none';
          document.getElementById('uploadBtn').style.display = 'inline-block';
        } else {
          document.getElementById('loginBtn').style.display = 'inline-block';
          document.getElementById('signupBtn').style.display = 'inline-block';
          document.getElementById('uploadBtn').style.display = 'none';
        }
      </script>
    </body>
    </html>
  `);
});

module.exports = router;
