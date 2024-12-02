import { NextResponse } from "next/server";
import { join } from "path";
import { writeFile } from "fs/promises";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function PUT(request: Request) {
    const formData = await request.formData()
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const attachments: File[] = []

    for (const [key, value] of formData.entries()) {
        if (key.startsWith("attachment") && value instanceof File) {
            attachments.push(value)
        }
    }

    if (!title || !description || attachments.length === 0) {
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
        const { data, error } = await supabase
            .from('tasks')
            .insert([
                { name: title, desc: description, attachments: attachmentUrls },
            ])
            .select()
        if (error) {
            throw error
        }


        return NextResponse.json({ message: "Task created successfully", task: data }, { status: 201 })
    } catch (error) {
        console.error("Error creating task:", error)
        return NextResponse.json({ error: "Error creating task" }, { status: 500 })
    }
}

export async function GET(request: Request) {
    try {
        // console.log('get req = ', request)
        const supabase = createRouteHandlerClient({ cookies });

        let { data: tasks, error } = await supabase
            .from('tasks')
            .select('*')
            .range(0, 9)

        if (error) {
            throw error
        }

        return NextResponse.json({ message: "ok", data: tasks }, { status: 200 })
    } catch (error) {
        console.error("Error creating task:", error)
        return NextResponse.json({ error: "Error creating task" }, { status: 500 })
    }
}