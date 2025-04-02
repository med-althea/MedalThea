import { client, connection, migrations } from '../../../knexfile.js';
import knex from 'knex';
import xlsx from 'xlsx';

const db = knex({ client, connection, migrations });

export const createQuiz = async (title, category, topics, set, questions) => {
  const [quiz] = await db('quizzes').insert({ title, category_id:category, topic_id:topics, set_id:set }).returning('quiz_id');
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

export const updateQuiz = async (quiz_id, questions, image, question_id) => {
  questions.map(async (q) => {
    const updateData = {};

    if (q.Question) updateData.question = q.Question;
    if (q.Option_1) updateData.option_a = q.Option_1;
    if (q.Option_2) updateData.option_b = q.Option_2;
    if (q.Option_3) updateData.option_c = q.Option_3;
    if (q.Option_4) updateData.option_d = q.Option_4;
    if (q.correctAnswer) updateData.answer = q.correctAnswer;
    if (q.explanation) updateData.explanation = q.explanation;
    if (image !== undefined) {
      updateData.image = image === "" ? null : image;
    }

    console.log("updateData",updateData, quiz_id, question_id)

    if (Object.keys(updateData).length > 0) {
      await db("quiz_questions").where({ quiz_id, question_id }).update(updateData);
    }
  })


  return { quiz_id };
};

export const createManualQuizService = async (quiz_id, questions) => {
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

export const uploadQuizFromXlsx = async (file,category,topics,set) => {
  const workbook = xlsx.read(file.buffer);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);

  const quiz = await createQuiz("", category, topics, set, data);
  return quiz;
};

export const downloadQuizToXlsx = async (quizId) => {
  try {
    // Fetch questions for the quiz
    const questions = await db("quiz_questions")
      .where({ quiz_id: quizId })
      .select(
        "question",
        "option_a",
        "option_b",
        "option_c",
        "option_d",
        "answer",
        "explanation"
      );

    if (!questions || questions.length === 0) {
      return null; // Handle empty dataset
    }

    // Convert questions to worksheet
    const worksheet = xlsx.utils.json_to_sheet(questions);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Quiz");

    // Generate a buffer from the workbook
    return xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
  } catch (error) {
    console.error("Error generating XLSX:", error);
    return null;
  }
};

export const getQuizList = async (set) => {
  const quizzes = await db("quizzes")
  .select(
    "quizzes.quiz_id",
    "quizzes.title",
    "quizzes.status",
    "quizzes.category_id",
    "categories.name as category_name",
    "quizzes.topic_id",
    "topics.name as topic_name",
    "quizzes.set_id",
    "sets.name as set_name"
  )
  .leftJoin("categories", "quizzes.category_id", "categories.category_id")
  .leftJoin("topics", "quizzes.topic_id", "topics.topic_id")
  .leftJoin("sets", "quizzes.set_id", "sets.set_id")
  .where("quizzes.set_id", set);

  const quizListWithQuestions = await Promise.all(
    quizzes.map(async (quiz) => {
      const questions = await db('quiz_questions')
        .where({ quiz_id: quiz.quiz_id })
        .select('question_id','question', 'option_a', 'option_b', 'option_c', 'option_d', 'answer', 'explanation');
        const formattedQuestions = questions.map(q => ({
          question_id: q.question_id,
          question: q.question,
          options: [{option: q.option_a}, {option: q.option_b}, {option: q.option_c}, {option: q.option_d}],
          answer: q.answer,
          explanation: q.explanation
        }));
    
        return { ...quiz, questions: formattedQuestions };
    })
  );

  return quizListWithQuestions;
};

export const getTopicsList = async (category) => {
  const quizTopics = await db('quizzes').pluck('topics').where({category}).distinct();
  return {topics: quizTopics};
};

export const getSetsList = async (category, topics) => {
  const quizSets = await db('quizzes')
  .pluck('set')
  .where({ category, topics });

  return {sets: quizSets};
};

export const submitQuiz = async (userId, quizId, submittedAnswers) => {
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


export const getUserScores = async (userId) => {
  return db('user_scores').leftJoin('quizzes', 'user_scores.quiz_id', 'quizzes.quiz_id')
  .where('user_scores.user_id', userId)
  .select('user_scores.*', 'quizzes.category', 'quizzes.set', 'quizzes.topics');
};

export const getAllCategories = () => db("categories").select("*");

export const getSets = (topicId) => db("sets").select("*").where("topic_id",topicId);

export const getTopics = (categoryId) => db("topics").select("*").where("category_id",categoryId);

export const deleteSet = async (id) => {
  const deletedRows = await db("sets").where({ set_id: id }).del();
  return deletedRows > 0; // Returns true if deleted, false if not found
};

export const deleteTopic = async (id) => {
  const deletedRows = await db("topics").where({ topic_id: id }).del();
  return deletedRows > 0;
};

export const deleteCategory = async (id) => {
  const deletedRows = await db("categories").where({ category_id: id }).del();
  return deletedRows > 0;
};

export const createCategory = async (name) => {
  const existingCategory = await db("categories").where({ name }).first();
  if (existingCategory) {
    throw new Error("Category name already exists");
  }
  return db("categories").insert({ name }).returning("*");
};


export const createTopic = async (name, category_id, image) => {
  const existingTopic = await db("topics").where({ name, category_id }).first();
  if (existingTopic) {
    throw new Error("Topic name already exists in this category");
  }
  return db("topics").insert({ name, category_id, image }).returning("*");
};


export const createSet = async (name, topic_id, image) => {
  const existingSet = await db("sets").where({ name, topic_id }).first();
  if (existingSet) {
    throw new Error("Set name already exists in this topic");
  }
  return db("sets").insert({ name, topic_id, image }).returning("*");
};

export const deleteQuiz = async (quiz_id, question_id) => {
  const deletedRows = db("quiz_questions");
  console.log("quiz_id, question_id", quiz_id, question_id)
  if(question_id){
    deletedRows.where({question_id})
  }
  if(quiz_id){
    deletedRows.where({quiz_id})
  }
  const rowsDeleted = await deletedRows.del();

  return rowsDeleted > 0;
};
