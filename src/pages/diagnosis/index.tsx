import { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TriangleAlert, ChartBar, Target, TrendingUp, BookOpen, CircleAlert } from 'lucide-react-taro'

const SUBJECTS = ['数学', '语文', '英语', '物理', '化学', '生物', '历史', '地理', '政治']

export default function Diagnosis() {
  const [studentName, setStudentName] = useState('')
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(false)
  const [diagnosis, setDiagnosis] = useState<any>(null)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    if (!studentName || !subject) {
      Taro.showToast({ title: '请填写学生姓名并选择科目', icon: 'none' })
      return
    }

    setLoading(true)
    setDiagnosis(null)
    setError('')

    try {
      const res = await Network.request({
        url: '/api/diagnosis/analyze',
        method: 'POST',
        data: { studentName, subject },
      })
      console.log('诊断结果:', res.data)

      if (res.data.data?.message) {
        setError(res.data.data.message)
      } else {
        setDiagnosis(res.data.data)
      }
    } catch (err) {
      console.error('诊断失败:', err)
      Taro.showToast({ title: '诊断失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const errorTypeColors: Record<string, string> = {
    '计算错误': 'bg-red-100 text-red-700',
    '概念错误': 'bg-purple-100 text-purple-700',
    '审题错误': 'bg-amber-100 text-amber-700',
    '思路错误': 'bg-blue-100 text-blue-700',
    '步骤错误': 'bg-orange-100 text-orange-700',
  }

  return (
    <ScrollView className="h-full bg-slate-50" scrollY>
      <View className="p-4 space-y-4">
        {/* 输入区 */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <View className="flex flex-row items-center gap-2">
              <ChartBar size={20} color="#2563eb" />
              <Text className="block text-base font-semibold text-gray-900">薄弱点诊断</Text>
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
            <Button disabled={loading} onClick={handleAnalyze}>
              <TrendingUp size={16} color="inherit" />
              <Text className="block text-sm">{loading ? '诊断分析中...' : '开始诊断'}</Text>
            </Button>
          </CardContent>
        </Card>

        {/* 加载态 */}
        {loading && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        )}

        {/* 提示信息 */}
        {error && !loading && (
          <Alert>
            <CircleAlert size={16} color="inherit" />
            <AlertDescription>
              <Text className="block text-sm">{error}</Text>
            </AlertDescription>
          </Alert>
        )}

        {/* 诊断结果 */}
        {diagnosis && !loading && (
          <View className="space-y-4">
            {/* 错误类型统计 */}
            {diagnosis.error_type_stats && Object.keys(diagnosis.error_type_stats).length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <View className="flex flex-row items-center gap-2 mb-3">
                    <TriangleAlert size={18} color="#f59e0b" />
                    <Text className="block text-base font-semibold text-gray-900">错误类型统计</Text>
                  </View>
                  <View className="space-y-2">
                    {Object.entries(diagnosis.error_type_stats).map(([type, count]: [string, any]) => {
                      const values = Object.values(diagnosis.error_type_stats) as number[]
                      const total = values.reduce((a: number, b: number) => a + b, 0)
                      const percent = total > 0 ? Math.round((count / total) * 100) : 0
                      return (
                        <View key={type} className="flex flex-row items-center gap-2">
                          <Badge variant="outline" className={errorTypeColors[type] || ''}>
                            <Text className="block text-xs">{type}</Text>
                          </Badge>
                          <View className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <View className="h-full bg-blue-500 rounded-full" style={{ width: `${percent}%` }} />
                          </View>
                          <Text className="block text-xs text-gray-500 w-8 text-right">{count}次</Text>
                        </View>
                      )
                    })}
                  </View>
                </CardContent>
              </Card>
            )}

            {/* Top3 薄弱知识点 */}
            {diagnosis.top_weaknesses && diagnosis.top_weaknesses.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <View className="flex flex-row items-center gap-2 mb-3">
                    <Target size={18} color="#2563eb" />
                    <Text className="block text-base font-semibold text-gray-900">
                      Top 3 知识短板
                    </Text>
                  </View>
                  <View className="space-y-3">
                    {diagnosis.top_weaknesses.map((w: any, idx: number) => (
                      <View key={idx} className="flex flex-row items-center gap-3 p-3 rounded-lg bg-slate-50">
                        <View className={`w-8 h-8 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-red-100' : idx === 1 ? 'bg-amber-100' : 'bg-blue-100'}`}>
                          <Text className={`block text-sm font-bold ${idx === 0 ? 'text-red-600' : idx === 1 ? 'text-amber-600' : 'text-blue-600'}`}>{idx + 1}</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="block text-sm font-medium text-gray-900">{w.name}</Text>
                          <View className="flex flex-row items-center gap-2 mt-1">
                            <Badge variant={w.level === 'severe' ? 'destructive' : w.level === 'moderate' ? 'secondary' : 'outline'}>
                              <Text className="block text-xs">
                                {w.level === 'severe' ? '重度' : w.level === 'moderate' ? '中度' : '轻度'}
                              </Text>
                            </Badge>
                            <Text className="block text-xs text-gray-500">出现 {w.count} 次</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </CardContent>
              </Card>
            )}

            {/* 综合诊断总结 */}
            {diagnosis.summary && (
              <Card>
                <CardContent className="p-4">
                  <View className="flex flex-row items-center gap-2 mb-2">
                    <BookOpen size={18} color="#2563eb" />
                    <Text className="block text-base font-semibold text-gray-900">综合诊断建议</Text>
                  </View>
                  <View className="bg-blue-50 rounded-lg p-4">
                    <Text className="block text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {diagnosis.summary}
                    </Text>
                  </View>
                </CardContent>
              </Card>
            )}

            {/* 提示用户生成训练 */}
            <Alert>
              <TriangleAlert size={16} color="inherit" />
              <AlertDescription>
                <Text className="block text-sm text-gray-700">
                  诊断完成！请切换到「专项训练」Tab 生成个性化训练题。
                </Text>
              </AlertDescription>
            </Alert>
          </View>
        )}
      </View>
    </ScrollView>
  )
}