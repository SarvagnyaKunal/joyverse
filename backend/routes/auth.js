const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/Users');
const Therapist = require('../models/Therapist');

const router = express.Router();

// Signup Route - Only for users (dyslexic kids)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, age, gender, therapistUID } = req.body;

    // Validate required fields
    if (!name || !email || !password || !age || !gender || !therapistUID) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, email, password, age, gender, therapistUID'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }    // Validate that therapistUID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(therapistUID)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid therapist ID format. Please check with your therapist for the correct ID.'
      });
    }

    // Verify that the therapist exists
    const therapist = await Therapist.findById(therapistUID);
    if (!therapist) {
      return res.status(400).json({
        success: false,
        message: 'Invalid therapist ID. Please check with your therapist.'
      });
    }

    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate unique PID (you can customize this format)
    const pid = `USER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create new user
    const newUser = new User({
      pid,
      name,
      email,
      passwordHash,
      age,
      gender,
      therapistId: therapistUID
    });

    await newUser.save();

    // Return success response (without password)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        pid: newUser.pid,
        name: newUser.name,
        email: newUser.email,
        age: newUser.age,
        gender: newUser.gender,
        therapistId: newUser.therapistId,
        role: 'user'
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during signup'
    });
  }
});

// Login Route - For both users and therapists
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    let user = null;
    let role = null;

    // First, check if it's a user
    user = await User.findOne({ email });
    if (user) {
      role = 'user';
    } else {
      // If not found in users, check therapists
      user = await Therapist.findOne({ email });
      if (user) {
        role = 'therapist';
      }
    }

    // If user not found in either collection
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Prepare response data based on role
    let responseData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: role
    };

    // Add role-specific data
    if (role === 'user') {
      responseData.pid = user.pid;
      responseData.age = user.age;
      responseData.gender = user.gender;
      responseData.therapistId = user.therapistId;
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: responseData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// Optional: Route to get user profile (for authenticated users)
router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find in users first
    let user = await User.findById(id).select('-passwordHash');
    let role = 'user';

    if (!user) {
      // If not found in users, check therapists
      user = await Therapist.findById(id).select('-passwordHash');
      role = 'therapist';
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        role: role
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
