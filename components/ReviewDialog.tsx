"use client";

import {
  forwardRef,
  Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Image from "next/image";
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
import ReviewForm from "@/components/ReviewForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Record } from "@/types/record";
import { Task } from "@/types/task";
import { User } from "@supabase/supabase-js";
import { REWARD_METHODS, SUI_MIST } from "@/config/constants";
import AddressLink from "./address-link";

export async function fetchTask(id: string): Promise<Task> {
  const response = await fetch(`/api/tasks/${id}`);
  if (!response.ok) {
    throw new Error("加载任务失败");
  }
  const result = await response.json();
  return result.data;
}

const ReviewDialog = (
  {
    record,
    user,
    onSubmitSuccess,
  }: {
    record: Record | null;
    user: User | null;
    onSubmitSuccess?: () => void;
  },
  ref: Ref<{
    setOpen: Function;
  }>
) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [task, setTask] = useState<Task | null>(null);
  const [taskLoading, setTaskLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    setOpen,
  }));

  const form = useRef<{
    onSubmit: Function;
  }>(null);

  useEffect(() => {
    if (record && open) {
      setTaskLoading(true);
      fetchTask(record.task_id)
        .then((t) => {
          setTask(t);
        })
        .finally(() => {
          setTaskLoading(false);
        });
    }
  }, [record, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-[70vw] max-h-[90vh] flex flex-col"
        onPointerDownOutside={(event) => {
          event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>审核申请</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto h-3/6">
          <div className="grid sm:grid-cols-8 gap-4 items-start">
            <div className="sm:col-span-5">
              <RecordDetailCard record={record}></RecordDetailCard>

              <div className="mt-4">
                <TaskDetailCard
                  task={task}
                  loading={taskLoading}
                ></TaskDetailCard>
              </div>
            </div>

            <div className="sm:col-span-3">
              <ReviewForm
                user={user}
                onSubmitSuccess={() => {
                  setOpen(false);
                  onSubmitSuccess && onSubmitSuccess();
                }}
                record={record}
                task={task as Task}
              ></ReviewForm>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="flex items-center">
    <span className="text-sm text-gray-500">{label}:</span>&nbsp;
    <span className="text-sm font-medium">{value}</span>
  </div>
);

function TaskDetailCard({
  task,
  loading,
}: {
  task: Task | null;
  loading?: boolean;
}) {
  if (loading) {
    return <TaskSkeleton />;
  }

  return !task ? (
    <div>任务不存在</div>
  ) : (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-semibold">任务详情</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <DetailItem label="任务名" value={task.name as string} />
        <DetailItem label="任务描述" value={task.desc as string} />
        <DetailItem
          label="发布时间"
          value={new Date(task.publish_date as string).toLocaleString()}
        />
        <DetailItem
          label="结束时间"
          value={new Date(task.end_date as string).toLocaleString()}
        />
        <DetailItem
          label="奖励方式"
          value={
            REWARD_METHODS[
              task.reward_method as keyof typeof REWARD_METHODS
            ] as string
          }
        />
        <DetailItem
          label="奖池金额"
          value={(task.pool as number) / SUI_MIST + "SUI"}
        />
        <DetailItem
          label="申请已通过/总数"
          value={
            (task.record_pass_count as number) +
            "/" +
            (task.claim_limit as number)
          }
        />
      </CardContent>
    </Card>
  );
}

function RecordDetailCard({
  record,
  loading,
}: {
  record: Record | null;
  loading?: boolean;
}) {
  if (loading) {
    return <TaskSkeleton />;
  }

  return !record ? (
    <div>申请记录不存在</div>
  ) : (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-semibold">申请详情</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <DetailItem label="描述" value={record.desc as string} />
        <div className="flex items-center">
          <span className="text-sm text-gray-500">钱包地址:</span>&nbsp;
          <AddressLink
            address={record.wallet_address as string}
            type="account"
          ></AddressLink>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-2">附件图片</p>
          <div className="grid grid-cols-4 gap-2">
            {record?.attachments?.map((image, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden"
              >
                <a
                  href={image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 z-10"
                >
                  <Image
                    src={image}
                    alt={`image ${index + 1}`}
                    width={60}
                    height={60}
                  />
                </a>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TaskSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(1)].map((_, i) => (
        <div key={i} className="border p-4 rounded-lg shadow">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}

export default forwardRef(ReviewDialog);
