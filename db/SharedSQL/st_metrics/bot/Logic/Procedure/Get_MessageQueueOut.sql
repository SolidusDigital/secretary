create or alter procedure bot.Get_MessageQueueOut
-- declare
    @run_limit int = 10000
as
begin
    drop table if exists #message_queue_out

    select
        top (@run_limit)
        message_queue_out_id, request_code, message, load_status, group_id, user_id, message_queue_in_id, response_raw_id, message_code
        , 'MESSAGE_QUEUE_OUT' request_type
    into #message_queue_out
    from bot.message_queue_out
    where load_status in ('NEW')
    order by message_queue_out_id

    select *
    from #message_queue_out

--     update a set load_status = 'SENT'
--     from bot.message_queue_out a
--     join #message_queue_out b on a.message_queue_out_id = b.message_queue_out_id
end

go

exec bot.Get_MessageQueueOut
