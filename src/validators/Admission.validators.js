import Joi from "joi";

export const admissionValidator = Joi.object({
  first_name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.empty": "First name is required",
      "string.min": "First name should have at least 2 characters",
      "string.max": "First name should have at most 50 characters",
    }),

  last_name: Joi.string()
    .max(50)
    .allow("")
    .messages({
      "string.max": "Last name should have at most 50 characters",
    }),

  contact_no: Joi.number()
    .required()
    .messages({
      "number.base": "Contact number must be a number",
      "any.required": "Contact number is required",
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Email must be a valid email",
      "any.required": "Email is required",
    }),
});
