"use client"

import { useState, useEffect, useRef } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash, Send } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Task } from "@/types/task";
import TaskSubmissionDialog from "@/components/TaskSubmissionDialog"
import SimpleAlert from '@/components/simple-alert'

const SUI_MIST = 1000000000
const STATUS_MAP = {
  0: '草稿',
  1: '已发布',
  2: '完成'
}

// // 模拟任务数据
// const tasks = [
//   { id: 1, title: "完成项目报告", status: "进行中", startDate: "2023-06-01", endDate: "2023-06-15", claimLimit: 3 },
//   { id: 2, title: "设计新logo", status: "待审核", startDate: "2023-06-05", endDate: "2023-06-20", claimLimit: 1 },
//   { id: 3, title: "更新网站内容", status: "已完成", startDate: "2023-05-25", endDate: "2023-06-10", claimLimit: 2 },
//   { id: 4, title: "客户满意度调查", status: "进行中", startDate: "2023-06-10", endDate: "2023-06-30", claimLimit: 5 },
//   { id: 5, title: "优化数据库查询", status: "待审核", startDate: "2023-06-15", endDate: "2023-07-05", claimLimit: 2 },
//   { id: 6, title: "开发移动应用", status: "进行中", startDate: "2023-07-01", endDate: "2023-08-15", claimLimit: 4 },
//   { id: 7, title: "员工培训计划", status: "待审核", startDate: "2023-07-10", endDate: "2023-07-25", claimLimit: 10 },
//   { id: 8, title: "市场调研报告", status: "已完成", startDate: "2023-06-20", endDate: "2023-07-10", claimLimit: 2 },
//   { id: 9, title: "产品发布会准备", status: "进行中", startDate: "2023-07-15", endDate: "2023-08-01", claimLimit: 6 },
//   { id: 10, title: "年度财务审计", status: "待审核", startDate: "2023-08-01", endDate: "2023-08-31", claimLimit: 3 },
//   { id: 11, title: "社交媒体营销活动", status: "进行中", startDate: "2023-07-20", endDate: "2023-08-20", claimLimit: 4 },
//   { id: 12, title: "客户反馈分析", status: "已完成", startDate: "2023-07-05", endDate: "2023-07-20", claimLimit: 2 },
// ]

export async function fetchTasks({
  pageNo,
  pageSize = 10,
  user_id
}: {
  pageNo: number;
  pageSize?: number;
  user_id: string;
}): Promise<Task[]> {
  const response = await fetch(`/api/tasks`, {
    method: 'POST',
    body: JSON.stringify({ pageNo, pageSize, user_id }),
  });
  if (!response.ok) {
    throw new Error("加载任务失败");
  }
  const result = await response.json();
  return result.data;
}

export function TaskListTable({
  user,
}: {
  user: any,
}) {
  const [pageNo, setPageNo] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const pageSize = 10
  const totalPage = Math.ceil(total / pageSize)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editTaskId, setEditTaskId] = useState('');
  const [openAlert, setOpenAlert] = useState(fase);
  const form = useRef<{ setOpen: Function }>(null)

  //   const getCurrentPageTasks = () => {
  //     const startIndex = (pageNo - 1) * pageSize
  //     const endIndex = startIndex + pageSize
  //     return tasks.slice(startIndex, endIndex)
  //   }

  useEffect(() => {
    setIsLoading(true)
    fetchTasks({ pageNo: pageNo, pageSize, user_id: user?.id }).then(data => {
      if (data) {
        setTasks(data.list);
        setTotal(data.total);
      }
    }).finally(() => {
      setIsLoading(false)
    })
  }, [pageNo])

  const handleEdit = (id: string) => {
    console.log(`编辑任务 ${id}`)
    setEditTaskId(id);
    if (form.current) {
      form.current.setOpen(true)
    }
  }

  const handleDelete = (id: number) => {
    console.log(`删除任务 ${id}`)
  }

  const handlePublish = (id: number) => {
    console.log(`发布任务 ${id}`)
  }

  return (
    <div className="w-full">
      <TaskSubmissionDialog ref={form} taskId={editTaskId} hasTrigger={false}/>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>任务名</TableHead>
            <TableHead>任务描述</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>奖池(SUI)</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              </TableCell>
            </TableRow>
          ) : tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center ">
                暂无数据
              </TableCell>
            </TableRow>
          ) :
            (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.name}</TableCell>
                  <TableCell>{task.desc}</TableCell>
                  <TableCell>
                    <Badge variant={task.status == 0 ? "outline" : task.status == 1 ? "default" : "secondary"}>
                      { STATUS_MAP[task.status] }
                    </Badge>
                  </TableCell>
                  <TableCell>{ task.pool as number / SUI_MIST }</TableCell>
                  <TableCell>{new Date(task.created_at).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">打开菜单</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(task.id)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>编辑</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(task.id)}>
                          <Trash className="mr-2 h-4 w-4" />
                          <span>删除</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handlePublish(task.id)}>
                          <Send className="mr-2 h-4 w-4" />
                          <span>发布</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )
          }
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-end aria-hidden:hidden" aria-hidden={tasks.length == 0}>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPageNo((prev) => Math.max(prev - 1, 1))}
                aria-disabled={pageNo === 1}
                className="aria-disabled:bg-slate-50 aria-disabled:text-gray-500 aria-disabled:cursor-not-allowed"
              />
            </PaginationItem>
            {[...Array(totalPage)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => setPageNo(index + 1)}
                  isActive={pageNo === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPageNo((prev) => Math.min(prev + 1, totalPage))}
                aria-disabled={pageNo === 1}
                className="aria-disabled:bg-slate-50 aria-disabled:text-gray-500 aria-disabled:cursor-not-allowed"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        <SimpleAlert open={openAlert} onOpenChange={(open) => {
          setOpenAlert(open)
        }}></SimpleAlert>
      </div>
    </div>
  )
}

