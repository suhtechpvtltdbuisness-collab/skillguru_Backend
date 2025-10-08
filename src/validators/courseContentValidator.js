import Joi from "joi";

const classSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().allow(""),
  videoUrl: Joi.string().uri().allow(""),
  durationMinutes: Joi.number().min(1).required(),
  resources: Joi.array().items(Joi.string().uri().allow("")),
});

const subtopicSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().allow(""),
  classes: Joi.array().items(classSchema),
});

const topicSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().allow(""),
  subtopics: Joi.array().items(subtopicSchema),
});

const weekSchema = Joi.object({
  weekNumber: Joi.number().min(1).required(),
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().allow(""),
  topics: Joi.array().items(topicSchema),
});

export const createCourseContentValidator = Joi.object({
  course: Joi.string().required(), // ObjectId (course id)
  weeks: Joi.array().items(weekSchema),
  totalDurationHours: Joi.number().min(0).default(0),
  totalClasses: Joi.number().min(0).default(0),
  liveClassLink: Joi.string().uri().allow(""),
  recordings: Joi.array().items(
    Joi.object({
      title: Joi.string().min(1).required(),
      url: Joi.string().uri().required(),
      addedAt: Joi.date(),
    })
  ),
});

export const updateCourseContentValidator = Joi.object({
  weeks: Joi.array().items(weekSchema),
  totalDurationHours: Joi.number().min(0),
  totalClasses: Joi.number().min(0),
  liveClassLink: Joi.string().uri().allow(""),
  recordings: Joi.array().items(
    Joi.object({
      title: Joi.string().min(1).required(),
      url: Joi.string().uri().required(),
      addedAt: Joi.date(),
    })
  ),
});
