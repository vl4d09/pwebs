const router = require('express').Router();
const Reminder = require('../models/Reminder');
const { authorizePermission } = require('../middleware/auth');

/**
 * @swagger
 * /api/reminders:
 *   get:
 *     summary: Get all reminders for authenticated user with pagination
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filter by completion status
 *     responses:
 *       200:
 *         description: List of reminders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reminders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reminder'
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalItems:
 *                   type: integer
 *       403:
 *         description: Forbidden - missing permissions
 */
router.get('/', authorizePermission('READ'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const query = { userId: req.user.id };
    
    // Apply filters if provided
    if (req.query.completed !== undefined) {
      query.completed = req.query.completed === 'true';
    }
    
    const totalItems = await Reminder.countDocuments(query);
    const reminders = await Reminder.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ priority: -1, dueDate: 1, createdAt: -1 });
    
    res.status(200).json({
      reminders,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
      totalItems
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/reminders/{id}:
 *   get:
 *     summary: Get a specific reminder by ID
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Reminder ID
 *     responses:
 *       200:
 *         description: Reminder details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reminder'
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Reminder not found
 */
router.get('/:id', authorizePermission('READ'), async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    
    res.status(200).json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/reminders:
 *   post:
 *     summary: Create a new reminder
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               notes:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               dueTime:
 *                 type: string
 *               priority:
 *                 type: boolean
 *               completed:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Reminder created successfully
 *       403:
 *         description: Forbidden
 */
router.post('/', authorizePermission('WRITE'), async (req, res) => {
  try {
    const reminder = new Reminder({
      ...req.body,
      userId: req.user.id
    });
    
    const savedReminder = await reminder.save();
    res.status(201).json(savedReminder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/reminders/{id}:
 *   put:
 *     summary: Update a reminder
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Reminder ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               notes:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               dueTime:
 *                 type: string
 *               priority:
 *                 type: boolean
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Reminder updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Reminder not found
 */
router.put('/:id', authorizePermission('UPDATE'), async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    
    // Update reminder properties
    Object.keys(req.body).forEach(key => {
      if (key !== 'userId') {
        reminder[key] = req.body[key];
      }
    });
    
    const updatedReminder = await reminder.save();
    res.status(200).json(updatedReminder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/reminders/{id}:
 *   delete:
 *     summary: Delete a reminder
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Reminder ID
 *     responses:
 *       200:
 *         description: Reminder deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Reminder not found
 */
router.delete('/:id', authorizePermission('DELETE'), async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    
    res.status(200).json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;