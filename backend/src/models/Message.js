const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true
  },
  userInfo: {
    firstName: String,
    lastName: String,
    email: String,
    avatarUrl: String
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  messageType: {
    type: String,
    enum: ['text', 'system', 'file'],
    default: 'text'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Compound index for efficient project message queries
messageSchema.index({ projectId: 1, createdAt: -1 });

// Static method to get messages for a project with pagination
messageSchema.statics.getProjectMessages = async function(projectId, options = {}) {
  const { limit = 50, before = null } = options;
  
  const query = { projectId, isDeleted: false };
  
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// Static method to create a new message
messageSchema.statics.createMessage = async function(data) {
  const message = new this(data);
  await message.save();
  return message.toObject();
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
