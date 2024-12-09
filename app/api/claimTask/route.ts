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
        const attachmentUrls = await Promise.all(
            attachments.map(async (attachment, index) => {
                const bytes = await attachment.arrayBuffer()
                const buffer = Buffer.from(bytes)
                const fileName = `${Date.now()}-${index}-${attachment.name}`
                const path = join("./public", "uploads", fileName)
                await writeFile(path, buffer)
                return `/uploads/${fileName}`
            })
        )


        const supabase = createRouteHandlerClient({ cookies });
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (user) {
            const { data, error } = await supabase
                .from('tasks')
                .insert([
                    { desc, status: 0, user_id: user.id, attachments: attachmentUrls },
                ])
                .select()
            if (error) {
                throw error
            }
            return NextResponse.json({ message: "Task created successfully", task: data }, { status: 201 })
        } else {
            throw new Error('请先登录')
        }
    } catch (error) {
        console.error("Error creating task:", error)
        return NextResponse.json({ error: "Error creating task" }, { status: 500 })
    }
}
