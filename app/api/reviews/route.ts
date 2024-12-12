import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Record } from "@/types/record"

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const supabase = createRouteHandlerClient({ cookies });

        const { data: taskIds, error: taskError } = await supabase.from('tasks').select('id').eq('user_id', body.user_id)
        if (taskError) {
            throw taskError
        }

        const builder = supabase.from('records')
            .select('*', { count: 'exact' })
            .eq('result', 0)
            .in('task_id', taskIds.map(task => task.id))
            .order('created_at', { ascending: true })

        const pageSize = body.pageSize || 10
        if (body.pageNo) {
            builder.range((body.pageNo - 1) * pageSize, body.pageNo * pageSize)
        }
        const { data: records, error, count } = await builder;

        if (error) {
            throw error
        }

        return NextResponse.json({
            message: "ok", data: {
                list: records,
                pageNo: body.pageNo || 1,
                pageSize,
                total: count
            }
        }, { status: 200 })
    } catch (error) {
        console.error("查询审核记录失败:", error)
        return NextResponse.json({ error: "查询审核记录失败" }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    const formData = await request.formData()
    const id = formData.get("id") as string
    const comment = formData.get("comment") as string
    const result = formData.get("result") as string
    const reward_digest = formData.get("reward_digest") as string

    try {
        const supabase = createRouteHandlerClient({ cookies });

        let { data: recordData, error: recordError } = await supabase
            .from('records')
            .select('*')
            .eq('id', id)

        if (recordError) {
            throw recordError
        }

        if (recordData && recordData.length > 0) {
            recordData = recordData[0]
        } else {
            return NextResponse.json({ message: "没有对应的申请数据" }, { status: 400 })
        }

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (user) {
            if (user.id === (recordData as unknown as Record).user_id) {
                return NextResponse.json({ message: "不能审核自己的申请" }, { status: 400 })
            }
            const { data, error } = await supabase
                .from('records')
                .update({
                    comment,
                    result,
                    reward_digest,
                    check_date: new Date().toISOString().toLocaleString(),
                })
                .eq('id', id)
                .select()
            if (error) {
                throw error
            }
            return NextResponse.json({ message: "审核提交成功", record: data }, { status: 200 })
        } else {
            throw new Error('请先登录')
        }
    } catch (error) {
        console.error("审核提交失败:", error)
        return NextResponse.json({ error: "审核提交失败" }, { status: 500 })
    }
}