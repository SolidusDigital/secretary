create or alter procedure dbo.Process_ResponseRaw
-- declare
    @run_limit int = 10000
  , @is_debug bit = 0
as
begin

	-- timing and init
	begin
	    set nocount on;
		set @is_debug = isnull(@is_debug, 0);
		set @run_limit = isnull(@run_limit, 10000);
	end

	-- temp tables creation
    begin
        drop table if exists #response_raw;
        drop table if exists #request;
        drop table if exists #response;


        create table #response_raw
        (
            response_raw_id int not null primary key
          , request_type varchar(50) not null
          , response_date datetime2(0) not null
          , request_json nvarchar(max) null
          , response_json nvarchar(max) null
          , raw_response nvarchar(max) null
          , request_code varchar(100) null
        );

        create table #request
        (
            id int not null identity(1, 1) primary key
          , response_raw_id int not null
          , request_type varchar(50) not null
          , [action] varchar(100) null
          , request_name varchar(100) null
          , retailer_code varchar(100) null
          , request_id int null
          , store_num varchar(10) null
          , width varchar(100) null
          , ratio varchar(100) null
          , radius varchar(100) null
          , diameter varchar(100) null
          , link varchar(500) null
        );

        create nonclustered index [IX_ResponseRawIdRequestType]
		on #request (response_raw_id, request_type);

        create nonclustered index [IX_ResponseRawIdWidthRatioDiameter]
		on #request (response_raw_id, width, ratio, diameter);

        create nonclustered index [IX_RequestIdRequestType]
		on #request (request_id, request_type);

        create table #response
        (
            id int not null identity(1, 1) primary key
           , response_raw_id int not null
           , request_type                  varchar(100)
           , db_name                       varchar(100)  null
           , backup_path                   varchar(1000) null
           , diff_cron_schedule            varchar(100)  null
           , backup_diff_on_start          bit           null
           , service_mode                  varchar(100)  null
           , db_names_to_restore_or_backup varchar(1000) null
           , db_target                     varchar(100)
           , final_path                    varchar(1000)
           , full_backup_exists            bit
           , next_run_time                 datetime2
           , full_back_up_flag             bit
           , operation_success             bit
           , request_code                  varchar(100)
           , inserted_date                 datetime2     not null default getdate()
           , updated_date                  datetime2     not null default getdate()
           , operation_error               varchar(4000) null
        );
        create nonclustered index [IX_ResponseRawIdRequestType]
        on #response (response_raw_id, request_type);
    end;

    --------------------------------------------------------
    -- load temp tables
    --------------------------------------------------------
begin


    if @is_debug = 1
    begin
        insert into #response_raw(response_raw_id, request_type, response_date, request_json, response_json, raw_response, request_code)
        select
            top (@run_limit)
               response_raw_id
             , request_type
             , inserted_date as response_date
             , request       as request_json
             , response      as response_json
             , raw_response
             , request_id    as request_code
        from dbo.response_raw r
        where request_type in ('BACKUP', 'RESTORE')
--         and response_raw_id = 1117
        order by
            response_raw_id
    end;
    else
    begin
        insert into #response_raw(response_raw_id, request_type, response_date, request_json, response_json, raw_response, request_code)
        select top (@run_limit)
               response_raw_id
             , request_type
             , inserted_date [response_date]
             , request       [request_json]
             , response      [response_json]
             , raw_response
             , request_id     request_code
        from dbo.response_raw
        where load_status = 'NEW'
        and request_type in ('BACKUP', 'RESTORE')
        order by response_raw_id

    end;


end

end

if exists(select * from #response_raw where request_type in ('BACKUP', 'RESTORE'))
begin
    insert into #response (response_raw_id, request_type, db_name, backup_path, diff_cron_schedule, backup_diff_on_start, service_mode, db_names_to_restore_or_backup, db_target, final_path, full_backup_exists, next_run_time, full_back_up_flag, operation_success, request_code, operation_error )
    select r.response_raw_id, r.request_type, db_name, backup_path, diff_cron_schedule, backup_diff_on_start, service_mode, db_names_to_restore_or_backup, db_target, final_path, full_backup_exists, next_run_time, full_back_up_flag, operation_success, r.request_code, operation_error
    from #response_raw r
    cross apply
    (
        select x.db_name,
               x.backup_path,
               x.diff_cron_schedule,
               x.backup_diff_on_start,
               x.service_mode,
               x.db_names_to_restore_or_backup,
               x.db_target,
               x.final_path,
               x.full_backup_exists,
               x.next_run_time,
               x.full_back_up_flag,
               x.operation_success,
               x.request_code,
               x.operation_error
        from
            openjson(r.raw_response)
            with
            (
                db_name varchar(100) '$.db_name'
              , backup_path varchar(1000) '$.backup_path'
              , diff_cron_schedule varchar(100) '$.diff_cron_schedule'
              , backup_diff_on_start bit '$.backup_diff_on_start'
              , service_mode varchar(100) '$.service_mode'
              , db_names_to_restore_or_backup nvarchar(max) '$.db_names_to_restore_or_backup' as JSON
              , db_target varchar(100) '$.db_target'
              , final_path varchar(100) '$.final_path'
              , full_backup_exists bit '$.full_backup_exists'
              , next_run_time datetime2 '$.next_run_time'
              , full_back_up_flag bit '$.full_back_up_flag'
              , operation_success bit '$.operation_success'
              , request_code bit '$.request_code'
              , operation_error varchar(4000) '$.operation_error'
            ) x

    )                  j

    where r.request_type in ('BACKUP', 'RESTORE')
    and not exists(select * from #response rr where rr.response_raw_id = r.response_raw_id)
end


begin
    insert into dbo.recovery_service (db_name, backup_path, diff_cron_schedule, backup_diff_on_start, service_mode, db_names_to_restore_or_backup, db_target, final_path, full_backup_exists, next_run_time, full_back_up_flag, operation_success, request_type, response_raw_id, operation_error, request_code)
    select db_name, backup_path, diff_cron_schedule, backup_diff_on_start, service_mode, db_names_to_restore_or_backup, db_target, final_path, full_backup_exists, next_run_time, full_back_up_flag, operation_success, request_type, response_raw_id, operation_error, request_code
    from #response r
    where request_type in ('RESTORE', 'BACKUP')
    and not exists(select * from dbo.recovery_service rs where rs.response_raw_id = r.response_raw_id)
end


begin
    update a set load_status = 'LOADED'
    from #response_raw b
    join dbo.response_raw a on a.response_raw_id = b.response_raw_id
    where exists(select * from #response c where c.response_raw_id = a.response_raw_id)
end

go


go


select *
-- update r set load_status = 'NEW'
from dbo.recovery_service r

-- truncate table dbo.recovery_service

select *
-- from dbo.recovery_service r
-- update r set load_status = 'NEW'
from dbo.response_raw r
-- where request_type = 'RESTORE'
-- where response_raw_id =  1117
-- order by response_raw_id desc
