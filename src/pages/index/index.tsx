import { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, Send, CircleCheck, CircleX, TriangleAlert, Lightbulb } from 'lucide-react-taro'

const SUBJECTS = ['数学', '语文', '英语', '物理', '化学', '生物', '历史', '地理', '政治']

export default function Index() {
  const [studentName, setStudentName] = useState('')
  const [subject, setSubject] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [studentAnswer, setStudentAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleGrade = async () => {
    if (!studentName || !subject || !questionText || !studentAnswer) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await Network.request({
        url: '/api/error-questions/grade',
        method: 'POST',
        data: { studentName, subject, questionText, studentAnswer },
      })
      console.log('批改结果:', res.data)
      setResult(res.data.data)
    } catch (error) {
      console.error('批改失败:', error)
      Taro.showToast({ title: '批改失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setQuestionText('')
    setStudentAnswer('')
    setResult(null)
  }

  return (
    <ScrollView className="h-full bg-slate-50" scrollY>
      <View className="p-4 space-y-4">
        {/* 学生信息与科目选择 */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <View className="flex flex-row items-center gap-3">
              <BookOpen size={20} color="#2563eb" />
              <Text className="block text-base font-semibold text-gray-900">错题录入与批改</Text>
            </View>
            <Separator />
            <View>
              <Text className="block text-sm font-medium text-gray-700 mb-1">学生姓名</Text>
              <Input
                placeholder="请输入学生姓名"
                value={studentName}
                onInput={(e) => setStudentName(e.detail.value)}
              />
            </View>
            <View>
              <Text className="block text-sm font-medium text-gray-700 mb-1">选择科目</Text>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择科目" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </View>
          </CardContent>
        </Card>

        {/* 题目与作答区 */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <Text className="block text-sm font-medium text-gray-700">题目内容</Text>
            <Textarea
              placeholder="请输入或粘贴题目内容..."
              value={questionText}
              onInput={(e) => setQuestionText(e.detail.value)}
              autoHeight
            />
            <Text className="block text-sm font-medium text-gray-700">学生作答</Text>
            <Textarea
              placeholder="请输入学生的解答..."
              value={studentAnswer}
              onInput={(e) => setStudentAnswer(e.detail.value)}
              autoHeight
            />

            <View style={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
              <Button className="flex-1" disabled={loading} onClick={handleGrade}>
                {loading ? (
                  <Text className="block text-sm">批改中...</Text>
                ) : (
                  <>
                    <Send size={16} color="inherit" />
                    <Text className="block text-sm">提交批改</Text>
                  </>
                )}
              </Button>
              {result && (
                <Button variant="outline" className="flex-1" onClick={handleReset}>
                  <Text className="block text-sm">继续录入</Text>
                </Button>
              )}
            </View>
          </CardContent>
        </Card>

        {/* 加载骨架屏 */}
        {loading && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        )}

        {/* 批改结果 */}
        {result && !loading && (
          <View className="space-y-4">
            {/* 对错标记 */}
            <Card>
              <CardContent className="p-4">
                <View className="flex flex-row items-center gap-2 mb-2">
                  {result.isCorrect === 'correct' ? (
                    <>
                      <CircleCheck size={24} color="#22c55e" />
                      <Text className="block text-lg font-bold text-green-600">回答正确 ✓</Text>
                    </>
                  ) : (
                    <>
                      <CircleX size={24} color="#ef4444" />
                      <Text className="block text-lg font-bold text-red-500">回答错误 ✗</Text>
                    </>
                  )}
                  <Badge variant={result.isCorrect === 'correct' ? 'secondary' : 'destructive'} className="ml-auto">
                    {result.isCorrect === 'correct' ? '正确' : '需订正'}
                  </Badge>
                </View>
              </CardContent>
            </Card>

            {/* 标准答案与解题过程 */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <View className="flex flex-row items-center gap-2">
                  <CircleCheck size={18} color="#2563eb" />
                  <Text className="block text-base font-semibold text-gray-900">标准答案</Text>
                </View>
                <Text className="block text-sm text-gray-900 bg-blue-50 rounded-lg p-3">{result.correctAnswer}</Text>
                <Separator />
                <View className="flex flex-row items-center gap-2">
                  <Lightbulb size={18} color="#2563eb" />
                  <Text className="block text-base font-semibold text-gray-900">规范解题过程</Text>
                </View>
                <Text className="block text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{result.stepByStep}</Text>
              </CardContent>
            </Card>

            {/* 错误分析 */}
            {result.isCorrect === 'wrong' && (
              <>
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <View className="flex flex-row items-center gap-2">
                      <TriangleAlert size={18} color="#f59e0b" />
                      <Text className="block text-base font-semibold text-gray-900">错误分析</Text>
                    </View>
                    <View className="flex flex-row items-center gap-2 mb-2">
                      <Text className="block text-xs text-gray-500">错误类型：</Text>
                      <Badge variant="destructive">{result.errorType}</Badge>
                    </View>
                    <Text className="block text-sm text-gray-700 bg-amber-50 rounded-lg p-3">{result.errorDetail}</Text>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-2">
                    <View className="flex flex-row items-center gap-2">
                      <TriangleAlert size={18} color="#ef4444" />
                      <Text className="block text-base font-semibold text-gray-900">题目陷阱与思维误区</Text>
                    </View>
                    <Text className="block text-sm text-gray-700 bg-red-50 rounded-lg p-3">{result.trapAnalysis}</Text>
                  </CardContent>
                </Card>

                {/* 知识点标签 */}
                {result.knowledgePoints && result.knowledgePoints.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <Text className="block text-base font-semibold text-gray-900 mb-2">涉及知识点</Text>
                      <View className="flex flex-row flex-wrap gap-2">
                        {result.knowledgePoints.map((kp: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">{kp}</Badge>
                        ))}
                      </View>
                      {result.weaknessLevel && (
                        <View className="mt-2">
                          <Text className="block text-xs text-gray-500">
                            薄弱等级：
                            <Text className={`font-semibold ${result.weaknessLevel === 'severe' ? 'text-red-500' : result.weaknessLevel === 'moderate' ? 'text-amber-500' : 'text-green-500'}`}>
                              {result.weaknessLevel === 'severe' ? '重度' : result.weaknessLevel === 'moderate' ? '中度' : '轻度'}
                            </Text>
                          </Text>
                        </View>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  )
}