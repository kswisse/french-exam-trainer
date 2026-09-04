import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ─── Helpers ──────────────────────────────────────────────────────

function uuid(): string {
  return crypto.randomUUID();
}

// ─── Seed Data ────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...\n");

  // ── 1. Skill Taxonomy ──────────────────────────────────────────

  const comprehensionEcriteId = uuid();
  const grammaireId = uuid();
  const tempsVerbauxId = uuid();
  const subjonctifId = uuid();
  const conditionnelId = uuid();
  const pronomsId = uuid();
  const prepositionsId = uuid();
  const vocabulaireId = uuid();
  const inferenceId = uuid();

  const skills = [
    { id: comprehensionEcriteId, name: "Compréhension écrite", category: "receptive", parentId: null },
    { id: grammaireId, name: "Grammaire", category: "linguistic", parentId: null },
    { id: tempsVerbauxId, name: "Temps verbaux", category: "linguistic", parentId: grammaireId },
    { id: subjonctifId, name: "Subjonctif", category: "linguistic", parentId: grammaireId },
    { id: conditionnelId, name: "Conditionnel", category: "linguistic", parentId: grammaireId },
    { id: pronomsId, name: "Pronoms", category: "linguistic", parentId: grammaireId },
    { id: prepositionsId, name: "Prépositions", category: "linguistic", parentId: grammaireId },
    { id: vocabulaireId, name: "Vocabulaire", category: "linguistic", parentId: null },
    { id: inferenceId, name: "Inférence", category: "cognitive", parentId: null },
  ];

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { id: skill.id },
      update: {},
      create: skill,
    });
  }
  console.log(`  ✓ Created ${skills.length} skills`);

  // ── 2. Demo Admin Profile ──────────────────────────────────────

  const adminProfileId = uuid();
  await prisma.profile.upsert({
    where: { id: adminProfileId },
    update: {},
    create: {
      id: adminProfileId,
      displayName: "Admin Démo",
      email: "admin@french-exam-trainer.demo",
      role: "ADMIN",
    },
  });
  console.log("  ✓ Created admin profile");

  // ── 3. Exam ────────────────────────────────────────────────────

  const examId = uuid();
  await prisma.exam.upsert({
    where: { id: examId },
    update: {},
    create: {
      id: examId,
      title: "Exercices de Français — Démo",
      description:
        "Examen démonstratif couvrant la compréhension écrite, la grammaire et le vocabulaire de niveau B1-B2.",
      type: "DELF B2",
      year: 2026,
      language: "fr",
      timeLimitMinutes: 60,
      totalPoints: 20,
      negativePoints: 0,
      mode: "BOTH",
      status: "PUBLISHED",
    },
  });
  console.log("  ✓ Created exam");

  // ── 4. Exam Sections ───────────────────────────────────────────

  const section1Id = uuid();
  const section2Id = uuid();
  const section3Id = uuid();

  const sections = [
    {
      id: section1Id,
      examId,
      title: "Compréhension écrite",
      instructions:
        "Lisez attentivement chaque question et choisissez la meilleure réponse. Pour les questions vrai/faux, indiquez si l'affirmation est correcte ou non.",
      order: 1,
    },
    {
      id: section2Id,
      examId,
      title: "Grammaire",
      instructions:
        "Complétez les phrases en choisissant la bonne réponse ou en écrivant la forme correcte du verbe.",
      order: 2,
    },
    {
      id: section3Id,
      examId,
      title: "Vocabulaire",
      instructions:
        "Démontrez votre maîtrise du vocabulaire français en répondant aux questions suivantes.",
      order: 3,
    },
  ];

  for (const section of sections) {
    await prisma.examSection.upsert({
      where: { id: section.id },
      update: {},
      create: section,
    });
  }
  console.log(`  ✓ Created ${sections.length} exam sections`);

  // ── 5 & 6 & 7 & 8. Questions, Options, Answers, Skills ───────

  // --- Section 1: Compréhension écrite (5 questions) ---

  // Q1: MC - Capital of France
  const q1Id = uuid();
  await prisma.question.create({
    data: {
      id: q1Id,
      sectionId: section1Id,
      number: 1,
      type: "MULTIPLE_CHOICE",
      text: "Quelle est la capitale de la France ?",
      instructions: "Choisissez la bonne réponse parmi les propositions.",
      points: 1,
      difficulty: "A1",
      order: 1,
      options: {
        create: [
          { id: uuid(), label: "A", text: "Lyon", isCorrect: false },
          { id: uuid(), label: "B", text: "Paris", isCorrect: true },
          { id: uuid(), label: "C", text: "Marseille", isCorrect: false },
          { id: uuid(), label: "D", text: "Toulouse", isCorrect: false },
        ],
      },
      skills: {
        create: [{ id: uuid(), skillId: vocabulaireId }],
      },
    },
  });

  // Q2: MC - French idiom
  const q2Id = uuid();
  await prisma.question.create({
    data: {
      id: q2Id,
      sectionId: section1Id,
      number: 2,
      type: "MULTIPLE_CHOICE",
      text: "Que signifie l'expression « avoir le coup de foudre » ?",
      instructions: "Choisissez la signification correcte.",
      points: 2,
      difficulty: "B1",
      order: 2,
      options: {
        create: [
          { id: uuid(), label: "A", text: "Être frappé par la foudre", isCorrect: false },
          { id: uuid(), label: "B", text: "Tomber amoureux instantanément", isCorrect: true },
          { id: uuid(), label: "C", text: "Avoir un accident", isCorrect: false },
          { id: uuid(), label: "D", text: "Perdre connaissance", isCorrect: false },
        ],
      },
      skills: {
        create: [{ id: uuid(), skillId: vocabulaireId }],
      },
    },
  });

  // Q3: TF - Subjonctif after croire que
  const q3Id = uuid();
  await prisma.question.create({
    data: {
      id: q3Id,
      sectionId: section1Id,
      number: 3,
      type: "TRUE_FALSE",
      text: "Le subjonctif est obligatoire après « croire que ».",
      instructions: "Indiquez si cette affirmation est vraie ou fausse.",
      points: 1,
      difficulty: "B2",
      order: 3,
      options: {
        create: [
          { id: uuid(), label: "V", text: "Vrai", isCorrect: false },
          { id: uuid(), label: "F", text: "Faux", isCorrect: true },
        ],
      },
      skills: {
        create: [{ id: uuid(), skillId: subjonctifId }],
      },
    },
  });

  // Q4: SHORT_TEXT - Conjugation
  const q4Id = uuid();
  await prisma.question.create({
    data: {
      id: q4Id,
      sectionId: section1Id,
      number: 4,
      type: "SHORT_TEXT",
      text: "Conjuguez « aller » au présent de l'indicatif, 1ère personne du singulier.",
      instructions: "Écrivez la forme correcte du verbe.",
      points: 1,
      difficulty: "A2",
      order: 4,
      answers: {
        create: [
          { id: uuid(), text: "vais", isAcceptable: true, normalizationRule: { trimWhitespace: true, caseInsensitive: true } },
        ],
      },
      skills: {
        create: [{ id: uuid(), skillId: tempsVerbauxId }],
      },
    },
  });

  // Q5: MC - Reading comprehension passage
  const passageId = uuid();
  await prisma.passage.create({
    data: {
      id: passageId,
      sectionId: section1Id,
      title: "Le Marché Provençal",
      content:
        "Chaque dimanche matin, le marché de la place Bellecour s'anime. Les producteurs locaux étalent leurs fraises, leurs tomates et leurs herbes aromatiques. Les parfums de lavande et de pain frais se mélangent dans l'air tiède du matin. C'est un rituel incontournable pour les Lyonnais, qui viennent non seulement pour faire leurs courses, mais aussi pour retrouver leurs voisins et échanger quelques mots autour d'un café.",
      type: "READING_TEXT",
    },
  });

  const q5Id = uuid();
  await prisma.question.create({
    data: {
      id: q5Id,
      sectionId: section1Id,
      passageId,
      number: 5,
      type: "MULTIPLE_CHOICE",
      text: "Quel est le thème principal de ce texte ?",
      instructions: "Choisissez la meilleure réponse.",
      points: 2,
      difficulty: "B1",
      order: 5,
      options: {
        create: [
          { id: uuid(), label: "A", text: "La cuisine lyonnaise", isCorrect: false },
          { id: uuid(), label: "B", text: "La vie quotidienne au marché provençal", isCorrect: true },
          { id: uuid(), label: "C", text: "Les produits agricoles français", isCorrect: false },
          { id: uuid(), label: "D", text: "Le tourisme en Provence", isCorrect: false },
        ],
      },
      skills: {
        create: [{ id: uuid(), skillId: comprehensionEcriteId }],
      },
    },
  });

  // --- Section 2: Grammaire (8 questions) ---

  // Q6: MC - Temps verbaux (imparfait)
  const q6Id = uuid();
  await prisma.question.create({
    data: {
      id: q6Id,
      sectionId: section2Id,
      number: 6,
      type: "MULTIPLE_CHOICE",
      text: "Quel temps est utilisé dans cette phrase ? « Je mangeais un gâteau quand tu es arrivé. »",
      instructions: "Identifiez le temps du verbe souligné.",
      points: 1,
      difficulty: "A2",
      order: 6,
      options: {
        create: [
          { id: uuid(), label: "A", text: "Présent de l'indicatif", isCorrect: false },
          { id: uuid(), label: "B", text: "Imparfait de l'indicatif", isCorrect: true },
          { id: uuid(), label: "C", text: "Passé composé", isCorrect: false },
          { id: uuid(), label: "D", text: "Futur simple", isCorrect: false },
        ],
      },
      skills: {
        create: [{ id: uuid(), skillId: tempsVerbauxId }],
      },
    },
  });

  // Q7: MC - Subjonctif
  const q7Id = uuid();
  await prisma.question.create({
    data: {
      id: q7Id,
      sectionId: section2Id,
      number: 7,
      type: "MULTIPLE_CHOICE",
      text: "Complétez : « Il faut que tu ___ (aller) chez le médecin. »",
      instructions: "Choisissez la forme correcte du subjonctif.",
      points: 2,
      difficulty: "B1",
      order: 7,
      options: {
        create: [
          { id: uuid(), label: "A", text: "vas", isCorrect: false },
          { id: uuid(), label: "B", text: "allais", isCorrect: false },
          { id: uuid(), label: "C", text: "ailles", isCorrect: true },
          { id: uuid(), label: "D", text: "irais", isCorrect: false },
        ],
      },
      skills: {
        create: [{ id: uuid(), skillId: subjonctifId }],
      },
    },
  });

  // Q8: FILL_BLANK - être + préposition
  const q8Id = uuid();
  await prisma.question.create({
    data: {
      id: q8Id,
      sectionId: section2Id,
      number: 8,
      type: "FILL_BLANK",
      text: "Je ___ (être) allé au marché ___ (hier).",
      instructions: "Complétez les blancs avec les formes correctes.",
      points: 2,
      difficulty: "A2",
      order: 8,
      answers: {
        create: [
          { id: uuid(), text: "blank_1: suis", isAcceptable: true, normalizationRule: { trimWhitespace: true, caseInsensitive: true } },
          { id: uuid(), text: "blank_2: hier", isAcceptable: true, normalizationRule: { trimWhitespace: true, caseInsensitive: true } },
        ],
      },
      skills: {
        create: [
          { id: uuid(), skillId: tempsVerbauxId },
          { id: uuid(), skillId: prepositionsId },
        ],
      },
    },
  });

  // Q9: MATCHING - French to English
  const q9Id = uuid();
  await prisma.question.create({
    data: {
      id: q9Id,
      sectionId: section2Id,
      number: 9,
      type: "MATCHING",
      text: "Associez chaque mot français à sa traduction anglaise.",
      instructions:
        "Mots français : 1) bibliothèque, 2) école, 3) boulangerie, 4) cuisine. Réponses anglaises : A) library, B) bakery, C) kitchen, D) school. Réponds au format : 1-A, 2-D, 3-B, 4-C.",
      points: 2,
      difficulty: "A2",
      order: 9,
      answers: {
        create: [
          { id: uuid(), text: '{"1":"A","2":"D","3":"B","4":"C"}', isAcceptable: true, normalizationRule: { trimWhitespace: true, caseInsensitive: true } },
        ],
      },
      skills: {
        create: [{ id: uuid(), skillId: vocabulaireId }],
      },
    },
  });

  // Q10: MC - Conditionnel
  const q10Id = uuid();
  await prisma.question.create({
    data: {
      id: q10Id,
      sectionId: section2Id,
      number: 10,
      type: "MULTIPLE_CHOICE",
      text: "Complétez : « Si j'avais de l'argent, je ___ un voyage en Italie. »",
      instructions: "Choisissez la forme correcte du conditionnel.",
      points: 2,
      difficulty: "B1",
      order: 10,
      options: {
        create: [
          { id: uuid(), label: "A", text: "vais", isCorrect: false },
          { id: uuid(), label: "B", text: "irais", isCorrect: true },
          { id: uuid(), label: "C", text: "suis allé", isCorrect: false },
          { id: uuid(), label: "D", text: "irai", isCorrect: false },
        ],
      },
      skills: {
        create: [{ id: uuid(), skillId: conditionnelId }],
      },
    },
  });

  // Q11: MC - Pronoms
  const q11Id = uuid();
  await prisma.question.create({
    data: {
      id: q11Id,
      sectionId: section2Id,
      number: 11,
      type: "MULTIPLE_CHOICE",
      text: "Quel pronom remplace « le livre » dans cette phrase ? « Je lis le livre. »",
      instructions: "Choisissez le pronom complément d'objet direct correct.",
      points: 1,
      difficulty: "A2",
      order: 11,
      options: {
        create: [
          { id: uuid(), label: "A", text: "lui", isCorrect: false },
          { id: uuid(), label: "B", text: "le", isCorrect: true },
          { id: uuid(), label: "C", text: "la", isCorrect: false },
          { id: uuid(), label: "D", text: "y", isCorrect: false },
        ],
      },
      skills: {
        create: [{ id: uuid(), skillId: pronomsId }],
      },
    },
  });

  // Q12: MC - Prépositions
  const q12Id = uuid();
  await prisma.question.create({
    data: {
      id: q12Id,
      sectionId: section2Id,
      number: 12,
      type: "MULTIPLE_CHOICE",
      text: "Complétez : « Je vais ___ Paris ___ train. »",
      instructions: "Choisissez les prépositions correctes.",
      points: 1,
      difficulty: "A2",
      order: 12,
      options: {
        create: [
          { id: uuid(), label: "A", text: "à / en", isCorrect: true },
          { id: uuid(), label: "B", text: "à / par", isCorrect: false },
          { id: uuid(), label: "C", text: "pour / en", isCorrect: false },
          { id: uuid(), label: "D", text: "pour / par le", isCorrect: false },
        ],
      },

      skills: {
        create: [{ id: uuid(), skillId: prepositionsId }],
      },
    },
  });

  // Q13: FILL_BLANK - Passé composé
  const q13Id = uuid();
  await prisma.question.create({
    data: {
      id: q13Id,
      sectionId: section2Id,
      number: 13,
      type: "FILL_BLANK",
      text: "Nous ___ (finir) nos devoirs avant la récréation.",
      instructions: "Conjuguez le verbe au passé composé.",
      points: 1,
      difficulty: "A2",
      order: 13,
      answers: {
        create: [
          { id: uuid(), text: "blank_1: avons fini", isAcceptable: true, normalizationRule: { trimWhitespace: true, caseInsensitive: true } },
        ],
      },
      skills: {
        create: [{ id: uuid(), skillId: tempsVerbauxId }],
      },
    },
  });

  // --- Section 3: Vocabulaire (7 questions) ---

  // Q14: TRUE_FALSE - Grammar rule
  const q14Id = uuid();
  await prisma.question.create({
    data: {
      id: q14Id,
      sectionId: section3Id,
      number: 14,
      type: "TRUE_FALSE",
      text: "Le pronom « y » remplace un complément de lieu introduit par « à ».",
      instructions: "Indiquez si cette affirmation est vraie ou fausse.",
      points: 1,
      difficulty: "B1",
      order: 14,
      options: {
        create: [
          { id: uuid(), label: "V", text: "Vrai", isCorrect: true },
          { id: uuid(), label: "F", text: "Faux", isCorrect: false },
        ],
      },
      skills: {
        create: [{ id: uuid(), skillId: pronomsId }],
      },
    },
  });

  // Q15: MC - Context-based vocab
  const q15Id = uuid();
  await prisma.question.create({
    data: {
      id: q15Id,
      sectionId: section3Id,
      number: 15,
      type: "MULTIPLE_CHOICE",
      text: "Que signifie « une arche » dans le contexte architectural ?",
      instructions: "Choisissez la meilleure définition.",
      points: 1,
      difficulty: "B1",
      order: 15,
      options: {
        create: [
          { id: uuid(), label: "A", text: "Une porte d'entrée", isCorrect: false },
          { id: uuid(), label: "B", text: "Une structure voûtée en forme de demi-cercle", isCorrect: true },
          { id: uuid(), label: "C", text: "Un toit en pente", isCorrect: false },
          { id: uuid(), label: "D", text: "Un mur de soutènement", isCorrect: false },
        ],
      },
      skills: {
        create: [{ id: uuid(), skillId: vocabulaireId }],
      },
    },
  });

  // Q16: MC - Synonym
  const q16Id = uuid();
  await prisma.question.create({
    data: {
      id: q16Id,
      sectionId: section3Id,
      number: 16,
      type: "MULTIPLE_CHOICE",
      text: "Quel est le synonyme de « joyeux » ?",
      instructions: "Choisissez le mot le plus proche en signification.",
      points: 1,
      difficulty: "A2",
      order: 16,
      options: {
        create: [
          { id: uuid(), label: "A", text: "Triste", isCorrect: false },
          { id: uuid(), label: "B", text: "Heureux", isCorrect: true },
          { id: uuid(), label: "C", text: "Fatigué", isCorrect: false },
          { id: uuid(), label: "D", text: "En colère", isCorrect: false },
        ],
      },
      skills: {
        create: [{ id: uuid(), skillId: vocabulaireId }],
      },
    },
  });

  // Q17: SHORT_TEXT - Expression
  const q17Id = uuid();
  await prisma.question.create({
    data: {
      id: q17Id,
      sectionId: section3Id,
      number: 17,
      type: "SHORT_TEXT",
      text: "Quelle expression française signifie « avoir très faim » ?",
      instructions: "Écrivez l'expression complète.",
      points: 2,
      difficulty: "B1",
      order: 17,
      answers: {
        create: [
          { id: uuid(), text: "avoir une faim de loup", isAcceptable: true, normalizationRule: { trimWhitespace: true, caseInsensitive: true, removeAccents: true } },
          { id: uuid(), text: "mourir de faim", isAcceptable: true, normalizationRule: { trimWhitespace: true, caseInsensitive: true, removeAccents: true } },
        ],
      },
      skills: {
        create: [{ id: uuid(), skillId: vocabulaireId }],
      },
    },
  });

  // Q18: MC - Antonym
  const q18Id = uuid();
  await prisma.question.create({
    data: {
      id: q18Id,
      sectionId: section3Id,
      number: 18,
      type: "MULTIPLE_CHOICE",
      text: "Quel est l'antonyme de « courageux » ?",
      instructions: "Choisissez le mot de signification opposée.",
      points: 1,
      difficulty: "A2",
      order: 18,
      options: {
        create: [
          { id: uuid(), label: "A", text: "Brave", isCorrect: false },
          { id: uuid(), label: "B", text: "Lâche", isCorrect: true },
          { id: uuid(), label: "C", text: "Fort", isCorrect: false },
          { id: uuid(), label: "D", text: "Generous", isCorrect: false },
        ],
      },
      skills: {
        create: [{ id: uuid(), skillId: vocabulaireId }],
      },
    },
  });

  // Q19: FILL_BLANK - Vocab in context
  const q19Id = uuid();
  await prisma.question.create({
    data: {
      id: q19Id,
      sectionId: section3Id,
      number: 19,
      type: "FILL_BLANK",
      text: "Le ___ est le moment de la journée entre le coucher et le lever du soleil.",
      instructions: "Trouvez le mot qui décrit cette période.",
      points: 1,
      difficulty: "A2",
      order: 19,
      answers: {
        create: [
          { id: uuid(), text: "blank_1: crépuscule", isAcceptable: true, normalizationRule: { trimWhitespace: true, caseInsensitive: true } },
          { id: uuid(), text: "blank_1: nuit", isAcceptable: true, normalizationRule: { trimWhitespace: true, caseInsensitive: true } },
          { id: uuid(), text: "blank_1: aube", isAcceptable: true, normalizationRule: { trimWhitespace: true, caseInsensitive: true } },
        ],
      },
      skills: {
        create: [{ id: uuid(), skillId: vocabulaireId }],
      },
    },
  });

  // Q20: MC - Inference from text
  const passage2Id = uuid();
  await prisma.passage.create({
    data: {
      id: passage2Id,
      sectionId: section3Id,
      title: "La Lettre",
      content:
        "Cher ami, je t'écris pour te dire que je serai à Paris la semaine prochaine. J'ai hâte de te revoir et de partager un bon repas dans ton restaurant préféré. À bientôt, Marie.",
      type: "READING_TEXT",
    },
  });

  const q20Id = uuid();
  await prisma.question.create({
    data: {
      id: q20Id,
      sectionId: section3Id,
      passageId: passage2Id,
      number: 20,
      type: "MULTIPLE_CHOICE",
      text: "Quel est le but principal de cette lettre ?",
      instructions: "Inférez l'intention de l'auteur.",
      points: 2,
      difficulty: "B1",
      order: 20,
      options: {
        create: [
          { id: uuid(), label: "A", text: "Demander de l'aide", isCorrect: false },
          { id: uuid(), label: "B", text: "Annoncer une visite et proposer une rencontre", isCorrect: true },
          { id: uuid(), label: "C", text: "S'excuser pour une absence", isCorrect: false },
          { id: uuid(), label: "D", text: "Donner des nouvelles de sa santé", isCorrect: false },
        ],
      },
      skills: {
        create: [{ id: uuid(), skillId: inferenceId }],
      },
    },
  });

  console.log("  ✓ Created 20 questions with options, answers, and skill associations");
  console.log("  ✓ Created 2 reading passages");

  // ── Summary ────────────────────────────────────────────────────

  const skillCount = await prisma.skill.count();
  const examCount = await prisma.exam.count();
  const sectionCount = await prisma.examSection.count();
  const questionCount = await prisma.question.count();
  const optionCount = await prisma.questionOption.count();
  const answerCount = await prisma.questionAnswer.count();
  const questionSkillCount = await prisma.questionSkill.count();
  const passageCount = await prisma.passage.count();

  console.log("\n📊 Seeding summary:");
  console.log(`   Skills: ${skillCount}`);
  console.log(`   Exams: ${examCount}`);
  console.log(`   Sections: ${sectionCount}`);
  console.log(`   Questions: ${questionCount}`);
  console.log(`   Options: ${optionCount}`);
  console.log(`   Answers: ${answerCount}`);
  console.log(`   Question-Skills: ${questionSkillCount}`);
  console.log(`   Passages: ${passageCount}`);
  console.log("\n✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
