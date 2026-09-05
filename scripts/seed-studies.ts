import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../lib/db/schema'
import { eq } from 'drizzle-orm'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

async function main() {
  // Find the admin user to set as createdBy
  const admin = await db.query.users.findFirst({
    where: eq(schema.users.role, 'admin'),
  })

  if (!admin) {
    console.error('No admin user found. Please seed the admin user first.')
    process.exit(1)
  }

  console.log(`Using admin: ${admin.email}`)

  const studies = [
    {
      title: 'Cardiovascular Health & Exercise Study',
      slug: 'cardiovascular-health-exercise-2026',
      summary: 'Investigating the effects of structured exercise programs on cardiovascular markers in adults aged 40–70.',
      description: `We are recruiting adults between 40 and 70 years old to participate in a 12-week cardiovascular health study. Participants will follow a structured aerobic exercise program and attend monthly check-ins at our research center.

The study aims to understand how consistent moderate exercise affects blood pressure, cholesterol levels, and overall heart health. Participants will receive a free fitness tracker, comprehensive health screening, and a $150 compensation upon completion.

Time commitment: 3 sessions per week (45 minutes each) + 4 clinic visits over 12 weeks.`,
      status: 'active' as const,
      contactEmail: 'cardio-study@aurelis.health',
      eligibilityCriteria: {
        questions: [
          { id: 'age', label: 'What is your age?', type: 'number' },
          { id: 'exercise_frequency', label: 'How many days per week do you currently exercise?', type: 'number' },
          { id: 'heart_conditions', label: 'Have you been diagnosed with any heart conditions? If yes, please describe.', type: 'textarea' },
          { id: 'medications', label: 'List any medications you are currently taking.', type: 'textarea' },
          { id: 'smoker', label: 'Do you currently smoke or use tobacco products?', type: 'text' },
        ],
        criteria: {
          minAge: 40,
          maxAge: 70,
          excludeConditions: ['recent heart attack', 'severe arrhythmia', 'heart failure'],
          note: 'Participant should be sedentary or lightly active (exercising fewer than 3 days/week). Exclude if they have had a cardiac event in the past 6 months or cannot perform moderate aerobic activity.',
        },
      },
    },
    {
      title: 'Type 2 Diabetes Prevention Program',
      slug: 'diabetes-prevention-2026',
      summary: 'A lifestyle intervention study for adults at risk of developing Type 2 diabetes, focusing on diet and activity changes.',
      description: `This 6-month study evaluates the effectiveness of a personalized lifestyle intervention program in reducing the risk of Type 2 diabetes among pre-diabetic adults.

Participants will work with a registered dietitian and health coach to develop individualized nutrition and activity plans. Regular blood glucose monitoring and HbA1c testing will be provided at no cost.

Benefits include: free nutritional counseling, glucose monitoring equipment, lab tests, and $200 compensation upon study completion.

Time commitment: Weekly 30-minute virtual check-ins + quarterly in-person lab visits.`,
      status: 'active' as const,
      contactEmail: 'diabetes-study@aurelis.health',
      eligibilityCriteria: {
        questions: [
          { id: 'age', label: 'What is your age?', type: 'number' },
          { id: 'bmi', label: 'What is your approximate BMI or weight in lbs and height?', type: 'textarea' },
          { id: 'fasting_glucose', label: 'Do you know your most recent fasting blood glucose level?', type: 'text' },
          { id: 'family_history', label: 'Do you have a family history of Type 2 diabetes?', type: 'text' },
          { id: 'current_conditions', label: 'List any current medical diagnoses.', type: 'textarea' },
          { id: 'diet', label: 'Briefly describe your typical daily diet.', type: 'textarea' },
        ],
        criteria: {
          minAge: 30,
          maxAge: 75,
          excludeConditions: ['Type 1 diabetes', 'Type 2 diabetes (already diagnosed)', 'kidney disease'],
          note: 'Looking for pre-diabetic individuals (fasting glucose 100–125 mg/dL or HbA1c 5.7–6.4%). Exclude anyone already on diabetes medication or insulin.',
        },
      },
    },
    {
      title: 'Cognitive Health & Sleep Quality Study',
      slug: 'cognitive-sleep-quality-2026',
      summary: 'Examining the relationship between sleep patterns and cognitive function in adults over 55.',
      description: `Join our 8-week study exploring how sleep quality impacts memory, attention, and overall cognitive health in older adults.

Participants will wear a non-invasive sleep tracking device at home and complete weekly online cognitive assessments. One in-person visit at the start and end of the study for baseline and follow-up neuropsychological testing.

No medications or invasive procedures involved. Participants will receive their personalized sleep analysis report and $120 compensation.

Time commitment: Nightly sleep tracking + 20-minute weekly online assessments + 2 clinic visits.`,
      status: 'active' as const,
      contactEmail: 'sleep-study@aurelis.health',
      eligibilityCriteria: {
        questions: [
          { id: 'age', label: 'What is your age?', type: 'number' },
          { id: 'sleep_hours', label: 'On average, how many hours of sleep do you get per night?', type: 'number' },
          { id: 'sleep_issues', label: 'Do you experience any sleep problems (insomnia, sleep apnea, etc.)? Describe.', type: 'textarea' },
          { id: 'memory_concerns', label: 'Have you noticed any changes in your memory or concentration in the past year?', type: 'text' },
          { id: 'neurological_conditions', label: 'Have you been diagnosed with any neurological conditions (e.g., dementia, Parkinson\'s)?', type: 'text' },
          { id: 'sleep_medications', label: 'Are you currently taking any sleep aids or sedatives?', type: 'text' },
        ],
        criteria: {
          minAge: 55,
          maxAge: 85,
          excludeConditions: ['dementia', 'Alzheimer\'s disease', 'severe psychiatric disorder', 'shift work in the past 3 months'],
          note: 'Participant should be community-dwelling (not in a care facility). Exclude if diagnosed with a major neurocognitive disorder or currently undergoing treatment that significantly affects sleep (e.g., chemotherapy).',
        },
      },
    },
    {
      title: 'Mental Health & Digital Wellness Study',
      slug: 'mental-health-digital-wellness-2026',
      summary: 'Evaluating a mobile app-based mindfulness program for reducing stress and anxiety in working adults.',
      description: `We are studying whether a structured 8-week mindfulness and digital wellness program delivered via mobile app can meaningfully reduce stress, anxiety, and burnout in working adults.

Participants will use our research app daily (10–15 minutes) and complete weekly mood and stress check-ins. No prior mindfulness experience is required.

All participants receive lifetime access to the wellness app, a personalized wellness report, and $80 upon completion.

Time commitment: 10–15 minutes daily + weekly 5-minute surveys over 8 weeks.`,
      status: 'active' as const,
      contactEmail: 'wellness-study@aurelis.health',
      eligibilityCriteria: {
        questions: [
          { id: 'age', label: 'What is your age?', type: 'number' },
          { id: 'employment', label: 'Are you currently employed full-time or part-time?', type: 'text' },
          { id: 'stress_level', label: 'On a scale of 1–10, how would you rate your average stress level over the past month?', type: 'number' },
          { id: 'mental_health_diagnosis', label: 'Do you have any current mental health diagnoses? If yes, please list them.', type: 'textarea' },
          { id: 'therapy', label: 'Are you currently receiving psychotherapy or psychiatric treatment?', type: 'text' },
          { id: 'smartphone', label: 'Do you have a smartphone (iOS or Android) with reliable internet access?', type: 'text' },
        ],
        criteria: {
          minAge: 22,
          maxAge: 65,
          excludeConditions: ['active psychosis', 'severe depression requiring hospitalization', 'active suicidal ideation'],
          note: 'Looking for employed adults with moderate to high stress. Mild-to-moderate anxiety or depression is acceptable if the participant is stable. Exclude if they are in acute psychiatric crisis or cannot use a smartphone app.',
        },
      },
    },
    {
      title: 'Nutrition & Gut Microbiome Research',
      slug: 'nutrition-gut-microbiome-2026',
      summary: 'Studying how a high-fiber, plant-forward diet affects gut microbiome composition and digestive health over 10 weeks.',
      description: `This 10-week dietary intervention study investigates the impact of a structured plant-forward, high-fiber eating plan on gut microbiome diversity and digestive health outcomes.

Participants will receive weekly meal guides and grocery lists, and provide stool samples at weeks 0, 5, and 10 for microbiome analysis. All sample collection is done at home with provided kits.

Participants receive a full microbiome report, personalized nutrition insights, and $175 compensation.

Time commitment: Follow a provided meal plan + 3 stool sample collections + bi-weekly 15-minute phone check-ins.`,
      status: 'draft' as const,
      contactEmail: 'nutrition-study@aurelis.health',
      eligibilityCriteria: {
        questions: [
          { id: 'age', label: 'What is your age?', type: 'number' },
          { id: 'diet_type', label: 'How would you describe your current diet? (e.g., omnivore, vegetarian, vegan)', type: 'text' },
          { id: 'gi_conditions', label: 'Do you have any gastrointestinal conditions (IBS, Crohn\'s, celiac, etc.)?', type: 'textarea' },
          { id: 'antibiotics', label: 'Have you taken antibiotics in the past 3 months?', type: 'text' },
          { id: 'probiotics', label: 'Are you currently taking probiotic supplements?', type: 'text' },
          { id: 'food_allergies', label: 'Do you have any food allergies or intolerances?', type: 'textarea' },
        ],
        criteria: {
          minAge: 25,
          maxAge: 70,
          excludeConditions: ['inflammatory bowel disease (active flare)', 'colon cancer', 'recent GI surgery'],
          note: 'Participant must be willing to follow a plant-forward diet for 10 weeks. Exclude if they are currently on immunosuppressants or have taken antibiotics in the past 3 months (affects microbiome baseline).',
        },
      },
    },
  ]

  console.log(`Seeding ${studies.length} studies...`)

  for (const study of studies) {
    await db.insert(schema.studies).values({
      ...study,
      createdBy: admin.id,
    })
    console.log(`  ✓ ${study.title} (${study.status})`)
  }

  console.log('\nDone! Studies created:')
  console.log('  - 4 active studies (visible on public pages)')
  console.log('  - 1 draft study (admin only)')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
