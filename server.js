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

// ✅ GET current rate at /api/rates
app.get('/api/rates', async (req, res) => {
    try {
        const latest = await Rate.findOne().sort({ updatedAt: -1 });
        if (!latest) return res.status(404).json({ error: 'Rate not found' });

        res.json({
            rate: latest.value,
            last_updated: latest.updatedAt
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ✅ Secret UPDATE endpoint (use /update?value=1450&key=1234)
app.get('/update', async (req, res) => {
    const { value, key } = req.query;

    if (key !== process.env.ADMIN_KEY) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const newRate = new Rate({ value });
        await newRate.save();

        res.json({ message: 'Rate updated!', rate: value });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Home route
app.get('/', (req, res) => {
    res.send('NairaFixer API is running...');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
