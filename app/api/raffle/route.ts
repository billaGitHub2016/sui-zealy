import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const supabase = createRouteHandlerClient({ cookies });
        const winnerRecord = body.winnerRecord;

        const { error } = await supabase
            .from('records')
            .update({
                raffle_date: new Date().toISOString(),
                is_winner: true,
                reward_digest: winnerRecord.reward_digest
            })
            .eq('record_address', winnerRecord.record_address)
            .select()

        const { data: task, error: taskError } = await supabase.from('tasks').select('id').eq('address', winnerRecord.task_address)
        console.log('match task = ', task)
        if (task && task.length > 0) {
            const { data: otherRecords } = await supabase.from('records').select('id').eq('id', task[0].id).neq('record_address', winnerRecord.record_address)
            console.log('otherRecords = ', otherRecords)
            if (otherRecords && otherRecords.length > 0) {
                await supabase.from('records').update({
                    raffle_date: new Date().toISOString(),
                    is_winner: false,
                    reward_digest: winnerRecord.reward_digest
                }).in('id', otherRecords.map(record => record.id))
            }
        }

        if (error || taskError) {
            throw error
        }

        return NextResponse.json({
            message: "ok"
        }, { status: 200 })
    } catch (error) {
        console.error("更新中奖记录失败:", error)
        return NextResponse.json({ error: "更新中奖记录失败" }, { status: 500 })
    }
}