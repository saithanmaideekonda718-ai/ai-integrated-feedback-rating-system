const Feedback = require('../models/Feedback');

// Allows students to submit anonymous reviews
const submitFeedback = async (req, res) => {
  try {
    const { courseId, rating, comments } = req.body;
    
    // Generate a basic sentiment score between 0-100 based on the star rating
    // A 5-star is highly positive (90+), a 1-star is negative (<30)
    let sentiment = 50; 
    if (rating === 5) sentiment = 95;
    else if (rating === 4) sentiment = 80;
    else if (rating === 3) sentiment = 50;
    else if (rating === 2) sentiment = 30;
    else if (rating === 1) sentiment = 10;

    const feedback = await Feedback.create({
      course: courseId,
      rating,
      comments,
      sentiment
    });

    res.status(201).json({ message: 'Feedback successfully recorded', feedback });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetches clustered metric data required by the Admin Dashboard charts
const getAdminMetrics = async (req, res) => {
  try {
    // Populate links the ObjectIds inside Feedback back into full Course objects
    const feedbacks = await Feedback.find({}).populate('course');
    
    // We iterate through all feedbacks and group them using a dictionary
    const groupedMetrics = {};
    
    feedbacks.forEach(fb => {
      // Safety check in case the reference course was deleted
      if (!fb.course) return; 

      const cId = fb.course._id.toString();
      
      // Initialize the cluster if it doesn't exist
      if (!groupedMetrics[cId]) {
        groupedMetrics[cId] = {
          course: fb.course.name,
          branch: fb.course.branch,
          year: fb.course.year,
          semester: fb.course.semester,
          totalRating: 0,
          totalSentiment: 0,
          count: 0
        };
      }
      
      // Perform rolling aggregation
      groupedMetrics[cId].totalRating += fb.rating;
      groupedMetrics[cId].totalSentiment += fb.sentiment;
      groupedMetrics[cId].count += 1;
    });

    // Formatting it into the clean flattened Array format the frontend expects:
    const resultsArray = Object.values(groupedMetrics).map(cluster => ({
      course: cluster.course,
      branch: cluster.branch,
      year: cluster.year,
      semester: cluster.semester,
      rating: parseFloat((cluster.totalRating / cluster.count).toFixed(1)), // One decimal point
      count: cluster.count,
      sentiment: Math.round(cluster.totalSentiment / cluster.count)
    }));

    res.status(200).json(resultsArray);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { submitFeedback, getAdminMetrics };
