import Joi from "joi";

// Validation for submitting a contact request
export const submitContactValidator = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name should have at least 2 characters",
    "string.max": "Name should have at most 50 characters",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Email must be a valid email address",
  }),
  phone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .messages({
      "string.pattern.base": "Phone number must be 10-15 digits",
    }),
  message: Joi.string().min(5).required().messages({
    "string.empty": "Message is required",
    "string.min": "Message should have at least 5 characters",
  }),
  callbackRequested: Joi.boolean().optional(),
});
