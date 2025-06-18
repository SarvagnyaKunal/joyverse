const emotionSampleSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  roundNumber: Number,
  timestamp: Date,
  emotion: String,
  confidence: Number
});

module.exports = mongoose.model('EmotionSample', emotionSampleSchema);
