import { client, connection, migrations } from '../../../knexfile.js';
import knex from 'knex';
import xlsx from 'xlsx';

const db = knex({ client, connection, migrations });

const createQuiz = async (title, category, topics, set, questions) => {
  const [quiz] = await db('quizzes').insert({ title, category, topics, set }).returning('quiz_id');
  const questionData = questions.map((q) => ({
    quiz_id: quiz.quiz_id,
    question: q.Question,
    option_a: q.Option_1,
    option_b: q.Option_2,
    option_c: q.Option_3,
    option_d: q.Option_4,
    answer: q.correctAnswer,
    explanation: q.explanation || '',
  }));

  await db('quiz_questions').insert(questionData);

  return { quiz };
};

const createManualQuizService = async (quiz_id, questions) => {
  const questionData = questions.map((q) => ({
    quiz_id: quiz_id,
    question: q.Question,
    option_a: q.Option_1,
    option_b: q.Option_2,
    option_c: q.Option_3,
    option_d: q.Option_4,
    answer: q.correctAnswer,
    explanation: q.explanation || '',
  }));

  const response = await db('quiz_questions').insert(questionData);

  return response?.rowCount || [];
};

const uploadQuizFromXlsx = async (file,category,topics,set) => {
  const workbook = xlsx.read(file.buffer);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);

  const quiz = await createQuiz("", category, topics, set, data);
  return quiz;
};

const downloadQuizToXlsx = async (quizId) => {
  const questions = await db('quiz_questions').where({ quiz_id: quizId });
  const worksheet = xlsx.utils.json_to_sheet(questions);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Quiz');
  return xlsx.write(workbook, { type: 'buffer' });
};

const getQuizList = async (category, topics, set) => {
  const quizzes = await db('quizzes').select('quiz_id', 'title', 'category', 'topics', 'set', 'status').where({category, topics, set});

  const quizListWithQuestions = await Promise.all(
    quizzes.map(async (quiz) => {
      const questions = await db('quiz_questions')
        .where({ quiz_id: quiz.quiz_id })
        .select('question', 'option_a', 'option_b', 'option_c', 'option_d', 'answer', 'explanation');
      return { ...quiz, questions };
    })
  );

  return quizListWithQuestions;
};

const getTopicsList = async (category) => {
  const quizTopics = await db('quizzes').pluck('topics').where({category}).distinct();
  return {topics: quizTopics};
};

const getSetsList = async (category, topics) => {
  const quizSets = await db('quizzes')
  .pluck('set')
  .where({ category, topics });

  return {sets: quizSets};
};

async function submitQuiz(userId, quizId, submittedAnswers) {
  let score = 0;
  let unattempted = [];
  let incorrect = [];
  const quizData = await db('quizzes')
  .where('quizzes.quiz_id', quizId)
  .select('quizzes.category', 'quizzes.set', 'quizzes.topics').first();

  // Fetch quiz questions from the database
  const questions = await db('quiz_questions').where('quiz_questions.quiz_id', quizId);

  // Convert submittedAnswers array to a key-value map for easier lookup
  const submittedMap = Object.fromEntries(submittedAnswers.map(q => [q.questionId, q.answer]));

  questions.forEach(q => {
    const submittedAnswer = submittedMap[q.question_id];

    if (!submittedAnswer) {
      unattempted.push({ questionId: q.question_id });
    } else if (q.answer !== submittedAnswer) {
      incorrect.push({
        questionId: q.question_id,
        submitted: submittedAnswer,
        correct: q.answer
      });
    } else {
      score++;
    }
  });

  // Save results in the database
  await db('user_scores').insert({
    user_id: userId,
    quiz_id: quizId,
    score,
    total_questions: questions.length,
    unattempted: unattempted.length
  });

  return {
    score,
    total: questions.length,
    category:quizData.category,
    set:quizData.set,
    topics:quizData.topics,
    unattempted,
    incorrect
  };
}


const getUserScores = async (userId) => {
  return db('user_scores').leftJoin('quizzes', 'user_scores.quiz_id', 'quizzes.quiz_id')
  .where('user_scores.user_id', userId)
  .select('user_scores.*', 'quizzes.category', 'quizzes.set', 'quizzes.topics');
};

export default { createQuiz, uploadQuizFromXlsx, downloadQuizToXlsx, getQuizList, submitQuiz, getUserScores, getTopicsList, getSetsList, createManualQuizService };
