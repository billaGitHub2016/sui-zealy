// import ClientSideModelsList from "@/components/realtime/ClientSideModelsList";
import { Database } from "@/types/supabase";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import TaskSubmissionDialog from "@/components/TaskSubmissionDialog";
import TaskList from "@/components/TaskList";
import { TaskListTable as MyTaskList } from "@/components/MyTaskList";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

export default async function Index() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>User not found</div>;
  }

  // const { data: models } = await supabase
  //   .from("models")
  //   .select(
  //     `*, samples (
  //     *
  //   )`
  //   )
  //   .eq("user_id", user.id);

  // return <ClientSideModelsList serverModels={models ?? []} />;

  return (
    <div className="container w-full px-4 py-8">
      <Tabs defaultValue="myTask" className="w-full">
        <TabsList>
          <TabsTrigger value="myTask">我的任务</TabsTrigger>
          <TabsTrigger value="myApply">我的申请</TabsTrigger>
        </TabsList>
        <TabsContent
          value="myTask"
          forceMount
          className="data-[state=inactive]:hidden"
        >
          <Suspense fallback={<TaskListSkeleton />}>
            {/* <TaskSubmissionDialog /> */}
            <MyTaskList user={user}></MyTaskList>
          </Suspense>
        </TabsContent>
        <TabsContent
          value="myApply"
          forceMount
          className="data-[state=inactive]:hidden"
        >
          hahaha
        </TabsContent>
      </Tabs>
    </div>
  );
  return;
}

function TaskListSkeleton() {
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
