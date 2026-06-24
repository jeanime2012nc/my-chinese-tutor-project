import { Injectable, Logger } from '@nestjs/common';

/** 调用 LLM 的统一方法（使用 Coze SDK） */
async function callLLM(
  messages: Array<{ role: string; content: any }>,
  options?: { temperature?: number; maxTokens?: number },
): Promise<string> {
  const { LLMClient, Config } = await import('coze-coding-dev-sdk');

  // Config 自动从环境变量加载凭证，无需手动传参
  const config = new Config();
  const client = new LLMClient(config);

  const response = await client.invoke(
    messages.map((m) => ({
      role: m.role as 'system' | 'user' | 'assistant',
      content: m.content,
    })),
    {
      model: 'doubao-seed-2-0-pro-260215',
      temperature: options?.temperature ?? 0.4,
      // 注意：不传 streaming: false，Coze API 始终返回 SSE 格式，
      // SDK 默认 streaming: true 并在 invoke 内部自动聚合
    },
  );

  return response.content;
}

/** 从文本中提取 JSON 对象 */
function extractJSON(text: string): Record<string, any> | null {
  // 先尝试直接解析
  try {
    return JSON.parse(text);
  } catch {}

  // 尝试提取 ```json ... ``` 包裹的内容
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) {
    try {
      return JSON.parse(match[1].trim());
    } catch {}
  }

  // 尝试提取 { ... } JSON 对象
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try {
      return JSON.parse(braceMatch[0]);
    } catch {}
  }

  return null;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  /**
   * 智能批改：对学生的作答进行批改
   */
  async chatGrade(messages: Array<{ role: string; content: any }>): Promise<{
    grading: { isCorrect: string; score: number; errorType: string; errorAnalysis: string; trapAnalysis: string };
    reply: string;
  }> {
    const systemPrompt = `你是一位经验丰富的高中语文教师。请对学生的作答进行批改。

请以 JSON 格式返回批改结果，格式如下：
{
  "grading": {
    "isCorrect": "correct|partial|wrong",
    "score": 0-100的分数,
    "errorType": "错误类型（审题错误/概念错误/思路错误/步骤错误/计算错误/无错误）",
    "errorAnalysis": "详细分析学生的错误原因和思维误区（50-100字）",
    "trapAnalysis": "点明题目陷阱和学生的思维误区（30-50字）"
  },
  "reply": "给学生的自然语言回复（100-200字），包含鼓励、批改说明和建议，用对话体"
}

注意：请从对话历史中理解题目和学生作答，不要仅看最后一条消息。`;

    try {
      const responseText = await callLLM([
        { role: 'system', content: systemPrompt },
        ...messages.filter((m) => m.role !== 'system'),
      ], { temperature: 0.4, maxTokens: 4096 });

      const result = extractJSON(responseText);
      if (result?.grading) {
        return {
          grading: {
            isCorrect: result.grading.isCorrect || 'wrong',
            score: result.grading.score ?? 0,
            errorType: result.grading.errorType || '未知错误',
            errorAnalysis: result.grading.errorAnalysis || '',
            trapAnalysis: result.grading.trapAnalysis || '',
          },
          reply: result.reply || responseText,
        };
      }

      // JSON 解析失败，直接返回全部文本
      return {
        grading: { isCorrect: 'wrong', score: 0, errorType: '未知', errorAnalysis: '', trapAnalysis: '' },
        reply: responseText,
      };
    } catch (error: any) {
      this.logger.error(`chatGrade 调用失败: ${error.message}`);
      return {
        grading: { isCorrect: 'wrong', score: 0, errorType: '服务异常', errorAnalysis: '', trapAnalysis: '' },
        reply: '抱歉，批改服务暂时不可用，请稍后再试。',
      };
    }
  }

  /**
   * 薄弱诊断：分析错题记录，诊断薄弱点
   */
  async diagnose(params: { questions: any[] }): Promise<{
    errorTypeStats: Record<string, number>;
    topWeaknesses: Array<{ name: string; level: string; count: number }>;
    summary: string;
  }> {
    const questionsText = JSON.stringify(params.questions, null, 2);
    const prompt = `你是一位高中语文教学诊断专家。以下是学生的错题记录，请进行薄弱诊断。
注意：这是高中语文学科，绝对不能涉及数学、物理、化学、生物、地理等其他任何学科内容。

错题记录：
${questionsText}

请分析并返回以下 JSON 格式（不要额外文字，只返回 JSON）：

\`\`\`json
{
  "errorTypeStats": {"审题错误": 数字, "概念错误": 数字, "思路错误": 数字},
  "topWeaknesses": [{"name": "具体薄弱知识点（必须是高中语文知识点）", "level": "mild|moderate|severe", "count": 出现次数}],
  "summary": "综合诊断结论（200字以内，包含整体评价、主要问题、提升建议）"
}
\`\`\`

要求：
1. errorTypeStats 用对象格式，key为错误类型名称，value为出现次数
2. topWeaknesses 必须列出语文知识的具体薄弱点，如文言文实词、古诗鉴赏、作文立意、现代文阅读等
3. 总结中全部围绕高中语文能力提升展开
4. 【严禁】出现任何数学、物理、化学等非语文学科内容`;

    try {
      const responseText = await callLLM([
        { role: 'system', content: '你是一位专业的高中语文教学诊断专家。本系统只负责高中语文学科诊断，绝不能分析任何其他学科的知识点。' },
        { role: 'user', content: prompt },
      ], { temperature: 0.3, maxTokens: 4096 });

      const result = extractJSON(responseText);
      return {
        errorTypeStats: (result?.errorTypeStats as Record<string, number>) || {},
        topWeaknesses: result?.topWeaknesses || [],
        summary: result?.summary || '诊断分析暂不可用，请稍后再试。',
      };
    } catch (error: any) {
      this.logger.error(`diagnose 调用失败: ${error.message}`);
      return { errorTypeStats: {}, topWeaknesses: [], summary: '诊断分析暂不可用。' };
    }
  }

  /**
   * 生成训练题：根据诊断结果生成分层训练题目
   */
  async generateTraining(params: {
    errorTypeStats: Record<string, number>;
    topWeaknesses: Array<{ name: string; level: string; count: number }>;
    summary: string;
  }): Promise<{
    trainingData: Array<{ type: string; difficulty: string; questions: Array<{ stem: string; answer: string; analysis: string; trapWarning?: string }> }>;
    carefulTraining?: Array<{ stem: string; answer: string; analysis: string; trapWarning: string }>;
    difficultyDistribution: { basic: number; intermediate: number; advanced: number };
  }> {
    const prompt = `你是一位高中语文教学专家，请根据以下诊断结果生成分层训练题。

薄弱诊断：
${JSON.stringify(params, null, 2)}

请返回以下 JSON 格式（不要额外文字，只返回 JSON）：

\`\`\`json
{
  "trainingData": [
    {
      "type": "薄弱点名称",
      "difficulty": "basic|intermediate|advanced",
      "questions": [
        {
          "stem": "题目内容",
          "answer": "参考答案与解析（100-200字）",
          "analysis": "考查的知识点和解题思路（50-100字）",
          "trapWarning": "易错提示和避坑指南（选填）"
        }
      ]
    }
  ],
  "carefulTraining": [
    {
      "stem": "细心专项训练题",
      "answer": "参考答案",
      "analysis": "解析",
      "trapWarning": "易错点提醒"
    }
  ],
  "difficultyDistribution": {
    "basic": 基础题数量,
    "intermediate": 中档题数量,
    "advanced": 拔高题数量
  }
}
\`\`\`

要求：
1. 按薄弱等级分配训练题量（重度60%/中度30%/轻度10%）
2. 训练内容贴合高中语文统编版教材
3. 每道题需要完整解析和避坑提醒
4. 若存在大量审题/概念失误，额外生成carefulTraining（每题的stem包含5道细心专项小题）`;

    try {
      const responseText = await callLLM([
        { role: 'system', content: '你是一位专业的高中语文命题专家，擅长根据学情生成针对性的训练题。' },
        { role: 'user', content: prompt },
      ], { temperature: 0.5, maxTokens: 8192 });

      const result = extractJSON(responseText);
      return {
        trainingData: result?.trainingData || [],
        carefulTraining: result?.carefulTraining || undefined,
        difficultyDistribution: result?.difficultyDistribution || { basic: 0, intermediate: 0, advanced: 0 },
      };
    } catch (error: any) {
      this.logger.error(`generateTraining 调用失败: ${error.message}`);
      return { trainingData: [], difficultyDistribution: { basic: 0, intermediate: 0, advanced: 0 } };
    }
  }
}