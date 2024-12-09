import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { writeFile } from "fs/promises";
import { join } from "path";
import { Task } from "@/types/task";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const param = await params
    const { id } = param
    console.log('params = ', param)
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('id', id)

        const { count: passRecordCount, error: passRecordCountError } = await supabase.from('records')
            .select('id', { count: 'exact' })
            .eq('task_id', id)
            .eq('result', 1)

        if (error || passRecordCountError) {
            throw error
        }

        let task = null
        if (data.length === 1) {
            task = data[0]
            task.record_pass_count = passRecordCount
        }

        return NextResponse.json({ message: "ok", data: task }, { status: 200 })
    } catch (error) {
        console.error("查询任务失败:", error)
        return NextResponse.json({ error: "查询任务失败" }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const param = await params
    const { id } = param
    try {
        const supabase = createRouteHandlerClient({ cookies });

        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id)

        if (error) {
            throw error
        }

        return NextResponse.json({ message: "ok", data: null }, { status: 200 })
    } catch (error) {
        console.error("任务删除失败:", error)
        return NextResponse.json({ error: "任务删除失败" }, { status: 500 })
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const param = await params
    const { id } = param

    try {
        const supabase = createRouteHandlerClient({ cookies });

        const { data: taskData, error: taskError } = await supabase
            .from('tasks')
            .select('*')
            .eq('id', id)
        console.log('taskData = ', taskData)
        if (taskError) {
            throw new Error('没有找到任务数据')
        }

        const formData = await request.formData()
        // console.log('formData = ', formData)
        const name = formData.get("name") as string
        const desc = formData.get("desc") as string
        // console.log('desc = ', desc)
        const reward_method = formData.get("reward_method") as unknown as number
        // console.log('reward_method = ', reward_method)
        const claim_limit = formData.get("claim_limit") as unknown as number
        const pool = formData.get("pool") as unknown as number
        const start_date = formData.get("start_date") as string
        const end_date = formData.get("end_date") as string
        const status = formData.get("status") as unknown as number
        const attachments: File[] = []
        // const previews: string[] = []

        for (const [key, value] of formData.entries()) {
            if (key.startsWith("attachment") && value instanceof File) {
                attachments.push(value)
            }
            // if (key.startsWith("preview") && typeof value === "string") {
            //     previews.push(value)
            // }
        }

        const attachmentUrls = await Promise.all(
            attachments.map(async (attachment, index) => {
                const bytes = await attachment.arrayBuffer()
                const buffer = Buffer.from(bytes)
                const fileName = `${Date.now()}-${index}-${attachment.name}`
                const path = join("./public", "uploads", fileName)
                await writeFile(path, new Uint8Array(buffer))
                return `/uploads/${fileName}`
            })
        )

        const update: Partial<Task> = { name, desc, reward_method, claim_limit, pool, start_date, end_date }
        if (attachments.length > 0) {
            update.attachments = attachmentUrls
        }
        if (typeof status === 'number') {
            update.status = status
        }
        console.log('update = ', update)

        const { data, error } = await supabase
            .from('tasks')
            .update(update)
            .eq('id', id)
            .select()

        if (error) {
            throw error
        }

        let task = null
        if (data.length === 1) {
            task = data[0]
        }

        return NextResponse.json({ message: "ok", data: task }, { status: 200 })
    } catch (error) {
        console.error("任务更新失败:", error)
        return NextResponse.json({ error: "任务更新失败：" + (error as unknown as Error).message }, { status: 500 })
    }
}

