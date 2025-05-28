const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Email already exists or invalid input
 */
router.post('/register', async (req, res) => {
  try {
    // Check if user already exists
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create new user
    const user = new User({
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role || 'USER',
    });

    const savedUser = await user.save();
    res.status(201).json({
      id: savedUser._id,
      email: savedUser.email,
      role: savedUser.role,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate a user and get token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
  try {
    // Check if user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: 'Email or password is incorrect' });
    }

    // Check password
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Email or password is incorrect' });
    }

    // Determine permissions based on role
    let permissions = [];
    if (user.role === 'ADMIN') {
      permissions = ['READ', 'WRITE', 'UPDATE', 'DELETE'];
    } else {
      permissions = ['READ', 'WRITE'];
    }

    // Create and assign token
    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email, 
        role: user.role,
        permissions: permissions 
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '1m' } // Token expires in 1 minute for demo
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/auth/token:
 *   get:
 *     summary: Generate a demo token with specified permissions
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, USER]
 *         description: Role to include in token
 *     responses:
 *       200:
 *         description: Token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get('/token', (req, res) => {
  const role = req.query.role || 'USER';
  
  let permissions = [];
  if (role === 'ADMIN') {
    permissions = ['READ', 'WRITE', 'UPDATE', 'DELETE'];
  } else {
    permissions = ['READ', 'WRITE'];
  }
  
  // Generate demo token
  const token = jwt.sign(
    { 
      id: '60d0fe4f5311236168a109ca', // Demo user ID
      email: 'demo@example.com',
      role: role,
      permissions: permissions 
    }, 
    process.env.JWT_SECRET,
    { expiresIn: '1m' } // Token expires in 1 minute
  );
  
  res.status(200).json({
    token,
    permissions,
    role,
    expiresIn: '1 minute'
  });
});

module.exports = router;