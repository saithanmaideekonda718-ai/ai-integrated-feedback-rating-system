const mongoose = require('mongoose');

// Schema for anonymous feedback given by students
const feedbackSchema = new mongoose.Schema({
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course',
    required: true 
  },
  rating: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5
  },
  comments: { 
    type: String 
  },
  sentiment: { 
    type: Number, // Calculated score from 0-100 indicating positive/negative tone
    default: 80 
  },
  anonymousId: {
    type: String,
    required: true
  },
  student: {
    type: String, // store username
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
