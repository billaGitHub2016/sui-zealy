import { NextResponse } from "next/server";
import { join } from "path";
import { writeFile } from "fs/promises";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function PUT(request: Request) {
    const formData = await request.formData()
    const desc = formData.get("desc") as string
    const task_id = formData.get("task_id") as string
    const wallet_address = formData.get("wallet_address") as string
    const record_address = formData.get("record_address") as string
    const attachments: File[] = []

    for (const [key, value] of formData.entries()) {
        if (key.startsWith("attachments") && value instanceof File) {
            attachments.push(value)
        }
    }

    if (!desc) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    try {
        const supabase = createRouteHandlerClient({ cookies });
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const { data: waitingRecord, error: waitingRecordError } = await supabase
            .from('records')
            .select('task_id')
            .eq('task_id', task_id)
            .eq('result', 0)
            .eq('user_id', user?.id)
        if (waitingRecordError) {
            throw waitingRecordError
        }

        if (waitingRecord.length > 0) {
            return NextResponse.json({ message: "您已提交过申请，请耐心等待审核" }, { status: 400 })
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
                return
            })
        )

        if (user) {
            const { data, error } = await supabase
                .from('records')
                .insert([
                    { desc, result: 0, user_id: user.id, attachments: attachmentUrls, task_id, wallet_address, record_address },
                ])
                .select()
            if (error) {
                throw error
            }
            return NextResponse.json({ message: "申请提交成功", task: data }, { status: 201 })
        } else {
            throw new Error('请先登录')
        }
    } catch (error) {
        console.error("申请提交失败:", error)
        return NextResponse.json({ error: "申请提交失败，请稍后再试" }, { status: 500 })
    }
}
