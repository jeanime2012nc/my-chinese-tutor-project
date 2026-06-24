import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Target, TriangleAlert, RefreshCw } from 'lucide-react-taro'

interface DiagnosisResult {
  id: string
  question_ids: string[]
  error_type_stats: Record<string, number>
  top_weaknesses: { name: string; count: number; level: string }[]
  summary: string
  student_name?: string
  subject?: string
  created_at?: string
}

export default function Diagnosis() {
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [initLoading, setInitLoading] = useState(true)

  // 页面加载时获取最新诊断
  useEffect(() => {
    fetchLatest()
  }, [])

  const fetchLatest = async () => {
    setInitLoading(true)
    try {
      const res = await Network.request({
        url: '/api/diagnosis/latest',
        method: 'GET',
      })
      console.log('[诊断] 最新记录:', res.data)
      if (res.data?.data) {
        setResult(res.data.data)
      }
    } catch (err) {
      console.error('[诊断] 获取最新记录失败:', err)
    } finally {
      setInitLoading(false)
    }
  }

  const handleDiagnose = async () => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/diagnosis/analyze',
        method: 'POST',
        data: {},
      })
      console.log('[诊断] 生成结果:', res.data)
      if (res.data?.data) {
        setResult(res.data.data)
      } else {
        Taro.showToast({ title: '暂无错题记录，请先对话批改', icon: 'none' })
      }
    } catch (err: any) {
      console.error('[诊断] 失败:', err)
      Taro.showToast({ title: '诊断失败：' + (err.message || '请稍后重试'), icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const severityColor = (s: string) => {
    if (s === 'severe' || s === '重度') return 'bg-red-100 text-red-700 border-red-200'
    if (s === 'moderate' || s === '中度') return 'bg-amber-100 text-amber-700 border-amber-200'
    return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  }

  const severityLabel = (s: string) => {
    if (s === 'severe') return '重度'
    if (s === 'moderate') return '中度'
    return '轻度'
  }

  return (
    <View className="h-full bg-slate-50 flex flex-col">
      <View className="bg-white px-4 py-3 border-b border-gray-100" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <View className="flex flex-row items-center gap-2">
          <Target size={20} color="#2563eb" />
          <Text className="block text-base font-semibold text-gray-900">薄弱点诊断</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-3 pb-6">
        {/* 初始加载骨架屏 */}
        {initLoading && (
          <View className="mt-4 space-y-3">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </View>
        )}

        {/* 空状态 */}
        {!initLoading && !result && (
          <View className="mt-16">
            <Card>
              <CardContent className="p-6">
                <View className="flex items-center justify-center mb-4">
                  <Target size={48} color="#93c5fd" />
                </View>
                <Text className="block text-center text-base font-semibold text-gray-800 mb-2">
                  暂无诊断数据
                </Text>
                <Text className="block text-center text-sm text-gray-500 mb-6">
                  先去「智能辅导」页面提交几道题目，AI 批改后会自动生成薄弱点诊断
                </Text>
                <Button className="w-full" onClick={handleDiagnose} disabled={loading}>
                  <Text className="block text-white font-medium">
                    {loading ? '诊断中...' : '开始诊断分析'}
                  </Text>
                </Button>
              </CardContent>
            </Card>
          </View>
        )}

        {/* 诊断结果 */}
        {result && (
          <View className="space-y-4">
            {(() => {
              const totalCount = result.question_ids?.length || 0
              const stats = result.error_type_stats || {}
              const entries = Object.entries(stats)
              const categories = entries.map(([name, count]) => ({
                name,
                count,
                percentage: totalCount > 0 ? Math.round((count as number) / totalCount * 100) : 0,
              }))

              return (
                <>
                  {/* 总体统计 */}
                  <Card>
                    <CardContent className="p-4">
                      <Text className="block text-base font-bold text-gray-900 mb-3">错题统计</Text>
                      <Text className="block text-3xl font-bold text-blue-600 mb-3">{totalCount}</Text>
                      <Text className="block text-sm text-gray-500 mb-3">道错题 / 知识点薄弱点</Text>
                      <View className="space-y-2">
                        {categories.map((cat, idx) => (
                          <View key={idx}>
                            <View className="flex flex-row items-center justify-between mb-1">
                              <Text className="block text-sm text-gray-700">{cat.name}</Text>
                              <Text className="block text-sm text-gray-500">{cat.count} 题 ({cat.percentage}%)</Text>
                            </View>
                            <View className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <View
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${cat.percentage}%` }}
                              />
                            </View>
                          </View>
                        ))}
                      </View>
                    </CardContent>
                  </Card>

                  {/* Top 薄弱点 */}
                  <Card>
                    <CardContent className="p-4">
                      <Text className="block text-base font-bold text-gray-900 mb-3">Top 3 优先巩固</Text>
                      <View className="space-y-3">
                        {(result.top_weaknesses || []).slice(0, 3).map((w, idx) => (
                          <View key={idx} className="border border-gray-100 rounded-xl p-3">
                            <View className="flex flex-row items-center justify-between mb-2">
                              <Text className="block text-sm font-semibold text-gray-800">
                                #{idx + 1} {w.name}
                              </Text>
                              <Badge className={severityColor(w.level)} variant="default">
                                <Text className="block text-xs">{severityLabel(w.level)}</Text>
                              </Badge>
                            </View>
                            <View className="flex flex-row items-center gap-1">
                              <TriangleAlert size={12} color="#ef4444" />
                              <Text className="block text-xs text-red-500">错误 {w.count} 次</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </CardContent>
                  </Card>

                  {/* 总结建议 */}
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardContent className="p-4">
                      <Text className="block text-base font-bold text-gray-900 mb-2">学习建议</Text>
                      <Text className="block text-sm text-gray-700 leading-relaxed">{result.summary}</Text>
                    </CardContent>
                  </Card>

                  {/* 操作按钮 */}
                  <View className="flex flex-row gap-3">
                    <Button variant="secondary" onClick={handleDiagnose} className="flex-1" disabled={loading}>
                      <RefreshCw size={16} color="#6b7280" />
                      <Text className="block text-sm ml-1">{loading ? '诊断中...' : '重新诊断'}</Text>
                    </Button>
                    <Button variant="outline" onClick={fetchLatest} className="flex-shrink-0">
                      <RefreshCw size={16} color="#6b7280" />
                    </Button>
                  </View>
                </>
              )
            })()}
          </View>
        )}
      </ScrollView>
    </View>
  )
}