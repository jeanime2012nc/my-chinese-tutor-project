import { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Dumbbell, Lightbulb, Flame } from 'lucide-react-taro'

// 示例数据：高中语文专项训练
const SAMPLE_TRAINING: any = {
  training_data: [
    {
      difficulty: 'easy',
      type: '基础巩固',
      question: '补写出下列名篇名句中的空缺部分：\n（1）《登高》中"无边落木萧萧下，______"。\n（2）《赤壁赋》中"寄蜉蝣于天地，______"。',
      answer: '（1）不尽长江滚滚来\n（2）渺沧海之一粟',
      analysis: '（1）杜甫《登高》颈联，注意"滚滚"一词。（2）苏轼《赤壁赋》，"沧"易误写为"苍"，"粟"易误写为"栗"。',
      tip: '⚠️ 常考易错字："萧萧"非"潇潇"；"沧"非"苍"；"粟"非"栗"。建议用"三遍法"记忆。',
      knowledge_point: '古诗词默写',
    },
    {
      difficulty: 'easy',
      type: '基础巩固',
      question: '下列加点词的释义，不正确的一项是（  ）\nA. 使人遗赵王书（送给）\nB. 不如因而厚遇之（招待、款待）\nC. 且以一璧之故逆强秦之欢（违背）\nD. 臣诚恐见欺于王而负赵（承担）',
      answer: 'D（负：辜负。"负赵"意为辜负了赵王。）',
      analysis: '"负"多义辨析：①凭借（"负其强"）②辜负（"负赵"）③背弃（"负约"）。结合语境判断。',
      tip: '⚠️ 文言实词要结合语境。"负"有"背着""辜负""凭借""背弃"等义项，是高考高频词。',
      knowledge_point: '文言文实词理解',
    },
    {
      difficulty: 'medium',
      type: '中档变式',
      question: '杜牧《山行》"远上寒山石径斜，白云生处有人家"，请赏析"生"字的妙处。',
      answer: '"生"字写出白云升腾缭绕的动态美，赋予静态画面以生命力，营造缥缈悠远的意境，体现诗人对自然山水的热爱。',
      analysis: '炼字题思路：①解释字义 ②描绘画面 ③分析效果 ④点明情感。注意"生"与"深"的区别。',
      tip: '⚠️ 炼字题答题结构：字义 + 画面 + 效果 + 情感。不要只答"生动形象"，要具体分析。',
      knowledge_point: '诗歌鉴赏炼字',
    },
    {
      difficulty: 'medium',
      type: '中档变式',
      question: '韩愈《师说》中"古之圣人，其出人也远矣，犹且从师而问焉；今之众人，其下圣人也亦远矣，而耻学于师"，运用了什么论证方法？',
      answer: '对比论证。将古之圣人"从师而问"与今之众人"耻学于师"对比，突出从师的重要性，增强说服力。',
      analysis: '对比论证分析三要素：①对比对象（圣人与众人）②对比内容（行为差异）③对比目的（突出观点）。',
      tip: '⚠️ 论证方法题：判断方法 + 具体分析 + 表达效果，三步缺一不可。',
      knowledge_point: '文言文论证方法',
    },
    {
      difficulty: 'advanced',
      type: '拔高综合',
      question: '李清照《鹧鸪天·桂花》"何须浅碧深红色，自是花中第一流"表达了怎样的审美观？末句"骚人可煞无情思，何事当年不见收"用了什么手法？',
      answer: '（1）重内在品格、轻外在艳丽的审美观。（2）用典（屈原未收桂花）与拟人，借古讽今，表达不被人理解的孤傲与自信。',
      analysis: '咏物诗三步：从"物"到"人"再到"情"。桂花自喻，表达超越世俗的审美追求。',
      tip: '⚠️ 咏物诗注意"物→人→情"分析路径。"何须""自是"等虚词体现自信语气，是答题关键。',
      knowledge_point: '诗歌鉴赏综合',
    },
  ],
  careful_training: [
    '⚠️ 古诗词默写注意字形细节。"长" vs "常"、"萧" vs "潇"、"栗" vs "粟"等易混淆，写完后逐字检查。',
    '⚠️ 诗歌鉴赏先点明手法/字义，再分析画面和效果，最后落到情感，不可跳过画面描述。',
    '⚠️ 文言文翻译注意古今异义和词类活用，不要望文生义。',
  ],
  difficulty_distribution: { basic: 2, medium: 2, advanced: 1 },
  summary: '本次训练覆盖古诗词默写、文言文实词、诗歌鉴赏三大板块。建议先基础巩固，再中档变式，最后挑战拔高题。审题时圈画关键词，答题时结构化表达。',
}

export default function Training() {
  const [result, setResult] = useState<any>(SAMPLE_TRAINING)
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
                        <Flame size={14} color="#ef4444" className="mt-1 flex-shrink-0" />
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