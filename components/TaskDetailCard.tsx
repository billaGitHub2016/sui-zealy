"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet } from 'lucide-react'
import { ConnectButton } from '@mysten/dapp-kit'
import { Separator } from "@/components/ui/separator"
import { Task } from "@/types/task"
import { SUI_MIST, STATUS_MAP, REWARD_METHODS } from '@/config/constants'

interface TaskDetailProps {
  taskName: string
  description: string
  images: string[]
}

export function TaskDetailCard({ task }: { task: Task }) {
  const [isWalletConnected, setIsWalletConnected] = useState(false)

  const handleConnectWallet = () => {
    // 这里应该是实际连接 SUI 钱包的逻辑
    // 现在我们只是模拟连接过程
    setIsWalletConnected(true)
  }

  const DetailItem = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex justify-between items-center py-2">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-semibold text-center">{task.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm text-gray-500">任务描述</h3>
          <p className="text-sm leading-relaxed">{task.desc}</p>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <DetailItem label="奖励方式" value={REWARD_METHODS[parseInt(task.reward_method)]} />
            <DetailItem label="任务状态" value={STATUS_MAP[parseInt(task.status)]} />
            <DetailItem label="奖池金额" value={task.pool / SUI_MIST + 'SUI'} />
            <DetailItem label="申请通过总数" value={task.claim_limit} />
            { task.reward_method === 1 && <DetailItem label="单个申请奖励金额" value={task.pool / SUI_MIST / task.claim_limit + 'SUI'} />}
          </div>
          <div className="space-y-2">
            <DetailItem label="创建时间" value={new Date(task.created_at).toLocaleDateString()} />
            <DetailItem label="任务开始日期" value={new Date(task.start_date).toLocaleDateString()} />
            <DetailItem label="任务结束日期" value={new Date(task.end_date).toLocaleDateString()} />
          </div>
        </div>
        {task.attachments.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm text-gray-500 mb-2">相关图片</h3>
              <div className="grid grid-cols-2 gap-4">
                {task.attachments.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={image}
                      alt={`Task image ${index + 1}`}
                      fill
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        {/* <Button
          className="w-full"
          onClick={handleConnectWallet}
          disabled={isWalletConnected}
        >
          <Wallet className="mr-2 h-4 w-4" />
          {isWalletConnected ? "钱包已连接" : "连接 SUI 钱包"}
        </Button> */}
        <ConnectButton className="bg-fuchsia-800"></ConnectButton>
      </CardFooter>
    </Card>
  )
}

