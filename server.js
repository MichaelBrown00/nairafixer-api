const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// MongoDB model
const Rate = require('./models/Rate');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// GET current rate
app.get('/rate', async (req, res) => {
    const latest = await Rate.findOne().sort({ updatedAt: -1 });
    if (!latest) return res.status(404).json({ error: 'Rate not found' });

    res.json({
        rate: latest.value,
        last_updated: latest.updatedAt
    });
});

// Secret UPDATE endpoint (use /update?value=1450&key=1234)
app.get('/update', async (req, res) => {
    const { value, key } = req.query;

    if (key !== process.env.ADMIN_KEY) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    const newRate = new Rate({ value });
    await newRate.save();

    res.json({ message: 'Rate updated!', rate: value });
});

// Home
app.get('/', (req, res) => {
    res.send('NairaFixer API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
