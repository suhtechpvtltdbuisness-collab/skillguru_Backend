import mongoose from "mongoose";


const classSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  videoUrl: String,
  durationMinutes: { type: Number, required: true },
  resources: [String],
}, { _id: false });

const topicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  subtopics: [
    {
      title: { type: String, required: true },
      description: String,
      classes: [classSchema],
    }
  ]
}, { _id: false });


const weekSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: String,
  topics: [topicSchema]
}, { _id: false });


const courseContentSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  weeks: [weekSchema],
  totalDurationHours: { type: Number, default: 0 },
  totalClasses: { type: Number, default: 0 },
}, { timestamps: true });

const CourseContent = mongoose.model("CourseContent", courseContentSchema);
export default CourseContent;
