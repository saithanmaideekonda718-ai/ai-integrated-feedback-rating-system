const mongoose = require('mongoose');

// Schema for subjects/courses managed by faculty
const courseSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  faculty: { 
    type: String, // Faculty's name or username
    required: true 
  },
  branch: { 
    type: String, // e.g., 'CS', 'IT', 'ME'
    required: true 
  },
  year: { 
    type: String, // e.g., '1', '2', '3', '4'
    required: true 
  },
  semester: { 
    type: String, // e.g., '1' to '8'
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
