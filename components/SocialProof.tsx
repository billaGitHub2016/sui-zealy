"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Task } from "@/types/task";
import { Skeleton } from "./ui/skeleton";

export const Makers = [
  {
    image: "/images/users/1.png",
  },
  {
    image: "/images/users/2.png",
  },
  {
    image: "/images/users/3.png",
  },
  {
    image: "/images/users/4.png",
  },
  {
    image: "/images/users/5.png",
  },
];

export async function fetchTasksCount({
  pageNo = 1,
  pageSize = 1,
  orderBy = "publish_date",
}: {
  pageNo?: number;
  pageSize?: number;
  orderBy?: string;
}): Promise<{
  list: Task[];
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

const SocialProof = () => {
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    setLoading(true);
    fetchTasksCount({})
      .then((res) => {
        setCount(res.total);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section className="flex flex-col items-center justify-center gap-20 pt-16">
      <div className="flex flex-col items-center gap-5">
        {loading ? (
          <TaskListSkeleton />
        ) : (
          <>
            <div className="flex items-center justify-center">
              {Makers.map((user, index) => {
                return (
                  <Image
                    key={index}
                    src={user.image}
                    alt="User"
                    height={40}
                    width={40}
                    className="rounded-full -m-[5px] border border-white"
                  />
                );
              })}
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-400">
              <span className="text-primary font-semibold text-base">
                {count}+
              </span>{" "}
              任务已发布
            </p>
          </>
        )}
      </div>
    </section>
  );
};

export default SocialProof;

function TaskListSkeleton() {
  return (
    <div className="space-y-4 w-48 col-span-3 h-10">
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
