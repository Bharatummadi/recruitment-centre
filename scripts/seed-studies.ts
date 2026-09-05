import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../lib/db/schema'
import { eq } from 'drizzle-orm'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const LOCATIONS = ['Visakhapatnam (Vizag)', 'Hyderabad', 'Bangalore']

async function main() {
  const admin = await db.query.users.findFirst({
    where: eq(schema.users.role, 'admin'),
  })

  if (!admin) {
    console.error('No admin user found. Please seed the admin user first.')
    process.exit(1)
  }

  console.log(`Using admin: ${admin.email}`)

  // Clear in dependency order (FK constraints)
  await db.delete(schema.screeningResults)
  await db.delete(schema.enrollments)
  await db.delete(schema.interestSubmissions)
  await db.delete(schema.studies)
  console.log('Cleared existing data.\n')

  const studies = [
    // ── SKINCARE ───────────────────────────────────────────────────────────────
    {
      title: 'Vitamin C Brightening Serum Trial – Women',
      slug: 'vitamin-c-brightening-serum-women-2026',
      summary: 'Evaluating a new 15% Vitamin C brightening serum for dull and uneven skin tone in women aged 20–45.',
      description: `We are looking for women between 20 and 45 years old based in Vizag, Hyderabad, or Bangalore to test our new Vitamin C Brightening Serum over 8 weeks.

Participants will apply the serum twice daily and attend two in-person skin assessment visits (weeks 0 and 8). Photography and non-invasive skin tone measurements will be taken at each visit.

Benefits: Full product kit worth ₹4,500, complimentary skin analysis report, and ₹1,200 compensation upon completion.

Time commitment: 8 weeks of product use + 2 clinic visits (approx. 45 min each).`,
      status: 'active' as const,
      contactEmail: 'skincare@aurelis.in',
      eligibilityCriteria: {
        questions: [
          { id: 'location', label: 'Which city are you currently based in?', type: 'text' },
          { id: 'age', label: 'What is your age?', type: 'number' },
          { id: 'gender', label: 'What is your gender?', type: 'text' },
          { id: 'skin_concern', label: 'What is your primary skin concern? (e.g., dullness, dark spots, uneven tone)', type: 'textarea' },
          { id: 'skin_type', label: 'How would you describe your skin type? (Oily / Dry / Combination / Normal)', type: 'text' },
          { id: 'current_serum', label: 'Are you currently using a Vitamin C or brightening serum?', type: 'text' },
          { id: 'allergies', label: 'Do you have any known skin allergies or sensitivities?', type: 'textarea' },
        ],
        criteria: {
          locations: LOCATIONS,
          minAge: 20,
          maxAge: 45,
          gender: 'Female',
          excludeConditions: ['active acne', 'rosacea', 'eczema', 'current retinol use'],
          note: 'Participant must not be using active retinol or AHA/BHA products during the study. Exclude if currently pregnant or breastfeeding.',
        },
      },
    },
    {
      title: 'Anti-Aging Night Cream Study – Women',
      slug: 'anti-aging-night-cream-women-2026',
      summary: 'Testing a peptide-based anti-aging night cream targeting fine lines and skin elasticity in women aged 35–60.',
      description: `This 10-week study evaluates the effectiveness of our advanced peptide and retinol-alternative night cream in reducing visible fine lines and improving skin firmness in women aged 35 to 60.

Participants will apply the cream nightly and visit our partner clinics in their city for baseline and end-of-study assessments using VISIA skin analysis.

Benefits: Full-size product kit (₹6,800 value), detailed VISIA skin analysis report, and ₹1,500 compensation.

Time commitment: 10 weeks of nightly application + 2 clinic visits.`,
      status: 'active' as const,
      contactEmail: 'skincare@aurelis.in',
      eligibilityCriteria: {
        questions: [
          { id: 'location', label: 'Which city are you currently based in?', type: 'text' },
          { id: 'age', label: 'What is your age?', type: 'number' },
          { id: 'gender', label: 'What is your gender?', type: 'text' },
          { id: 'skin_concern', label: 'Describe your primary aging concern (fine lines, wrinkles, sagging, etc.)', type: 'textarea' },
          { id: 'skin_type', label: 'What is your skin type? (Oily / Dry / Combination / Normal)', type: 'text' },
          { id: 'current_anti_aging', label: 'Are you currently using any anti-aging products? If yes, list them.', type: 'textarea' },
          { id: 'medications', label: 'Are you on any prescription skincare medications (e.g., tretinoin)?', type: 'text' },
        ],
        criteria: {
          locations: LOCATIONS,
          minAge: 35,
          maxAge: 60,
          gender: 'Female',
          excludeConditions: ['prescription tretinoin use', 'recent cosmetic procedures (last 6 months)', 'active skin infections'],
          note: 'Exclude if the participant has had laser treatments, chemical peels, or injectables in the last 6 months.',
        },
      },
    },
    {
      title: 'Acne Control Face Wash Trial',
      slug: 'acne-control-face-wash-2026',
      summary: 'Testing a salicylic acid and neem-based face wash for oily and acne-prone skin in men and women aged 16–30.',
      description: `We are recruiting men and women aged 16 to 30 with oily or acne-prone skin in Vizag, Hyderabad, and Bangalore to test our new Acne Control Face Wash over 6 weeks.

Participants will use the face wash twice daily and complete weekly online skin self-assessments with photos. One in-person visit at week 6 for final evaluation.

Benefits: Full product set (₹2,200 value) and ₹800 compensation upon completion.

Time commitment: 6 weeks of product use + weekly 5-min photo uploads + 1 final clinic visit.`,
      status: 'active' as const,
      contactEmail: 'skincare@aurelis.in',
      eligibilityCriteria: {
        questions: [
          { id: 'location', label: 'Which city are you currently based in?', type: 'text' },
          { id: 'age', label: 'What is your age?', type: 'number' },
          { id: 'gender', label: 'What is your gender?', type: 'text' },
          { id: 'skin_type', label: 'How would you describe your skin type?', type: 'text' },
          { id: 'acne_severity', label: 'On a scale of 1–5, how would you rate your acne severity? (1 = mild, 5 = severe)', type: 'number' },
          { id: 'current_treatment', label: 'Are you currently using any acne treatments or medications?', type: 'textarea' },
          { id: 'allergies', label: 'Any known allergies to salicylic acid, neem, or tea tree?', type: 'text' },
        ],
        criteria: {
          locations: LOCATIONS,
          minAge: 16,
          maxAge: 30,
          gender: 'All',
          excludeConditions: ['cystic acne requiring prescription', 'isotretinoin (Accutane) use', 'known salicylic acid allergy'],
          note: 'Looking for mild to moderate acne (score 1–3). Exclude severe cystic acne requiring prescription treatment.',
        },
      },
    },
    {
      title: 'Under-Eye Dark Circle & Puffiness Serum Study',
      slug: 'under-eye-dark-circle-serum-2026',
      summary: 'Evaluating a new caffeine and vitamin K under-eye serum for dark circles and puffiness in women aged 25–50.',
      description: `Join our 8-week study testing a new under-eye serum formulated with caffeine, vitamin K, and hyaluronic acid targeting dark circles and morning puffiness.

Participants apply the serum every morning and evening. Two clinic visits for professional skin assessments using Chromameter measurements.

Benefits: Product kit (₹3,800 value), clinical skin assessment report, and ₹1,000 compensation.

Time commitment: 8 weeks of product use + 2 clinic visits.`,
      status: 'active' as const,
      contactEmail: 'skincare@aurelis.in',
      eligibilityCriteria: {
        questions: [
          { id: 'location', label: 'Which city are you currently based in?', type: 'text' },
          { id: 'age', label: 'What is your age?', type: 'number' },
          { id: 'gender', label: 'What is your gender?', type: 'text' },
          { id: 'dark_circle_severity', label: 'How severe are your dark circles? (Mild / Moderate / Severe)', type: 'text' },
          { id: 'puffiness', label: 'Do you experience morning under-eye puffiness?', type: 'text' },
          { id: 'sleep_hours', label: 'On average, how many hours of sleep do you get per night?', type: 'number' },
          { id: 'current_eye_products', label: 'Are you currently using any under-eye products?', type: 'text' },
        ],
        criteria: {
          locations: LOCATIONS,
          minAge: 25,
          maxAge: 50,
          gender: 'Female',
          excludeConditions: ['recent eye surgery', 'active eye infections', 'severe allergies around the eye area'],
          note: 'Exclude if participant has had any eye surgery in the last 12 months.',
        },
      },
    },
    {
      title: 'Men\'s Daily Oil-Control Moisturiser Trial',
      slug: 'mens-oil-control-moisturiser-2026',
      summary: 'Testing a lightweight, matte-finish moisturiser designed for men with oily to combination skin, aged 20–45.',
      description: `We are recruiting men aged 20 to 45 based in Vizag, Hyderabad, or Bangalore to test our new Men's Daily Oil-Control Moisturiser over 6 weeks.

The product is a lightweight, non-greasy formula with SPF 20 designed specifically for Indian skin and climate conditions. Participants apply daily and complete bi-weekly online check-ins.

Benefits: Full product kit (₹2,600 value) and ₹900 compensation upon completion.

Time commitment: 6 weeks of daily use + 3 short online check-ins + 1 final visit.`,
      status: 'active' as const,
      contactEmail: 'mencare@aurelis.in',
      eligibilityCriteria: {
        questions: [
          { id: 'location', label: 'Which city are you currently based in?', type: 'text' },
          { id: 'age', label: 'What is your age?', type: 'number' },
          { id: 'gender', label: 'What is your gender?', type: 'text' },
          { id: 'skin_type', label: 'How would you describe your skin type? (Oily / Dry / Combination / Normal)', type: 'text' },
          { id: 'current_moisturiser', label: 'Do you currently use a face moisturiser? If yes, which one?', type: 'text' },
          { id: 'outdoor_exposure', label: 'How many hours per day are you typically outdoors?', type: 'number' },
          { id: 'allergies', label: 'Any known skin allergies or sensitivities?', type: 'text' },
        ],
        criteria: {
          locations: LOCATIONS,
          minAge: 20,
          maxAge: 45,
          gender: 'Male',
          excludeConditions: ['severe skin conditions', 'prescription topical treatments'],
          note: 'Preference for oily or combination skin types. Exclude if on prescription skincare.',
        },
      },
    },
    {
      title: 'Men\'s Charcoal Deep-Cleanse Face Scrub Study',
      slug: 'mens-charcoal-face-scrub-2026',
      summary: 'Evaluating a charcoal and kaolin clay face scrub for deep pore cleansing and blackhead reduction in men aged 18–40.',
      description: `This 4-week study tests our Men's Activated Charcoal Face Scrub targeting enlarged pores, blackheads, and excess sebum.

Participants use the scrub 3 times per week and complete weekly skin selfie uploads via our app. One in-person pore analysis at the end of the study.

Benefits: Full product set (₹1,800 value) and ₹700 compensation.

Time commitment: 4 weeks + weekly photo uploads + 1 clinic visit.`,
      status: 'active' as const,
      contactEmail: 'mencare@aurelis.in',
      eligibilityCriteria: {
        questions: [
          { id: 'location', label: 'Which city are you currently based in?', type: 'text' },
          { id: 'age', label: 'What is your age?', type: 'number' },
          { id: 'gender', label: 'What is your gender?', type: 'text' },
          { id: 'skin_type', label: 'What is your skin type?', type: 'text' },
          { id: 'blackheads', label: 'Do you have visible blackheads or enlarged pores?', type: 'text' },
          { id: 'current_scrub', label: 'Do you currently use a face scrub? How often?', type: 'text' },
          { id: 'allergies', label: 'Any known allergies to charcoal-based or clay products?', type: 'text' },
        ],
        criteria: {
          locations: LOCATIONS,
          minAge: 18,
          maxAge: 40,
          gender: 'Male',
          excludeConditions: ['active acne breakouts', 'very sensitive skin', 'rosacea'],
          note: 'Exclude if participant has active inflamed acne — scrubs are not suitable. Oily to combination skin preferred.',
        },
      },
    },

    // ── HAIRCARE ───────────────────────────────────────────────────────────────
    {
      title: 'Anti-Hair Fall Scalp Serum Study',
      slug: 'anti-hair-fall-scalp-serum-2026',
      summary: 'Testing a new caffeine and biotin scalp serum for reducing hair fall and improving hair density in men and women aged 22–50.',
      description: `We are recruiting men and women aged 22 to 50 experiencing early to moderate hair fall to test our Anti-Hair Fall Scalp Serum over 12 weeks.

Participants apply the serum daily to the scalp and attend trichoscopy assessments at the start and end of the study to measure hair density.

Benefits: Full serum kit (₹5,200 value), trichoscopy report, and ₹1,500 compensation.

Time commitment: 12 weeks of daily scalp application + 2 trichoscopy clinic visits.`,
      status: 'active' as const,
      contactEmail: 'haircare@aurelis.in',
      eligibilityCriteria: {
        questions: [
          { id: 'location', label: 'Which city are you currently based in?', type: 'text' },
          { id: 'age', label: 'What is your age?', type: 'number' },
          { id: 'gender', label: 'What is your gender?', type: 'text' },
          { id: 'hair_fall_duration', label: 'How long have you been experiencing hair fall? (e.g., 6 months, 2 years)', type: 'text' },
          { id: 'hair_fall_severity', label: 'How would you describe your hair fall? (Mild / Moderate / Severe)', type: 'text' },
          { id: 'scalp_condition', label: 'Do you have any scalp conditions (dandruff, psoriasis, etc.)?', type: 'text' },
          { id: 'current_treatment', label: 'Are you currently using any hair fall treatments or supplements?', type: 'textarea' },
        ],
        criteria: {
          locations: LOCATIONS,
          minAge: 22,
          maxAge: 50,
          gender: 'All',
          excludeConditions: ['alopecia areata', 'scalp psoriasis (active)', 'chemotherapy-induced hair loss', 'thyroid disorders (uncontrolled)'],
          note: 'Looking for mild to moderate diffuse hair fall. Exclude pattern baldness (advanced stages) and those on minoxidil or finasteride.',
        },
      },
    },
    {
      title: 'Deep Conditioning Hair Mask Study – Women',
      slug: 'deep-conditioning-hair-mask-women-2026',
      summary: 'Evaluating a keratin and argan oil deep conditioning mask for dry, damaged, and chemically-treated hair in women aged 20–50.',
      description: `This 6-week study tests our Deep Conditioning Hair Mask formulated with keratin, argan oil, and hydrolysed silk protein for women with dry, damaged, or colour/chemically-treated hair.

Participants use the mask twice a week and complete a weekly online hair health diary. One in-person hair elasticity and moisture assessment at the end.

Benefits: Full product kit (₹3,500 value) and ₹1,000 compensation.

Time commitment: 6 weeks of twice-weekly mask application + weekly diary + 1 clinic visit.`,
      status: 'active' as const,
      contactEmail: 'haircare@aurelis.in',
      eligibilityCriteria: {
        questions: [
          { id: 'location', label: 'Which city are you currently based in?', type: 'text' },
          { id: 'age', label: 'What is your age?', type: 'number' },
          { id: 'gender', label: 'What is your gender?', type: 'text' },
          { id: 'hair_type', label: 'How would you describe your hair? (Straight / Wavy / Curly / Coily)', type: 'text' },
          { id: 'hair_damage', label: 'Is your hair chemically treated, coloured, or heat-damaged?', type: 'text' },
          { id: 'hair_concern', label: 'What is your primary hair concern? (Dryness, breakage, frizz, dullness, etc.)', type: 'textarea' },
          { id: 'current_mask', label: 'Do you currently use a hair mask or deep conditioner? How often?', type: 'text' },
        ],
        criteria: {
          locations: LOCATIONS,
          minAge: 20,
          maxAge: 50,
          gender: 'Female',
          excludeConditions: ['active scalp infections', 'ongoing chemotherapy'],
          note: 'Ideal candidates have colour-treated, heat-damaged, or naturally dry hair. Exclude if currently using prescription scalp treatments.',
        },
      },
    },
    {
      title: 'Anti-Dandruff Shampoo Efficacy Trial',
      slug: 'anti-dandruff-shampoo-trial-2026',
      summary: 'Testing a zinc pyrithione and tea tree oil anti-dandruff shampoo for flaking and scalp itchiness in men and women aged 18–45.',
      description: `We are looking for participants aged 18 to 45 with mild to moderate dandruff to test our new Anti-Dandruff Shampoo over 8 weeks in Vizag, Hyderabad, and Bangalore.

Participants use the shampoo as their primary shampoo throughout the study. Scalp flaking severity is assessed at the start, week 4, and week 8 at partner clinics.

Benefits: Shampoo supply for the full study duration + ₹900 compensation.

Time commitment: 8 weeks of regular use + 3 quick clinic check-ins (15 min each).`,
      status: 'active' as const,
      contactEmail: 'haircare@aurelis.in',
      eligibilityCriteria: {
        questions: [
          { id: 'location', label: 'Which city are you currently based in?', type: 'text' },
          { id: 'age', label: 'What is your age?', type: 'number' },
          { id: 'gender', label: 'What is your gender?', type: 'text' },
          { id: 'dandruff_severity', label: 'How severe is your dandruff? (Mild / Moderate / Severe)', type: 'text' },
          { id: 'dandruff_duration', label: 'How long have you been dealing with dandruff?', type: 'text' },
          { id: 'scalp_itch', label: 'Do you experience scalp itchiness? Rate 1–5.', type: 'number' },
          { id: 'current_shampoo', label: 'What shampoo are you currently using for dandruff?', type: 'text' },
        ],
        criteria: {
          locations: LOCATIONS,
          minAge: 18,
          maxAge: 45,
          gender: 'All',
          excludeConditions: ['seborrheic dermatitis (severe)', 'scalp psoriasis', 'known allergy to zinc pyrithione or tea tree oil'],
          note: 'Participants must stop using their current anti-dandruff shampoo 2 weeks before the study starts (washout period).',
        },
      },
    },
    {
      title: 'Men\'s Beard Growth & Softening Oil Study',
      slug: 'mens-beard-growth-oil-2026',
      summary: 'Evaluating a castor oil and vitamin E beard oil for growth stimulation and softening in men aged 20–40 with a beard.',
      description: `This 8-week study tests our Men's Beard Growth & Softening Oil on men who currently have a beard of at least 2 cm length.

The oil is applied twice daily to the beard and underlying skin. Participants complete weekly beard length and texture self-assessments. One in-person visit at the end of the study.

Benefits: Full product kit (₹2,400 value) and ₹800 compensation.

Time commitment: 8 weeks of twice-daily application + weekly check-ins + 1 final visit.`,
      status: 'active' as const,
      contactEmail: 'mencare@aurelis.in',
      eligibilityCriteria: {
        questions: [
          { id: 'location', label: 'Which city are you currently based in?', type: 'text' },
          { id: 'age', label: 'What is your age?', type: 'number' },
          { id: 'gender', label: 'What is your gender?', type: 'text' },
          { id: 'beard_length', label: 'What is your current beard length approximately? (in cm)', type: 'text' },
          { id: 'beard_duration', label: 'How long have you been growing your beard?', type: 'text' },
          { id: 'beard_concern', label: 'What is your main beard concern? (Patchy growth, dryness, coarseness, slow growth)', type: 'textarea' },
          { id: 'current_beard_products', label: 'Are you currently using any beard oils or balms?', type: 'text' },
        ],
        criteria: {
          locations: LOCATIONS,
          minAge: 20,
          maxAge: 40,
          gender: 'Male',
          excludeConditions: ['alopecia barbae', 'skin infections on the face'],
          note: 'Participant must have at least 2 cm of beard growth. Must be willing to avoid other beard products during the study.',
        },
      },
    },
    {
      title: 'Frizz-Control & Shine Hair Serum Study – Women',
      slug: 'frizz-control-hair-serum-women-2026',
      summary: 'Testing a silicone-free frizz control and shine serum for wavy, curly, or humidity-affected hair in women aged 18–45.',
      description: `India's high humidity wreaks havoc on hair. This 6-week study evaluates our Frizz-Control & Shine Serum, a silicone-free formula designed for wavy to curly hair in humid climates like Vizag, Hyderabad, and Bangalore.

Participants apply the serum after every wash and complete a weekly hair diary. Two in-person hair assessments.

Benefits: Full serum kit (₹2,800 value) and ₹900 compensation.

Time commitment: 6 weeks of post-wash application + weekly diary + 2 hair assessments.`,
      status: 'active' as const,
      contactEmail: 'haircare@aurelis.in',
      eligibilityCriteria: {
        questions: [
          { id: 'location', label: 'Which city are you currently based in?', type: 'text' },
          { id: 'age', label: 'What is your age?', type: 'number' },
          { id: 'gender', label: 'What is your gender?', type: 'text' },
          { id: 'hair_type', label: 'Describe your hair texture (Straight / Wavy / Curly / Coily)', type: 'text' },
          { id: 'frizz_concern', label: 'Do you experience frizz, especially in humid weather?', type: 'text' },
          { id: 'hair_porosity', label: 'Does your hair absorb water quickly or repel it? (High / Low porosity — or Not sure)', type: 'text' },
          { id: 'current_serum', label: 'Are you currently using a hair serum or anti-frizz product?', type: 'text' },
        ],
        criteria: {
          locations: LOCATIONS,
          minAge: 18,
          maxAge: 45,
          gender: 'Female',
          excludeConditions: ['active scalp treatments', 'ongoing keratin treatment (within last 3 months)'],
          note: 'Best fit is wavy or curly hair that experiences frizz in humid conditions. Exclude if recently had a keratin or chemical straightening treatment.',
        },
      },
    },

    // ── SPF / BODY ──────────────────────────────────────────────────────────────
    {
      title: 'SPF 50 PA++++ Sunscreen Daily Wear Study',
      slug: 'spf50-sunscreen-daily-wear-2026',
      summary: 'Evaluating a broad-spectrum SPF 50 PA++++ sunscreen for daily outdoor wear in Indian climate conditions for men and women aged 18–45.',
      description: `India's UV index demands serious sun protection. This 8-week study evaluates our new broad-spectrum SPF 50 PA++++ sunscreen designed for Indian skin tones — non-greasy, no white cast, and suitable for daily wear.

Participants apply the sunscreen every morning and after outdoor exposure. Two VISIA skin assessments to measure UV protection impact.

Benefits: Sunscreen supply for the full study + ₹1,100 compensation.

Time commitment: 8 weeks of daily application + 2 skin assessments.`,
      status: 'active' as const,
      contactEmail: 'skincare@aurelis.in',
      eligibilityCriteria: {
        questions: [
          { id: 'location', label: 'Which city are you currently based in?', type: 'text' },
          { id: 'age', label: 'What is your age?', type: 'number' },
          { id: 'gender', label: 'What is your gender?', type: 'text' },
          { id: 'outdoor_hours', label: 'How many hours per day do you spend outdoors on average?', type: 'number' },
          { id: 'current_sunscreen', label: 'Do you currently use sunscreen? If yes, which SPF?', type: 'text' },
          { id: 'skin_type', label: 'What is your skin type? (Oily / Dry / Combination / Normal)', type: 'text' },
          { id: 'allergies', label: 'Any known allergies to sunscreen ingredients?', type: 'text' },
        ],
        criteria: {
          locations: LOCATIONS,
          minAge: 18,
          maxAge: 45,
          gender: 'All',
          excludeConditions: ['photodermatitis', 'known sunscreen allergy'],
          note: 'Preference for participants who spend at least 2 hours outdoors daily (outdoor workers, students, commuters).',
        },
      },
    },
    {
      title: 'Hydrating Body Butter Study – Women',
      slug: 'hydrating-body-butter-women-2026',
      summary: 'Testing a shea butter and coconut oil body butter for dry skin hydration and softness in women aged 20–55.',
      description: `This 6-week study evaluates our rich Hydrating Body Butter for women with dry to very dry skin. The formula combines shea butter, coconut oil, and vitamin E.

Participants apply twice daily (morning and night) and complete a weekly skin softness self-assessment. One in-person skin hydration measurement using a Corneometer at the end.

Benefits: Full product kit (₹2,200 value) and ₹800 compensation.

Time commitment: 6 weeks of twice-daily application + weekly self-assessments + 1 clinic visit.`,
      status: 'draft' as const,
      contactEmail: 'skincare@aurelis.in',
      eligibilityCriteria: {
        questions: [
          { id: 'location', label: 'Which city are you currently based in?', type: 'text' },
          { id: 'age', label: 'What is your age?', type: 'number' },
          { id: 'gender', label: 'What is your gender?', type: 'text' },
          { id: 'skin_dryness', label: 'How would you describe your body skin dryness? (Mild / Moderate / Severe)', type: 'text' },
          { id: 'current_body_moisturiser', label: 'What body moisturiser or lotion do you currently use?', type: 'text' },
          { id: 'allergies', label: 'Any known allergies to coconut oil, shea butter, or fragrances?', type: 'text' },
          { id: 'skin_conditions', label: 'Do you have any diagnosed skin conditions like eczema or psoriasis?', type: 'text' },
        ],
        criteria: {
          locations: LOCATIONS,
          minAge: 20,
          maxAge: 55,
          gender: 'Female',
          excludeConditions: ['active eczema flare', 'psoriasis (active)', 'known coconut or shea butter allergy'],
          note: 'Looking for participants with dry to very dry body skin. Exclude if on prescription topical treatments for skin conditions.',
        },
      },
    },
    {
      title: 'Natural Scalp Nourishing Hair Oil Study',
      slug: 'natural-scalp-hair-oil-2026',
      summary: 'Evaluating a blend of brahmi, bhringraj, and amla hair oil for scalp nourishment and hair strength in men and women aged 25–55.',
      description: `We are recruiting men and women aged 25 to 55 to test our Natural Scalp Nourishing Hair Oil — a traditional Ayurvedic-inspired blend of brahmi, bhringraj, amla, and cold-pressed coconut oil.

Participants apply the oil twice a week with a scalp massage and complete a monthly hair breakage self-assessment. Two clinic visits for hair and scalp evaluation.

Benefits: Full oil kit (₹1,800 value) and ₹900 compensation.

Time commitment: 10 weeks of twice-weekly oil application + 2 clinic visits.`,
      status: 'draft' as const,
      contactEmail: 'haircare@aurelis.in',
      eligibilityCriteria: {
        questions: [
          { id: 'location', label: 'Which city are you currently based in?', type: 'text' },
          { id: 'age', label: 'What is your age?', type: 'number' },
          { id: 'gender', label: 'What is your gender?', type: 'text' },
          { id: 'scalp_type', label: 'How would you describe your scalp? (Dry / Oily / Normal / Sensitive)', type: 'text' },
          { id: 'current_hair_oil', label: 'Do you currently oil your hair? Which oil and how often?', type: 'text' },
          { id: 'hair_concern', label: 'What is your primary hair concern? (Breakage, dryness, dullness, hair fall)', type: 'textarea' },
          { id: 'allergies', label: 'Any known allergies to coconut oil, amla, or herbal oils?', type: 'text' },
        ],
        criteria: {
          locations: LOCATIONS,
          minAge: 25,
          maxAge: 55,
          gender: 'All',
          excludeConditions: ['active scalp infections', 'severe seborrhoeic dermatitis'],
          note: 'Open to participants who do and do not currently oil their hair. Must be willing to use the oil twice weekly without other hair oils during the study.',
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
    console.log(`  ✓ [${study.status}] ${study.title}`)
  }

  const active = studies.filter(s => s.status === 'active').length
  const draft = studies.filter(s => s.status === 'draft').length
  console.log(`\nDone! ${studies.length} studies created:`)
  console.log(`  - ${active} active (visible on public pages)`)
  console.log(`  - ${draft} draft (admin only)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
