'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TaskSubmissionForm } from "@/components/TaskSubmissionForm"

export default function TaskSubmissionDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>创建新任务</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[70vw] sm:max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>创建新任务</DialogTitle>
          {/* <DialogDescription>
            请填写以下表单来创建一个新的任务。所有字段都是必填的。
          </DialogDescription> */}
        </DialogHeader>
        <div className="overflow-y-auto h-4/6">
          <TaskSubmissionForm onSubmitSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

