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
  }: {
    taskId?: string;
    title?: string;
  },
  ref: Ref<{
    setOpen: Function;
  }>
) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    setOpen,
  }));

  const form = useRef<{
    onSubmit: Function;
  }>(null);

  useEffect(() => {
    if (taskId && open) {
      setLoading(true);
      fetchTask(taskId).then((t) => {
        console.log("task = ", t);
        setTask(t);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [taskId, open]);

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
          <TaskDetailCard task={task} isLoading={loading}/>
        </div>
        <DialogFooter className="">
          {task?.status === 0 && (
            <Button
              onClick={() => {
                console.log("submit");
                if (form.current) {
                  setIsSubmitting(true);
                  form.current.onSubmit().finally(() => {
                    setIsSubmitting(false);
                  });
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "提交中..." : "发布"}
            </Button>
          )}
          {task?.status === 1 && (
            <Button
              onClick={() => {
                console.log("submit");
                if (form.current) {
                  setIsSubmitting(true);
                  form.current.onSubmit().finally(() => {
                    setIsSubmitting(false);
                  });
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "提交中..." : "取消发布"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default forwardRef(TaskPublishDialog);
