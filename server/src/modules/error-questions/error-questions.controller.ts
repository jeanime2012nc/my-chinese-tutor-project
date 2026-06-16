import { Controller, Post, Get, Param, Body, HttpCode, Logger } from '@nestjs/common';
import { ErrorQuestionsService } from './error-questions.service';
import { AiService } from '../ai/ai.service';

@Controller('error-questions')
export class ErrorQuestionsController {
  private readonly logger = new Logger(ErrorQuestionsController.name);

  constructor(
    private readonly errorQuestionsService: ErrorQuestionsService,
    private readonly aiService: AiService,
  ) {}

  @Post('grade')
  @HttpCode(200)
  async gradeAndSave(@Body() body: {
    studentName: string;
    subject: string;
    questionText: string;
    studentAnswer: string;
  }) {
    this.logger.log(`批改错题: ${body.subject}, ${body.questionText.substring(0, 30)}...`);

    const gradeResult = await this.aiService.gradeQuestion({
      subject: body.subject,
      questionText: body.questionText,
      studentAnswer: body.studentAnswer,
    });

    const saved = await this.errorQuestionsService.createQuestion({
      student_name: body.studentName,
      subject: body.subject,
      question_text: body.questionText,
      student_answer: body.studentAnswer,
      correct_answer: gradeResult.correctAnswer,
      step_by_step: gradeResult.stepByStep,
      is_correct: gradeResult.isCorrect,
      error_type: gradeResult.errorType,
      error_detail: gradeResult.errorDetail,
      trap_analysis: gradeResult.trapAnalysis,
      knowledge_points: gradeResult.knowledgePoints,
      weakness_level: gradeResult.weaknessLevel,
    });

    return { code: 200, msg: 'success', data: saved };
  }

  @Get('list/:studentName')
  @HttpCode(200)
  async listQuestions(@Param('studentName') studentName: string) {
    const questions = await this.errorQuestionsService.getQuestionsByStudent(studentName);
    return { code: 200, msg: 'success', data: questions };
  }

  @Get(':id')
  @HttpCode(200)
  async getQuestion(@Param('id') id: string) {
    const question = await this.errorQuestionsService.getQuestionById(id);
    return { code: 200, msg: 'success', data: question };
  }
}