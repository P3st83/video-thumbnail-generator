const https = require('https');
const fs = require('fs');
const path = require('path');

const files = [
  {
    url: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
    filename: 'ffmpeg-core.js'
  },
  {
    url: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
    filename: 'ffmpeg-core.wasm'
  },
  {
    url: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.worker.js',
    filename: 'ffmpeg-core.worker.js'
  }
];

const publicDir = path.join(__dirname, '..', 'public');

// Create public directory if it doesn't exist
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

files.forEach(file => {
  const filePath = path.join(publicDir, file.filename);
  const fileStream = fs.createWriteStream(filePath);

  https.get(file.url, (response) => {
    response.pipe(fileStream);
    fileStream.on('finish', () => {
      fileStream.close();
      console.log(`Downloaded ${file.filename}`);
    });
  }).on('error', (err) => {
    fs.unlink(filePath, () => {});
    console.error(`Error downloading ${file.filename}:`, err.message);
  });
}); 