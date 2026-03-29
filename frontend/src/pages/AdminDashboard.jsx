import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/common/Card';
import { Users, Star, MessageSquareText, TrendingUp, Filter, Trash2, Library, BookX } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import './Admin.css';

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const [courseRes, metricRes] = await Promise.all([
        fetch('http://localhost:5000/api/courses'),
        fetch('http://localhost:5000/api/feedback/admin-metrics')
      ]);
      
      if (!courseRes.ok) throw new Error('Failed to load courses');
      if (!metricRes.ok) throw new Error('Failed to load metrics');
      
      const courseData = await courseRes.json();
      const metricData = await metricRes.json();
      
      setCourses(courseData);
      setMetrics(metricData);
    } catch(err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteCourse = async (id, courseName) => {
    if(!window.confirm(`Are you sure you want to permanently delete '${courseName}' and ALL its associated feedback?`)) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${id}`, {
        method: 'DELETE'
      });
      if(!res.ok) throw new Error('Failed to delete course');
      
      setSuccessMsg(`Course '${courseName}' deleted successfully.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      
      fetchDashboardData(); // Refresh table
    } catch(err) {
      setErrorMsg(err.message);
    }
  };

  // Combine courses with their fetched feedback metrics
  const enhancedCourses = useMemo(() => {
    return courses.map(course => {
      // Find matching metric object (assuming course name + branch + year + semester uniqueness is standard)
      const m = metrics.find(m => m.course === course.name && m.branch === course.branch && m.year === course.year && m.semester === course.semester);
      return {
        ...course,
        rating: m ? m.rating : 0,
        count: m ? m.count : 0,
        sentiment: m ? m.sentiment : 0
      };
    });
  }, [courses, metrics]);

  const filteredData = useMemo(() => {
    return enhancedCourses.filter(item => {
      return (selectedBranch === '' || item.branch === selectedBranch) &&
             (selectedYear === '' || item.year === selectedYear) && 
             (selectedSemester === '' || item.semester === selectedSemester);
    });
  }, [enhancedCourses, selectedBranch, selectedYear, selectedSemester]);

  const rankedFilteredData = useMemo(() => {
    return [...filteredData]
      .sort((a, b) => {
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        return b.count - a.count;
      })
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }));
  }, [filteredData]);

  // Derived metrics
  const coursesWithReviews = filteredData.filter(d => d.count > 0);
  const avgRating = coursesWithReviews.length > 0 
    ? (coursesWithReviews.reduce((acc, curr) => acc + curr.rating, 0) / coursesWithReviews.length).toFixed(1) 
    : '0.0';
  const totalFeedback = filteredData.reduce((acc, curr) => acc + curr.count, 0);
  const avgSentiment = coursesWithReviews.length > 0 
    ? Math.round(coursesWithReviews.reduce((acc, curr) => acc + curr.sentiment, 0) / coursesWithReviews.length) 
    : 0;

  const sentimentDistribution = useMemo(() => {
    let positive = 0, neutral = 0, negative = 0;
    coursesWithReviews.forEach(c => {
      if (c.sentiment >= 70) positive += c.count;
      else if (c.sentiment >= 40) neutral += c.count;
      else negative += c.count;
    });
    return [
      { name: 'Positive', value: positive, fill: 'var(--success)' },
      { name: 'Neutral', value: neutral, fill: 'var(--warning)' },
      { name: 'Negative', value: negative, fill: 'var(--danger)' }
    ].filter(d => d.value > 0);
  }, [coursesWithReviews]);

  const aiInsights = useMemo(() => {
    if (coursesWithReviews.length === 0) return "Insufficient data for AI analysis. Please gather more student feedback.";
    const avgScore = avgSentiment;
    let insight = `Based on a semantic analysis of ${totalFeedback} recent feedbacks, average core sentiment is standing at ${avgScore}%. `;
    
    if (avgScore >= 75) {
      insight += "Students consistently demonstrate high satisfaction. Teaching methodologies are highly effective.";
    } else if (avgScore >= 50) {
      insight += "Engagement is moderate. While overall acceptable, specific courses are receiving polarized feedback. Consider reviewing detailed comments.";
    } else {
      insight += "Urgent Alert: Overall sentiment is critically low. Rapid pedagogical intervention is highly recommended.";
    }
    
    const sorted = [...coursesWithReviews].sort((a,b) => a.rating - b.rating);
    if (sorted.length > 0) {
      insight += ` Attention should be primarily directed to '${sorted[0].name}' (${sorted[0].branch}), which holds the lowest aggregate rating of ${sorted[0].rating}/5.`;
    }
    
    return insight;
  }, [coursesWithReviews, avgSentiment, totalFeedback]);

  return (
    <DashboardLayout>
      <div className="dashboard-header mb-6 animate-slide-up">
        <h1>Dashboard Overview</h1>
        <p>Monitor course performance, student feedback, and manage available subjects.</p>
        
        {errorMsg && <div style={{ color: 'var(--danger)', marginTop: '10px' }}>{errorMsg}</div>}
        {successMsg && <div style={{ color: 'var(--success)', marginTop: '10px' }}>{successMsg}</div>}
      </div>

      <Card className="filter-card mb-8 glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="filter-wrapper">
          <div className="filter-title">
            <Filter size={18} />
            <span>Filter Data</span>
          </div>
          <div className="filter-controls" style={{ flexWrap: 'wrap' }}>
            <select 
              className="select-input" 
              value={selectedBranch} 
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="">All Branches</option>
              <option value="CS">Computer Science (CS)</option>
              <option value="IT">Information Tech (IT)</option>
              <option value="EC">Electronics (EC)</option>
              <option value="ME">Mechanical (ME)</option>
              <option value="CE">Civil (CE)</option>
            </select>

            <select 
              className="select-input" 
              value={selectedYear} 
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedSemester('');
              }}
            >
              <option value="">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>

            <select 
              className="select-input" 
              value={selectedSemester} 
              onChange={(e) => setSelectedSemester(e.target.value)}
              disabled={!selectedYear}
            >
              <option value="">All Semesters</option>
              {selectedYear === '1' && (
                <><option value="1">Semester 1</option><option value="2">Semester 2</option></>
              )}
              {selectedYear === '2' && (
                <><option value="3">Semester 3</option><option value="4">Semester 4</option></>
              )}
              {selectedYear === '3' && (
                <><option value="5">Semester 5</option><option value="6">Semester 6</option></>
              )}
              {selectedYear === '4' && (
                <><option value="7">Semester 7</option><option value="8">Semester 8</option></>
              )}
            </select>
          </div>
        </div>
      </Card>
      
      <div className="metrics-grid">
        <Card className="metric-card glass animate-float" style={{ animationDelay: '0s' }}>
          <div className="metric-icon-wrapper bg-blue text-blue" style={{ background: 'var(--primary-light)' }}>
            <Star size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Average Rating</p>
            <h3 className="metric-value">{avgRating}<span className="metric-suffix">/5</span></h3>
          </div>
        </Card>
        <Card className="metric-card glass animate-float" style={{ animationDelay: '0.2s' }}>
          <div className="metric-icon-wrapper text-green" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <MessageSquareText size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Total Feedbacks</p>
            <h3 className="metric-value">{totalFeedback}</h3>
          </div>
        </Card>
        <Card className="metric-card glass animate-float" style={{ animationDelay: '0.4s' }}>
          <div className="metric-icon-wrapper text-purple" style={{ background: '#f3e8ff', color: '#9333ea' }}>
            <TrendingUp size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Avg Sentiment Score</p>
            <h3 className="metric-value">{avgSentiment}%</h3>
          </div>
        </Card>
        <Card className="metric-card glass animate-float" style={{ animationDelay: '0.6s' }}>
          <div className="metric-icon-wrapper text-orange" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
            <Library size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Courses Shown</p>
            <h3 className="metric-value">{filteredData.length}</h3>
          </div>
        </Card>
      </div>

      <div className="dashboard-content-grid animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <Card className="chart-card glass">
          <h3 className="card-title mb-6">Average Ratings by Course</h3>
          <div className="chart-container" style={{ height: '300px' }}>
            {coursesWithReviews.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coursesWithReviews} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} domain={[0, 5]} tick={{ fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)', padding: '12px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(5px)' }} />
                  <Bar dataKey="rating" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data-msg" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                {isLoading ? 'Loading metrics...' : 'No rating data available for this branch/cohort.'}
              </div>
            )}
          </div>
        </Card>

        <Card className="chart-card glass">
          <h3 className="card-title mb-6">Feedback Count / Engagement Volume</h3>
          <div className="chart-container" style={{ height: '300px' }}>
            {coursesWithReviews.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coursesWithReviews} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)', padding: '12px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(5px)' }} />
                  <Bar dataKey="count" fill="var(--primary-light)" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data-msg" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                {isLoading ? 'Loading metrics...' : 'No rating data available for this branch/cohort.'}
              </div>
            )}
          </div>
        </Card>

        <Card className="chart-card glass" style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.5fr)', gap: '2rem' }}>
          <div>
            <h3 className="card-title mb-6">Sentiment Distribution</h3>
            <div className="chart-container" style={{ height: '250px' }}>
              {sentimentDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sentimentDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                      {sentimentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data-msg" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  No sentiment data available.
                </div>
              )}
            </div>
          </div>
          
          <div className="ai-analysis-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 className="card-title mb-4 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
              <Star size={18} fill="var(--primary)" /> AI Semantic Analysis Executive Summary
            </h3>
            <div className="ai-insight-box" style={{ background: 'var(--primary-light)', padding: '1.5rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary)', fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
              {aiInsights}
            </div>
          </div>
        </Card>

        <Card className="table-card glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="card-title">Manage Subjects & Metrics</h3>
          </div>
          
          <div className="table-responsive">
            <table className="feedback-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Course Name</th>
                  <th>Tags</th>
                  <th>Feedbacks</th>
                  <th>Rating</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rankedFilteredData.map((item, idx) => (
                  <tr key={item._id || idx}>
                    <td>
                      {item.count > 0 ? (
                        <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem' }}>#{item.rank}</span>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>-</span>
                      )}
                    </td>
                    <td className="font-medium text-main">{item.name}</td>
                    <td>
                      <span className="badge badge-positive" style={{ marginRight: '0.25rem' }}>{item.branch}</span>
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>Y{item.year} S{item.semester}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500, color: item.count > 0 ? 'inherit' : 'var(--text-muted)' }}>
                        {item.count}
                      </span>
                    </td>
                    <td>
                      {item.count > 0 ? (
                        <div className="flex-rating"><Star size={16} fill="#f59e0b" color="#f59e0b" /> <span className="font-medium">{item.rating}</span></div>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>No Data</span>
                      )}
                    </td>
                    <td>
                      <button 
                        onClick={() => handleDeleteCourse(item._id, item.name)}
                        className="danger-action"
                        title="Delete subject permanently"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {rankedFilteredData.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                      <BookX size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                      No subjects found for this selection
                    </td>
                  </tr>
                )}
                {isLoading && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>Loading subjects...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
