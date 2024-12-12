export type Task = {
    address: string | null
    attachments: string[] | null
    claim_limit: number | null
    created_at: string
    desc: string | null
    end_date: string | null
    id: number
    name: string | null
    owner_address: string | null
    pool: number | null
    reward_method: number | null
    start_date: string | null
    status: number | null
    publish_date: string | null
    user_id: string
    record_count?: number | null
    record_pass_count?: number | null
    task_admin_cap_address?: string | null
}