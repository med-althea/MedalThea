import express from 'express';
import * as quizController from '../controller/quizController.js';

import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post('/create', quizController.createQuiz);
router.post('/manual/create', quizController.createManualQuiz);
router.post('/upload', upload.single("file"), quizController.uploadQuizXlsx);
router.get('/download/:quizId', quizController.downloadQuizXlsx);
router.get('/list', quizController.listQuizzes);
router.post('/submit', quizController.submitQuiz);
router.get('/scores/:userId', quizController.getUserScores);
router.post('/manual/update', quizController.updateQuiz);

router.get("/category/list", quizController.listCategories);
router.get("/topic/list/:categoryId", quizController.listTopics);
router.get("/set/list/:topicId", quizController.listSets);

router.post("/category/create", quizController.createCategory);
router.post("/topic/create", quizController.createTopic);
router.post("/set/create", quizController.createSet);

router.delete("/category/delete/:categoryId", quizController.deleteCategory);
router.delete("/topic/delete/:topicId", quizController.deleteTopic);
router.delete("/set/delete/:setId", quizController.deleteSet);
router.delete("/quiz/delete/:quizId/:questionId", quizController.deleteQuiz);
router.delete("/quiz/delete/:quizId", quizController.deleteQuiz);

export default router;