import { Controller, Post, Get, Body, Param, HttpCode, Logger } from '@nestjs/common';
import { DiagnosisService } from './diagnosis.service';
import { ErrorQuestionsService } from '../error-questions/error-questions.service';
import { AiService } from '../ai/ai.service';

@Controller('diagnosis')
export class DiagnosisController {
  private readonly logger = new Logger(DiagnosisController.name);

  constructor(
    private readonly diagnosisService: DiagnosisService,
    private readonly errorQuestionsService: ErrorQuestionsService,
    private readonly aiService: AiService,
  ) {}

  @Post('analyze')
  @HttpCode(200)
  async analyze(@Body() body: { studentName: string; subject: string }) {
    this.logger.log(`薄弱诊断: ${body.studentName}, ${body.subject}`);

    const questions = await this.errorQuestionsService.getQuestionsByStudent(body.studentName);
    const subjectQuestions = questions.filter(q => q.subject === body.subject);

    if (subjectQuestions.length === 0) {
      return { code: 200, msg: 'success', data: { message: '暂未找到错题记录，请先录入错题' } };
    }

    const wrongQuestions = subjectQuestions
      .filter(q => q.is_correct === 'wrong')
      .map(q => ({
        questionText: q.question_text,
        studentAnswer: q.student_answer,
        correctAnswer: q.correct_answer,
        errorType: q.error_type,
        errorDetail: q.error_detail,
        trapAnalysis: q.trap_analysis,
        knowledgePoints: q.knowledge_points,
        weaknessLevel: q.weakness_level,
      }));

    if (wrongQuestions.length === 0) {
      return { code: 200, msg: 'success', data: { message: '全部正确，继续保持！' } };
    }

    const diagnosisResult = await this.aiService.diagnose({ questions: wrongQuestions });

    const saved = await this.diagnosisService.saveDiagnosis({
      studentName: body.studentName,
      subject: body.subject,
      errorTypeStats: diagnosisResult.errorTypeStats,
      topWeaknesses: diagnosisResult.topWeaknesses,
      summary: diagnosisResult.summary,
      questionIds: subjectQuestions.map(q => q.id as string),
    });

    return { code: 200, msg: 'success', data: saved };
  }

  @Get('list/:studentName')
  @HttpCode(200)
  async listDiagnoses(@Param('studentName') studentName: string) {
    const diagnoses = await this.diagnosisService.getDiagnosesByStudent(studentName);
    return { code: 200, msg: 'success', data: diagnoses };
  }

  @Get(':id')
  @HttpCode(200)
  async getDiagnosis(@Param('id') id: string) {
    const diagnosis = await this.diagnosisService.getDiagnosisById(id);
    return { code: 200, msg: 'success', data: diagnosis };
  }
}