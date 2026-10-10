import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/style.min.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'style.css'));
});
app.get('/theme.min.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'theme.css'));
});
app.get('/main.min.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'main.js'));
});
app.get('/product.min.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'product.css'));
});

app.use(express.static(__dirname, {
  extensions: ['html', 'htm']
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`WebMakers Luxury Restaurant server running on http://0.0.0.0:${PORT}`);
});
