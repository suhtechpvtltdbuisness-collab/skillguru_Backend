import mongoose from "mongoose";
import dotenv from "dotenv";
import {
  Assignment,
  AssignmentSubmission,
  Cart,
  Certificate,
  Course,
  Coursecontent,
  Enrollment,
  Progress,
  Review,
  SkillGuruUser,
  Wishlist,
  Order
} from "../models/index.js";

dotenv.config();

const DEMO_USER_ID = "68e687a6dd0f3bbae8fd2610";
const DEMO_USER_EMAIL = "ankitpandey841226@gmail.com";

const seedDemoData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("📡 Connected to MongoDB");

    // Verify user exists
    const user = await SkillGuruUser.findById(DEMO_USER_ID);
    if (!user) {
      console.error("❌ Demo user not found!");
      process.exit(1);
    }
    console.log("✅ Demo user found:", user.name);

    // Clean existing demo data for this user
    console.log("🧹 Cleaning existing demo data...");

    // First, get all enrollments to find which courses to clean up
    const existingEnrollments = await Enrollment.find({ student: DEMO_USER_ID }).lean();
    const enrolledCourseIds = existingEnrollments.map(e => e.course);

    // Delete user-specific data
    await Enrollment.deleteMany({ student: DEMO_USER_ID });
    await Progress.deleteMany({ user: DEMO_USER_ID });
    await AssignmentSubmission.deleteMany({ student: DEMO_USER_ID });
    await Certificate.deleteMany({ user: DEMO_USER_ID });
    await Review.deleteMany({ user: DEMO_USER_ID });
    await Cart.deleteMany({ user: DEMO_USER_ID });
    await Wishlist.deleteMany({ user: DEMO_USER_ID });
    await Order.deleteMany({ user: DEMO_USER_ID });

    // Clean up demo courses and related data
    if (enrolledCourseIds.length > 0) {
      await Assignment.deleteMany({ course: { $in: enrolledCourseIds } });
      await Coursecontent.deleteMany({ course: { $in: enrolledCourseIds } });
      await Course.deleteMany({ _id: { $in: enrolledCourseIds } });
    }

    // Also delete courses by slug pattern (in case of orphaned courses)
    await Course.deleteMany({
      slug: {
        $in: [
          "advanced-react-typescript",
          "data-science-python-ml",
          "ui-ux-design-figma",
          "fullstack-javascript"
        ]
      }
    });

    // Create Instructor Users (if they don't exist)
    console.log("👨‍🏫 Creating instructors...");

    let instructor1 = await SkillGuruUser.findOne({ email: "sarah.johnson@suhtech.in" });
    if (!instructor1) {
      instructor1 = await SkillGuruUser.create({
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@suhtech.in",
        password: "$2a$10$demoPasswordHash",
        role: "teacher",
        isVerified: true
      });
    }

    let instructor2 = await SkillGuruUser.findOne({ email: "michael.chen@suhtech.in" });
    if (!instructor2) {
      instructor2 = await SkillGuruUser.create({
        name: "Prof. Michael Chen",
        email: "michael.chen@suhtech.in",
        password: "$2a$10$demoPasswordHash",
        role: "teacher",
        isVerified: true
      });
    }

    let instructor3 = await SkillGuruUser.findOne({ email: "emily.rodriguez@suhtech.in" });
    if (!instructor3) {
      instructor3 = await SkillGuruUser.create({
        name: "Emily Rodriguez",
        email: "emily.rodriguez@suhtech.in",
        password: "$2a$10$demoPasswordHash",
        role: "teacher",
        isVerified: true
      });
    }

    console.log("✅ Created/found 3 instructors");

    // Create Demo Courses
    console.log("📚 Creating demo courses...");

    const course1 = await Course.create({
      title: "Advanced React & TypeScript Masterclass",
      slug: "advanced-react-typescript",
      description: "Master modern React development with TypeScript, including hooks, context, Redux, and advanced patterns.",
      shortDescription: "Learn advanced React concepts and TypeScript integration",
      instructor: instructor1._id,
      category: "Web Development",
      price: 2999,
      durationHours: 40,
      level: "advanced",
      tags: ["React", "TypeScript", "Web Development", "Frontend"],
      thumbnailUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop",
      published: true
    });

    const course2 = await Course.create({
      title: "Data Science with Python & Machine Learning",
      slug: "data-science-python-ml",
      description: "Complete data science course covering Python, pandas, NumPy, scikit-learn, and deep learning with TensorFlow.",
      shortDescription: "Become a data science expert with Python",
      instructor: instructor2._id,
      category: "Data Science",
      price: 3499,
      durationHours: 60,
      level: "intermediate",
      tags: ["Python", "Data Science", "Machine Learning", "AI"],
      thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
      published: true
    });

    const course3 = await Course.create({
      title: "UI/UX Design Masterclass - Figma to Production",
      slug: "ui-ux-design-figma",
      description: "Learn complete UI/UX design process from research to prototyping and handoff using Figma.",
      shortDescription: "Master UI/UX design with Figma",
      instructor: instructor3._id,
      category: "Design",
      price: 2499,
      durationHours: 35,
      level: "beginner",
      tags: ["UI/UX", "Figma", "Design", "Prototyping"],
      thumbnailUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop",
      published: true
    });

    const course4 = await Course.create({
      title: "Full Stack JavaScript Development",
      slug: "fullstack-javascript",
      description: "Build modern full-stack applications with React, Node.js, Express, and MongoDB.",
      shortDescription: "Complete full-stack development with JavaScript",
      instructor: instructor1._id,
      category: "Web Development",
      price: 3999,
      durationHours: 80,
      level: "intermediate",
      tags: ["JavaScript", "Node.js", "React", "MongoDB"],
      thumbnailUrl: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop",
      published: true
    });

    console.log("✅ Created 4 demo courses");

    // Create Course Content for enrolled courses
    console.log("📖 Creating course content...");

    await Coursecontent.create({
      course: course1._id,
      totalDurationHours: 40,
      totalClasses: 45,
      liveClassLink: "https://meet.google.com/demo-react-class",
      weeks: [
        {
          weekNumber: 1,
          title: "React Fundamentals Review",
          topics: [
            {
              title: "Modern React Setup",
              subtopics: [
                {
                  title: "Environment Setup",
                  classes: [
                    {
                      title: "Introduction to the Course",
                      description: "Overview of what we'll learn",
                      videoUrl: "https://example.com/video1",
                      durationMinutes: 15,
                      resources: ["https://reactjs.org/docs"]
                    },
                    {
                      title: "Setting up React with Vite",
                      description: "Modern React development setup",
                      videoUrl: "https://example.com/video2",
                      durationMinutes: 30,
                      resources: []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          weekNumber: 2,
          title: "TypeScript Integration",
          topics: [
            {
              title: "TypeScript Basics",
              subtopics: [
                {
                  title: "Type System",
                  classes: [
                    {
                      title: "Introduction to TypeScript",
                      description: "Understanding TypeScript basics",
                      videoUrl: "https://example.com/video3",
                      durationMinutes: 45,
                      resources: []
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      recordings: [
        {
          title: "Live Session: React Hooks Deep Dive",
          url: "https://example.com/recording1",
          addedAt: new Date("2025-10-15")
        }
      ]
    });

    await Coursecontent.create({
      course: course2._id,
      totalDurationHours: 60,
      totalClasses: 65,
      liveClassLink: "https://meet.google.com/demo-ds-class",
      weeks: [
        {
          weekNumber: 1,
          title: "Python Fundamentals",
          topics: [
            {
              title: "Getting Started",
              subtopics: [
                {
                  title: "Python Basics",
                  classes: [
                    {
                      title: "Introduction to Data Science",
                      description: "What is data science?",
                      videoUrl: "https://example.com/video-ds1",
                      durationMinutes: 20,
                      resources: []
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      recordings: []
    });

    console.log("✅ Created course content");

    // Create Enrollments
    console.log("🎓 Creating enrollments...");

    const enrollment1 = await Enrollment.create({
      student: DEMO_USER_ID,
      course: course1._id,
      status: "enrolled",
      progress: 65,
      enrolledAt: new Date("2025-10-01")
    });

    const enrollment2 = await Enrollment.create({
      student: DEMO_USER_ID,
      course: course2._id,
      status: "enrolled",
      progress: 82,
      enrolledAt: new Date("2025-09-15")
    });

    const enrollment3 = await Enrollment.create({
      student: DEMO_USER_ID,
      course: course3._id,
      status: "completed",
      progress: 100,
      enrolledAt: new Date("2025-08-01")
    });

    console.log("✅ Created 3 enrollments");

    // Create Progress for enrolled courses
    console.log("📊 Creating progress data...");

    await Progress.create({
      user: DEMO_USER_ID,
      course: course1._id,
      completedLessons: ["w1-t0-s0-c0", "w1-t0-s0-c1", "w2-t0-s0-c0"]
    });

    await Progress.create({
      user: DEMO_USER_ID,
      course: course2._id,
      completedLessons: ["w1-t0-s0-c0"]
    });

    console.log("✅ Created progress records");

    // Create Assignments
    console.log("📝 Creating assignments...");

    const assignment1 = await Assignment.create({
      course: course1._id,
      title: "Build E-commerce Shopping Cart",
      description: "Create a functional shopping cart with React and TypeScript",
      dueDate: new Date("2025-12-01"),
      maxMarks: 100,
      attachments: ["https://example.com/assignment-brief.pdf"],
      createdBy: user._id
    });

    const assignment2 = await Assignment.create({
      course: course1._id,
      title: "Implement Custom Hooks",
      description: "Create 3 custom React hooks for common use cases",
      dueDate: new Date("2025-11-20"),
      maxMarks: 50,
      attachments: [],
      createdBy: user._id
    });

    const assignment3 = await Assignment.create({
      course: course2._id,
      title: "ML Model Implementation",
      description: "Build and train a machine learning model using scikit-learn",
      dueDate: new Date("2025-11-25"),
      maxMarks: 100,
      attachments: ["https://example.com/dataset.csv"],
      createdBy: user._id
    });

    const assignment4 = await Assignment.create({
      course: course2._id,
      title: "Data Analysis Project",
      description: "Perform exploratory data analysis on provided dataset",
      dueDate: new Date("2025-11-10"),
      maxMarks: 75,
      attachments: [],
      createdBy: user._id
    });

    console.log("✅ Created 4 assignments");

    // Create Assignment Submissions
    console.log("✍️ Creating assignment submissions...");

    await AssignmentSubmission.create({
      assignment: assignment2._id,
      student: DEMO_USER_ID,
      course: course1._id,
      submittedAt: new Date("2025-11-18"),
      content: "I have implemented three custom hooks: useLocalStorage, useFetch, and useDebounce. All hooks include TypeScript types and comprehensive error handling.",
      attachments: ["https://example.com/my-submission.zip"],
      marks: 48,
      feedback: "Great work! Your hooks are well-implemented and properly typed.",
      status: "graded"
    });

    await AssignmentSubmission.create({
      assignment: assignment4._id,
      student: DEMO_USER_ID,
      course: course2._id,
      submittedAt: new Date("2025-11-09"),
      content: "Completed comprehensive EDA with visualizations and insights.",
      attachments: ["https://example.com/eda-notebook.ipynb"],
      marks: null,
      feedback: null,
      status: "submitted"
    });

    console.log("✅ Created 2 assignment submissions");

    // Create Certificate for completed course
    console.log("🎓 Creating certificate...");

    await Certificate.create({
      user: DEMO_USER_ID,
      course: course3._id,
      issuedAt: new Date("2025-10-15")
    });

    console.log("✅ Created 1 certificate");

    // Create Reviews
    console.log("⭐ Creating reviews...");

    await Review.create({
      user: DEMO_USER_ID,
      course: course1._id,
      rating: 5,
      comment: "Excellent course! Dr. Sarah explains complex concepts in a very clear way. The hands-on projects really helped solidify my understanding.",
      aspects: {
        contentQuality: 5,
        instructorClarity: 5,
        valueForMoney: 4
      }
    });

    await Review.create({
      user: DEMO_USER_ID,
      course: course2._id,
      rating: 5,
      comment: "Best data science course I've taken. Prof. Chen covers everything from basics to advanced ML algorithms.",
      aspects: {
        contentQuality: 5,
        instructorClarity: 5,
        valueForMoney: 5
      }
    });

    await Review.create({
      user: DEMO_USER_ID,
      course: course3._id,
      rating: 4,
      comment: "Great introduction to UI/UX design. The Figma tutorials were particularly helpful.",
      aspects: {
        contentQuality: 4,
        instructorClarity: 4,
        valueForMoney: 4
      }
    });

    console.log("✅ Created 3 reviews");

    // Create Wishlist
    console.log("❤️ Creating wishlist...");

    await Wishlist.create({
      user: DEMO_USER_ID,
      items: [
        {
          course: course4._id,
          addedAt: new Date()
        }
      ]
    });

    console.log("✅ Created wishlist with 1 item");

    // Create Orders
    console.log("🛒 Creating orders...");

    await Order.create({
      user: DEMO_USER_ID,
      items: [
        {
          course: course1._id,
          price: 2999
        }
      ],
      amount: 2999,
      currency: "INR",
      status: "paid",
      provider: "cashfree",
      providerOrderId: "order_demo_" + Date.now(),
      providerPaymentId: "payment_demo_" + Date.now(),
      createdAt: new Date("2025-10-01")
    });

    await Order.create({
      user: DEMO_USER_ID,
      items: [
        {
          course: course2._id,
          price: 3499
        },
        {
          course: course3._id,
          price: 2499
        }
      ],
      amount: 5998,
      currency: "INR",
      status: "paid",
      provider: "cashfree",
      providerOrderId: "order_demo_" + (Date.now() + 1),
      providerPaymentId: "payment_demo_" + (Date.now() + 1),
      createdAt: new Date("2025-09-15")
    });

    console.log("✅ Created 2 orders");

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("🎉 DEMO DATA SEEDING COMPLETED!");
    console.log("=".repeat(50));
    console.log("\n📊 Summary:");
    console.log(`👤 User: ${user.name} (${user.email})`);
    console.log(`📚 Courses Created: 4`);
    console.log(`🎓 Enrollments: 3 (1 completed, 2 in progress)`);
    console.log(`📝 Assignments: 4 (2 submitted)`);
    console.log(`🏆 Certificates: 1`);
    console.log(`⭐ Reviews: 3`);
    console.log(`❤️ Wishlist Items: 1`);
    console.log(`🛒 Orders: 2`);
    console.log(`📊 Progress Records: 2`);

    console.log("\n🔗 Access Dashboard:");
    console.log(`Frontend: http://localhost:5173/dashboard`);
    console.log(`API: http://localhost:5000/api/v1/dashboard/me`);

    console.log("\n✅ You can now login and see all demo data!");
    console.log("=".repeat(50) + "\n");

    mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedDemoData();
