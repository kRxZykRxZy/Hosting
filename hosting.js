const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(bodyParser.json({ limit: '10mb' }));

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

app.use('/:ip', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`${PORT}`));
