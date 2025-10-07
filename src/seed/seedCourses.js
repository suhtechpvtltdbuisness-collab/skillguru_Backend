// seedCourses.js
import mongoose from "mongoose";
import slugify from "slugify";
import Course from "../models/Course.js";
import CourseContent from "../models/CourseContent.js";
import { SkillGuruUser } from "../models/index.js";

const categories = [
  "Development",
  "Data Science",
  "Design",
  "Marketing",
  "Business",
];

// Connect to DB
mongoose.connect("mongodb+srv://Ankit:Ankit@cluster0.m609d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomWords = (count = 3) =>
  Array.from({ length: count }, () =>
    ["nextjs", "python", "marketing", "data", "design", "fullstack", "uiux", "node", "growth"][Math.floor(Math.random() * 9)]
  ).join(" ");

const createDemoContent = () => {
  const weeks = [];

  for (let w = 1; w <= 3; w++) {
    const week = {
      weekNumber: w,
      title: `Week ${w}: ${randomWords(2)}`,
      description: `Learn the fundamentals of ${randomWords(1)} in week ${w}.`,
      topics: [],
    };

    for (let t = 1; t <= 2; t++) {
      const topic = {
        title: `Topic ${t}: ${randomWords(2)}`,
        description: `Deep dive into ${randomWords(1)} concepts.`,
        subtopics: [],
      };

      for (let s = 1; s <= 2; s++) {
        const subtopic = {
          title: `Subtopic ${s}: ${randomWords(2)}`,
          description: `Explore ${randomWords(2)} details.`,
          classes: [],
        };

        for (let c = 1; c <= 2; c++) {
          const duration = Math.floor(Math.random() * 15) + 10;
          subtopic.classes.push({
            title: `Class ${c}: ${randomWords(2)}`,
            description: `This class covers ${randomWords(2)}.`,
            videoUrl: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`,
            durationMinutes: duration,
            resources: [`Resource ${c} - ${randomWords(2)}`],
          });
        }

        topic.subtopics.push(subtopic);
      }

      week.topics.push(topic);
    }

    weeks.push(week);
  }

  // Calculate total duration and classes
  const totalClasses = weeks.reduce(
    (sum, w) =>
      sum +
      w.topics.reduce(
        (tSum, t) =>
          tSum +
          t.subtopics.reduce((sSum, s) => sSum + s.classes.length, 0),
        0
      ),
    0
  );

  const totalDurationHours =
    weeks.reduce(
      (sum, w) =>
        sum +
        w.topics.reduce(
          (tSum, t) =>
            tSum +
            t.subtopics.reduce(
              (sSum, s) =>
                sSum + s.classes.reduce((cSum, c) => cSum + c.durationMinutes, 0),
              0
            ),
          0
        ),
      0
    ) / 60;

  return { weeks, totalClasses, totalDurationHours };
};

const seedCourses = async () => {
  try {
    console.log("🌱 Seeding started...");

    const instructors = await SkillGuruUser.find().limit(3); // pick from existing instructors
    if (instructors.length === 0) throw new Error("No instructors found!");

    // Remove old data
    await Course.deleteMany({});
    await CourseContent.deleteMany({});

    for (let i = 0; i < 10; i++) {
      const title = `${randomWords(3)} Course`;
      const slug = slugify(title, { lower: true, strict: true });
      const instructor = randomElement(instructors);
      const category = randomElement(categories);
      const price = Math.floor(Math.random() * 5000) + 500;

      const course = await Course.create({
        title,
        slug,
        description: `A complete course on ${title}.`,
        shortDescription: `Learn ${randomWords(2)} from scratch.`,
        instructor: instructor._id,
        category,
        price,
        durationHours: Math.floor(Math.random() * 40) + 10,
        level: randomElement(["beginner", "intermediate", "advanced"]),
        tags: [randomWords(1), randomWords(1)],
        thumbnailUrl: `https://picsum.photos/seed/${slug}/600/400`,
        published: true,
      });

      const { weeks, totalClasses, totalDurationHours } = createDemoContent();

      await CourseContent.create({
        course: course._id,
        weeks,
        totalDurationHours,
        totalClasses,
      });

      console.log(`✅ Added: ${course.title}`);
    }

    console.log("🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding:", error);
    process.exit(1);
  }
};

seedCourses();
