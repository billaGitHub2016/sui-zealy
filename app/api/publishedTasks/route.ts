import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('body = ', body)
        
        const supabase = createPagesBrowserClient({ supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY });

        const builder = supabase.rpc('get_published_tasks')
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