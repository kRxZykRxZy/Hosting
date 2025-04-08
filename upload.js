const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { verifyPassword } = require('./auth');  // Import the password verification function

// Serve the upload page
router.get('/upload', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>UBBload - Upload</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet" />
    </head>
    <body class="bg-dark text-white">
      <div class="container my-5">
        <h2 class="text-center">Upload an Image</h2>
        <div class="d-flex justify-content-center">
          <input type="file" id="imageInput" class="form-control mb-3" />
        </div>
        <div class="text-center">
          <button class="btn btn-primary" onclick="uploadImage()">Upload</button><br><br>
          <a id="link" href="#" style="color: green;"></a>
        </div>
      </div>

      <script>
        async function uploadImage() {
          const fileInput = document.getElementById('imageInput');
          const passwordInput = localStorage.getItem('password');
          const file = fileInput.files[0];
          const password = localStorage.getItem('password');

          if (!file) return alert('Select an image');
          if (!password) return alert('Please login to upload images');

          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Image = reader.result.split(',')[1];
            const fileType = file.name.split('.').pop();
            if (!['jpg', 'jpeg', 'png', 'webp'].includes(fileType)) {
              alert('Invalid file type');
              return location.reload();
            }

            const ipRes = await fetch('https://api.ipify.org/?format=json');
            const ip = (await ipRes.json()).ip;

            const response = await fetch('/api/upload/json', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                image: base64Image,
                ip: ip, 
                imageName: file.name,
                fileType: fileType, 
                username: localStorage.getItem('loggedIn'),
                password: password // Send password for verification
              })
            });

            const result = await response.text();
            const link = document.getElementById('link');
            link.href = result;
            link.textContent = "View Upload";
          };
          reader.readAsDataURL(file);
        }
      </script>
    </body>
    </html>
  `);
});

// Upload handler
router.post('/api/upload/json', (req, res) => {
  const { image, ip, imageName, fileType, username, password } = req.body;

  if (!image || !ip || !imageName || !fileType || !username || !password)
    return res.status(400).send('Missing required fields');

  // Verify password
  if (!verifyPassword(username, password)) {
    return res.status(401).send('Incorrect password');
  }

  const buffer = Buffer.from(image, 'base64');
  const uploadPath = path.join(__dirname, 'uploads', username);

  fs.mkdir(uploadPath, { recursive: true }, (err) => {
    if (err) return res.status(500).send('Failed to create directory');

    const fullFilePath = path.join(uploadPath, `${imageName}.${fileType}`);
    fs.writeFile(fullFilePath, buffer, (err) => {
      if (err) return res.status(500).send('Failed to save file');

      const url = `https://${req.headers.host}/${username}/${imageName}.${fileType}`;
      res.send(url);
    });
  });
});

module.exports = router;
