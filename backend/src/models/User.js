const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: {
    city: String,
    region: String,
    country: String,
  },
  weather: {
    temperature: Number,
    condition: String,
  },
});

module.exports = mongoose.model('User', userSchema);
