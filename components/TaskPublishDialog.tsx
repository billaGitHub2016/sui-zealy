"use client";

import {
  forwardRef,
  Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import TaskDetailCard from "@/components/TaskDetailCard";
import { Task } from "@/types/task";
import { User } from "@supabase/supabase-js";
import SimpleAlert from "@/components/simple-alert";
import { Two_Hours_Ms } from "@/config/constants";
import { toast } from "@/components/ui/use-toast";

export async function fetchTask(id: string): Promise<Task> {
  const response = await fetch(`/api/tasks/${id}`);
  if (!response.ok) {
    throw new Error("加载任务失败");
  }
  const result = await response.json();
  return result.data;
}

const TaskPublishDialog = (
  {
    taskId,
    title = "发布任务",
    user,
  }: {
    taskId?: string;
    title?: string;
    user: User | null;
  },
  ref: Ref<{
    setOpen: Function;
  }>
) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const taskDetail = useRef<{ handlePublish: () => Promise<"">, handleWithdraw: () => Promise<""> }>(null);
  const [openAlert, setOpenAlert] = useState(false);
  const [operation, setOperation] = useState("");
  const [alertTips, setAlertTips] = useState("");

  useImperativeHandle(ref, () => ({
    setOpen,
  }));

  const form = useRef<{
    onSubmit: Function;
  }>(null);

  useEffect(() => {
    if (taskId && open) {
      setLoading(true);
      fetchTask(taskId)
        .then((t) => {
          console.log("task = ", t);
          setTask(t);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [taskId, open]);

  const onConfirm = () => {
    if (operation === "publish") {
      if (taskDetail.current) {
        setIsSubmitting(true);
        taskDetail.current
          .handlePublish()
          .catch(() => { })
          .finally(() => {
            setIsSubmitting(false);
          });
      }
    } else if (operation === "withdraw") {
      if (taskDetail.current) {
        setIsSubmitting(true);
        taskDetail.current
          .handleWithdraw()
          .catch(() => { })
          .finally(() => {
            setIsSubmitting(false);
          });
      }
    }
  };

  const onWithdraw = (withdrawTask: Task) => {
    console.log(`提现 ${withdrawTask.id}`);
    if (withdrawTask) {
      const { publish_date, end_date } = withdrawTask;
      const now = new Date();
      const publishDate = new Date(publish_date as string);
      const diffTime = Math.abs(now.getTime() - publishDate.getTime());
      const endDate = new Date(end_date as string);
      const diffTime2 = Math.abs(now.getTime() - endDate.getTime());
      if (diffTime > Two_Hours_Ms && diffTime2 < 0) {
        toast({
          title: "校验失败",
          description: "已过犹豫期，请在任务结束日期过后再提现。",
          variant: "destructive",
        });
        return;
      }
      if (task?.status !== 1) {
        toast({
          title: "校验失败",
          description: "任务未发布，无法提现。",
          variant: "destructive",
        });
        return;
      }
      setOperation("withdraw");
      setAlertTips(
        "任务提现后，将返回全部奖池金额，并删除链上任务数据。确认继续？"
      );
      setOpenAlert(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-[70vw] max-h-[90vh] flex flex-col"
        onPointerDownOutside={(event) => {
          event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {/* <DialogDescription>
            请填写以下表单来创建一个新的任务。所有字段都是必填的。
          </DialogDescription> */}
        </DialogHeader>
        <div className="overflow-y-auto h-3/6">
          <TaskDetailCard
            task={task}
            isLoading={loading}
            user={user}
            ref={taskDetail}
          />
        </div>
        <DialogFooter className="">
          {task?.status === 0 && (
            <Button
              onClick={() => {
                setOperation("publish");
                setAlertTips(
                  "任务发布后，在犹豫期(2小时)内可以提现并删除链上发布的任务。犹豫期结束后需要等待到结束日期后或任务完成后才能删除链上任务。请确认是否要发布？"
                );
                setOpenAlert(true);
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "提交中..." : "发布"}
            </Button>
          )}
          {task?.status === 1 && (
            <Button
              onClick={() => {
                onWithdraw(task);
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "提交中..." : "提现"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>

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
    </Dialog>
  );
};

export default forwardRef(TaskPublishDialog);
