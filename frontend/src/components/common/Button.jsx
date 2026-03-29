import React from 'react';
import './Button.css';

const Button = ({ children, variant = 'primary', className = '', type = 'button', ...props }) => {
  return (
    <button type={type} className={`btn btn-${variant} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
