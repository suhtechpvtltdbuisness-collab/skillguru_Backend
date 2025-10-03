import Joi from "joi";

export const createCourseValidator = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  slug: Joi.string().min(3).max(100).required(),
  description: Joi.string().allow(""),
  shortDescription: Joi.string().allow(""),
  category: Joi.string().allow(""),
  price: Joi.number().min(0).default(0),
  durationHours: Joi.number().min(0),
  level: Joi.string().valid("beginner", "intermediate", "advanced").default("beginner"),
  tags: Joi.array().items(Joi.string()),
  thumbnailUrl: Joi.string().uri().allow(""),
  published: Joi.boolean(),
  metadata: Joi.object(),
});

export const updateCourseValidator = Joi.object({
  title: Joi.string().min(3).max(100),
  slug: Joi.string().min(3).max(100),
  description: Joi.string().allow(""),
  shortDescription: Joi.string().allow(""),
  category: Joi.string().allow(""),
  price: Joi.number().min(0),
  durationHours: Joi.number().min(0),
  level: Joi.string().valid("beginner", "intermediate", "advanced"),
  tags: Joi.array().items(Joi.string()),
  thumbnailUrl: Joi.string().uri().allow(""),
  published: Joi.boolean(),
  metadata: Joi.object(),
});
