const express = require('express');
const Redis = require('ioredis');
const app = express();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.get('/', async (req, res) => {
    const user = req.query.user || 'default';
    const isBot = req.headers['x-is-bot'] === 'true';
    const scoreKey = `trust_score:${user}`;
    let currentScore = await redis.get(scoreKey) || 100;
    
    currentScore = isBot ? parseInt(currentScore) - 10 : parseInt(currentScore) + 2;
    await redis.set(scoreKey, currentScore);

    if (currentScore <= 30) {
        await redis.set(`state:${user}`, 'QUARANTINE');
        return res.status(403).send('<h1>Site Under Maintenance</h1><p>Verification in progress.</p>');
    }
    res.send(`<h1>Affiliate: ${user}</h1><p>Trust Score: ${currentScore}</p>`);
});

app.listen(3000, () => console.log('Server active on port 3000'));
