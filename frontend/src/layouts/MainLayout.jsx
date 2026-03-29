import React from 'react';
import Navbar from '../components/common/Navbar';
import './Layouts.css';

const MainLayout = ({ children, role }) => {
  return (
    <div className="layout-container">
      <Navbar role={role} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
