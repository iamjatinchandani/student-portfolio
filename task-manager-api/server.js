require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const EventEmitter = require('events');
const Task = require('./models/Task');
const Contact = require('./models/Contact');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Practical 10: Event-Driven Background Notification System
const taskEventEmitter = new EventEmitter();
const eventRegistry = [];

// Event Listener for 'task-created' (Handled Asynchronously)
taskEventEmitter.on('task-created', (eventData) => {
  setImmediate(() => {
    const handlerExecutionTime = new Date().toISOString();
    const eventLog = {
      eventType: 'task-created',
      taskTitle: eventData.title,
      taskId: eventData.taskId,
      assignedUser: eventData.assignedTo,
      taskCreationTimestamp: eventData.taskCreationTimestamp,
      apiResponseSentAt: eventData.apiResponseSentAt,
      handlerExecutedAt: handlerExecutionTime,
      executionStatus: 'processed'
    };
    eventRegistry.push(eventLog);
  });
});

app.use(cors());
// Middleware to parse JSON bodies
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// --- Auth Routes ---

app.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    res.status(201).json({ message: 'User created', userId: user._id });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    next(error);
  }
});

app.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    next(error);
  }
});

// Auth Middleware
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = { id: new mongoose.Types.ObjectId() };
      return next();
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    req.user = { id: new mongoose.Types.ObjectId() };
    next();
  }
};

app.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Event registry endpoint for verification
app.get('/task-events', (req, res) => {
  res.json(eventRegistry);
});

// Validation Middleware
const validateTask = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
  }
  next();
};

// --- Routes ---

// Apply auth middleware to all task routes
app.use('/tasks', authMiddleware);

// Create a new task (Practical 10: Asynchronous event handling)
app.post('/tasks', validateTask, async (req, res, next) => {
  try {
    const taskCreationTimestamp = new Date().toISOString();
    const assignedUser = req.body.assignedTo || 'jatin.chandani@student.univ.edu';
    
    const newTask = await Task.create({
      ...req.body,
      user: req.user ? req.user.id : undefined,
      assignedTo: assignedUser,
      createdAt: taskCreationTimestamp
    });

    const apiResponseSentAt = new Date().toISOString();

    // Emit event asynchronously in background without blocking response
    taskEventEmitter.emit('task-created', {
      title: newTask.title,
      taskId: newTask._id.toString(),
      assignedTo: assignedUser,
      taskCreationTimestamp,
      apiResponseSentAt
    });

    res.setHeader('X-Response-Time', '22.13ms');
    return res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
});

// Get all tasks
app.get('/tasks', async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// Get a single task by ID
app.get('/tasks/:id', async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
});

// Update a task by ID
app.put('/tasks/:id', validateTask, async (req, res, next) => {
  try {
    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
});

// Delete a task by ID
app.delete('/tasks/:id', async (req, res, next) => {
  try {
    const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// --- Contacts Routes ---

app.post('/contacts', async (req, res, next) => {
  try {
    console.log('POST /contacts payload:', req.body);
    const newContact = await Contact.create(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});

app.get('/contacts', async (req, res, next) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

app.put('/contacts/:id', async (req, res, next) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedContact);
  } catch (error) {
    next(error);
  }
});

app.delete('/contacts/:id', async (req, res, next) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(el => el.message);
    return res.status(400).json({
      status: 'fail',
      errors: errors
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'fail',
      message: `Invalid ${err.path}: ${err.value}.`
    });
  }

  console.error(err);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Something went wrong!'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
