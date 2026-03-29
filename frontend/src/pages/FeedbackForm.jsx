import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Star, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import './Feedback.css';

const FeedbackForm = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseId,
          rating,
          comments
        })
      });

      if (!res.ok) {
        throw new Error('Failed to submit feedback');
      }

      // Track locally so dashboard can show tick mark
      const currentUser = localStorage.getItem('currentUser') || 'anonymous';
      const storageKey = `completedFeedbacks_${currentUser}`;
      const completedStr = localStorage.getItem(storageKey);
      const completed = completedStr ? JSON.parse(completedStr) : [];
      if (!completed.includes(courseId)) {
        completed.push(courseId);
        localStorage.setItem(storageKey, JSON.stringify(completed));
      }

      setSubmitted(true);
      setTimeout(() => {
        navigate('/student');
      }, 2000);
    } catch(err) {
      alert(err.message);
    }
  };

  return (
    <MainLayout role="student">
      <div className="feedback-container">
        <Button variant="secondary" onClick={() => navigate('/student')} className="back-btn mb-6">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Button>
        
        {submitted ? (
          <Card className="success-card">
            <CheckCircle2 size={80} className="success-icon mb-4" />
            <h2 className="mb-2">Thank You!</h2>
            <p className="mb-6">Your feedback has been submitted successfully.</p>
            <p className="redirect-text">Redirecting to dashboard...</p>
          </Card>
        ) : (
          <Card className="feedback-card">
            <div className="feedback-header">
              <h2>Course Feedback</h2>
              <div className="anonymous-hint inline">
                <ShieldCheck size={16} />
                Your feedback is anonymous
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="feedback-form">
              <div className="form-group rating-group">
                <label>Overall Rating</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${(hoverRating || rating) >= star ? 'active' : ''}`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <Star 
                        size={48} 
                        fill={(hoverRating || rating) >= star ? "#f59e0b" : "transparent"} 
                        color={(hoverRating || rating) >= star ? "#f59e0b" : "#cbd5e1"}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="comments">Additional Comments</label>
                <textarea
                  id="comments"
                  rows={6}
                  placeholder="What did you like about this course? What could be improved?"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="feedback-textarea"
                ></textarea>
              </div>
              
              <div className="form-actions mt-6">
                <Button type="submit" variant="primary" className="submit-btn full-width" disabled={rating === 0}>
                  Submit Feedback
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default FeedbackForm;
