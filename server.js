import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// In-memory storage
const users = new Map();
const posts = [];
const follows = new Map();
const messages = new Map(); // conversation_id -> messages
const conversations = new Map(); // user -> [conversation_ids]

// Helper to create conversation ID
const getConversationId = (user1, user2) => {
  return [user1, user2].sort().join('_');
};

// Auth middleware (same as before)
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, 'secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth routes (same as before)
app.post('/api/register', (req, res) => {
  const { handle, password } = req.body;
  
  if (!handle || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  if (handle.length < 3) {
    return res.status(400).json({ error: 'Handle must be at least 3 characters' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  if (users.has(handle)) {
    return res.status(400).json({ error: 'Handle already taken' });
  }
  
  users.set(handle, { handle, password });
  conversations.set(handle, new Set());
  const token = jwt.sign({ handle }, 'secret_key');
  res.json({ token });
});

app.post('/api/login', (req, res) => {
  const { handle, password } = req.body;
  const user = users.get(handle);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ handle }, 'secret_key');
  res.json({ token });
});

// User routes
app.get('/api/users/search', auth, (req, res) => {
  const { query } = req.query;
  const searchResults = Array.from(users.keys())
    .filter(handle => 
      handle !== req.user.handle && 
      handle.toLowerCase().includes(query.toLowerCase())
    )
    .map(handle => ({ handle }));
  res.json(searchResults);
});

// Messaging routes
app.post('/api/messages', auth, (req, res) => {
  const { recipientHandle, content } = req.body;
  const senderHandle = req.user.handle;
  
  if (!users.has(recipientHandle)) {
    return res.status(404).json({ error: 'User not found' });
  }

  const conversationId = getConversationId(senderHandle, recipientHandle);
  
  if (!messages.has(conversationId)) {
    messages.set(conversationId, []);
    conversations.get(senderHandle).add(conversationId);
    conversations.get(recipientHandle).add(conversationId);
  }
  
  const message = {
    id: Date.now(),
    sender: senderHandle,
    recipient: recipientHandle,
    content,
    timestamp: Date.now()
  };
  
  messages.get(conversationId).push(message);
  res.json(message);
});

app.get('/api/messages/:recipientHandle', auth, (req, res) => {
  const conversationId = getConversationId(req.user.handle, req.params.recipientHandle);
  const conversationMessages = messages.get(conversationId) || [];
  res.json(conversationMessages);
});

app.get('/api/conversations', auth, (req, res) => {
  const userConversations = conversations.get(req.user.handle) || new Set();
  const conversationList = Array.from(userConversations).map(conversationId => {
    const [user1, user2] = conversationId.split('_');
    const otherUser = user1 === req.user.handle ? user2 : user1;
    const conversationMessages = messages.get(conversationId) || [];
    const lastMessage = conversationMessages[conversationMessages.length - 1];
    
    return {
      id: conversationId,
      otherUser,
      lastMessage
    };
  });
  
  res.json(conversationList);
});

// Keep existing routes...

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
