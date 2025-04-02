// src/user/controller/userController.js
import bcrypt from 'bcryptjs';
import knex from 'knex';
import { client, connection, migrations } from '../../../knexfile.js';

const db = knex({ client, connection, migrations });

// User Registration
const register = async (req, res) => {
  const { username, email, password, mobile, full_name, role_id } = req.body.finalData;
  if (!username || !email || !password || !mobile || !full_name) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const [newUser] = await db('users').insert({ username, email, password: hashedPassword, mobile, full_name, role_id }).returning(['user_id', 'username', 'email', 'full_name', 'mobile']);

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Registration Failed, Try after sometime' });
  }
};

// User Login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Please provide email and password' });

  try {
    const user = await db('users').where({ email }).first();
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(400).json({ message: 'Invalid credentials' });

    res.json({ message: 'Login successful', user: { user_id: user.user_id } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login unsuccessful, Try again' });
  }
};

const getUserDetails = async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: 'Please provide userId' });

  try {
    const user = await db('users').select(
      'users.user_id',
      'users.username',
      'users.full_name',
      'users.email',
      'users.mobile',
      'users.created_at',
    ).where({ user_id:userId }).first();
    if (!user) return res.status(400).json({ message: 'Invalid User Id' });

    res.json({user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Get User Details failed, Try again' });
  }
};

const getUserList = async (req, res) => {

  try {
    const users = await db('users').select(
      'users.user_id',
      'users.username',
      'users.full_name',
      'users.email',
      'users.mobile',
      'users.role_id',
      'users.created_at',
    );

    res.json({users});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Get User List failed, Try again' });
  }
};

// Update User Profile with Old Password Validation and Unique New Password Check
const updateUserProfile = async (req, res) => {
  const { userId } = req.params;
  const { username, email, mobile, full_name, old_password, new_password } = req.body;

  if (!userId) {
    return res.status(400).json({ status: 400, message: 'User ID is required' });
  }

  if (!username && !email && !mobile && !full_name && !new_password) {
    return res.status(400).json({ status: 400, message: 'At least one field is required for update' });
  }

  try {
    const user = await db('users').where({ user_id: userId }).first();
    if (!user) return res.status(404).json({ status: 404, message: 'User not found' });

    let updatedFields = {};

    // Old password is required for any update
    if (!old_password) {
      return res.status(400).json({ status: 400, message: 'Old password is required for profile update' });
    }

    // Validate old password
    const isOldPasswordValid = await bcrypt.compare(old_password, user.password);
    if (!isOldPasswordValid) {
      return res.status(400).json({ status: 400, message: 'Old password is incorrect' });
    }

    // If updating password, check that it's different from the old one
    if (new_password) {
      if (old_password === new_password) {
        return res.status(400).json({ status: 400, message: 'New password cannot be the same as the old password' });
      }
      updatedFields.password = await bcrypt.hash(new_password, 10);
    }

    // Update only provided fields
    if (username) updatedFields.username = username;
    if (email) updatedFields.email = email;
    if (mobile) updatedFields.mobile = mobile;
    if (full_name) updatedFields.full_name = full_name;

    const [updatedUser] = await db('users')
      .where({ user_id: userId })
      .update(updatedFields)
      .returning(['user_id', 'username', 'email', 'full_name', 'mobile']);

    res.status(200).json({
      status: 200,
      message: 'User profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: 'Profile update failed, try again later' });
  }
};

export { register, login, getUserDetails, getUserList, updateUserProfile };
