const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Serve upload page
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
          if (!file) return alert('Select an image');

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
                ip,
                imageName: file.name,
                fileType,
                username: localStorage.getItem('loggedIn')
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
  const { image, ip, imageName, fileType, username } = req.body;
  if (!image || !ip || !imageName || !fileType || !username)
    return res.status(400).send('Missing required fields');

  const buffer = Buffer.from(image, 'base64');
  const uploadPath = path.join(__dirname, 'uploads', username);

  fs.mkdir(uploadPath, { recursive: true }, (err) => {
    if (err) return res.status(500).send('Failed to create directory');

    const fullFilePath = path.join(uploadPath, `${imageName}.${fileType}`);
    fs.writeFile(fullFilePath, buffer, (err) => {
      if (err) return res.status(500).send('Failed to save file');

      const url = `http://${req.headers.host}/${username}/${imageName}.${fileType}`;
      res.send(url);
    });
  });
});

// Serve static files from /:username
router.use('/:username', express.static(path.join(__dirname, 'uploads')));

module.exports = router;
