import { useState, useRef } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Send, ImagePlus, BookOpen, CircleCheck, CircleX } from 'lucide-react-taro'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  imageUrl?: string
  grading?: any
  loading?: boolean
}

export default function Index() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: '你好！我是你的专属 **高中语文辅导老师** 📚\n\n你可以直接输入语文题目和你的答案，我来帮你批改分析；也可以上传题目图片，我来识别并批改。\n\n**试试说：**\n> "请帮我批改这道题：《登高》中"无边落木萧萧下"下一句是什么？我答的是"不尽长江滚滚东流"，对吗？"',
    },
  ])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingImage, setPendingImage] = useState<string | null>(null)
  const scrollRef = useRef<any>(null)

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo(0, 99999, { animated: true })
    }, 100)
  }

  const handleSend = async () => {
    const text = inputText.trim()
    const hasImage = !!pendingImage

    if (!text && !hasImage) return

    // 构建用户消息
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text || '（上传了一张图片，请解析）',
      imageUrl: pendingImage || undefined,
    }
    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setPendingImage(null)

    // 添加 loading 消息
    const loadingId = `loading-${Date.now()}`
    setMessages(prev => [...prev, { id: loadingId, role: 'ai', content: '', loading: true }])
    setLoading(true)
    scrollToBottom()

    try {
      // 构建历史消息（取最近6条）
      const history = messages
        .filter(m => m.id !== 'welcome' && !m.loading)
        .slice(-6)
        .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }))

      const res = await Network.request({
        url: '/api/error-questions/chat',
        method: 'POST',
        data: {
          message: userMsg.content,
          imageUrl: userMsg.imageUrl,
          history,
        },
      })
      console.log('对话回复:', res.data)
      const data = res.data.data

      // 更新 loading 消息为 AI 回复
      setMessages(prev =>
        prev.map(m =>
          m.id === loadingId
            ? { ...m, loading: false, content: data.reply, grading: data.grading }
            : m,
        ),
      )
    } catch (error) {
      console.error('对话失败:', error)
      setMessages(prev =>
        prev.map(m =>
          m.id === loadingId
            ? { ...m, loading: false, content: '抱歉，我暂时无法处理你的请求，请稍后再试。😅' }
            : m,
        ),
      )
    } finally {
      setLoading(false)
      scrollToBottom()
    }
  }

  const handlePickImage = async () => {
    try {
      // 先上传图片
      const chooseRes = await Taro.chooseImage({ count: 1, sizeType: ['compressed'] })
      const tempPath = chooseRes.tempFilePaths[0]

      Taro.showLoading({ title: '上传图片中...' })
      const uploadRes = await Network.uploadFile({
        url: '/api/upload/image',
        filePath: tempPath,
        name: 'file',
      })
      Taro.hideLoading()
      console.log('上传结果:', uploadRes.data)

      const { url } = JSON.parse(uploadRes.data as string).data
      setPendingImage(url)
      scrollToBottom()
    } catch (error) {
      console.error('上传图片失败:', error)
      Taro.hideLoading()
      Taro.showToast({ title: '图片上传失败', icon: 'none' })
    }
  }

  // 渲染消息气泡
  const renderMessage = (msg: Message) => {
    if (msg.loading) {
      return (
        <View className="flex flex-row items-start gap-2 mb-4">
          <View className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <BookOpen size={16} color="white" />
          </View>
          <Card className="flex-1">
            <CardContent className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        </View>
      )
    }

    if (msg.role === 'user') {
      return (
        <View className="flex flex-row items-start gap-2 mb-4 justify-end">
          <Card className="max-w-[85%] bg-blue-500">
            <CardContent className="p-3">
              {msg.imageUrl && (
                <Image
                  src={msg.imageUrl}
                  className="w-48 h-36 rounded-lg mb-2"
                  mode="aspectFit"
                />
              )}
              {msg.content && (
                <Text className="block text-sm text-white leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </Text>
              )}
            </CardContent>
          </Card>
          <View className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <Text className="block text-sm font-semibold text-gray-600">我</Text>
          </View>
        </View>
      )
    }

    // AI 消息
    return (
      <View className="flex flex-row items-start gap-2 mb-4">
        <View className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
          <BookOpen size={16} color="white" />
        </View>
        <View className="flex-1 max-w-[85%]">
          <Card>
            <CardContent className="p-3">
              <Text className="block text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </Text>

              {/* 如果有批改数据，显示结构化批改卡片 */}
              {msg.grading && (
                <View className="mt-3 space-y-2">
                  <Separator />
                  {/* 对错标记 */}
                  <View className="flex flex-row items-center gap-2 mt-2">
                    {msg.grading.isCorrect === 'correct' ? (
                      <>
                        <CircleCheck size={18} color="#22c55e" />
                        <Text className="block text-sm font-bold text-green-600">回答正确 ✓</Text>
                      </>
                    ) : (
                      <>
                        <CircleX size={18} color="#ef4444" />
                        <Text className="block text-sm font-bold text-red-500">回答错误 ✗</Text>
                      </>
                    )}
                    <Badge variant={msg.grading.isCorrect === 'correct' ? 'secondary' : 'destructive'}>
                      <Text className="block text-xs">
                        {msg.grading.isCorrect === 'correct' ? '正确' : '需订正'}
                      </Text>
                    </Badge>
                  </View>

                  {/* 答案 */}
                  {msg.grading.correctAnswer && (
                    <View className="bg-blue-50 rounded-lg p-2 mt-1">
                      <Text className="block text-xs font-semibold text-blue-700 mb-1">标准答案：</Text>
                      <Text className="block text-sm text-gray-800">{msg.grading.correctAnswer}</Text>
                    </View>
                  )}

                  {/* 错误分析 */}
                  {msg.grading.isCorrect === 'wrong' && msg.grading.errorType && (
                    <View className="bg-amber-50 rounded-lg p-2">
                      <Text className="block text-xs font-semibold text-amber-700 mb-1">
                        错误类型：
                        <Badge variant="destructive" className="ml-1">
                          <Text className="block text-xs">{msg.grading.errorType}</Text>
                        </Badge>
                      </Text>
                      {msg.grading.errorDetail && (
                        <Text className="block text-xs text-gray-600 mt-1">{msg.grading.errorDetail}</Text>
                      )}
                      <View className="bg-red-50 rounded-lg p-2 mt-1">
                        <Text className="block text-xs font-semibold text-red-700 mb-1">⚠️ 陷阱分析：</Text>
                        <Text className="block text-xs text-gray-600">{msg.grading.trapAnalysis}</Text>
                      </View>
                    </View>
                  )}

                  {/* 知识点标签 */}
                  {msg.grading.knowledgePoints && msg.grading.knowledgePoints.length > 0 && (
                    <View className="flex flex-row flex-wrap gap-1 mt-1">
                      {msg.grading.knowledgePoints.map((kp: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          <Text className="block text-xs">{kp}</Text>
                        </Badge>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </CardContent>
          </Card>
        </View>
      </View>
    )
  }

  return (
    <View className="h-full bg-slate-50 flex flex-col">
      {/* 头部 */}
      <View className="bg-white px-4 py-3 border-b border-gray-100" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <View className="flex flex-row items-center gap-2">
          <BookOpen size={20} color="#2563eb" />
          <Text className="block text-base font-semibold text-gray-900">高中语文 · 对话批改</Text>
        </View>
      </View>

      {/* 消息列表 */}
      <ScrollView
        ref={scrollRef}
        className="flex-1 px-4 pt-3"
        scrollY
        scrollWithAnimation
      >
        {messages.map(msg => (
          <View key={msg.id}>{renderMessage(msg)}</View>
        ))}
      </ScrollView>

      {/* 图片预览 */}
      {pendingImage && (
        <View className="px-4 py-2 bg-white border-t border-gray-100">
          <View className="relative inline-block">
            <Image src={pendingImage} className="w-16 h-16 rounded-lg" mode="aspectFill" />
            <View
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
              onClick={() => setPendingImage(null)}
            >
              <Text className="block text-xs text-white font-bold">×</Text>
            </View>
          </View>
        </View>
      )}

      {/* 输入区 */}
      <View className="bg-white border-t border-gray-100 px-3 py-2" style={{ position: 'relative' }}>
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: '8px' }}>
          <Button
            variant="ghost"
            className="w-10 h-10 p-0 flex-shrink-0"
            onClick={handlePickImage}
            disabled={loading}
          >
            <ImagePlus size={22} color="#6b7280" />
          </Button>
          <View className="flex-1 bg-gray-50 rounded-2xl px-4 py-2" style={{ borderWidth: 0 }}>
            <Input
              className="w-full text-sm bg-transparent"
              placeholder="输入语文题目和你的答案..."
              value={inputText}
              onInput={(e) => setInputText(e.detail.value)}
              confirmType="send"
              onConfirm={handleSend}
              disabled={loading}
            />
          </View>
          <Button
            className="w-10 h-10 p-0 flex-shrink-0 rounded-full"
            onClick={handleSend}
            disabled={loading || (!inputText.trim() && !pendingImage)}
          >
            <Send size={18} color="white" />
          </Button>
        </View>
      </View>
    </View>
  )
}