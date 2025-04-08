const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const app = express();

app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('uploads')); // Serve static files

const users = [
  { username: 'admin', passwordHash: bcrypt.hashSync('password123', 10) }, // Example user
];

// Handle POST request for login
app.post('/api/login/json', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username);

  if (user && bcrypt.compareSync(password, user.passwordHash)) {
    res.json({ message: 'Login successful', username });
  } else {
    res.status(401).json({ message: 'Login failed. Invalid username or password.' });
  }
});

// Handle POST request for signup
app.post('/api/signup/json', (req, res) => {
  const { username, password } = req.body;
  
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: 'Username already taken' });
  }
  const passwordHash = bcrypt.hashSync(password, 10);
  users.push({ username, passwordHash });

  res.json({ message: 'User successfully created', username });
});

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UBBload Home</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-dark text-white">
  <div class="container text-center mt-5">
    <h1>Welcome to UBBload</h1>
    <p>Upload your images and share the links easily!</p>

    <!-- Upload Button (will be visible only if logged in) -->
    <a href="/upload" class="btn btn-primary btn-lg my-3" id="uploadBtn" style="display: none;">Go to Image Upload</a>

    <!-- Login Button (will be hidden if logged in) -->
    <a href="/login" class="btn btn-secondary btn-lg my-3" id="loginBtn">Login</a>

    <!-- Signup Button (will be hidden if logged in) -->
    <a href="/signup" class="btn btn-success btn-lg my-3" id="signupBtn">Signup</a>
  </div>

  <script>
    // Check if user is logged in by checking localStorage
    const loggedIn = localStorage.getItem('loggedIn');
    
    if (loggedIn) {
      // If logged in, hide login and signup buttons, show upload button
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

// Upload route
app.get('/upload', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UBBload Image Uploading</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-dark text-white">

  <div class="container my-5">
    <h2 class="text-center">Upload an Image</h2>
    <div class="d-flex justify-content-center">
      <input type="file" id="imageInput" class="form-control mb-3" />
    </div>
    <div class="text-center">
      <button class="btn btn-primary" onclick="uploadImage()">Upload Image</button><br>
      <br>
      <a id="link" href="#" style="color: green;"></a>
    </div>
  </div>

  <script>
    const imageLink = document.getElementById('link');
    async function uploadImage() {
      const fileInput = document.getElementById('imageInput');
      const file = fileInput.files[0];
      if (!file) {
        alert('Please select an image');
        return;
      }

      const res = await fetch('https://api.ipify.org/?format=json');
      const ipData = await res.json();
      const ip = ipData.ip;

      const reader = new FileReader();
      reader.onloadend = async function () {
        const base64Image = reader.result.split(',')[1];

        const fileType = file.name.split('.').pop();
        if (!['jpg', 'png', 'webp', 'jpeg'].includes(fileType)) {
          alert("Invalid File Type");
          setTimeout(() => {
            location.reload();
          }, 2000);
          return;
        }

        const formData = {
          image: base64Image,
          ip: ip,
          imageName: file.name,
          fileType: fileType,
          username: localStorage.getItem('loggedIn')
        };

        const response = await fetch('/api/upload/json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        const result = await response.text();
        imageLink.href = result;
        imageLink.textContent = "View Upload";
      };
      
      reader.readAsDataURL(file);
    }
  </script>

  <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.min.js"></script>
</body>
</html>`);
});

// Serve the login page (GET)
app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login Page</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body class="bg-dark text-white">
      <div class="container">
        <div class="row justify-content-center align-items-center" style="height: 100vh;">
          <div class="col-4">
            <h3 class="text-center">Login</h3>
            <form id="loginForm">
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input type="text" class="form-control" id="username" name="username" required>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" name="password" required>
              </div>
              <div class="text-center">
                <button type="submit" class="btn btn-primary">Login</button>
              </div>
            </form>
            <p class="text-center mt-3">
              <a href="/signup" class="text-white">Don't have an account? Sign up here</a>
            </p>
          </div>
        </div>
      </div>
      <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.min.js"></script>
      <script>
        document.getElementById('loginForm').addEventListener('submit', function(event) {
          event.preventDefault(); // Prevent form submission
          
          const username = document.getElementById('username').value;
          const password = document.getElementById('password').value;
          
          fetch('/api/login/json', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          })
          .then(response => response.json())
          .then(data => {
            if (data.message === 'Login successful') {
              localStorage.setItem('loggedIn', data.username); // Store the username in localStorage
              window.location.href = '/dashboard'; // Redirect to dashboard or home page
            } else {
              alert('Login failed. Invalid username or password.');
            }
          })
          .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during login.');
          });
        });
      </script>
    </body>
    </html>
  `);
});

// Serve the signup page (GET)
app.get('/signup', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Signup Page</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body class="bg-dark text-white">
      <div class="container">
        <div class="row justify-content-center align-items-center" style="height: 100vh;">
          <div class="col-4">
            <h3 class="text-center">Sign Up</h3>
            <form id="signupForm">
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input type="text" class="form-control" id="username" name="username" required>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" name="password" required>
              </div>
              <div class="text-center">
                <button type="submit" class="btn btn-primary">Sign Up</button>
              </div>
            </form>
            <p class="text-center mt-3">
              <a href="/login" class="text-white">Already have an account? Login here</a>
            </p>
          </div>
        </div>
      </div>
      <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.min.js"></script>
      <script>
        document.getElementById('signupForm').addEventListener('submit', function(event) {
          event.preventDefault(); // Prevent form submission
          
          const username = document.getElementById('username').value;
          const password = document.getElementById('password').value;
          
          fetch('/api/signup/json', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          })
          .then(response => response.json())
          .then(data => {
            if (data.message === 'User successfully created') {
              alert('User successfully created, please log in.');
              window.location.href = '/login'; // Redirect to login page after signup
            } else {
              alert('Signup failed: ' + data.message);
            }
          })
          .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during signup.');
          });
        });
      </script>
    </body>
    </html>
  `);
});

// Image upload handling route
app.post('/api/upload/json', (req, res) => {
  const { image, ip, imageName, fileType, username } = req.body;
  if (!image || !ip || !imageName || !fileType || !username) return res.status(400).send('Image, IP, imageName, username and fileType are required');
  
  const buffer = Buffer.from(image, 'base64');
  const imagePath = path.join(__dirname, 'uploads', `${username}`, `${imageName}`);

  fs.mkdir(path.join(__dirname, 'uploads', username), { recursive: true }, (err) => {
    if (err) return res.status(500).send('Error creating directory');
    
    fs.writeFile(`${imagePath}.${fileType}`, buffer, (err) => {
      if (err) return res.status(500).send('Error saving the image');
      const url = `https://${req.headers.host}/${username}/${imageName}.${fileType}`;
      res.send(url);
    });
  });
});

// Serve static files from the 'uploads' directory
app.use('/:username', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
