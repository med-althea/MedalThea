// src/app.js
import express from 'express';
import { client, connection, migrations } from './knexfile.js';
import knex from 'knex';
import userRoutes from './src/user/routes/userRoutes.js';
import quizRoutes from './src/quiz/routes/quizRoutes.js';

const db = knex({ client, connection, migrations });
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// API to return the application name
app.get('/', (req, res) => {
  const appName = 'Quiz Application';
  const appVersion = '1.0.0';
  const appDescription = 'Quiz Application using Express and PostgreSQL';

  res.json({ name: appName, version: appVersion, description: appDescription });
});

// User and Quiz routes
app.use('/api/users', userRoutes);
app.use('/api/quizzes', quizRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;