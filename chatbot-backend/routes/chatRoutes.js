const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

router.post('/chat', chatController.sendMessage);
router.get('/sessions', chatController.getSessions);
router.get('/history/:sessionId', chatController.getHistory);
router.delete('/history/:sessionId', chatController.deleteSession);

module.exports = router;


