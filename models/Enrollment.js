const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    quizScores: [{
      quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
      },
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      timeUsed: {
        type: Number, // Time used in seconds
        default: 0
      },
      completedAt: Date
    }],
    completed: {
      type: Boolean,
      default: false
    },
    paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  stripePaymentId: {
    type: String,
    required: false, // Store Stripe Checkout Session ID
  },
  });


const Enrollment = mongoose.model('Enrollment', enrollmentSchema);


module.exports = Enrollment;
