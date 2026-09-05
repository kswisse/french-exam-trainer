import { GoogleGenerativeAI } from "@google/generative-ai";
import { type AIProvider, type ParseContext, type ClassifyMistakeParams, type MistakeClassification, type ExplainQuestionParams, type Explanation } from "./types";
import { ParsedExamSchema, type ParsedExam } from "@/lib/validation/schemas";

export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
  }

  async parseExam(text: string, context: ParseContext): Promise<ParsedExam> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `You are an expert French exam parser. Extract the following exam into structured JSON.
Return ONLY valid JSON matching this schema: ${JSON.stringify(ParsedExamSchema.shape)}`;

    const result = await model.generateContent([prompt, text]);
    const response = result.response.text();
    const parsed = JSON.parse(response);
    return ParsedExamSchema.parse(parsed);
  }

  async classifyMistake(params: ClassifyMistakeParams): Promise<MistakeClassification> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Classify this French exam mistake. Return JSON: { "category": "...", "confidence": 0-1, "explanation": "..." }`;
    const result = await model.generateContent([prompt, JSON.stringify(params)]);
    const response = result.response.text();
    return JSON.parse(response);
  }

  async explainQuestion(params: ExplainQuestionParams): Promise<Explanation> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Explain this French exam question. Return JSON: { "whyCorrect": "...", "whyIncorrect": "...", "frenchContext": "...", "takeaway": "..." }`;
    const result = await model.generateContent([prompt, JSON.stringify(params)]);
    const response = result.response.text();
    return JSON.parse(response);
  }
}
