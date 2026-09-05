# T06: Seed Data

**Goal:** Create demo exam with 20 original French questions across 3 sections, plus skill taxonomy.

**Files to create:**
```
french-exam-trainer/
└── prisma/
    └── seed/
        └── seed.ts
```

**`prisma/seed/seed.ts`:**

Create a script that:
1. Upserts the skill taxonomy (8 skills from spec Section 19.2)
2. Creates a demo admin Profile
3. Creates one Exam: "Exercices de Français — Démo" with status=PUBLISHED, mode=BOTH
4. Creates 3 ExamSections with correct order
5. Creates 20 Questions across sections with correct types, points, order
6. Creates QuestionOption records for MC/TF questions
7. Creates QuestionAnswer records for SHORT_TEXT/FILL_BLANK/MATCHING
8. Creates QuestionSkill associations

**Skill taxonomy to seed:**
```ts
const skills = [
  { name: "Compréhension écrite", category: "receptive" },
  { name: "Grammaire", category: "linguistic" },
  { name: "Temps verbaux", parentId: "<grammaire-id>", category: "linguistic" },
  { name: "Subjonctif", parentId: "<grammaire-id>", category: "linguistic" },
  { name: "Conditionnel", parentId: "<grammaire-id>", category: "linguistic" },
  { name: "Pronoms", parentId: "<grammaire-id>", category: "linguistic" },
  { name: "Prépositions", parentId: "<grammaire-id>", category: "linguistic" },
  { name: "Vocabulaire", category: "linguistic" },
  { name: "Inférence", category: "cognitive" },
];
```

**Question content:** Create original French questions. Examples:

Section 1 — Compréhension écrite (5 questions):
- Q1 (MC): "Quelle est la capitale de la France?" Options: A) Lyon B) Paris C) Marseille D) Toulouse. Correct: B
- Q2 (MC): "Que signifie 'avoir le coup de foudre'?" Options with French idioms. Correct: "Tomber amoureux"
- Q3 (TF): "Le subjonctif est obligatoire après 'croire que'." Correct: False
- Q4 (SHORT_TEXT): "Conjuguez 'aller' au présent, 1ère personne du singulier." Acceptable: ["vais"]
- Q5 (MC): Reading comprehension passage + question about main idea

Section 2 — Grammaire (8 questions):
- Q6 (MC): Temps verbaux — "Quel temps est utilisé dans: 'Je mangeais un gâteau'?"
- Q7 (MC): Subjonctif — "Il faut que tu ___ (aller)"
- Q8 (FILL_BLANK): "Je ___ (être) allé au marché ___ (hier)"
- Q9 (MATCHING): Match French words to English translations
- etc.

Section 3 — Vocabulaire (7 questions):
- Q10 (MC): "Que signifie 'une arche'?" Context-based vocabulary
- etc.

**Tests:** None (seed script only).

**Acceptance criteria:**
- `npx tsx prisma/seed/seed.ts` runs without errors
- Database contains: 1 Exam, 3 Sections, 20 Questions, all Options/Answers
- All QuestionSkill associations created
- `npm run build` still works after seeding

**Dependencies:** T02.
