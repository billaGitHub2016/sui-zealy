import { NextResponse } from "next/server";
import { createPagesBrowserClient, createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Published } from '@/config/constants';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const supabase = createPagesBrowserClient({ supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY });
        const { pageNo, pageSize, orderBy } = body;
        const builder = supabase.rpc('get_published_tasks_v10', { offsetsize: (pageNo - 1) * pageSize, pagesize: pageSize, orderby: orderBy || 'created_at' })

        const { data: tasks, error } = await builder;
        if (error) {
            throw error
        }

        const { error: countErr, count } = await supabase.from('tasks')
            .select('*', { count: 'exact' })
            .eq('status', Published)
        if (countErr) {
            throw countErr
        }

        return NextResponse.json({
            message: "ok", data: {
                list: tasks,
                pageNo: body.pageNo || 1,
                pageSize,
                total: count
            }
        }, { status: 200 })
    } catch (error) {
        console.error("查询已发布任务失败:", error)
        return NextResponse.json({ error: "查询已发布任务失败" }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const supabase = createRouteHandlerClient({ cookies });

        const { data, error } = await supabase
            .from('tasks')
            .update(body)
            .eq('id', body.id)
            .select()

        if (error) {
            throw error
        }

        let task = null
        if (data.length === 1) {
            task = data[0]
        }

        return NextResponse.json({
            message: "ok", data: task
        }, { status: 200 })
    } catch (error) {
        console.error("查询已发布任务失败:", error)
        return NextResponse.json({ error: "查询已发布任务失败" }, { status: 500 })
    }
}