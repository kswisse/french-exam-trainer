import { type Exam, type ExamSection, type Question, type QuestionOption, type QuestionAnswer, type QuestionSkill, type Skill, type Passage } from "@/generated/prisma/browser";

export type ExamWithSections = Exam & {
  sections: (ExamSection & {
    questions: Question[];
  })[];
};

export type ExamWithDetails = Exam & {
  sections: (ExamSection & {
    questions: (Question & {
      options: QuestionOption[];
      answers: QuestionAnswer[];
      skills: (QuestionSkill & {
        skill: Skill;
      })[];
    })[];
    passages: Passage[];
  })[];
};

export type ExamSummary = Pick<Exam, "id" | "title" | "description" | "type" | "year" | "timeLimitMinutes" | "totalPoints" | "mode" | "status" | "createdAt"> & {
  _count: {
    sections: number;
    questions: number;
  };
};
