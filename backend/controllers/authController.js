const User = require('../models/User');

const register = async (req, res) => {
  const { username, password, role } = req.body;
  
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Username, password, and role are required' });
  }

  if (role === 'admin') {
    return res.status(403).json({ error: 'Admin cannot be registered' });
  }

  try {
    const existingUser = await User.findOne({ username, role });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await User.create({ username, password, role });
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  const { username, password, role } = req.body;
  
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Username, password, and role are required' });
  }

  if (role === 'admin') {
    if (username === 'admin@gmail.com' && password === 'admin') {
      return res.status(200).json({ message: 'Login successful', user: { username, role: 'admin' } });
    } else {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }
  }

  try {
    const user = await User.findOne({ username, role });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Password verification (direct string match for simplicity in this template)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid password provided' });
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { login, register };
