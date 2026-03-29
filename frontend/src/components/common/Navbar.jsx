import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ role = 'student' }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={role === 'admin' ? '/admin' : '/student'} className="navbar-brand">
          <GraduationCap className="icon-main" size={28} />
          <span>FeedbackUI</span>
        </Link>
        
        <div className="navbar-menu">
          <Link to="/" className="navbar-link">
            <LogOut size={18} />
            <span>Logout</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
