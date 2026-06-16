import { Controller, Post, Get, Body, Param, HttpCode, Logger } from '@nestjs/common';
import { TrainingService } from './training.service';
import { ErrorQuestionsService } from '../error-questions/error-questions.service';
import { DiagnosisService } from '../diagnosis/diagnosis.service';
import { AiService } from '../ai/ai.service';

@Controller('training')
export class TrainingController {
  private readonly logger = new Logger(TrainingController.name);

  constructor(
    private readonly trainingService: TrainingService,
    private readonly errorQuestionsService: ErrorQuestionsService,
    private readonly diagnosisService: DiagnosisService,
    private readonly aiService: AiService,
  ) {}

  @Post('generate')
  @HttpCode(200)
  async generate() {
    this.logger.log('生成语文训练题');

    const questions = await this.errorQuestionsService.getAllQuestions();
    if (questions.length === 0) {
      return { code: 200, msg: 'success', data: { message: '暂无批改记录，请先提交题目' } };
    }

    // 获取最新诊断记录ID
    const diagnoses = await this.diagnosisService.getAllDiagnoses();
    const latestDiagnosisId = diagnoses.length > 0 ? diagnoses[0].id : null;

    // 统计薄弱等级
    const weaknessLevels = questions.map(q => q.weakness_level);
    const severeCount = weaknessLevels.filter(l => l === 'severe').length;
    const moderateCount = weaknessLevels.filter(l => l === 'moderate').length;

    let overallWeakness = 'mild';
    if (severeCount >= 2) overallWeakness = 'severe';
    else if (moderateCount >= 2 || severeCount >= 1) overallWeakness = 'moderate';

    const trainingQuestions = questions.map(q => ({
      questionText: q.question_text,
      knowledgePoints: q.knowledge_points || [],
      weaknessLevel: q.weakness_level,
      errorType: q.error_type,
    }));

    const trainingResult = await this.aiService.generateTraining({
      questions: trainingQuestions,
      weaknessLevel: overallWeakness,
    });

    const saved = await this.trainingService.saveTraining({
      diagnosisId: latestDiagnosisId,
      trainingData: trainingResult.trainingData,
      carefulTraining: trainingResult.carefulTraining,
      difficultyDistribution: trainingResult.difficultyDistribution,
      questionIds: questions.map(q => q.id as string),
    });

    return { code: 200, msg: 'success', data: saved };
  }

  @Get('latest')
  @HttpCode(200)
  async getLatestTraining() {
    const trainings = await this.trainingService.getAllTrainings();
    const latest = trainings.length > 0 ? trainings[0] : null;
    return { code: 200, msg: 'success', data: latest };
  }

  @Get(':id')
  @HttpCode(200)
  async getTraining(@Param('id') id: string) {
    const training = await this.trainingService.getTrainingById(id);
    return { code: 200, msg: 'success', data: training };
  }
}