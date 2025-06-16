const sessionSchema = new mongoose.Schema({
  userPid: { type: String, required: true },
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist' },
  game: String,
  startTime: Date,
  endTime: Date,
  durationInSeconds: Number,
  totalWords: Number,
  rounds: [
    {
      roundNumber: Number,
      word: String,
      difficulty: String,
      timeTakenSeconds: Number,
      finalEmotion: String,
      emotionSampleIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EmotionSample' }]
    }
  ]
});

module.exports = mongoose.model('Session', sessionSchema);
