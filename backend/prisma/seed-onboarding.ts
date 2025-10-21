/// <reference types="node" />
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const onboardingQuestions = [
  // Question 0 - Name (will be handled separately in frontend)
  {
    questionNumber: 0,
    category: "Welcome",
    questionText: "What should we call you?",
    questionType: "text-input",
    options: [],
    order: 0,
  },

  // Category 1: Getting Started
  {
    questionNumber: 1,
    category: "Getting Started",
    questionText: "How did you discover Scopas?",
    questionType: "single-choice",
    options: [
      "Social Media (Instagram, Facebook, TikTok, etc.)",
      "Search Engine (Google, Bing, etc.)",
      "Friend or Family Recommendation",
      "Other",
    ],
    order: 1,
  },
  {
    questionNumber: 2,
    category: "Getting Started",
    questionText: "What's your primary reason for using Scopas?",
    questionType: "single-choice",
    options: [
      "Save money on purchases",
      "Track spending and budgets",
      "Discover new deals automatically",
      "Organize my shopping better",
    ],
    order: 2,
  },

  // Category 2: Shopping Habits
  {
    questionNumber: 3,
    category: "Shopping Habits",
    questionText: "How often do you shop online?",
    questionType: "single-choice",
    options: [
      "Multiple times a week",
      "Once a week",
      "A few times a month",
      "Rarely (once a month or less)",
    ],
    order: 3,
  },
  {
    questionNumber: 4,
    category: "Shopping Habits",
    questionText: "What do you shop for most?",
    questionType: "single-choice",
    options: [
      "Fashion & Beauty",
      "Electronics & Tech",
      "Home & Lifestyle",
      "Food & Essentials",
    ],
    order: 4,
  },
  {
    questionNumber: 5,
    category: "Shopping Habits",
    questionText: "What best describes your shopping style?",
    questionType: "single-choice",
    options: [
      "Planner (I research before buying)",
      "Deal Hunter (I buy when there's a good deal)",
      "Spontaneous (I buy what I want)",
      "Minimalist (Only essentials)",
    ],
    order: 5,
  },

  // Category 3: About You
  {
    questionNumber: 6,
    category: "About You",
    questionText: "What's your age range?",
    questionType: "single-choice",
    options: ["18-24", "25-34", "35-49", "50+"],
    order: 6,
  },
  {
    questionNumber: 7,
    category: "About You",
    questionText: "How do you identify?",
    questionType: "single-choice",
    options: ["Male", "Female", "Non-binary", "Prefer not to say"],
    order: 7,
  },
  {
    questionNumber: 8,
    category: "About You",
    questionText: "What's your current situation?",
    questionType: "single-choice",
    options: [
      "Working full-time",
      "Working part-time / Freelance",
      "Student",
      "Other",
    ],
    order: 8,
  },

  // Category 4: Savings Goals
  {
    questionNumber: 9,
    category: "Savings Goals",
    questionText: "What's your monthly shopping budget?",
    questionType: "single-choice",
    options: ["Under $200", "$200 - $500", "$500 - $1,000", "Over $1,000"],
    order: 9,
  },
  {
    questionNumber: 10,
    category: "Savings Goals",
    questionText: "What's your primary savings goal?",
    questionType: "single-choice",
    options: [
      "Build emergency savings",
      "Save for a big purchase",
      "Pay off debt",
      "Reduce unnecessary spending",
    ],
    order: 10,
  },
  {
    questionNumber: 11,
    category: "Savings Goals",
    questionText: "How much do you want to save monthly with Scopas?",
    questionType: "single-choice",
    options: ["$20 - $50", "$50 - $100", "$100 - $300", "Over $300"],
    order: 11,
  },
  {
    questionNumber: 12,
    category: "Savings Goals",
    questionText: "Would you like budget alerts?",
    questionType: "single-choice",
    options: [
      "Yes, when I'm near my limit",
      "Yes, weekly spending summaries",
      "Maybe later",
      "No thanks",
    ],
    order: 12,
  },
];

async function seedOnboardingQuestions() {
  console.log("🌱 Seeding onboarding questions...");

  try {
    // Upsert questions (update if exists, create if not)
    for (const question of onboardingQuestions) {
      await prisma.onboarding_questions.upsert({
        where: {
          questionNumber: question.questionNumber,
        },
        update: {
          category: question.category,
          questionText: question.questionText,
          questionType: question.questionType,
          options: question.options,
          order: question.order,
          isActive: true,
        },
        create: question,
      });
    }

    console.log(
      `✅ Successfully seeded/updated ${onboardingQuestions.length} questions`
    );

    // Display seeded questions by category
    const categories = [
      "Welcome",
      "Getting Started",
      "Shopping Habits",
      "About You",
      "Savings Goals",
    ];

    for (const category of categories) {
      const count = onboardingQuestions.filter(
        (q) => q.category === category
      ).length;
      console.log(`   - ${category}: ${count} questions`);
    }
  } catch (error) {
    console.error("❌ Error seeding onboarding questions:", error);
    throw error;
  }
}

async function main() {
  await seedOnboardingQuestions();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
