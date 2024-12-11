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
  const taskDetail = useRef<{ handlePublish: () => Promise<""> }>(null);
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
          .catch(() => {})
          .finally(() => {
            setIsSubmitting(false);
          });
      }
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
          {/* {task?.status === 1 && (
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
              {isSubmitting ? "提交中..." : "取消发布"}
            </Button>
          )} */}
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
