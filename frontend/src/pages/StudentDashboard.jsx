import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Filter, CheckCircle } from 'lucide-react';
import './Pages.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));
  const currentUser = user?.username || 'anonymous';
  const [selectedBranch, setSelectedBranch] = useState(localStorage.getItem(`studentBranch_${currentUser}`) || '');
  const [selectedYear, setSelectedYear] = useState(localStorage.getItem(`studentYear_${currentUser}`) || '');
  const [selectedSemester, setSelectedSemester] = useState(localStorage.getItem(`studentSemester_${currentUser}`) || '');
  
  const [completedCourses, setCompletedCourses] = useState([]);

  useEffect(() => {
    localStorage.setItem(`studentBranch_${currentUser}`, selectedBranch);
    localStorage.setItem(`studentYear_${currentUser}`, selectedYear);
    localStorage.setItem(`studentSemester_${currentUser}`, selectedSemester);
  }, [selectedBranch, selectedYear, selectedSemester, currentUser]);

  useEffect(() => {
  const user = JSON.parse(localStorage.getItem('user'));
  const currentUser = user?.username || 'anonymous';

  const storageKey = `completedFeedbacks_${currentUser}`;
  const completedStr = localStorage.getItem(storageKey);

  if (completedStr) {
    setCompletedCourses(JSON.parse(completedStr));
  }
}, []);
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('http://localhost:5000/api/courses');
        if (!res.ok) throw new Error('Failed to fetch live courses');
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    return (selectedBranch === '' || course.branch === selectedBranch) &&
           (selectedYear === '' || (course.year && course.year.toString() === selectedYear)) && 
           (selectedSemester === '' || (course.semester && course.semester.toString() === selectedSemester));
  });

  return (
    <MainLayout role="student">
      <div className="dashboard-header animate-slide-up">
        <h1>Welcome, Student</h1>
        <p>Please provide honest and constructive feedback for your courses.</p>
        {errorMsg && <p style={{ color: 'var(--danger)', marginTop: '10px' }}>{errorMsg}</p>}
      </div>

      <Card className="filter-card mb-6 glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="filter-wrapper">
          <div className="filter-title">
            <Filter size={18} />
            <span>Filter Courses</span>
          </div>
          <div className="filter-controls" style={{ flexWrap: 'wrap' }}>
            <select 
              className="select-input" 
              value={selectedBranch} 
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="">All Branches</option>
              <option value="CS">Computer Science</option>
              <option value="IT">Information Technology</option>
              <option value="EC">Electronics</option>
              <option value="ME">Mechanical</option>
              <option value="CE">Civil</option>
            </select>

            <select 
              className="select-input" 
              value={selectedYear} 
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedSemester(''); // Reset semester when year changes
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

      {!(selectedBranch && selectedYear && selectedSemester) ? (
        <Card className="glass animate-slide-up" style={{ textAlign: 'center', padding: '3rem', animationDelay: '0.2s' }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Find Your Courses</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Please select your <strong>Branch</strong>, <strong>Year</strong>, and <strong>Semester</strong> using the filters above to load the subjects available for feedback.
          </p>
        </Card>
      ) : (
        <div className="courses-grid animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {isLoading ? (
              <div className="no-results" style={{ gridColumn: '1 / -1' }}>
                <p>Loading active courses...</p>
              </div>
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map((course) => {
              const isCompleted = completedCourses.includes(course._id);
              return (
                <Card key={course._id} className="course-card interactive glass animate-float" style={{ opacity: isCompleted ? 0.8 : 1 }}>
                  <div className="course-info">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {course.name}
                      {isCompleted && <CheckCircle size={18} color="var(--success)" />}
                    </h3>
                    <p className="faculty-name">Instructor: {course.faculty || 'Unknown'}</p>
                    <div className="course-badges mt-2">
                      <span className="badge badge-positive">{course.branch}</span>
                      <span className="badge badge-neutral ml-2">Yr {course.year}</span>
                      <span className="badge badge-neutral ml-2">Sem {course.semester}</span>
                    </div>
                  </div>
                  <Button 
                    variant={isCompleted ? "secondary" : "primary"} 
                    onClick={() => navigate(`/student/feedback/${course._id}`)}
                    style={{ width: '100%', marginTop: '1rem', background: isCompleted ? 'var(--success-light)' : '', color: isCompleted ? 'var(--success)' : '' }}
                    disabled={isCompleted}
                  >
                    {isCompleted ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}>
                        <CheckCircle size={18} /> Completed
                      </span>
                    ) : "Give Feedback"}
                  </Button>
                </Card>
              );
            })
          ) : (
            <div className="no-results" style={{ gridColumn: '1 / -1' }}>
              <p>No live courses found matching this criteria.</p>
            </div>
          )}
        </div>
      )}
    </MainLayout>
  );
};

export default StudentDashboard;
