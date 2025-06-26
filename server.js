const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const BEARER_TOKEN = '2254da6bfa596227708d80b3780babbf230603786ea2a4980e66d98abd2e484f';

const BOT_API_MAP = {
  'Digi AI Assistant': 'https://docsbot.ai/api/teams/my4YXyYm6SQ5ewtD75RN/bots/wxepOdO8DrIY3Hgszjip/questions',
  'AnywhereUSB Plus': 'https://docsbot.ai/api/teams/my4YXyYm6SQ5ewtD75RN/bots/riOJ116hCPEI9rqPz5oV/questions'
};

async function fetchAllQuestions(botName) {
  const apiUrl = BOT_API_MAP[botName];
  if (!apiUrl) throw new Error('Invalid bot name');

  let allQuestions = [];
  let page = 0;
  const perPage = 100;
  let hasMore = true;

  while (hasMore) {
    const url = `${apiUrl}?page=${page}&perPage=${perPage}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page ${page} for ${botName}`);
    }

    const data = await response.json();
    allQuestions = allQuestions.concat(data.questions);
    hasMore = data.pagination?.hasMorePages;
    page += 1;
  }

  return allQuestions;
}

app.get('/questions', async (req, res) => {
  const { startDate, endDate, bot } = req.query;

  if (!bot || !(bot in BOT_API_MAP)) {
    return res.status(400).json({ error: 'Invalid or missing bot name' });
  }

  try {
    const allQuestions = await fetchAllQuestions(bot);

    const filtered = allQuestions.filter(q => {
      const created = new Date(q.createdAt);
      return (!startDate || created >= new Date(startDate)) &&
             (!endDate || created <= new Date(endDate));
    });

    res.json({ questions: filtered });

  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
