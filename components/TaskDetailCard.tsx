"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet } from 'lucide-react'
import { ConnectButton } from '@mysten/dapp-kit'
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Task } from "@/types/task"
import { SUI_MIST, STATUS_MAP, REWARD_METHODS } from '@/config/constants'
// import { Transaction } from "@mysten/sui/dist/cjs/transactions"

interface TaskDetailProps {
  taskName: string
  description: string
  images: string[]
}

export default function TaskDetailCard({ task, isLoading = false }: { task: Task | null, isLoading?: boolean }) {
  const [isWalletConnected, setIsWalletConnected] = useState(false)

  const handleConnectWallet = () => {
    // 这里应该是实际连接 SUI 钱包的逻辑
    // 现在我们只是模拟连接过程
    setIsWalletConnected(true)
  }

  const DetailItem = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex items-center">
      <span className="text-sm text-gray-500">{label}:</span>&nbsp;
      <span className="text-sm font-medium">{value}</span>
    </div>
  )

  const handlePublish = () => {
    // 这里应该是实际发布任务的逻辑
    // const txb = new Transaction();
    // const [counterNft] = txb.moveCall({
    //   target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::counter_nft::mint`,
    //   arguments: [],
    // });
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader className="pb-4">
          <Skeleton className="h-8 w-3/4 mx-auto" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return task && (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-semibold text-center">{task.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm text-gray-500">任务描述:</h3>
          <p className="text-sm leading-relaxed">{task.desc}</p>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <DetailItem label="奖励方式" value={(REWARD_METHODS[(task.reward_method as number)] as string)} />
            <DetailItem label="任务状态" value={STATUS_MAP[parseInt(task.status)]} />
            <DetailItem label="奖池金额" value={(task.pool as number) / SUI_MIST + 'SUI'} />
            <DetailItem label="申请通过总数" value={(task.claim_limit as number)} />
            { task.reward_method === 1 && <DetailItem label="单个申请奖励金额" value={(task.pool as number) / SUI_MIST / (task.claim_limit as number) + 'SUI'} />}
          </div>
          <div className="space-y-2">
            <DetailItem label="创建时间" value={new Date(task.created_at).toLocaleString()} />
            <DetailItem label="任务开始日期" value={new Date((task.start_date) as string).toLocaleString()} />
            <DetailItem label="任务结束日期" value={new Date((task.end_date) as string).toLocaleString()} />
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
        <span className="text-sm text-gray-500">钱包地址: <ConnectButton className="bg-fuchsia-800"></ConnectButton></span>
        </div>

        {task.attachments && task.attachments.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm text-gray-500 mb-2">附件图片</h3>
              <div className="grid grid-cols-4 gap-2">
                {task.attachments.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                    <a href={image} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10">
                      <Image
                        src={image}
                        alt={`Task image ${index + 1}`}
                        width={120}
                        height={120}
                      />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        {/* <ConnectButton className="bg-fuchsia-800"></ConnectButton> */}
      </CardFooter>
    </Card>
  )
}

