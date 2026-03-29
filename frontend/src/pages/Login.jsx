import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Lock, User, ShieldCheck, Mail } from 'lucide-react';
import './Pages.css';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('student'); // 'student', 'faculty', 'admin'
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setUsername('');
    setPassword('');
    setErrorMsg('');
    if (newRole === 'admin') {
      setIsLogin(true); // Admin cannot register
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    const endpoint = isLogin ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/register';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Success
      if (!isLogin) {
        setIsLogin(true);
        setErrorMsg('Registered successfully! Please login now.');
      } else {
        localStorage.setItem('currentUser', username);
        if (role === 'admin') navigate('/admin');
        else if (role === 'faculty') navigate('/faculty');
        else navigate('/student');
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const isStudent = role === 'student';

  return (
    <div className="login-wrapper">
      <Card className="login-card glass">
        <div className="login-header">
          <h2>Welcome</h2>
          {isStudent && (
            <p className="anonymous-hint">
              <ShieldCheck size={16} />
              System does not track your identity
            </p>
          )}
        </div>

        <div className="role-tabs">
          <button type="button" className={`role-tab ${role === 'student' ? 'active' : ''}`} onClick={() => handleRoleChange('student')}>Student</button>
          <button type="button" className={`role-tab ${role === 'faculty' ? 'active' : ''}`} onClick={() => handleRoleChange('faculty')}>Faculty</button>
          <button type="button" className={`role-tab ${role === 'admin' ? 'active' : ''}`} onClick={() => handleRoleChange('admin')}>Admin</button>
        </div>
        
        {role !== 'admin' && (
          <div className="auth-mode-tabs" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
            <span 
              onClick={() => { setIsLogin(true); setErrorMsg(''); }} 
              style={{ cursor: 'pointer', fontWeight: isLogin ? 'bold' : 'normal', borderBottom: isLogin ? '2px solid var(--primary-light)' : 'none', color: isLogin ? 'var(--dark)' : 'var(--gray-dark)' }}
            >
              Login
            </span>
            <span 
              onClick={() => { setIsLogin(false); setErrorMsg(''); }} 
              style={{ cursor: 'pointer', fontWeight: !isLogin ? 'bold' : 'normal', borderBottom: !isLogin ? '2px solid var(--primary-light)' : 'none', color: !isLogin ? 'var(--dark)' : 'var(--gray-dark)' }}
            >
              Register
            </span>
          </div>
        )}
        
        {errorMsg && <div style={{ color: errorMsg.includes('success') ? 'green' : 'red', marginBottom: '15px', textAlign: 'center', fontSize: '0.9rem' }}>{errorMsg}</div>}

        <form onSubmit={handleAuth} className="login-form">
          <div className="input-group">
            {isStudent ? (
              <User className="input-icon" size={18} />
            ) : (
              <Mail className="input-icon" size={18} />
            )}
            <input 
              type={isStudent ? "text" : "email"} 
              placeholder={isStudent ? "Anonymous Login ID" : "Email (e.g. name@college.edu)"} 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <Lock className="input-icon" size={18} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <Button type="submit" variant="primary" className="login-button mt-2">
            {isLogin ? 'Login' : 'Register'} as {role.charAt(0).toUpperCase() + role.slice(1)}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Login;
