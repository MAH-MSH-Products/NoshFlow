const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

// Generate JWT with an expiration time
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d',
  });
};

/**
 * @desc    Create a new user
 * @route   POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { username, email, password, roleName } = req.body || {};

    // Basic input validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields (username, email, password)' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with that email' });
    }

    // Determine the role to assign (Customer by default)
    const targetRoleName = roleName || 'Customer';
    let role = await Role.findOne({ name: targetRoleName });

    // If the role doesn't exist in the DB, reject the registration
    // Roles should be seeded separately using the setup script
    if (!role) {
      return res.status(400).json({ message: `Role '${targetRoleName}' not found in the database. Please run the setup script.` });
    }


    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role: role._id
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: role.name,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user by email and populate their role
    const user = await User.findOne({ email }).populate('role');

    // Compare the hashed password
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role.name,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 */
const logout = (req, res) => {
  // With JWT, standard logout happens client-side by destroying the token.
  // We simply send a success message to confirm the action.
  res.status(200).json({ message: 'Successfully logged out' });
};

/**
 * @desc    Get current authenticated user's profile
 * @route   GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    // req.user is set by the protect middleware (password already excluded)
    res.status(200).json(req.user);
  } catch (error) {
    console.error('Get Profile Error:', error.message);
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe
};
