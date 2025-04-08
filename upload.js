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
router.get('/api/upload/json', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UBBload API Endpoint</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body {
      background-color: #f8f9fa;
    }

    .container {
      margin-top: 50px;
    }

    .cube-card {
      background-color: #007bff;
      color: white;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      text-align: center;
      height: 200px;
    }

    .cube-card h3 {
      font-size: 1.5rem;
      margin-bottom: 20px;
    }

    .cube-card p {
      font-size: 1rem;
      margin-bottom: 0;
    }

    .row {
      margin-top: 30px;
    }

    .btn-primary {
      background-color: #28a745;
      border-color: #28a745;
    }

    .cube-card .btn {
      margin-top: 20px;
    }

    .cube-card code {
      background-color: #f1f1f1;
      color: #333;
      padding: 8px 12px;
      border-radius: 4px;
    }

    .card-header {
      background-color: #007bff;
      color: white;
    }

    .card-body {
      background-color: #f1f1f1;
    }

  </style>
</head>
<body>

  <div class="container">
    <div class="text-center">
      <h1>UBBload API Endpoint</h1>
      <p class="lead">Your reliable solution for file uploads to UBBload.</p>
    </div>

    <div class="row">
      <!-- Cube 1: Endpoint -->
      <div class="col-md-4">
        <div class="cube-card">
          <h3>Image Upload Endpoint</h3>
          <p><code>https://ubbload.onrender.com/api/upload/json</code></p>
        </div>
      </div>

      <!-- Cube 2: HTTP Method -->
      <div class="col-md-4">
        <div class="cube-card">
          <h3>HTTP Method</h3>
          <p><strong>POST</strong></p>
        </div>
      </div>

      <!-- Cube 3: Authentication -->
      <div class="col-md-4">
        <div class="cube-card">
          <h3>Authentication</h3>
          <p>Use your <strong>API Token</strong></p>
        </div>
      </div>
    </div>

    <div class="row">
      <!-- Cube 4: Request Example -->
      <div class="col-md-6">
        <div class="cube-card">
          <h3>Request Example</h3>
          <pre>
curl -X POST https://ubbload.onrender.com/api/upload/json \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -F "file=@your-image.png"
          </pre>
        </div>
      </div>

      <!-- Cube 5: Response Example -->
      <div class="col-md-6">
        <div class="cube-card">
          <h3>Response Example</h3>
          <pre>
{
  "imageurl": "https://ubbload.onrender.com/uploads/example/image.png",
  "message": "Image uploaded successfully!"
}
          </pre>
        </div>
      </div>
    </div>

    <div class="text-center mt-5">
      <a href="https://ubbload.onrender.com" class="btn btn-primary">Go to UBBload</a>
    </div>

  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`)
});
// Serve static files from /:username
router.use('/:username', express.static(path.join(__dirname, 'uploads')));

module.exports = router;
