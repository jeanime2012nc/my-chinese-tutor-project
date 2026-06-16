import { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Dumbbell, Lightbulb, CircleAlert, Flame } from 'lucide-react-taro'

export default function Training() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/training/generate',
        method: 'POST',
        data: {},
      })
      console.log('训练结果:', res.data)
      setResult(res.data.data)
    } catch (err) {
      console.error('生成失败:', err)
      Taro.showToast({ title: '生成失败，请先提交错题', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const difficultyBadge = (d: string) => {
    if (d === 'easy') return <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200"><Text className="block text-xs">基础</Text></Badge>
    if (d === 'medium') return <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200"><Text className="block text-xs">中档</Text></Badge>
    return <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200"><Text className="block text-xs">较难</Text></Badge>
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
        {!result && !loading && (
          <View className="mt-8">
            <Card>
              <CardContent className="p-6">
                <View className="flex items-center justify-center mb-4">
                  <Dumbbell size={48} color="#93c5fd" />
                </View>
                <Text className="block text-center text-base font-semibold text-gray-800 mb-2">
                  针对性薄弱训练
                </Text>
                <Text className="block text-center text-sm text-gray-500 mb-6">
                  根据你的错题分析，AI 自动生成分层训练题，帮你巩固薄弱知识点
                </Text>
                <Button className="w-full" onClick={handleGenerate}>
                  <Text className="block text-white font-medium">生成训练题</Text>
                </Button>
              </CardContent>
            </Card>
          </View>
        )}

        {loading && (
          <View className="mt-4 space-y-3">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </View>
        )}

        {result && (
          <View className="space-y-4">
            {/* 难度分布 */}
            <Card>
              <CardContent className="p-4">
                <Text className="block text-sm font-bold text-gray-900 mb-3">📈 训练分布</Text>
                <View className="flex flex-row gap-3">
                  <View className="flex-1 bg-green-50 rounded-xl p-3 items-center">
                    <Text className="block text-lg font-bold text-green-600">{result.difficulty_distribution?.basic || 0}</Text>
                    <Text className="block text-xs text-green-700 mt-1">基础巩固</Text>
                  </View>
                  <View className="flex-1 bg-amber-50 rounded-xl p-3 items-center">
                    <Text className="block text-lg font-bold text-amber-600">{result.difficulty_distribution?.medium || 0}</Text>
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
            {result.training_data?.map((item: any, idx: number) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <View className="flex flex-row items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                      <Text className="block text-xs">第 {idx + 1} 题</Text>
                    </Badge>
                    {difficultyBadge(item.difficulty)}
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                      <Text className="block text-xs">{item.type}</Text>
                    </Badge>
                  </View>

                  <Text className="block text-sm font-semibold text-gray-800 mb-2 leading-relaxed">{item.question}</Text>
                  <Separator className="my-2" />

                  <View className="bg-blue-50 rounded-lg p-2 mb-2">
                    <Text className="block text-xs font-semibold text-blue-700 mb-1">💡 参考答案</Text>
                    <Text className="block text-sm text-gray-800">{item.answer}</Text>
                  </View>

                  <View className="bg-amber-50 rounded-lg p-2 mb-2">
                    <Text className="block text-xs font-semibold text-amber-700 mb-1">📖 解析</Text>
                    <Text className="block text-sm text-gray-700 leading-relaxed">{item.analysis}</Text>
                  </View>

                  <View className="bg-green-50 rounded-lg p-2">
                    <Text className="block text-xs font-semibold text-green-700 mb-1">⚠️ 避坑提醒</Text>
                    <Text className="block text-xs text-gray-600">{item.tip}</Text>
                  </View>
                </CardContent>
              </Card>
            ))}

            {/* 细心专项训练 */}
            {result.careful_training && result.careful_training.length > 0 && (
              <Card className="border-red-200">
                <CardContent className="p-4">
                  <View className="flex flex-row items-center gap-2 mb-3">
                    <Flame size={18} color="#ef4444" />
                    <Text className="block text-base font-bold text-red-600">审题/计算细心专项</Text>
                  </View>
                  {result.careful_training.map((tip: string, idx: number) => (
                    <View key={idx} className="bg-red-50 rounded-lg p-2 mb-2">
                      <View className="flex flex-row items-start gap-2">
                        <CircleAlert size={14} color="#ef4444" className="mt-1 flex-shrink-0" />
                        <Text className="block text-sm text-gray-700 leading-relaxed">{tip}</Text>
                      </View>
                    </View>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* 总结 */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardContent className="p-4">
                <View className="flex flex-row items-center gap-2 mb-2">
                  <Lightbulb size={18} color="#7c3aed" />
                  <Text className="block text-base font-bold text-gray-900">训练总结</Text>
                </View>
                <Text className="block text-sm text-gray-700 leading-relaxed">{result.summary}</Text>
              </CardContent>
            </Card>

            <Button variant="secondary" onClick={handleGenerate} className="w-full">
              <Text className="block text-sm">重新生成一组训练</Text>
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  )
}