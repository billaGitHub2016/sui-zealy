"use client"

import { ChevronUp } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

interface Task {
  id: number
  title: string
  description: string
  tags: string[]
  upvotes: number
  author: string
  date: string
  bulletPoints?: string[]
}

const tasks: Task[] = [
  {
    id: 1,
    title: "web3 兼职平台",
    description: "建立一个支持加密货币支付的兼职发布平台",
    tags: ["Team Wanted", "All", "SocialFi"],
    upvotes: 9,
    author: "MW",
    date: "2024-01-11",
    bulletPoints: [
      "建一个支持加密货币支付的兼职发布平台",
      "通过智能合约，用工方可以明确交付工作"
    ]
  },
  {
    id: 2,
    title: "DevRel DAO",
    description: "DevRel DAO can solve problems like isolation in the field by providing a supportive community",
    tags: ["Team Wanted", "Arbitrum", "DAO"],
    upvotes: 4,
    author: "Nitik Gupta",
    date: "2024-02-08"
  },
  {
    id: 3,
    title: "NexDAO",
    description: "建立一个Web3领域内第一的设置话媒体平台",
    tags: ["Team Wanted", "All", "DAO"],
    upvotes: 5,
    author: "mr k",
    date: "2024-01-18"
  }
]

export default function PublishedTaskList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map((task) => (
        <Card key={task.id} className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap gap-2 mb-3">
              {task.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant={tag === "Team Wanted" ? "secondary" : "outline"}
                  className={tag === "Team Wanted" ? "bg-yellow-100 hover:bg-yellow-100" : ""}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <h3 className="text-lg font-semibold">{task.title}</h3>
          </CardHeader>
          <CardContent className="flex-grow">
            {task.bulletPoints ? (
              <ol className="list-decimal list-inside space-y-1">
                {task.bulletPoints.map((point, index) => (
                  <li key={index} className="text-sm text-gray-600">{point}</li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-gray-600">{task.description}</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center pt-3 border-t">
            <div className="text-sm text-gray-500">
              By <span className="text-blue-600">{task.author}</span> · {task.date}
            </div>
            <Button variant="ghost" size="sm" className="space-x-1">
              <ChevronUp className="h-4 w-4" />
              <span>{task.upvotes}</span>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

