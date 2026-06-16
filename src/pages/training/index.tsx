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
import { Dumbbell, Lightbulb, CircleAlert, Target, BookOpen } from 'lucide-react-taro'

const SUBJECTS = ['数学', '语文', '英语', '物理', '化学', '生物', '历史', '地理', '政治']

export default function Training() {
  const [studentName, setStudentName] = useState('')
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(false)
  const [training, setTraining] = useState<any>(null)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [expandedCareful, setExpandedCareful] = useState<number | null>(null)

  const handleGenerate = async () => {
    if (!studentName || !subject) {
      Taro.showToast({ title: '请填写学生姓名并选择科目', icon: 'none' })
      return
    }

    setLoading(true)
    setTraining(null)
    setExpandedIndex(null)
    setExpandedCareful(null)

    try {
      // 先获取诊断结果，取最新一条
      const diagRes = await Network.request({
        url: `/api/diagnosis/list/${studentName}`,
        method: 'GET',
      })
      console.log('诊断列表:', diagRes.data)

      const diagnoses = diagRes.data.data || []
      const latestDiagnosis = diagnoses.length > 0 ? diagnoses[0] : null
      const diagnosisId = latestDiagnosis?.id || 0

      const res = await Network.request({
        url: '/api/training/generate',
        method: 'POST',
        data: { studentName, subject, diagnosisId },
      })
      console.log('训练结果:', res.data)
      setTraining(res.data.data)
    } catch (error) {
      console.error('生成训练失败:', error)
      Taro.showToast({ title: '生成训练失败，请先完成诊断', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const getTypeLabel = (type: string) => {
    const map: Record<string, { label: string; color: string }> = {
      basic: { label: '基础巩固', color: 'bg-green-100 text-green-700 border-green-200' },
      medium: { label: '中档变式', color: 'bg-amber-100 text-amber-700 border-amber-200' },
      advanced: { label: '拔高综合', color: 'bg-red-100 text-red-700 border-red-200' },
    }
    return map[type] || { label: type, color: '' }
  }

  return (
    <ScrollView className="h-full bg-slate-50" scrollY>
      <View className="p-4 space-y-4">
        {/* 输入区 */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <View className="flex flex-row items-center gap-2">
              <Dumbbell size={20} color="#2563eb" />
              <Text className="block text-base font-semibold text-gray-900">个性化分层训练</Text>
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
            <Button disabled={loading} onClick={handleGenerate}>
              <Target size={16} color="inherit" />
              <Text className="block text-sm">{loading ? '生成训练中...' : '生成训练题'}</Text>
            </Button>
          </CardContent>
        </Card>

        {/* 加载态 */}
        {loading && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        )}

        {/* 训练结果 */}
        {training && !loading && (
          <View className="space-y-4">
            {/* 难度分布 */}
            {training.difficulty_distribution && (
              <Card>
                <CardContent className="p-4">
                  <View className="flex flex-row items-center gap-2 mb-3">
                    <Target size={18} color="#2563eb" />
                    <Text className="block text-base font-semibold text-gray-900">训练题分布</Text>
                  </View>
                  <View className="flex flex-row gap-3">
                    {[
                      { key: 'basic', label: '基础巩固', color: 'bg-green-500' },
                      { key: 'medium', label: '中档变式', color: 'bg-amber-500' },
                      { key: 'advanced', label: '拔高综合', color: 'bg-red-500' },
                    ].map((item) => (
                      <View key={item.key} className="flex-1 items-center">
                        <View className={`w-full h-2 rounded-full ${item.color} opacity-80 mb-1`} />
                        <Text className="block text-xs text-gray-500 text-center">
                          {item.label}: {training.difficulty_distribution[item.key] || 0}题
                        </Text>
                      </View>
                    ))}
                  </View>
                </CardContent>
              </Card>
            )}

            {/* 训练题列表 */}
            {training.training_data && training.training_data.length > 0 && (
              <View className="space-y-3">
                <View className="flex flex-row items-center gap-2 px-1">
                  <BookOpen size={18} color="#2563eb" />
                  <Text className="block text-base font-semibold text-gray-900">专项练习题</Text>
                </View>
                {training.training_data.map((item: any, idx: number) => {
                  const typeInfo = getTypeLabel(item.type)
                  return (
                    <Card key={idx}>
                      <CardContent className="p-4">
                        <View className="flex flex-row items-center gap-2 mb-2">
                          <Badge variant="outline" className={typeInfo.color}>
                            <Text className="block text-xs">{typeInfo.label}</Text>
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            <Text className="block text-xs">第 {idx + 1} 题</Text>
                          </Badge>
                        </View>
                        <Text className="block text-sm text-gray-900 font-medium mb-2 leading-relaxed">
                          {item.question}
                        </Text>
                        <Button
                          variant="ghost"
                          className="w-full"
                          onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                        >
                          <Lightbulb size={14} color="inherit" />
                          <Text className="block text-xs">
                            {expandedIndex === idx ? '收起解析' : '查看解析与答案'}
                          </Text>
                        </Button>
                        {expandedIndex === idx && (
                          <View className="mt-3 p-3 bg-blue-50 rounded-lg space-y-2">
                            <Text className="block text-sm font-semibold text-gray-900">答案：</Text>
                            <Text className="block text-sm text-gray-700 mb-2">{item.answer}</Text>
                            <Separator />
                            <Text className="block text-sm font-semibold text-gray-900">解析：</Text>
                            <Text className="block text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                              {item.analysis}
                            </Text>
                            {item.tip && (
                              <>
                                <Separator />
                                <View className="flex flex-row items-start gap-1">
                                  <CircleAlert size={14} color="#f59e0b" className="mt-1" />
                                  <Text className="block text-xs text-amber-600 flex-1">
                                    💡 避坑提醒：{item.tip}
                                  </Text>
                                </View>
                              </>
                            )}
                          </View>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </View>
            )}

            {/* 细心专项训练 */}
            {training.careful_training && training.careful_training.length > 0 && (
              <View className="space-y-3">
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="p-4">
                    <View className="flex flex-row items-center gap-2 mb-1">
                      <CircleAlert size={18} color="#f59e0b" />
                      <Text className="block text-base font-semibold text-amber-700">细心专项训练</Text>
                    </View>
                    <Text className="block text-xs text-amber-600 mb-3">
                      检测到审题/计算失误较多，额外增加以下训练题
                    </Text>
                    <Separator className="mb-3" />
                    <View className="space-y-3">
                      {training.careful_training.map((item: any, idx: number) => (
                        <View key={idx} className="p-3 bg-white rounded-lg border border-amber-100">
                          <Text className="block text-sm font-medium text-gray-900 mb-2 leading-relaxed">
                            {item.question}
                          </Text>
                          <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => setExpandedCareful(expandedCareful === idx ? null : idx)}
                          >
                            <Lightbulb size={14} color="inherit" />
                            <Text className="block text-xs">
                              {expandedCareful === idx ? '收起解析' : '查看解析'}
                            </Text>
                          </Button>
                          {expandedCareful === idx && (
                            <View className="mt-2 p-3 bg-blue-50 rounded-lg space-y-1">
                              <Text className="block text-sm font-semibold text-gray-900">答案：</Text>
                              <Text className="block text-sm text-gray-700 mb-1">{item.answer}</Text>
                              <Separator />
                              <Text className="block text-sm font-semibold text-gray-900">解析：</Text>
                              <Text className="block text-sm text-gray-700 whitespace-pre-wrap">{item.analysis}</Text>
                              {item.tip && (
                                <Text className="block text-xs text-amber-600 mt-1">
                                  💡 {item.tip}
                                </Text>
                              )}
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  </CardContent>
                </Card>
              </View>
            )}

            {/* 提示 */}
            {(!training.training_data || training.training_data.length === 0) && (
              <Alert>
                <CircleAlert size={16} color="inherit" />
                <AlertDescription>
                  <Text className="block text-sm text-gray-700">
                    暂无训练题目，请先完成错题录入与薄弱诊断。
                  </Text>
                </AlertDescription>
              </Alert>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  )
}