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
import TaskSubmissionForm from "@/components/TaskSubmissionForm";
import { Task } from "@/types/task";

export async function fetchTask(id: string): Promise<Task[]> {
  const response = await fetch(`/api/tasks/${id}`);
  if (!response.ok) {
    throw new Error("加载任务失败");
  }
  const result = await response.json();
  return result.data;
}

const TaskSubmissionDialog = (
  {
    taskId,
    hasTrigger = true,
    title = "创建新任务",
  }: {
    taskId?: string;
    hasTrigger?: boolean;
    title?: string;
  },
  ref: Ref<{
    setOpen: Function;
  }>
) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [task, setTask] = useState<Task | null>(null);

  useImperativeHandle(ref, () => ({
    setOpen,
  }));

  const form = useRef<{
    onSubmit: Function;
  }>(null);

  useEffect(() => {
    if (taskId && open) {
      fetchTask(taskId).then((t) => {
        console.log("task = ", t);
        setTask(t);
      });
    }
  }, [taskId, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {hasTrigger && (
        <DialogTrigger asChild>
          <Button>创建新任务</Button>
        </DialogTrigger>
      )}
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
          <TaskSubmissionForm
            onSubmitSuccess={() => setOpen(false)}
            ref={form}
            task={task}
          />
        </div>
        <DialogFooter className="">
          <Button
            type="submit"
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
            {isSubmitting ? "提交中..." : "提交"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default forwardRef(TaskSubmissionDialog);
