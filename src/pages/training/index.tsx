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

// 示例数据：统编版必修下第八单元专项训练
const SAMPLE_TRAINING: any = {
  training_data: [
    {
      difficulty: 'easy',
      type: '基础巩固',
      question: '下列加点字注音全部正确的一项是（  ）\nA. 壅蔽（yōng） 黜恶（chù） 浚泉源（jùn）\nB. 塞源（sāi）  载舟（zǎi）  谬赏（miào）\nC. 殷忧（yīn）  董之以严刑（dǒng） 可畏惟人（wéi）\nD. 谗邪（chán）  虑壅蔽（yōng） 克终（kē）',
      answer: 'A（B. 载 zài；谬 miù；C. 殷 yīn正确，惟同"唯"读wéi；D. 克 kè）',
      analysis: 'A项全部正确。B项"载舟"之"载"读zài（装载），非zǎi；"谬赏"读miù。D项"克终"之"克"读kè（能够）。',
      tip: '⚠️ "载"字两读：zài（装载/承受，"载舟覆舟"）、zǎi（记载/年份）。"谬"只有一个读音miù。',
      knowledge_point: '字音辨析',
    },
    {
      difficulty: 'easy',
      type: '基础巩固',
      question: '下列句子中加点词的解释，不正确的一项是（  ）\nA. 臣闻求木之长者，必固其根本（稳固）\nB. 人君当神器之重，居域中之大（担当）\nC. 虽董之以严刑，振之以威怒（监督）\nD. 简能而任之，择善而从之（简略）',
      answer: 'D（简：选拔。整个句子意思是"选拔有才能的人任用他，选择好的意见听从它"。）',
      analysis: '"简"在文言文中常见义项：①选拔（"简能而任"）；②简单/简略（"简略"）；③怠慢（"自骄则简士"）。本句出自《谏太宗十思疏》，取"选拔"义。',
      tip: '⚠️ "简"和"能"都是文言高频词。"简"≠"简单"，这里是"选拔"。"能"指有才能的人。',
      knowledge_point: '文言实词理解',
    },
    {
      difficulty: 'medium',
      type: '中档变式',
      question: '翻译下列句子，注意标出重点采分点：\n（1）斯亦伐根以求木茂，塞源而欲流长也。\n（2）虽董之以严刑，振之以威怒，终苟免而不怀仁。',
      answer: '（1）这也（如同）砍断树根却要求树木茂盛，堵住源头却想要水流长远啊。\n【采分点：斯（这）、伐（砍断）、塞（堵住）、判断句式"……也"】\n（2）即使用严酷的刑罚来监督他们，用威严的怒气来震慑他们，最终（人们）只求苟且免于刑罚而并不怀念（君王的）仁德。\n【采分点：董（监督）、以（用）、振（通"震"震慑）、苟免（苟且免罪）、怀仁（怀念仁德）】',
      analysis: '翻译六字诀：留（保留专名）、删（删除无义词）、补（补足省略）、换（古词换今词）、调（调整语序）、贯（贯通文意）。（1）注意"斯""亦"的判断语气，"……也"是判断句标志。（2）"董之以严刑"是状语后置句（以严刑董之），"振"通"震"。',
      tip: '⚠️ 文言翻译先圈画关键词（通假字、词类活用、古今异义、特殊句式），逐词翻译后再调整语序。',
      knowledge_point: '文言文翻译',
    },
    {
      difficulty: 'medium',
      type: '中档变式',
      question: '阅读以下文段，回答问题：\n\n"臣闻求木之长者，必固其根本；欲流之远者，必浚其泉源；思国之安者，必积其德义。源不深而望流之远，根不固而求木之长，德不厚而思国之理，臣虽下愚，知其不可，而况于明哲乎！"\n\n（1）请概括本段的核心观点。\n（2）文中用了什么论证方法？请简要分析。',
      answer: '（1）核心观点：国君要使国家安定，必须积累德义（居安思危，厚积德义）。\n（2）比喻论证。以"求木之长者必固根本""欲流之远者必浚泉源"两个日常生活事例，比喻"思国之安者必积其德义"的政治主张，将抽象道理形象化，使论证更具说服力。同时运用正反对比（"固根本"与"根不固"、"浚泉源"与"源不深"），突出积德义的重要性。',
      analysis: '魏征开篇不直接说理，而是从"木""流"两个生活常识入手建立类比关系，层层递进引出治国之道。这种"由浅入深、取喻明理"的论证方式是古代论说文的典范。',
      tip: '⚠️ 论证方法分析三步：判断方法 + 引用文句 + 分析效果。比喻论证的作用是"化抽象为具体"，对比论证的作用是"突出观点、增强说服力"。',
      knowledge_point: '文言文阅读理解',
    },
    {
      difficulty: 'advanced',
      type: '拔高综合',
      question: '比较阅读《谏太宗十思疏》与《答司马谏议书》，回答以下问题：\n\n（1）两篇文章的写作背景和目的有何不同？\n（2）魏征"十思"与王安石"名实之辩"在论证思路上有何共同特点？\n（3）你认为两篇文章在论证风格上有怎样的差异？请简要分析。',
      answer: '（1）**背景与目的不同**：\n- 《谏太宗十思疏》：唐太宗居安忘危，骄奢渐起，魏征上书劝谏君主保持清醒、守住基业。\n- 《答司马谏议书》：王安石推行变法遭司马光（司马谏议）反对，王安石写信回应，坚守变法立场。\n\n（2）**共性**：都采用"破立结合"的论证方式。魏征先破"根不固/源不深"之弊，再立"积德义"之策；王安石先驳司马光"侵官/生事/征利/拒谏"四责，再立"受命于人主，议法度而修之于朝廷"之名实。\n\n（3）**风格差异**：\n- 魏征：婉曲恳切，多用比喻排比，语言典雅庄重，以情动人。\n- 王安石：逻辑严密，直言不讳，语言犀利峻切，以理服人。',
      analysis: '两文代表中国古代论说文的两种风格：魏征的"臣子劝谏型"——委婉含蓄、以喻说理；王安石的"政敌论辩型"——理直气壮、直陈立场。高考常考比较阅读，注意从"背景-目的-思路-手法-语言"五个维度对比。',
      tip: '⚠️ 比较阅读答题框架：①分点说明差异 ②引用原文支撑 ③总结特点。先答不同点，再找共性，最后升华主题。',
      knowledge_point: '文言文比较阅读',
    },
  ],
  careful_training: [
    '⚠️ 字音题注意多音字和形近字区别："载"(zài/zǎi)、"塞"(sè/sāi)、"谬"(miù,勿写"缪")、"浚"(jùn,勿写"峻/骏")。',
    '⚠️ 翻译题先标采分点（通假字/古今异义/词类活用/特殊句式），逐词对应，不漏译不增译。',
    '⚠️ 主观题答题先总后分，分条陈述。如"论证方法"先判断再分析，引用原文关键词。',
  ],
  difficulty_distribution: { basic: 2, medium: 2, advanced: 1 },
  summary: '本次训练围绕**统编版必修下第八单元**《谏太宗十思疏》《答司马谏议书》展开。基础巩固重点在字音和实词，中档变式训练翻译与阅读理解，拔高综合侧重两文对比分析。建议按"基础→中档→拔高"顺序完成，审题时注意圈画题干中的"不正确""赏析""比较"等关键指令词。',
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