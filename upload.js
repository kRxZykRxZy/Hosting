const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { verifyPassword } = require('./auth');

// Middleware to parse JSON
router.use(express.json({ limit: '10mb' }));

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
          const file = fileInput.files[0];
          const password = localStorage.getItem('password');
          const username = localStorage.getItem('username');

          if (!file) return alert('Select an image');
          if (!password || !username) return alert('Please login to upload images');

          const fileType = file.name.split('.').pop().toLowerCase();
          if (!['jpg', 'jpeg', 'png', 'webp'].includes(fileType)) {
            alert('Invalid file type');
            return;
          }

          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Image = reader.result.split(',')[1];
            const ipRes = await fetch('https://api.ipify.org/?format=json');
            const ip = (await ipRes.json()).ip;

            const response = await fetch('/api/upload/json', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                image: base64Image,
                ip,
                imageName: file.name,
                fileType,
                username,
                password
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
router.post('/api/upload/json', async (req, res) => {
  try {
    const { image, ip, imageName, fileType, username, password } = req.body;

    if (!image || !ip || !imageName || !fileType || !username || !password) {
      return res.status(400).send('Missing required fields');
    }

    const valid = await verifyPassword(username, password);
    if (!valid) {
      return res.status(401).send('Incorrect password');
    }

    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    if (!allowedExtensions.includes(fileType.toLowerCase())) {
      return res.status(400).send('Unsupported file type');
    }

    const safeName = path.parse(imageName).name.replace(/[^a-zA-Z0-9_-]/g, '');
    const fullFilePath = path.join(__dirname, 'uploads', username, `${safeName}.${fileType}`);

    fs.mkdir(path.dirname(fullFilePath), { recursive: true }, (err) => {
      if (err) return res.status(500).send('Failed to create upload directory');

      const buffer = Buffer.from(image, 'base64');
      fs.writeFile(fullFilePath, buffer, (err) => {
        if (err) return res.status(500).send('Failed to save file');

        const url = `https://${req.headers.host}/uploads/${username}/${safeName}.${fileType}`;
        res.send(url);
      });
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).send('Server error during upload');
  }
});

module.exports = router;
