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
   * 高中语文对话式批改：支持文字/图片输入
   * 用户输入可以是：题目+作答 或 仅题目 或 问题咨询
   */
  async chatGrade(params: {
    message: string;
    imageUrl?: string;
    history?: Array<{ role: string; content: string }>;
  }): Promise<{
    reply: string;
    grading?: {
      correctAnswer: string;
      stepByStep: string;
      isCorrect: string;
      errorType: string;
      errorDetail: string;
      trapAnalysis: string;
      knowledgePoints: string[];
      weaknessLevel: string;
    };
  }> {
    const messages: Array<any> = [
      {
        role: 'system',
        content: `你是一位经验丰富的高中语文教师，擅长批改作文、阅读理解、古文翻译、诗歌鉴赏、拼音、汉字、成语等各类语文题目。

你的回复风格：
1. 自然对话体，像老师在和学生面对面交流
2. 如果是批改题目，先用 warm-up 语气回应，再给出专业分析
3. 批改时明确指出：答案对错、错误类型（审题/理解/知识/表达/思路错误）、详细分析、陷阱说明
4. 鼓励性语气，帮助学生建立信心
5. 排版清晰，重点内容使用 **加粗** 标注
6. 如果是图片，先说明"已收到你的图片"，再进行分析

**重要：对于学生上传的图片中的题目：**
- 仔细识别图片中的**文字内容**，包括拼音、汉字、标点等细节
- 如果是**拼音题**（如给汉字注音、看拼音写汉字等），注意拼音的声调、声母韵母是否正确
- 如果是**字形题**（如看拼音写词语、成语填空等），注意笔划、偏旁、结构是否正确
- 如果是**默写/填空题**，注意是否有错别字、漏字、语序颠倒
- 仔细对比学生答案与标准答案的差异，指出每一个错误点

回复结构（如果涉及批改）：
- 先给出整体判断（正确/错误）
- 然后对错误进行分层分析
- 最后给出改进建议`,
      },
    ];

    // 添加历史消息（最近3轮）
    if (params.history && params.history.length > 0) {
      const recentHistory = params.history.slice(-6);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // 用户消息（支持图片 - 多模态格式）
    if (params.imageUrl) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: params.message || '请解析这张图片中的题目并批改' },
          { type: 'image_url', image_url: { url: params.imageUrl, detail: 'high' } },
        ],
      });
    } else {
      messages.push({
        role: 'user',
        content: params.message,
      });
    }

    try {
      const response = await this.client.invoke(
        messages,
        {
          model: 'doubao-seed-2-0-pro-260215',
          temperature: 0.4,
        },
      );

      const reply = response.content;

      // 尝试从回复中提取结构化批改数据
      let grading: {
        correctAnswer: string;
        stepByStep: string;
        isCorrect: string;
        errorType: string;
        errorDetail: string;
        trapAnalysis: string;
        knowledgePoints: string[];
        weaknessLevel: string;
      } | undefined = undefined;
      try {
        const jsonMatch = reply.match(/\{[\s\S]*"isCorrect"[\s\S]*\}/);
        if (jsonMatch) {
          const jsonData = JSON.parse(jsonMatch[0]);
          if (jsonData.isCorrect) {
            grading = {
              correctAnswer: jsonData.correctAnswer || '',
              stepByStep: jsonData.stepByStep || '',
              isCorrect: jsonData.isCorrect || 'wrong',
              errorType: jsonData.errorType || '',
              errorDetail: jsonData.errorDetail || '',
              trapAnalysis: jsonData.trapAnalysis || '',
              knowledgePoints: jsonData.knowledgePoints || [],
              weaknessLevel: jsonData.weaknessLevel || 'moderate',
            };
          }
        }
      } catch {
        // JSON 解析失败也没关系，对话体回复不需要结构化数据
      }

      return { reply, grading };
    } catch (error: any) {
      this.logger.error(`AI 对话调用失败: ${error.message}`);
      throw new Error('AI 服务异常，请重试');
    }
  }

  /**
   * 薄弱点诊断（基于历史错题）
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
    const prompt = `以下是一位高中生的语文错题分析数据，请进行综合诊断，严格按照 JSON 格式输出：

${questionsJson}

{
  "errorTypeStats": { "审题错误": 2, "理解错误": 1, "知识记忆错误": 3 },
  "topWeaknesses": [
    { "name": "具体知识短板名称（如：文言文虚词用法）", "level": "severe/moderate/mild", "count": 出现次数 },
    { "name": "...", "level": "...", "count": ... },
    { "name": "...", "level": "...", "count": ... }
  ],
  "summary": "综合诊断总结（对话体语气，鼓励且有针对性的建议）"
}`;

    try {
      const response = await this.client.invoke(
        [
          { role: 'system', content: '你是一位高中语文学习诊断专家，善于从学生的错题中找出薄弱点，给出有针对性的诊断建议。请严格按照 JSON 格式输出。' },
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
    } catch (error: any) {
      this.logger.error(`薄弱诊断 AI 调用失败: ${error.message}`);
      throw new Error('诊断服务异常，请重试');
    }
  }

  /**
   * 生成个性化语文训练题
   */
  async generateTraining(params: {
    questions: Array<{
      questionText: string;
      knowledgePoints: string[];
      weaknessLevel: string;
      errorType: string;
    }>;
    weaknessLevel: string;
  }): Promise<{
    trainingData: Array<{
      type: string;
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
      q => q.errorType.includes('审题') || q.errorType.includes('表达') || q.errorType.includes('书写'),
    );

    const prompt = `你是一名经验丰富的高中语文教师，需要为学生设计个性化语文训练题。

学生当前的薄弱等级：${params.weaknessLevel}
学生语文错题分析：${questionsJson}
${hasCarelessErrors ? '⚠️ 学生存在审题/表达失误，需要额外增加细心专项训练。' : ''}

题目类型可涵盖：现代文阅读、文言文阅读、古诗词鉴赏、语言文字运用、作文审题等。

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
      "question": "细心专项题（注重审题和表达细节的语文题）",
      "answer": "答案",
      "analysis": "解析，重点标注易错点",
      "tip": "避坑提醒"
    }
  ]` : '[]'}
}`;

    try {
      const response = await this.client.invoke(
        [
          { role: 'system', content: '你是一位经验丰富的高中语文教师，擅长根据学生薄弱点设计个性化训练题目。请严格按照 JSON 格式输出。' },
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
    } catch (error: any) {
      this.logger.error(`训练生成 AI 调用失败: ${error.message}`);
      throw new Error('训练题生成服务异常，请重试');
    }
  }
}