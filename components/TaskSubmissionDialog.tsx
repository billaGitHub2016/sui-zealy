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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TaskSubmissionForm from "@/components/TaskSubmissionForm";
import { Task } from "@/types/task";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export async function fetchTask(id: string): Promise<Task> {
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
    submitSuccessCallback,
  }: {
    taskId?: string;
    hasTrigger?: boolean;
    title?: string;
    submitSuccessCallback?: () => void;
  },
  ref: Ref<{
    setOpen: Function;
  }>
) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [isNewTask, setIsNewTask] = useState(false);

  useImperativeHandle(ref, () => ({
    setOpen,
  }));

  const form = useRef<{
    onSubmit: Function;
    resetForm: () => void;
  }>(null);

  useEffect(() => {
    if (open) {
      if (taskId && !isNewTask) {
        setLoading(true);
        fetchTask(taskId)
          .then((t) => {
            setTask(t);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    } else {
      form.current?.resetForm();
    }
  }, [taskId, open, isNewTask]);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (open) {
          setIsNewTask(true);
        } else {
          setIsNewTask(false);
          setTask(null);
        }
      }}
    >
      {hasTrigger && (
        <DialogTrigger asChild>
          <Button>创建新任务</Button>
        </DialogTrigger>
      )}
      <DialogContent
        className="max-w-[70vw] min-h-[90vh] flex flex-col"
        onPointerDownOutside={(event) => {
          event.preventDefault();
        }}
      >
        <DialogHeader className="flex flex-col">
          <DialogTitle>{isNewTask ? '创建任务' : title}</DialogTitle>
          {/* <DialogDescription>
    请填写以下表单来创建一个新的任务。所有字段都是必填的。
  </DialogDescription> */}
        </DialogHeader>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="overflow-y-auto flex-1">
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
                    form.current
                      .onSubmit()
                      .then(() => {
                        if (submitSuccessCallback) {
                          submitSuccessCallback();
                        }
                      })
                      .finally(() => {
                        setIsSubmitting(false);
                      });
                  }
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "提交中..." : "提交"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

function LoadingSkeleton() {
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg pt-4">
      <CardContent className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Separator />
        <div className="w-full">
        <Skeleton className="h-32 w-full" />
        </div>
        <Separator />
        <div className="w-full">
        <Skeleton className="h-32 w-full" />
        </div>
        <Separator />
        <div className="w-full">
        <Skeleton className="h-32 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export default forwardRef(TaskSubmissionDialog);
