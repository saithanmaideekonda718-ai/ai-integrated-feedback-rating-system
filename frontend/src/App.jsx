import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import FeedbackForm from './pages/FeedbackForm';
import AdminDashboard from './pages/AdminDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import FacultyFeedback from './pages/FacultyFeedback';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/student/feedback/:courseId" element={<FeedbackForm />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/reports" element={<AdminDashboard />} />
      <Route path="/faculty" element={<FacultyDashboard />} />
      <Route path="/faculty/add" element={<FacultyDashboard />} />
      <Route path="/faculty/feedback/:courseId" element={<FacultyFeedback />} />
    </Routes>
  );
}

export default App;
