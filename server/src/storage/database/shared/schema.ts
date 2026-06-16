import { pgTable, serial, timestamp, varchar, text, jsonb, integer, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

/**
 * 错题记录表
 * 存储学生提交的错题及其批改结果
 */
export const errorQuestions = pgTable(
  "error_questions",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    student_name: varchar("student_name", { length: 100 }).notNull().default('用户'),  // 学生姓名
    subject: varchar("subject", { length: 50 }).notNull().default('语文'),           // 科目
    question_text: text("question_text").notNull(),                   // 题目文本
    student_answer: text("student_answer").notNull(),                 // 学生作答
    correct_answer: text("correct_answer"),                          // 正确答案（AI 计算）
    step_by_step: text("step_by_step"),                              // 规范分步过程
    is_correct: varchar("is_correct", { length: 10 }),               // 对错标记：correct / wrong
    error_type: varchar("error_type", { length: 50 }),               // 错误类型：计算/概念/审题/思路/步骤等
    error_detail: text("error_detail"),                              // 详细错误分析
    trap_analysis: text("trap_analysis"),                            // 题目陷阱和学生思维误区
    knowledge_points: jsonb("knowledge_points"),                     // 核心知识点列表 ["知识点1", "知识点2"]
    weakness_level: varchar("weakness_level", { length: 10 }),       // 薄弱等级：mild/moderate/severe
    status: varchar("status", { length: 20 }).default("pending"),    // pending / graded
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("error_questions_subject_idx").on(table.subject),
    index("error_questions_status_idx").on(table.status),
    index("error_questions_created_at_idx").on(table.created_at),
  ]
);

/**
 * 诊断记录表
 * 存储对一组错题的诊断分析结果
 */
export const diagnosisRecords = pgTable(
  "diagnosis_records",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    student_name: varchar("student_name", { length: 100 }).notNull().default('用户'),  // 学生姓名
    subject: varchar("subject", { length: 50 }).notNull().default('语文'),           // 科目
    question_ids: jsonb("question_ids").notNull().default('[]'),      // 关联的错题ID列表
    error_type_stats: jsonb("error_type_stats"),                      // 错误类型统计 { "计算": 3, "概念": 1 }
    top_weaknesses: jsonb("top_weaknesses"),                          // Top3 知识短板 [{name, level, count}]
    summary: text("summary"),                                         // 诊断总结
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("diagnosis_records_created_at_idx").on(table.created_at),
  ]
);

/**
 * 训练记录表
 * 存储生成的个性化训练题目及作答情况
 */
export const trainingRecords = pgTable(
  "training_records",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    student_name: varchar("student_name", { length: 100 }).notNull(),  // 学生姓名
    subject: varchar("subject", { length: 50 }).notNull(),           // 科目
    diagnosis_id: varchar("diagnosis_id", { length: 36 }).references(() => diagnosisRecords.id),
    question_ids: jsonb("question_ids").notNull(),                    // 关联的错题ID列表
    training_data: jsonb("training_data").notNull(),                  // 训练题数据 [{type, question, answer, analysis, tip}]
    difficulty_distribution: jsonb("difficulty_distribution"),        // 难度分配 {basic: 3, medium: 2, advanced: 1}
    careful_training: jsonb("careful_training"),                      // 细心专项训练题
    status: varchar("status", { length: 20 }).default("generated"),   // generated / in_progress / completed
    score: integer("score"),                                          // 训练得分
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    completed_at: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("training_records_diagnosis_id_idx").on(table.diagnosis_id),
    index("training_records_status_idx").on(table.status),
  ]
);