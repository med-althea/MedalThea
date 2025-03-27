// src/user/controller/userController.js
import bcrypt from 'bcryptjs';
import knex from 'knex';
import { client, connection, migrations } from '../../../knexfile.js';

const db = knex({ client, connection, migrations });

// User Registration
const register = async (req, res) => {
  const { username, email, password, mobile, full_name } = req.body;
  if (!username || !email || !password || !mobile || !full_name) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const [newUser] = await db('users').insert({ username, email, password: hashedPassword, mobile, full_name }).returning(['user_id', 'username', 'email', 'full_name', 'mobile']);

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
      'users.mobile'
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
      'users.mobile'
    );

    res.json({users});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Get User List failed, Try again' });
  }
};

export { register, login, getUserDetails, getUserList };
