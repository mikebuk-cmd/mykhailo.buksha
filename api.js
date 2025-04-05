const axios = require('axios');

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const NEYNAR_API_URL = 'https://api.neynar.com/v2/farcaster';

// Получение последних кастов из канала
async function getChannelCasts(channelId) {
  try {
    const response = await axios.get(`${NEYNAR_API_URL}/casts`, {
      headers: { 'Authorization': `Bearer ${NEYNAR_API_KEY}` },
      params: { channel_id: channelId, limit: 50 }
    });
    return response.data.casts;
  } catch (error) {
    console.error('Error fetching casts:', error);
    return [];
  }
}

// Простой анализ активности
function analyzeActivity(casts) {
  if (!casts.length) return "No recent activity.";
  const thisWeek = casts.filter(cast => {
    const castDate = new Date(cast.created_at);
    const now = new Date();
    return (now - castDate) / (1000 * 60 * 60 * 24) <= 7;
  });
  return `This week: ${thisWeek.length} casts (vs ${casts.length} total).`;
}

// Поиск новичков
async function findNewcomers(channelId) {
  const casts = await getChannelCasts(channelId);
  const authors = new Set(casts.map(cast => cast.author.username));
  return Array.from(authors).slice(0, 3).join(', ') || "No newcomers yet.";
}

module.exports = { getChannelCasts, analyzeActivity, findNewcomers };