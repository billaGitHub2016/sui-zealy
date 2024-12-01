import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id
    try {
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

