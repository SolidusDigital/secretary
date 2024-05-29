create or alter procedure bot.Write_MessageQueueOut
-- declare
    @run_limit int = 10000
as
begin
    drop table if exists #recovery_service
    select
        top (@run_limit)
        recovery_service_id,
        request_code,
           (select operation_success
                 , operation_error
                 , db_name
                 , request_code
                 , final_path
                 , next_run_time
                 , request_type
                 , inserted_date
                 , concat(case operation_success when 0 then N'❗' end, request_type, ' [', db_name , '] DataBase',  ' Operation Result: ', case operation_success when 0 then N'__FAIL__' else 'Ok' end, case operation_success when 0 then N'❗' end) message_header
            for json path, without_array_wrapper) message,
           load_status,
           '-1002060007999'                          group_id,
           null                                   user_id,
           response_raw_id

    into #recovery_service
    from dbo.recovery_service rs
    where rs.load_status = 'NEW'
    and db_name not in ('test')

    insert into bot.message_queue_out (message, group_id, user_id, response_raw_id)
    select message, group_id, user_id, response_raw_id
    from #recovery_service a
    where not exists(select * from bot.message_queue_out b where a.request_code = b.request_code)

    update a set load_status = 'MESSAGE_QUEUED'
    from #recovery_service b
    join dbo.recovery_service a on a.recovery_service_id = b.recovery_service_id

end

go

-- select *
-- from dbo.recovery_service w
-- where db_name not in ('test')
-- and service_mode not in ('BACKUP')
-- order by 1 desc