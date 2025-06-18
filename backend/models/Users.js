const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  pid: { type: String, required: true, unique: true },
  name: String,
  age: Number,
  gender: String,
  email: { type: String, required: true, unique: true },
  passwordHash: String,
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist' }
});

module.exports = mongoose.model('User', userSchema);
