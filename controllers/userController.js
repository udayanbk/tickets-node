const User = require('../models/usersModel');

// GET all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.fetchAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE a user
exports.createUser = async (req, res) => {
  try {
    const { name, emp_id, email, mobile, role_id } = req.body;

    const newUser = await new User({
      name,
      emp_id,
      email,
      mobile,
      role_id
    }).save();

    res.status(201).json({
      message: 'User created',
      userId: newUser.id
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
