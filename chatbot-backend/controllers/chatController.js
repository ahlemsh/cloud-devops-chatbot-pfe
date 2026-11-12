const Message = require('../models/message.js');
const { generateSessionName } = require('../utils/KeyWordUtils.js');
const axios = require('axios');

const FLASK_API_URL = process.env.FLASK_API_URL;

exports.sendMessage = async (req, res) => {
  const { sessionId, message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    let chatSession;

    if (!sessionId) {
      chatSession = new Message({ sessionName: 'New Session', messages: [] });
    } else {
      chatSession = await Message.findOne({ sessionId });
      if (!chatSession) {
        return res.status(404).json({ error: 'Session not found' });
      }
    }

    chatSession.messages.push({ role: 'user', content: message });
    chatSession.lastActive = Date.now();

    let botResponse;
    try {
      const response = await axios.post(FLASK_API_URL, { input: message });
      botResponse = response.data.response;
    } catch (error) {
      console.error('Error calling Flask API:', error);
      botResponse = "Sorry, I'm unable to respond at the moment. Please try again later.";
    }

    chatSession.messages.push({ role: 'bot', content: botResponse });
    chatSession.sessionName = generateSessionName(chatSession.messages);

    await chatSession.save();

    res.json({ sessionId: chatSession.sessionId, response: botResponse });
  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const sessions = await Message.find({}, 'sessionId sessionName lastActive').sort({ lastActive: -1 });
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const chatSession = await Message.findOne({ sessionId: req.params.sessionId });

    if (!chatSession) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(chatSession);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const result = await Message.deleteOne({ sessionId: req.params.sessionId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Session not found or already deleted' });
    }

    res.json({ message: 'Chat history deleted successfully' });
  } catch (error) {
    console.error('Error deleting history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};