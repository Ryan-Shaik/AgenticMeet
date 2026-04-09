const fs = require('fs');
const path = require('path');
const https = require('https');

const MODEL_URL = 'https://alphacep.ai/download/kaldi-zip-model-en-us-0.22.zip';
const MODEL_DIR = path.join(__dirname, '..', 'server', 'model');
const ZIP_PATH = path.join(__dirname, '..', 'model.zip');

if (!fs.existsSync(path.dirname(ZIP_PATH))) {
  fs.mkdirSync(path.dirname(ZIP_PATH), { recursive: true });
}

console.log('Downloading Vosk model...');
console.log('URL:', MODEL_URL);
console.log('This may take a few minutes (about 500MB)...');
console.log('Saving to:', ZIP_PATH);

const file = fs.createWriteStream(ZIP_PATH);

https.get(MODEL_URL, (response) => {
  if (response.statusCode === 301 || response.statusCode === 302) {
    const redirectUrl = response.headers.location;
    console.log('Redirecting to:', redirectUrl);
    https.get(redirectUrl, (redirectResponse) => {
      handleDownload(redirectResponse);
    });
  } else {
    handleDownload(response);
  }
});

function handleDownload(response) {
  const totalSize = parseInt(response.headers['content-length'] || 0, 10);
  let downloaded = 0;

  response.on('data', (chunk) => {
    downloaded += chunk.length;
    const percent = totalSize > 0 ? ((downloaded / totalSize) * 100).toFixed(1) : 0;
    process.stdout.write(`\rProgress: ${percent}%`);
  });

  response.pipe(file);

  file.on('finish', () => {
    console.log('\n\nDownload complete!');
    console.log('File saved to:', ZIP_PATH);
    console.log('\nNow extract the zip file using 7-Zip or WinRAR:');
    console.log('1. Right-click model.zip');
    console.log('2. Select "Extract Here"');
    console.log('3. Rename extracted folder to "model"');
    console.log('4. Move to server/model/');
  });
}

file.on('error', (err) => {
  console.error('Download error:', err.message);
});