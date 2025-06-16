const therapistSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  passwordHash: String
});

module.exports = mongoose.model('Therapist', therapistSchema);
