const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Reminder:
 *       type: object
 *       required:
 *         - title
 *         - userId
 *       properties:
 *         title:
 *           type: string
 *           description: Reminder title
 *         notes:
 *           type: string
 *           description: Additional notes for the reminder
 *         dueDate:
 *           type: string
 *           format: date
 *           description: Due date for the reminder
 *         dueTime:
 *           type: string
 *           description: Due time in format HH:MM
 *         priority:
 *           type: boolean
 *           description: Whether this is a priority reminder
 *           default: false
 *         completed:
 *           type: boolean
 *           description: Whether the reminder has been completed
 *           default: false
 *         userId:
 *           type: string
 *           description: ID of the user who owns this reminder
 */
const reminderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    default: '',
  },
  dueDate: {
    type: Date,
    default: null,
  },
  dueTime: {
    type: String,
    default: null,
  },
  priority: {
    type: Boolean,
    default: false,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Reminder', reminderSchema);