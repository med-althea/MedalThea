import quizService from '../services/quizService.js';

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
    const fileBuffer = await quizService.downloadQuizToXlsx(quizId);
    res.setHeader('Content-Disposition', 'attachment; filename="quiz.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(fileBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to download quiz' });
  }
};

export const listQuizzes = async (req, res) => {
  try {
    const { category, topics, set } = req.body;
    let quizzes;
    if(category && !topics && !set){
      quizzes = await quizService.getTopicsList(category);
    } else if(category && topics && !set){
      quizzes = await quizService.getSetsList(category, topics);
    } else if(category && topics && set){
      quizzes = await quizService.getQuizList(category, topics, set);
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