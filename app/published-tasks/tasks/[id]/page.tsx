import TaskDetailCard from "@/components/TaskDetailCard";
import { Database } from "@/types/supabase";
import {
  createServerComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Task } from "@/types/task";
import TaskClaimForm from "@/components/TaskClaimForm";

export const dynamic = "force-dynamic";

export default async function Index({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", Number(params.id));

  let task = null;
  if (tasks && tasks.length > 0) {
    task = tasks[0];
  }

  return (
    <div className="w-full py-8">
      <Suspense fallback={<TaskSkeleton />}>
        <div className="w-full flex justify-between items-start mb-4">
          <div className="w-1/2">
            <TaskDetailCard
              task={task as unknown as Task}
              user={user as User}
            ></TaskDetailCard>
          </div>
          <div className="w-2/5">
            <TaskClaimForm task={task as unknown as Task}></TaskClaimForm>
          </div>
        </div>
      </Suspense>
    </div>
  );
}

function TaskSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="border p-4 rounded-lg shadow">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}
