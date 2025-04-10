const { request } = require('express');
const usersModel = require('../models/usersModel');
const User = require('../models/usersModel');
const usersRolesModel = require('../models/usersRolesModel');
const { default: knex } = require('knex');

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


exports.getUsers = async (req, res) => {
  try {
    const searchType = req?.body?.searchType;

    let users = await usersModel.forge()
    // .where()
    .fetchAll();

    users = users.toJSON();
    console.log('users--admin----', users)

    return res.status(200).json({
      message: 'Users Fetched',
      data: users
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.setUserRole = async (req, res) => {
  try {
    console.log('req.body-----', req.body);
    let response = await usersModel.forge()
    .where('emp_id', req?.body?.emp_id)
    .fetch({ require: false });

    if(!response){
      return res.status(400).json({ error: 'Invalid user request' });
    }
    response = response.toJSON();
    console.log('response--setUserRole--', response);
    await usersModel.query()
    .where('emp_id', req?.body?.emp_id)
    .update({role_id: req?.body?.role})

    return res.status(200).json({
      message: 'User Role Updated'
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCurrentRoles = async (req, res) => {
  try {
    console.log('getCurrentRoles')
    let resp = await usersRolesModel.forge().fetchAll({ require: false });
    resp = resp.toJSON();
    resp = resp.map(i=>{
      delete i.created_at;
      delete i.updated_at;
      return i
    })
    return res.status(200).json({
      message: 'User Role Updated',
      data: resp
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.setNewHierarchy = async (req, res) => {
  try {
    console.log('hierarchy--body---', req.body);
    const newRoles = req?.body?.fields;
    const levels = parseInt(req?.body?.newLevels);

    if (newRoles?.length === levels) {
      await usersRolesModel.query().truncate();

      const roles = [];
      for (let i = 0; i < newRoles.length; i++) {
        roles.push({ role_name: newRoles[i] });
      }

      console.log('roles', roles);

      for (const role of roles) {
        console.log("inserting role", role);
        await usersRolesModel.forge(role).save();
      }

      return res.status(200).json({
        message: 'User Roles Created',
        data: roles
      });
    }

  } catch (err) {
    console.error("Error inserting roles:", err);
    res.status(500).json({ error: err.message });
  }
};
