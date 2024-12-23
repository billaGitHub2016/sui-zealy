"use client";

import { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Bitcoin, Send, Gift, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "@/components/ui/use-toast";
import { Task } from "@/types/task";
import TaskSubmissionDialog from "@/components/TaskSubmissionDialog";
import TaskPublishDialog from "@/components/TaskPublishDialog";
import SimpleAlert from "@/components/simple-alert";
import { SUI_MIST, STATUS_MAP, Two_Hours_Ms, Draft, Published } from "@/config/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "@supabase/supabase-js";
import AddressLink from "./address-link";

export async function fetchTasks({
  pageNo,
  pageSize = 10,
  user_id,
}: {
  pageNo: number;
  pageSize?: number;
  user_id: string;
}): Promise<{
  list: Task[];
  total: number;
}> {
  const response = await fetch(`/api/tasks`, {
    method: "POST",
    body: JSON.stringify({ pageNo, pageSize, user_id }),
  });
  if (!response.ok) {
    throw new Error("加载任务失败");
  }
  const result = await response.json();
  return result.data;
}

export async function deleteTask(id: string): Promise<Task[]> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("删除任务失败");
  }
  const result = await response.json();
  return result.data;
}

export function TaskListTable({ user }: { user: User }) {
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const pageSize = 10;
  const totalPage = Math.ceil(total / pageSize);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editTaskId, setEditTaskId] = useState("");
  const [openAlert, setOpenAlert] = useState(false);
  const [operation, setOperation] = useState("");
  const [alertTips, setAlertTips] = useState("");
  const [publishDialogTitle, setPublishDialogTitle] = useState("");
  const [submitTaskDialogTitle, setSubmitTaskDialogTitle] =
    useState("创建任务");
  const form = useRef<{ setOpen: Function }>(null);
  const publishForm = useRef<{ setOpen: Function }>(null);

  //   const getCurrentPageTasks = () => {
  //     const startIndex = (pageNo - 1) * pageSize
  //     const endIndex = startIndex + pageSize
  //     return tasks.slice(startIndex, endIndex)
  //   }

  useEffect(() => {
    getTaskByPage();
  }, [pageNo]);

  const getTaskByPage = () => {
    setIsLoading(true);
    fetchTasks({ pageNo: pageNo, pageSize, user_id: user?.id })
      .then((result) => {
        if (result) {
          setTasks(result.list);
          setTotal(result.total);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleEdit = (id: string) => {
    const editTask = tasks.find((item) => item.id === parseInt(id));
    if (editTask?.status !== Draft) {
      toast({
        title: "校验失败",
        description: "任务不是草稿状态，不能编辑",
      });
      return;
    }
    console.log(`编辑任务 ${id}`);
    setEditTaskId(id);
    setSubmitTaskDialogTitle("编辑任务");
    if (form.current) {
      form.current.setOpen(true);
    }
  };

  const handleWithdraw = (id: string) => {
    console.log(`提现 ${id}`);
    setEditTaskId(id);
    setPublishDialogTitle("任务提现");
    publishForm.current?.setOpen(true);
  };

  const handlePublish = (id: string) => {
    const editTask = tasks.find((item) => item.id === parseInt(id));
    if (editTask?.status !== Draft) {
      toast({
        title: "校验失败",
        description: "任务不是草稿状态，不能发布",
      });
      return;
    }
    console.log(`发布任务 ${id}`);
    setEditTaskId(id);
    setPublishDialogTitle("发布任务");
    publishForm.current?.setOpen(true);
  };

  const handleRaffle = (id: string) => {
    const editTask = tasks.find((item) => item.id === parseInt(id));
    if (editTask?.status !== Published) {
      toast({
        title: "校验失败",
        description: "任务不是发布状态，不能抽奖",
      });
      return;
    }
    setEditTaskId(id);
    setPublishDialogTitle("抽奖");
    publishForm.current?.setOpen(true);
  }

  const onConfirm = () => {
    if (operation === "delete") {
      setIsLoading(true);
      deleteTask(editTaskId)
        .then(() => {
          toast({
            title: "提示",
            description: "任务已成功删除。",
          });
          return fetchTasks({
            pageNo: pageNo,
            pageSize,
            user_id: user?.id,
          }).then((result) => {
            if (result) {
              setTasks(result.list);
              setTotal(result.total);
            }
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
      console.log(`删除任务 ${editTaskId}`);
    }
  };

  return (
    <div className="w-full relative">
      <div className="absolute right-0 top-0">
        <Button
          variant={"outline"}
          onClick={() => {
            getTaskByPage();
          }}
        >
          <RefreshCw /> 刷新
        </Button>
      </div>
      <TaskSubmissionDialog
        ref={form}
        taskId={editTaskId}
        title={submitTaskDialogTitle}
        submitSuccessCallback={getTaskByPage}
      />
      <TaskPublishDialog
        ref={publishForm}
        taskId={editTaskId}
        user={user}
        title={publishDialogTitle}
        submitSuccessCallback={getTaskByPage}
      />
      <div className="mt-4"></div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>任务名</TableHead>
            <TableHead>任务描述</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>奖池(SUI)</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead>发布时间</TableHead>
            <TableHead>链上ID</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                <TaskListSkeleton />
              </TableCell>
            </TableRow>
          ) : tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center ">
                暂无数据
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.name}</TableCell>
                <TableCell>{task.desc}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      task.status == 0
                        ? "outline"
                        : task.status == 1
                          ? "default"
                          : "secondary"
                    }
                  >
                    {STATUS_MAP[task.status as 0 | 1 | 2]}
                  </Badge>
                </TableCell>
                <TableCell>{(task.pool as number) / SUI_MIST}</TableCell>
                <TableCell>
                  {new Date(task.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  {(task.publish_date &&
                    new Date(task.publish_date).toLocaleString()) ||
                    ""}
                </TableCell>
                <TableCell>
                  {task.address && (
                    <AddressLink
                      address={task.address}
                      type="object"
                    ></AddressLink>
                  )}
                </TableCell>
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
                      <DropdownMenuItem
                        onClick={() => handleEdit(task.id as unknown as string)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>编辑</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          handleWithdraw(task.id as unknown as string)
                        }
                      >
                        <Bitcoin className="mr-2 h-4 w-4" />
                        <span>提现</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handlePublish(task.id as unknown as string)
                        }
                      >
                        <Send className="mr-2 h-4 w-4" />
                        <span>发布</span>
                      </DropdownMenuItem>
                      {task.reward_method === 2 && (<DropdownMenuItem
                        onClick={() =>
                          handleRaffle(task.id as unknown as string)
                        }
                      >
                        <Gift className="mr-2 h-4 w-4" />
                        <span>抽奖</span>
                      </DropdownMenuItem>)}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
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

        <SimpleAlert
          hasTrigger={false}
          tips={alertTips}
          open={openAlert}
          onOpenChange={(open) => {
            setOpenAlert(open);
          }}
          onConfirm={onConfirm}
          onCancel={() => setOpenAlert(false)}
        ></SimpleAlert>
      </div>
    </div>
  );
}

function TaskListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="border p-4 rounded-lg shadow">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}
