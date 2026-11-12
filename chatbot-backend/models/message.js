const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const MessageSchema = new mongoose.Schema({
  sessionId: { type: String, default: uuidv4 },
  sessionName: { type: String, default: 'New Session' },
  messages: [
    {
      role: String,
      content: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  lastActive: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', MessageSchema);