import { NextResponse } from "next/server";
import { join } from "path";
import { writeFile } from "fs/promises";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function PUT(request: Request) {
    const formData = await request.formData()
    const name = formData.get("name") as string
    const desc = formData.get("desc") as string
    const reward_method = formData.get("reward_method") as string
    const claim_limit = formData.get("claim_limit") as string
    const pool = formData.get("pool") as string
    const start_date = formData.get("start_date") as string
    const end_date = formData.get("end_date") as string
    const attachments: File[] = []

    for (const [key, value] of formData.entries()) {
        if (key.startsWith("attachment") && value instanceof File) {
            attachments.push(value)
        }
    }

    if (!name || !desc || attachments.length === 0) {
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
                    { name, desc, reward_method, claim_limit, pool, start_date, end_date, status: 1, user_id: user.id, attachments: attachmentUrls },
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

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('body = ', body)
        const supabase = createRouteHandlerClient({ cookies });

        const builder = supabase.from('tasks')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
        if (body.user_id) {
            builder.eq('user_id', body.user_id)
        }
        const pageSize = body.pageSize || 10
        if (body.pageNo) {
            builder.range((body.pageNo - 1) * pageSize, body.pageNo * pageSize)
        }
        const { data: tasks, error, count } = await builder;

        if (error) {
            throw error
        }

        return NextResponse.json({ message: "ok", data: {
            list: tasks,
            pageNo: body.pageNo || 1,
            pageSize,
            total: count
        } }, { status: 200 })
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