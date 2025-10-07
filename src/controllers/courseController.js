import { Course, Coursecontent } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";


export const createCourse = catchAsync(async (req, res) => {
  const payload = { ...req.body, instructor: req.user._id };
  const course = await Course.create(payload);
  res.status(201).json({ success: true, data: course });
});


export const listCourses = catchAsync(async (req, res) => {
  const courses = await Course.find().populate("instructor", "name email");
  res.json({ success: true, data: courses });
});


export const getCourse = catchAsync(async (req, res) => {
  const course = await Course.findById(req.params.id).populate("instructor", "name email");
  if (!course) return res.status(404).json({ success: false, message: "Course not found" });
  res.json({ success: true, data: course });
});

// ✅ Update a course
export const updateCourse = catchAsync(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!course) return res.status(404).json({ success: false, message: "Course not found" });
  res.json({ success: true, data: course });
});


export const deleteCourse = catchAsync(async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: "Course not found" });
  res.json({ success: true, message: "Course deleted successfully" });
});


export const popularCourses = catchAsync(async (req, res) => {
  const courses = await Course.find({ published: true })
    .sort({ price: -1 })
    .limit(10)
    .populate("instructor", "name email");
  res.json({ success: true, data: courses });
});


export const getCourseByIdWithContent = catchAsync(async (req, res) => {
  const { id } = req.params;

  const course = await Course.findById(id)
    .populate("instructor", "name email")
    .lean();

  if (!course) {
    return res.status(404).json({ success: false, message: "Course not found" });
  }


  const courseContent = await Coursecontent.findOne({ course: id }).lean();

  res.json({
    success: true,
    data: {
      ...course,
      content: courseContent ? courseContent.weeks : [],
      totalDurationHours: courseContent?.totalDurationHours || 0,
      totalClasses: courseContent?.totalClasses || 0,
    },
  });
});



export const getPopularCoursesLimited = catchAsync(async (req, res) => {
  const courses = await Course.find({ published: true })
    .sort({ price: -1 }) // or use -createdAt if you want latest
    .limit(3)
    .populate("instructor", "name email");

  res.json({ success: true, data: courses });
});
