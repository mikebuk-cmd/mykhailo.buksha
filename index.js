const express = require('express');
const { createCanvas } = require('canvas'); // Импортируем canvas
const { getChannelCasts, analyzeActivity, findNewcomers } = require('./api');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.post('/api/ask', async (req, res) => {
  const { untrustedData } = req.body;
  const question = untrustedData?.inputText?.toLowerCase() || '';
  const channelId = 'founders';

  let responseText = '';
  if (question.includes('why less happy') || question.includes('activity')) {
    const casts = await getChannelCasts(channelId);
    responseText = analyzeActivity(casts);
  } else if (question.includes('newcomers')) {
    responseText = `Newcomers: ${await findNewcomers(channelId)}`;
  } else {
    responseText = 'Ask about activity or newcomers!';
  }

  // Создание динамического изображения
  const canvas = createCanvas(1200, 800); // Размер изображения
  const ctx = canvas.getContext('2d');

  // Настраиваем фон и текст
  ctx.fillStyle = '#ffffff'; // Белый фон
  ctx.fillRect(0, 0, 1200, 800);
  ctx.fillStyle = '#000000'; // Чёрный текст
  ctx.font = 'bold 40px Arial';
  ctx.fillText('ChannelSense', 50, 100); // Заголовок
  ctx.font = '30px Arial';
  
  // Разбиваем текст ответа на строки, чтобы помещался
  const maxWidth = 1100;
  const lineHeight = 40;
  let words = responseText.split(' ');
  let line = '';
  let y = 200;

  for (let i = 0; i < words.length; i++) {
    let testLine = line + words[i] + ' ';
    let metrics = ctx.measureText(testLine);
    let testWidth = metrics.width;
    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line, 50, y);
      line = words[i] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 50, y); // Последняя строка

  // Преобразуем изображение в Data URL
  const imageUrl = canvas.toDataURL('image/png');

  // Формируем HTML для фрейма
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta property="fc:frame" content="vNext">
      <meta property="fc:frame:image" content="${imageUrl}">
      <meta property="fc:frame:button:1" content="Ask again">
      <meta property="fc:frame:post_url" content="https://channelsense-1tn56kwe9-mikebuk-cmds-projects.vercel.app/ask">
      <meta property="og:title" content="ChannelSense">
      <meta property="og:description" content="${responseText}">
    </head>
    </html>
  `;
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});