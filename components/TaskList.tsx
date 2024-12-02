"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { Task } from "@/types/task";
import { DateRangePicker } from "@/components/date-range-picker";
import { DateRange } from "react-day-picker";

export async function fetchTasks(
  page: number,
  limit: number = 10
): Promise<Task[]> {
  const response = await fetch(`/api/tasks?page=${page}&limit=${limit}`);
  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }
  const result = await response.json();
  return result.data;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();

  const [date, setDate] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });

  // useEffect(() => {
  //   if (inView && hasMore) {
  //     loadMoreTasks()
  //   }
  // }, [inView, hasMore])

  const loadMoreTasks = async () => {
    const newTasks = await fetchTasks(page);
    if (newTasks.length === 0) {
      setHasMore(false);
    } else {
      setTasks((prevTasks) => [...prevTasks, ...newTasks]);
      setPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Link href={`/tasks/${task.id}`} key={task.id}>
          <div className="border p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-2">{task.title}</h2>
            <p className="text-gray-600 mb-2">
              {task.desc.substring(0, 100)}...
            </p>
            <p className="text-sm text-gray-500">
              发布者: {task.owner_address}
            </p>
            <p className="text-sm text-gray-500">状态: {task.status}</p>
          </div>
        </Link>
      ))}
      {hasMore && (
        <div ref={ref} className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      <DateRangePicker
        value={date}
        onChange={(value) => {
          console.log("日期change~~~~~~~~~~~", value);
          debugger;
          setDate(value);
        }}
      />
    </div>
  );
}
