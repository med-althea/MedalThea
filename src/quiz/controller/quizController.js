import * as quizService from '../services/quizService.js';

export const createQuiz = async (req, res) => {
  try {
    const { title, category, year, set, questions } = req.body;
    if(!title || !category || !year || !set || !questions){
      return res.status(400).json({ status:400, message: 'Failed to create quiz' });
    }
    const newQuiz = await quizService.createQuiz(title, category, year, set, questions);
    res.status(201).json(newQuiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const { quizId, questions, image, question_id } = req.body;
    if(!quizId || !questions || !question_id){
      return res.status(400).json({ status:400, message: 'Required Fields Missing' });
    }
    const newQuiz = await quizService.updateQuiz(quizId, questions, image, question_id);
    res.status(201).json(newQuiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error });
  }
};

export const createManualQuiz = async (req, res) => {
  try {
    const { quiz_id, questions } = req.body;
    if(!quiz_id || !questions){
      return res.status(400).json({ status:400, message: 'Failed to create quiz' });
    }
    const newQuiz = await quizService.createManualQuizService(quiz_id, questions);

    if(newQuiz)
      res.status(201).json({status:200, message:'Quiz created successfully'});
    else
     res.status(500).json({status:500, message:"Something went wrong, Failed to create quiz"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error });
  }
};

export const uploadQuizXlsx = async (req, res) => {
  try {

    const { category, topics, set } = req.body;
    const file = req.file;

    if(!file || !category || !topics){
      return res.status(400).json({ status:400, message: 'Failed to upload quiz' });
    }

    const result = await quizService.uploadQuizFromXlsx(file,category,topics,set);
    return res.status(201).json({ status:201, message: 'Quiz uploaded successfully', result });
  } catch (error) {
    return res.status(500).json({ status:500, message: 'Failed to upload quiz' });
  }
};

export const downloadQuizXlsx = async (req, res) => {
  try {
    const { quizId } = req.params;

    // Fetch the file buffer
    const fileBuffer = await quizService.downloadQuizToXlsx(quizId);

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(404).json({ status: 404, message: "File not found or empty" });
    }

    res.setHeader("Content-Disposition", `attachment; filename=${quizId}.xlsx`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Length", fileBuffer.length);

    res.send(fileBuffer);
  } catch (error) {
    console.error("Download Quiz Error:", error);
    res.status(500).json({ status: 500, message: "Failed to download quiz" });
  }
};

export const listQuizzes = async (req, res) => {
  try {
    const { set } = req.body;
    let quizzes;
    if(set){
      quizzes = await quizService.getQuizList(set);
    }

    res.status(200).json(quizzes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch quizzes' });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { userId, quizId, submittedAnswers } = req.body;
    const result = await quizService.submitQuiz(userId, quizId, submittedAnswers);
    res.status(200).json({ message: 'Quiz submitted', result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to submit quiz' });
  }
};

export const getUserScores = async (req, res) => {
  try {
    const { userId } = req.params;
    const scores = await quizService.getUserScores(userId);
    if(!scores){
      res.status(500).json({ message: 'Invalid UserId or not yet attempted any quiz' });
    }
    res.status(200).json(scores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch user scores' });
  }
};

export const listCategories = async (req, res) => {
  try {
    const categories = await quizService.getAllCategories();
    res.status(200).json({ status: 200, data: categories });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Failed to fetch categories" });
  }
};

export const createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ status: 400, message: "Name is required" });

  try {
    const newCategory = await quizService.createCategory(name);
    res.status(201).json({ status: 201, data: newCategory });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    await quizService.deleteCategory(categoryId);
    res.status(200).json({ status: 200, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Failed to delete category" });
  }
};

export const listTopics = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const topics = await quizService.getTopics(categoryId);
    res.status(200).json({ status: 200, data: topics });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Failed to fetch topics" });
  }
};

export const createTopic = async (req, res) => {
  const { name, category_id, image } = req.body;
  if (!name || !category_id) return res.status(400).json({ status: 400, message: "All fields are required" });

  try {
    const newTopic = await quizService.createTopic(name, category_id, image);
    res.status(201).json({ status: 201, data: newTopic });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

export const deleteTopic = async (req, res) => {
  const { topicId } = req.params;
  try {
    await quizService.deleteTopic(topicId);
    res.status(200).json({ status: 200, message: "Topic deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Failed to delete topic" });
  }
};

export const listSets = async (req, res) => {
  try {
    const { topicId } = req.params;
    const sets = await quizService.getSets(topicId);
    res.status(200).json({ status: 200, data: sets });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Failed to fetch sets" });
  }
};

export const createSet = async (req, res) => {
  const { name, topic_id, image } = req.body;
  if (!name || !topic_id) return res.status(400).json({ status: 400, message: "All fields are required" });

  try {
    const newSet = await quizService.createSet(name, topic_id, image);
    res.status(201).json({ status: 201, data: newSet });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

export const deleteSet = async (req, res) => {
  const { setId } = req.params;
  try {
    await quizService.deleteSet(setId);
    res.status(200).json({ status: 200, message: "Set deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Failed to delete set" });
  }
};

export const deleteQuiz = async (req, res) => {
  const { quizId, questionId } = req.params;
  try {
    await quizService.deleteQuiz(quizId, questionId);
    res.status(200).json({ status: 200, message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Failed to delete quiz" });
  }
};