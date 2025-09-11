const mongoose = require('mongoose');

const RateSchema = new mongoose.Schema({
    value: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Rate', RateSchema);
