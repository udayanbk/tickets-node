const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const UsersModel = require('../models/usersModel');
const config = require('../config/constants');
const JWT_SECRET = config.JWT_SECRET;

exports.signupUser = async (req, res) => {
  try {
    const { name, emp_id, email, mobile, password, role_id } = req.body;
    const existingUser = await UsersModel.where({ email }).fetch({ require: false });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await new UsersModel({
      name,
      emp_id,
      email,
      mobile,
      password: hashedPassword,
      role_id
    }).save();

    res.status(201).json({ message: 'User created'});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UsersModel.forge().where({ email }).fetch({
      withRelated: ["role"]
    });
  
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = user.toJSON();
    console.log('userData', userData)
    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // create token
    const token = jwt.sign(
      {
        id: userData.id,
        emp_id: userData.emp_id,
        email: userData.email,
        // role_id: userData.role_id,
        role: userData.role.role_name,
        name: userData.name
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: userData.id,
        emp_id: userData.emp_id,
        name: userData.name,
        email: userData.email,
        // role_id: userData.role_id
        role: userData.role.role_name,
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
