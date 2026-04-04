import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { BookOpen, PlusCircle, CheckCircle2, Trash2 } from 'lucide-react';
import './Pages.css';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const FacultyDashboard = () => {
  const [courseName, setCourseName] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [feedbackData, setFeedbackData] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const navigate = useNavigate();

  // Temporarily hardcoded for the current session since login does not persist faculty names
  const user = JSON.parse(localStorage.getItem('user'));
  const loggedInFaculty = user?.username || 'Unknown';

  const [chartData, setChartData] = useState([]);

  const fetchSubjects = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const res = await fetch(`http://localhost:5000/api/courses?faculty=${encodeURIComponent(loggedInFaculty)}`);
      if (!res.ok) throw new Error('Failed to fetch subjects');
      const data = await res.json();
      setSubjects(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchChartData = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/feedback/admin-metrics');
    const data = await res.json();

    setChartData(data);
    calculateStats(data); 
  } catch (err) {
    console.error(err);
  }
};

  useEffect(() => {
    fetchSubjects();
    fetchChartData();
  }, [loggedInFaculty]);

  

  const handleAddSubject = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: courseName,
          faculty: loggedInFaculty,
          branch,
          year,
          semester
        })
      });

      if (!res.ok) throw new Error('Failed to add subject');
      const newSub = await res.json();

      setSubjects([newSub, ...subjects]);
      setSuccessMsg(`Successfully added ${courseName}`);
      
      setCourseName('');
      setBranch('');
      setYear('');
      setSemester('');
      
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch(err) {
      setErrorMsg(err.message);
    }
  };

  const handleRemoveSubject = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/courses/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete subject');
      
      setSubjects(subjects.filter(sub => sub._id !== id));
      setSuccessMsg(`Successfully removed ${name}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch(err) {
      setErrorMsg(err.message);
    }
  };

  const [stats, setStats] = useState({
  total: 0,
  highest: '',
  lowest: ''
});

const calculateStats = (data) => {
  if (!data.length) return;

  let total = 0;
  let highest = data[0];
  let lowest = data[0];

  data.forEach(d => {
    total += d.count;

    if (d.rating > highest.rating) highest = d;
    if (d.rating < lowest.rating) lowest = d;
  });

  setStats({
    total,
    highest: `${highest.course} (${highest.rating})`,
    lowest: `${lowest.course} (${lowest.rating})`
  });
};


  return (
    <DashboardLayout role="faculty">
      <div className="dashboard-header mb-6 animate-slide-up">
        <h1>Faculty Dashboard</h1>
        <p>Manage your subjects and courses for the semester.</p>
        {errorMsg && <div style={{ color: 'var(--danger)', marginTop: '10px' }}>{errorMsg}</div>}
      </div>

      <div className="dashboard-content-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        

        <Card className="glass animate-slide-up" style={{ marginBottom: '20px' }}>
  <h3>Quick Insights</h3>

  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginTop: '15px'
  }}>
    
    <div style={{ padding: '15px', background: '#eef2ff', borderRadius: '10px' }}>
      <p>Total Feedback</p>
      <h2>{stats.total}</h2>
    </div>

    <div style={{ padding: '15px', background: '#dcfce7', borderRadius: '10px' }}>
      <p>Top Course</p>
      <h3>{stats.highest}</h3>
    </div>

    <div style={{ padding: '15px', background: '#fee2e2', borderRadius: '10px' }}>
      <p>Needs Improvement</p>
      <h3>{stats.lowest}</h3>
    </div>

  </div>
</Card>

<Card className="glass animate-slide-up" style={{ marginBottom: '20px' }}>
  <h3>Course-wise Rating</h3>

  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={chartData}>
      <XAxis dataKey="course" />
      <YAxis domain={[0, 5]} />
      <Tooltip />
      <Bar dataKey="rating" fill="#6366f1" />
    </BarChart>
  </ResponsiveContainer>
</Card>
        {/* Form to add subject */}
        <Card className="form-card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="card-title mb-6 flex items-center gap-2">
            <PlusCircle size={20} className="text-primary" /> Add New Subject
          </h3>
          
          {successMsg && (
            <div className="badge badge-positive mb-6 w-full flex items-center gap-2" style={{ padding: '1rem', background: 'var(--success-light)', color: 'var(--success)' }}>
              <CheckCircle2 size={18} />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleAddSubject} className="feedback-form">
            <div className="form-group">
              <label>Course Name</label>
              <input 
                type="text" 
                value={courseName} 
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g. Artificial Intelligence"
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Branch</label>
              <select className="select-input w-full" value={branch} onChange={(e) => setBranch(e.target.value)} required>
                <option value="">Select Branch</option>
                <option value="CS">Computer Science</option>
                <option value="IT">Information Technology</option>
                <option value="EC">Electronics</option>
                <option value="ME">Mechanical</option>
                <option value="CE">Civil</option>
              </select>
            </div>

            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Year</label>
                <select className="select-input w-full" value={year} onChange={(e) => { setYear(e.target.value); setSemester(''); }} required>
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
              
              <div>
                <label>Semester</label>
                <select className="select-input w-full" value={semester} onChange={(e) => setSemester(e.target.value)} disabled={!year} required>
                  <option value="">Select Semester</option>
                  {year === '1' && <><option value="1">Semester 1</option><option value="2">Semester 2</option></>}
                  {year === '2' && <><option value="3">Semester 3</option><option value="4">Semester 4</option></>}
                  {year === '3' && <><option value="5">Semester 5</option><option value="6">Semester 6</option></>}
                  {year === '4' && <><option value="7">Semester 7</option><option value="8">Semester 8</option></>}
                </select>
              </div>
            </div>

            <Button type="submit" variant="primary" className="full-width mt-6">
              Add Subject
            </Button>
          </form>
        </Card>

        {/* List of subjects */}
        <Card className="table-card glass animate-slide-up" style={{ alignSelf: 'start', animationDelay: '0.2s' }}>
          <h3 className="card-title mb-6 flex items-center gap-2">
            <BookOpen size={20} className="text-primary" /> My Subjects
          </h3>
          <div className="table-responsive">
            <table className="feedback-table">
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Tags</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }} className="text-muted">Loading subjects...</td>
                  </tr>
                ) : subjects.length > 0 ? (
                  subjects.map(sub => (
                    <tr key={sub._id}>
                      <td className="font-medium text-main">{sub.name}</td>
                      <td>
                        <span className="badge badge-positive" style={{ marginRight: '0.25rem' }}>{sub.branch}</span>
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>Y{sub.year} S{sub.semester}</span>
                      </td>
                      <td style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => navigate(`/faculty/feedback/${sub._id}`, { state: { name: sub.name } })}
                          style={{ background: '#6366f1', color: 'white', border: 'none', padding: '5px 8px', borderRadius: '5px', cursor: 'pointer' }}
                        >
                        View
                        </button>

                        <button 
                          onClick={() => handleRemoveSubject(sub._id, sub.name)}
                          className="danger-action"
                          title="Remove subject"
                        >
                        <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }} className="text-muted">No subjects added yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

  {feedbackData.length > 0 && (
  <Card className="glass animate-slide-up" style={{ marginTop: '20px' }}>
    <h3 className="card-title mb-4">
      Feedback for {selectedCourse}
    </h3>

    <p style={{ marginBottom: '10px' }}>
  Average Rating: {
    feedbackData.length > 0
      ? (feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length).toFixed(1)
      : 0
  }
</p>

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
  </Card>
)}
      </div>
    </DashboardLayout>
  );
};

export default FacultyDashboard;
