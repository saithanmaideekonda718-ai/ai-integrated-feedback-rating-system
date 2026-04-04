import React, { useEffect, useState } from 'react';
import { useParams,useLocation } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/common/Card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
const FacultyFeedback = () => {
  const { courseId } = useParams();
  const location = useLocation();

  const [feedbackData, setFeedbackData] = useState([]);
  const [courseName, setCourseName] = useState('');

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/feedback/course/${courseId}`);
      const data = await res.json();

      setFeedbackData(data);

      if (data.length > 0) {
        setCourseName(location?.state?.name || 'Course');// optional (can improve later)
      }
    } catch (err) {
      console.error(err);
    }
  };

  const avg =
    feedbackData.length > 0
      ? (feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length).toFixed(1)
      : 0;

  const sentimentData = [
  {
    name: 'Positive',
    value: feedbackData.filter(f => f.sentiment >= 70).length
  },
  {
    name: 'Neutral',
    value: feedbackData.filter(f => f.sentiment >= 40 && f.sentiment < 70).length
  },
  {
    name: 'Negative',
    value: feedbackData.filter(f => f.sentiment < 40).length
  }
];

  return (
    <DashboardLayout role="faculty">
      <Card className="glass" style={{ marginBottom: '20px' }}>
  <h3>Sentiment Overview</h3>

  <ResponsiveContainer width="100%" height={250}>
    <PieChart>
      <Pie
        data={sentimentData}
        dataKey="value"
        nameKey="name"
        outerRadius={80}
        label
      >
        <Cell fill="#22c55e" /> {/* green */}
        <Cell fill="#facc15" /> {/* yellow */}
        <Cell fill="#ef4444" /> {/* red */}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
</Card>
      <Card className="glass">
        <h2>Feedback for {courseName}</h2>

        <p>Average Rating: {avg}</p>

        <table className="feedback-table">
          <thead>
            <tr>
              <th>Anonymous ID</th>
              <th>Rating</th>
              <th>Comments</th>
              <th>Sentiment</th>
            </tr>
          </thead>
          <tbody>
            {feedbackData.map((f, i) => (
              <tr key={i}>
                <td>{f.anonymousId}</td>
                <td>{f.rating}</td>
                <td>{f.comments}</td>
                <td>{f.sentiment}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {feedbackData.length === 0 && (
          <p>No feedback available</p>
        )}
      </Card>
    </DashboardLayout>
  );
};

export default FacultyFeedback;