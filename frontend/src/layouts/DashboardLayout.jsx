import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, BarChart3, LogOut, BookOpen, PlusCircle } from 'lucide-react';
import './Layouts.css';

const DashboardLayout = ({ children, role = 'admin' }) => {
  const location = useLocation();

  return (
    <div className="admin-layout-container">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <GraduationCap className="icon-main" size={28} />
          <span>{role === 'admin' ? 'Admin Panel' : 'Faculty Panel'}</span>
        </div>
        
        <nav className="sidebar-nav" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {role === 'admin' ? (
            <>
              <Link to="/admin" className={`sidebar-link ${location.pathname === '/admin' ? 'active' : ''}`}>
                <LayoutDashboard size={20} />
                <span>Overview</span>
              </Link>
              <Link to="/admin/reports" className={`sidebar-link ${location.pathname === '/admin/reports' ? 'active' : ''}`}>
                <BarChart3 size={20} />
                <span>Reports</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/faculty" className={`sidebar-link ${location.pathname === '/faculty' ? 'active' : ''}`}>
                <BookOpen size={20} />
                <span>My Subjects</span>
              </Link>
              <Link to="/faculty/add" className={`sidebar-link ${location.pathname === '/faculty/add' ? 'active' : ''}`}>
                <PlusCircle size={20} />
                <span>Add Subject</span>
              </Link>
            </>
          )}
          
          <div style={{ marginTop: 'auto' }}>
            <Link to="/" className="sidebar-link logout">
              <LogOut size={20} />
              <span>Logout</span>
            </Link>
          </div>
        </nav>
      </aside>
      
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
