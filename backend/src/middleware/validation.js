const Joi = require('joi');

// User registration validation schema
const registerSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required'
    }),
  
  lastName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$#!%*?&])[A-Za-z\\d@$#!%*?&]+$'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    })
});

// User login validation schema
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));
      
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }
    
    next();
  };
};

// Workspace creation validation
const createWorkspaceSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Workspace name must be at least 2 characters',
      'string.max': 'Workspace name cannot exceed 100 characters',
      'any.required': 'Workspace name is required'
    }),
  
  slug: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-z0-9-]+$/)
    .required()
    .messages({
      'string.min': 'Workspace slug must be at least 2 characters',
      'string.max': 'Workspace slug cannot exceed 50 characters',
      'string.pattern.base': 'Workspace slug can only contain lowercase letters, numbers, and hyphens',
      'any.required': 'Workspace slug is required'
    }),
  
  description: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    })
});

// Member invitation validation
const inviteMemberSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  role: Joi.string()
    .valid('admin', 'member', 'guest')
    .default('member')
    .messages({
      'any.only': 'Role must be one of: admin, member, guest'
    })
});

// Update member role validation
const updateMemberRoleSchema = Joi.object({
  role: Joi.string()
    .valid('admin', 'member', 'guest')
    .required()
    .messages({
      'any.only': 'Role must be one of: admin, member, guest',
      'any.required': 'Role is required'
    })
});

const createProjectSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(255)
    .required()
    .messages({
      'string.min': 'Project name must be at least 2 characters',
      'string.max': 'Project name cannot exceed 255 characters',
      'any.required': 'Project name is required'
    }),
  
  description: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  
  color: Joi.string()
    .pattern(/^#[0-9A-F]{6}$/i)
    .default('#3b82f6')
    .messages({
      'string.pattern.base': 'Color must be a valid hex color code (e.g., #3b82f6)'
    }),
  
  startDate: Joi.date()
    .optional()
    .allow(null),
  
  endDate: Joi.date()
    .optional()
    .allow(null)
    .when('startDate', {
      is: Joi.exist(),
      then: Joi.date().min(Joi.ref('startDate')),
      otherwise: Joi.optional()
    })
    .messages({
      'date.min': 'End date must be after start date'
    })
});

// Add these to your existing validation.js

const createTaskSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(500)
    .required()
    .messages({
      'string.min': 'Task title cannot be empty',
      'string.max': 'Task title cannot exceed 500 characters',
      'any.required': 'Task title is required'
    }),
  
  description: Joi.string()
    .max(2000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 2000 characters'
    }),
  
  assigneeId: Joi.string()
    .uuid()
    .optional()
    .allow(null)
    .messages({
      'string.uuid': 'Assignee ID must be a valid UUID'
    }),
  
  priority: Joi.string()
    .valid('low', 'medium', 'high', 'urgent')
    .default('medium')
    .messages({
      'any.only': 'Priority must be one of: low, medium, high, urgent'
    }),
  
  dueDate: Joi.date()
    .optional()
    .allow(null)
    .messages({
      'date.base': 'Due date must be a valid date'
    }),
  
  labels: Joi.array()
    .items(Joi.string().max(50))
    .max(10)
    .default([])
    .messages({
      'array.max': 'Cannot have more than 10 labels',
      'string.max': 'Each label cannot exceed 50 characters'
    }),
  
  estimatedHours: Joi.number()
    .min(0)
    .max(999.99)
    .optional()
    .allow(null)
    .messages({
      'number.min': 'Estimated hours cannot be negative',
      'number.max': 'Estimated hours cannot exceed 999.99'
    })
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(500),
  description: Joi.string().max(2000).allow(''),
  assigneeId: Joi.string().uuid().allow(null),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
  dueDate: Joi.date().allow(null),
  labels: Joi.array().items(Joi.string().max(50)).max(10),
  estimatedHours: Joi.number().min(0).max(999.99).allow(null),
  actualHours: Joi.number().min(0).max(999.99).allow(null)
});

const moveTaskSchema = Joi.object({
  statusId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'Status ID must be a valid UUID',
      'any.required': 'Status ID is required'
    }),
  
  position: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'number.integer': 'Position must be an integer',
      'number.min': 'Position cannot be negative',
      'any.required': 'Position is required'
    })
});

const addCommentSchema = Joi.object({
  content: Joi.string()
    .min(1)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Comment cannot be empty',
      'string.max': 'Comment cannot exceed 2000 characters',
      'any.required': 'Comment content is required'
    }),
  
  mentions: Joi.array()
    .items(Joi.string().uuid())
    .max(20)
    .default([])
    .messages({
      'array.max': 'Cannot mention more than 20 users',
      'string.uuid': 'Mentioned user ID must be a valid UUID'
    })
});

module.exports = {
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
  validateCreateWorkspace: validate(createWorkspaceSchema),
  validateInviteMember: validate(inviteMemberSchema),
  validateUpdateMemberRole: validate(updateMemberRoleSchema),
  validateCreateProject: validate(createProjectSchema),
  validateCreateTask: validate(createTaskSchema),
  validateUpdateTask: validate(updateTaskSchema),
  validateMoveTask: validate(moveTaskSchema),
  validateAddComment: validate(addCommentSchema)
};
