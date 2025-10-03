import Joi from "joi";

export const registerValidator = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name should have at least 2 characters"
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email"
  }),
  password: Joi.string()
    .min(6)
    .max(128)
    .pattern(new RegExp("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*?&]+$"))
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters long",
      "string.pattern.base": "Password must contain at least one letter and one number"
    }),
  role: Joi.string().valid("student", "teacher", "sales", "admin").default("student"),
  phone: Joi.string().pattern(/^[0-9]{10}$/).messages({
    "string.pattern.base": "Phone number must be 10 digits"
  }),
  bio: Joi.string().max(500).allow(""),
  avatarUrl: Joi.string().uri().allow(""),
});

export const loginValidator = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email"
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters long"
  })
});
