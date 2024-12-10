// import ClientSideModelsList from "@/components/realtime/ClientSideModelsList";
import { Database } from "@/types/supabase";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import TaskSubmissionDialog from "@/components/TaskSubmissionDialog";
import { TaskListTable as MyTaskList } from "@/components/MyTaskList";
import { RecordListTable as MyRecordList } from "@/components/MyRecordList";
import { RecordListTable as MyReviewList } from "@/components/MyReviewList";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Index() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/overview')
  }

  return (
    <div className="container w-full px-4 py-8">
      <Tabs defaultValue="myTask" className="w-full">
        <TabsList>
          <TabsTrigger value="myTask">我的任务</TabsTrigger>
          <TabsTrigger value="myApply">我的申请</TabsTrigger>
          <TabsTrigger value="myReview">待我审核</TabsTrigger>
        </TabsList>
        <Suspense fallback={<TaskListSkeleton />}>
          <TabsContent
            value="myTask"
            forceMount
            className="data-[state=inactive]:hidden"
          >
            {/* <TaskSubmissionDialog /> */}
            <MyTaskList user={user}></MyTaskList>
          </TabsContent>
          <TabsContent
            value="myApply"
            forceMount
            className="data-[state=inactive]:hidden"
          >
            <MyRecordList user={user}></MyRecordList>
          </TabsContent>
          <TabsContent
            value="myReview"
            forceMount
            className="data-[state=inactive]:hidden">
            <MyReviewList user={user}></MyReviewList>
          </TabsContent>
        </Suspense>
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
