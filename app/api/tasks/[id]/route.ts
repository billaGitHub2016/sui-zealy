import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

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

        if (error) {
            throw error
        }

        let task = null
        if (data.length === 1) {
            task = data[0]
        }

        return NextResponse.json({ message: "ok", data: task }, { status: 200 })
    } catch (error) {
        console.error("Error creating task:", error)
        return NextResponse.json({ error: "Error query task" }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const param = await params
    const { id } = param
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('id', id)

        if (error) {
            throw error
        }

        let task = null
        if (data.length === 1) {
            task = data[0]
        }

        return NextResponse.json({ message: "ok", data: task }, { status: 200 })
    } catch (error) {
        console.error("Error creating task:", error)
        return NextResponse.json({ error: "Error query task" }, { status: 500 })
    }
}

