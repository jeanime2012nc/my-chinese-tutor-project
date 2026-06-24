import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Dumbbell, Lightbulb, Flame, RefreshCw } from 'lucide-react-taro'

interface TrainingQuestion {
  stem: string
  answer: string
  analysis: string
  trapWarning?: string
}

interface TrainingGroup {
  type: string
  difficulty: string
  questions: TrainingQuestion[]
}

interface TrainingResult {
  id: string
  training_data: TrainingGroup[]
  careful_training: { stem: string; answer: string; analysis: string; trapWarning: string }[]
  difficulty_distribution: Record<string, number>
  summary: string
  created_at?: string
}

export default function Training() {
  const [result, setResult] = useState<TrainingResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [initLoading, setInitLoading] = useState(true)

  // 页面加载时获取最新训练
  useEffect(() => {
    fetchLatest()
  }, [])

  const fetchLatest = async () => {
    setInitLoading(true)
    try {
      const res = await Network.request({
        url: '/api/training/latest',
        method: 'GET',
      })
      console.log('[训练] 最新记录:', res.data)
      if (res.data?.data) {
        setResult(res.data.data)
      }
    } catch (err) {
      console.error('[训练] 获取最新记录失败:', err)
    } finally {
      setInitLoading(false)
    }
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/training/generate',
        method: 'POST',
        data: {},
      })
      console.log('[训练] 生成结果:', res.data)
      if (res.data?.data) {
        setResult(res.data.data)
      } else {
        Taro.showToast({ title: '暂无错题记录，请先对话批改', icon: 'none' })
      }
    } catch (err: any) {
      console.error('[训练] 生成失败:', err)
      Taro.showToast({ title: '生成失败：' + (err.message || '请稍后重试'), icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const difficultyBadge = (d: string) => {
    if (d === 'basic')
      return <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200"><Text className="block text-xs">基础</Text></Badge>
    if (d === 'intermediate' || d === 'medium')
      return <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200"><Text className="block text-xs">中档</Text></Badge>
    return <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200"><Text className="block text-xs">较难</Text></Badge>
  }

  // 将所有分组的题目扁平化，方便渲染
  const flattenQuestions = () => {
    if (!result?.training_data) return []
    const items: Array<{ groupType: string; groupDifficulty: string; question: TrainingQuestion; index: number }> = []
    result.training_data.forEach((group) => {
      group.questions.forEach((q) => {
        items.push({ groupType: group.type, groupDifficulty: group.difficulty, question: q, index: items.length })
      })
    })
    return items
  }

  return (
    <View className="h-full bg-slate-50 flex flex-col">
      <View className="bg-white px-4 py-3 border-b border-gray-100" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <View className="flex flex-row items-center gap-2">
          <Dumbbell size={20} color="#2563eb" />
          <Text className="block text-base font-semibold text-gray-900">专项训练</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-3 pb-6">
        {/* 初始加载 */}
        {initLoading && (
          <View className="mt-4 space-y-3">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </View>
        )}

        {/* 空状态 */}
        {!initLoading && !result && (
          <View className="mt-16">
            <Card>
              <CardContent className="p-6">
                <View className="flex items-center justify-center mb-4">
                  <Dumbbell size={48} color="#93c5fd" />
                </View>
                <Text className="block text-center text-base font-semibold text-gray-800 mb-2">
                  暂无训练数据
                </Text>
                <Text className="block text-center text-sm text-gray-500 mb-6">
                  先去「智能辅导」页面提交错题，AI 会根据你的薄弱点生成专项训练
                </Text>
                <Button className="w-full" onClick={handleGenerate} disabled={loading}>
                  <Text className="block text-white font-medium">
                    {loading ? '生成中...' : '生成训练题'}
                  </Text>
                </Button>
              </CardContent>
            </Card>
          </View>
        )}

        {/* 训练结果 */}
        {result && (
          <View className="space-y-4">
            {/* 难度分布 */}
            <Card>
              <CardContent className="p-4">
                <Text className="block text-sm font-bold text-gray-900 mb-3">训练分布</Text>
                <View className="flex flex-row gap-3">
                  <View className="flex-1 bg-green-50 rounded-xl p-3 items-center">
                    <Text className="block text-lg font-bold text-green-600">{result.difficulty_distribution?.basic || 0}</Text>
                    <Text className="block text-xs text-green-700 mt-1">基础巩固</Text>
                  </View>
                  <View className="flex-1 bg-amber-50 rounded-xl p-3 items-center">
                    <Text className="block text-lg font-bold text-amber-600">{result.difficulty_distribution?.intermediate || 0}</Text>
                    <Text className="block text-xs text-amber-700 mt-1">中档变式</Text>
                  </View>
                  <View className="flex-1 bg-red-50 rounded-xl p-3 items-center">
                    <Text className="block text-lg font-bold text-red-600">{result.difficulty_distribution?.advanced || 0}</Text>
                    <Text className="block text-xs text-red-700 mt-1">拔高综合</Text>
                  </View>
                </View>
              </CardContent>
            </Card>

            {/* 训练题列表 */}
            {flattenQuestions().map((qItem) => (
              <Card key={qItem.index}>
                <CardContent className="p-4">
                  <View className="flex flex-row items-center flex-wrap gap-2 mb-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                      <Text className="block text-xs">第 {qItem.index + 1} 题</Text>
                    </Badge>
                    {difficultyBadge(qItem.groupDifficulty)}
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                      <Text className="block text-xs">{qItem.groupType}</Text>
                    </Badge>
                  </View>

                  <Text className="block text-sm font-semibold text-gray-800 mb-2 leading-relaxed">{qItem.question.stem}</Text>
                  <Separator className="my-2" />

                  <View className="bg-blue-50 rounded-lg p-2 mb-2">
                    <Text className="block text-xs font-semibold text-blue-700 mb-1">参考答案</Text>
                    <Text className="block text-sm text-gray-800">{qItem.question.answer}</Text>
                  </View>

                  <View className="bg-amber-50 rounded-lg p-2 mb-2">
                    <Text className="block text-xs font-semibold text-amber-700 mb-1">解析</Text>
                    <Text className="block text-sm text-gray-700 leading-relaxed">{qItem.question.analysis}</Text>
                  </View>

                  {qItem.question.trapWarning && (
                    <View className="bg-green-50 rounded-lg p-2">
                      <Text className="block text-xs font-semibold text-green-700 mb-1">避坑提醒</Text>
                      <Text className="block text-xs text-gray-600">{qItem.question.trapWarning}</Text>
                    </View>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* 细心专项训练 */}
            {result.careful_training && result.careful_training.length > 0 && (
              <Card className="border-red-200">
                <CardContent className="p-4">
                  <View className="flex flex-row items-center gap-2 mb-3">
                    <Flame size={18} color="#ef4444" />
                    <Text className="block text-base font-bold text-red-600">审题/细心专项</Text>
                  </View>
                  {result.careful_training.map((item, idx) => (
                    <View key={idx} className="bg-red-50 rounded-lg p-2 mb-2">
                      <Text className="block text-sm font-semibold text-gray-800 mb-1">第 {idx + 1} 题</Text>
                      <Text className="block text-sm text-gray-700 mb-1">{item.stem}</Text>
                      <Text className="block text-xs text-blue-700 mb-1">答案：{item.answer}</Text>
                      {item.analysis && <Text className="block text-xs text-gray-600 mb-1">解析：{item.analysis}</Text>}
                      {item.trapWarning && <Text className="block text-xs text-red-500">易错：{item.trapWarning}</Text>}
                    </View>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* 总结 */}
            {result.summary && (
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardContent className="p-4">
                  <View className="flex flex-row items-center gap-2 mb-2">
                    <Lightbulb size={18} color="#7c3aed" />
                    <Text className="block text-base font-bold text-gray-900">训练总结</Text>
                  </View>
                  <Text className="block text-sm text-gray-700 leading-relaxed">{result.summary}</Text>
                </CardContent>
              </Card>
            )}

            {/* 操作按钮 */}
            <View className="flex flex-row gap-3">
              <Button variant="secondary" onClick={handleGenerate} className="flex-1" disabled={loading}>
                <Text className="block text-sm">{loading ? '生成中...' : '重新生成一组训练'}</Text>
              </Button>
              <Button variant="outline" onClick={fetchLatest} className="flex-shrink-0">
                <RefreshCw size={16} color="#6b7280" />
              </Button>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}