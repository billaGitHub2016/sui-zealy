export type Record = {
    id: number
    desc: string
    attachments: string[] | null
    created_at: string
    wallet_address: string | null
    user_id: string
    task_id: string
    result: number
    check_date: string | null
    comment: string | null
    record_address: string | null
    reward_digest: string | null
    is_winner: boolean
    raffle_date: string | null
}