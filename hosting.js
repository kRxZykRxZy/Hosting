const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('uploads')); // Serve static files

// Home route
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UBBload</title>
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
      <a id="link" href="#" style="color: green;"><a>
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

        const formData = {
          image: base64Image,
          ip: ip,
          imageName: file.name,
          fileType: file.type.split('/')[1]
        };

        const response = await fetch(window.location.href + 'upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        const result = await response.text();
        imageLink.href = result;
        imageLink.textContent = "View Image" 
      };
      
      reader.readAsDataURL(file);
    }
  </script>

  <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.min.js"></script>
</body>
</html>`);
});

// Image upload handling route
app.post('/upload', (req, res) => {
  const { image, ip, imageName, fileType } = req.body;
  if (!image || !ip || !imageName || !fileType) return res.status(400).send('Image, IP, imageName, and fileType are required');
  
  const buffer = Buffer.from(image, 'base64');
  const imagePath = path.join(__dirname, 'uploads', `${ip}`, `${imageName}.${fileType}`);
  
  fs.mkdir(path.join(__dirname, 'uploads', ip), { recursive: true }, (err) => {
    if (err) return res.status(500).send('Error creating directory');
    
    fs.writeFile(imagePath, buffer, (err) => {
      if (err) return res.status(500).send('Error saving the image');
      const url = `https://${req.headers.host}/${ip}/${imageName}.${fileType}`;
      res.send(`${url}`);
    });
  });
});

// Serve static files from the 'uploads' directory
app.use('/:ip', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
