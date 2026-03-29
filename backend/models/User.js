const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    description: "Serves as Email for Faculty/Admin, and Anonymous ID for Students"
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    default: 'student'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
