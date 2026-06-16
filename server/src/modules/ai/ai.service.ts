import { Injectable, Logger } from '@nestjs/common';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private client: LLMClient;

  constructor() {
    const config = new Config();
    this.client = new LLMClient(config);
  }

  /**
   * 批改单道错题：计算答案、分步过程、错误类型分析
   */
  async gradeQuestion(params: {
    subject: string;
    questionText: string;
    studentAnswer: string;
  }): Promise<{
    correctAnswer: string;
    stepByStep: string;
    isCorrect: string;
    errorType: string;
    errorDetail: string;
    trapAnalysis: string;
    knowledgePoints: string[];
    weaknessLevel: string;
  }> {
    const prompt = `你是一名经验丰富的${params.subject}教师，正在批改学生的作业。

【题目】
${params.questionText}

【学生作答】
${params.studentAnswer}

请完成以下任务，严格按照 JSON 格式输出（不要有任何其他文字）：

{
  "correctAnswer": "本题的标准正确答案",
  "stepByStep": "规范的分步解题过程，每一步清晰说明",
  "isCorrect": "correct 或 wrong",
  "errorType": "如果错误，指出错误类型：计算错误 / 概念错误 / 审题错误 / 思路错误 / 步骤错误 / 无错误",
  "errorDetail": "详细说明学生的具体错误在哪里，指出错误步骤",
  "trapAnalysis": "分析题目中设置了什么陷阱，以及学生陷入了什么思维误区",
  "knowledgePoints": ["核心知识点1", "核心知识点2", "核心知识点3"],
  "weaknessLevel": "mild 或 moderate 或 severe（根据该知识点掌握程度评估薄弱等级）"
}`;

    try {
      const response = await this.client.invoke(
        [
          { role: 'system', content: '你是一位严谨细致的全科教师，擅长批改作业、分析错误、指导学生。请严格按照要求的 JSON 格式输出。' },
          { role: 'user', content: prompt },
        ],
        { model: 'doubao-seed-2-0-pro-260215', temperature: 0.3 },
      );

      const result = JSON.parse(response.content);
      return {
        correctAnswer: result.correctAnswer || '',
        stepByStep: result.stepByStep || '',
        isCorrect: result.isCorrect || 'wrong',
        errorType: result.errorType || '无错误',
        errorDetail: result.errorDetail || '',
        trapAnalysis: result.trapAnalysis || '',
        knowledgePoints: result.knowledgePoints || [],
        weaknessLevel: result.weaknessLevel || 'moderate',
      };
    } catch (error) {
      this.logger.error(`错题批改 AI 调用失败: ${error.message}`);
      throw new Error('AI 批改服务异常，请重试');
    }
  }

  /**
   * 薄弱点诊断：汇总错题分析，生成诊断报告
   */
  async diagnose(params: {
    questions: Array<{
      questionText: string;
      studentAnswer: string;
      correctAnswer: string;
      errorType: string;
      errorDetail: string;
      trapAnalysis: string;
      knowledgePoints: string[];
      weaknessLevel: string;
    }>;
  }): Promise<{
    errorTypeStats: Record<string, number>;
    topWeaknesses: Array<{ name: string; level: string; count: number }>;
    summary: string;
  }> {
    const questionsJson = JSON.stringify(params.questions, null, 2);

    const prompt = `以下是一组学生的错题分析数据，请综合诊断，严格按照 JSON 格式输出：

${questionsJson}

{
  "errorTypeStats": { "计算错误": 3, "概念错误": 1, ... },
  "topWeaknesses": [
    { "name": "最短知识短板名称", "level": "severe/moderate/mild", "count": 出现次数 },
    ...
  ],
  "summary": "综合诊断总结，指出学生最需要加强的方向，语气鼓励且有建设性"
}`;

    try {
      const response = await this.client.invoke(
        [
          { role: 'system', content: '你是一位学习诊断专家，善于从学生的错题中找出薄弱点，给出有针对性的诊断建议。请严格按照 JSON 格式输出。' },
          { role: 'user', content: prompt },
        ],
        { model: 'doubao-seed-2-0-pro-260215', temperature: 0.3 },
      );

      const result = JSON.parse(response.content);
      return {
        errorTypeStats: result.errorTypeStats || {},
        topWeaknesses: result.topWeaknesses || [],
        summary: result.summary || '',
      };
    } catch (error) {
      this.logger.error(`薄弱诊断 AI 调用失败: ${error.message}`);
      throw new Error('诊断服务异常，请重试');
    }
  }

  /**
   * 生成个性化训练题目
   */
  async generateTraining(params: {
    subject: string;
    questions: Array<{
      questionText: string;
      knowledgePoints: string[];
      weaknessLevel: string;
      errorType: string;
    }>;
    weaknessLevel: string; // 总体薄弱等级
  }): Promise<{
    trainingData: Array<{
      type: string;        // basic / medium / advanced
      question: string;
      answer: string;
      analysis: string;
      tip: string;
    }>;
    difficultyDistribution: { basic: number; medium: number; advanced: number };
    carefulTraining: Array<{
      question: string;
      answer: string;
      analysis: string;
      tip: string;
    }>;
  }> {
    const questionsJson = JSON.stringify(params.questions, null, 2);
    const hasCarelessErrors = params.questions.some(
      q => q.errorType.includes('审题') || q.errorType.includes('计算'),
    );

    const prompt = `你是一名经验丰富的${params.subject}教师，需要为学生设计个性化训练题。

学生当前的薄弱等级：${params.weaknessLevel}
学生错题分析：${questionsJson}
${hasCarelessErrors ? '⚠️ 学生存在审题/计算失误，需要额外增加细心专项训练。' : ''}

请按照以下比例分配训练题：
- 重度薄弱（severe）：60% 为基础巩固题
- 中度薄弱（moderate）：30% 为中档变式题
- 轻度薄弱（mild）：10% 为拔高综合题
${hasCarelessErrors ? '- 额外增加 5 道细心专项训练题' : ''}

严格按照 JSON 格式输出：

{
  "trainingData": [
    {
      "type": "basic 或 medium 或 advanced",
      "question": "题目内容（贴合手机阅读，分板块排版）",
      "answer": "标准答案",
      "analysis": "完整解析，重点内容用**加粗**标注",
      "tip": "避坑提醒"
    }
  ],
  "difficultyDistribution": {
    "basic": 基础题数量,
    "medium": 中档题数量,
    "advanced": 拔高题数量
  },
  "carefulTraining": ${hasCarelessErrors ? `[
    {
      "question": "细心专项题1（注重审题和计算细节）",
      "answer": "答案",
      "analysis": "解析，重点标注易错点",
      "tip": "避坑提醒"
    }
  ]` : '[]'}
}`;

    try {
      const response = await this.client.invoke(
        [
          { role: 'system', content: '你是一位经验丰富的出题教师，擅长根据学生薄弱点设计个性化训练题目。请严格按照 JSON 格式输出。' },
          { role: 'user', content: prompt },
        ],
        { model: 'doubao-seed-2-0-pro-260215', temperature: 0.5 },
      );

      const result = JSON.parse(response.content);
      return {
        trainingData: result.trainingData || [],
        difficultyDistribution: result.difficultyDistribution || { basic: 0, medium: 0, advanced: 0 },
        carefulTraining: result.carefulTraining || [],
      };
    } catch (error) {
      this.logger.error(`训练生成 AI 调用失败: ${error.message}`);
      throw new Error('训练题生成服务异常，请重试');
    }
  }
}