import { NextResponse } from "next/server";
import { join } from "path";
import { writeFile } from "fs/promises";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const supabase = createRouteHandlerClient({ cookies });

        const builder = supabase.from('records')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
        if (body.user_id) {
            builder.eq('user_id', body.user_id)
        }
        const pageSize = body.pageSize || 10
        if (body.pageNo) {
            builder.range((body.pageNo - 1) * pageSize, body.pageNo * pageSize)
        }
        const { data: records, error, count } = await builder;

        if (error) {
            throw error
        }

        return NextResponse.json({ message: "ok", data: {
            list: records,
            pageNo: body.pageNo || 1,
            pageSize,
            total: count
        } }, { status: 200 })
    } catch (error) {
        console.error("查询申请记录失败:", error)
        return NextResponse.json({ error: "查询申请记录失败" }, { status: 500 })
    }
}
