"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Task } from "@/types/task";
import Link from "next/link";
import AddressLink from "@/components/address-link";
import { SUI_MIST, Two_Hours_Ms } from "@/config/constants";
import { MIST_PER_SUI } from "@mysten/sui/dist/cjs/utils";
import { Skeleton } from "./ui/skeleton";

type PublishTask = {
  description: string;
  tags: {
    label: string;
    value: string;
    variant: string;
  }[];
} & Task;

// const tasks: Task[] = [
//   {
//     id: 1,
//     title: "web3 兼职平台",
//     description: "建立一个支持加密货币支付的兼职发布平台",
//     tags: ["Team Wanted", "All", "SocialFi"],
//     upvotes: 9,
//     author: "MW",
//     date: "2024-01-11",
//     bulletPoints: [
//       "建一个支持加密货币支付的兼职发布平台",
//       "通过智能合约，用工方可以明确交付工作"
//     ]
//   },
//   {
//     id: 2,
//     title: "DevRel DAO",
//     description: "DevRel DAO can solve problems like isolation in the field by providing a supportive community",
//     tags: ["Team Wanted", "Arbitrum", "DAO"],
//     upvotes: 4,
//     author: "Nitik Gupta",
//     date: "2024-02-08"
//   },
//   {
//     id: 3,
//     title: "NexDAO",
//     description: "建立一个Web3领域内第一的设置话媒体平台",
//     tags: ["Team Wanted", "All", "DAO"],
//     upvotes: 5,
//     author: "mr k",
//     date: "2024-01-18"
//   }
// ]

export async function fetchTasks({
  pageNo,
  pageSize = 6,
  orderBy = "publish_date",
}: {
  pageNo: number;
  pageSize?: number;
  orderBy?: string;
}): Promise<{
  list: PublishTask[];
  total: number;
}> {
  const response = await fetch(`/api/publishedTasks`, {
    method: "POST",
    body: JSON.stringify({ pageNo, pageSize, orderBy }),
  });
  if (!response.ok) {
    throw new Error("加载已发布任务失败");
  }
  const result = await response.json();
  return result.data;
}

export default function PublishedTaskList() {
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 6;
  const totalPage = Math.ceil(total / pageSize);
  // console.log('totalPage = ', totalPage)
  const [tasks, setTasks] = useState<PublishTask[]>([]);

  useEffect(() => {
    getTaskByPage();
  }, [pageNo]);

  const getTaskByPage = () => {
    setIsLoading(true);
    fetchTasks({ pageNo, pageSize })
      .then((result) => {
        if (result) {
          setTasks(
            result.list.map((item) => {
              const tags = [];
              if ((item.record_pass_count as number) > 0) {
                tags.push({
                  label: "有申请通过",
                  value: "hasRecordPass",
                  variant: "secondary",
                });
              } else if ((item.record_count as number) > 0) {
                tags.push({
                  label: "已有申请",
                  value: "hasRecord",
                  variant: "secondary",
                });
              } else {
                tags.push({
                  label: "暂无申请",
                  value: "hasRecord",
                  variant: "outline",
                });
              }

              if (
                item.publish_date &&
                new Date().getTime() - new Date(item.publish_date).getTime() <
                  Two_Hours_Ms
              ) {
                tags.push({
                  label: "犹豫期内",
                  value: "canBeWithdraw",
                  variant: "secondary",
                });
              }

              return {
                ...item,
                tags,
              };
            })
          );
          setTotal(result.total);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (<TaskListSkeleton/>) : (tasks.map((task) => (
          <Card key={task.id} className="flex flex-col transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-blue-100/50 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap gap-2 mb-3">
                {task.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant={(tag.variant as any) || "outline"}
                    className={`${
                      tag.value === "hasRecordPass"
                        ? "bg-yellow-100 hover:bg-yellow-100"
                        : ""
                    }${
                      tag.value === "canBeWithdraw"
                        ? "bg-red-100 hover:bg-red-100"
                        : ""
                    }`}
                  >
                    {tag.label}
                  </Badge>
                ))}
              </div>
              <Link href={`/published-tasks/tasks/${task.id}`}>
                <h3 className="text-lg font-semibold">{task.name}</h3>
              </Link>
            </CardHeader>
            <CardContent className="flex-grow pt-3">
              <p className="text-sm text-gray-600">奖池: {(task.pool as number) / SUI_MIST} SUI</p>
              <p className="text-sm text-gray-600 mt-1">
                已通过申请数/总数: {task.record_pass_count} / {task.claim_limit}
              </p>
            </CardContent>
            <CardFooter className="flex flex-col items-start pt-3 border-t">
              <div className="text-sm text-gray-500">
                任务ID:{" "}
                <span className="text-blue-600">
                  <AddressLink address={task.address} type="object" />
                </span>
              </div>
              <div className="text-sm text-gray-500">
                发布日期:{" "}
                {(task.publish_date &&
                  new Date(task.publish_date as string).toLocaleString()) ||
                  ""}
              </div>
              <div className="text-sm text-gray-500">
                结束日期:{" "}
                {(task.end_date &&
                  new Date(task.end_date as string).toLocaleString()) ||
                  ""}
              </div>
              {/* <Button variant="ghost" size="sm" className="space-x-1">
                <ChevronUp className="h-4 w-4" />
                <span>{task.upvotes}</span>
              </Button> */}
            </CardFooter>
          </Card>
        )))}
      </div>

      <div
        className="mt-4 flex justify-end aria-hidden:hidden"
        aria-hidden={tasks.length == 0}
      >
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
                onClick={() =>
                  setPageNo((prev) => Math.min(prev + 1, totalPage))
                }
                aria-disabled={totalPage === 1}
                className="aria-disabled:bg-slate-50 aria-disabled:text-gray-500 aria-disabled:cursor-not-allowed"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

function TaskListSkeleton() {
  return (
    <div className="space-y-4 w-full col-span-3">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="border p-4 rounded-lg shadow">
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}