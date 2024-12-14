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
        
        const { count: notCheckRecordCount, error: notCheckRecordCountError } = await supabase.from('records')
            .select('id', { count: 'exact' })
            .eq('task_id', id)
            .eq('result', 0)

        if (error || passRecordCountError || notCheckRecordCountError) {
            throw error
        }

        let task = null
        if (data.length === 1) {
            task = data[0]
            task.record_pass_count = passRecordCount
            task.record_not_check_count = notCheckRecordCount
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
                const fileName = `${Date.now()}-${index}.${attachment.name.split('.')[1]}`
                const { data, error }: { data: any, error: any } = await supabase.storage
                    .from('task_images')
                    .upload(fileName, buffer)
                if (error) {
                    console.error('上传失败:', error)
                }
                if (data) {
                    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${data.fullPath}`
                }
                return []
            })
        )

        const update: Partial<Task> = { name, desc, reward_method, claim_limit, pool, end_date }
        if (attachments.length > 0) {
            update.attachments = attachmentUrls as string[]
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

