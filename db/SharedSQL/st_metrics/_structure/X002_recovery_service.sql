-- create schema bot
go
declare @script_num varchar(10) = 'X' + '002'
declare
	@start_message varchar(100) =  @script_num + ': messages'

print @start_message

begin transaction
begin try
begin
    drop table if exists dbo.recovery_service
    create table dbo.recovery_service
    (
        recovery_service_id           int           not null identity primary key,
        load_status                   varchar(100)  not null default 'NEW',
        db_name                       varchar(100)  null,
        backup_path                   varchar(1000) null,
        diff_cron_schedule            varchar(100)  null,
        backup_diff_on_start          bit           null,
        service_mode                  varchar(100)  null,
        db_names_to_restore_or_backup varchar(1000) null,
        db_target                     varchar(100),
        final_path                    varchar(1000),
        full_backup_exists            bit,
        next_run_time                 datetime2,
        full_back_up_flag             bit,
        operation_success             bit,
        request_type                  varchar(100),
        inserted_date                 datetime2     not null default getdate(),
        updated_date                  datetime2     not null default getdate(),
        response_raw_id               bigint        not null,
        operation_error               varchar(4000) null,
        request_code                  varchar(100)  not null default newid()

    )

    create index IX_LoadStatus on dbo.recovery_service (load_status) include (response_raw_id, request_type, request_code)
end



insert into dbo.script_log(name)
values (@script_num)

commit
print @script_num +  ' OK'
end try
begin catch
	rollback
	;throw
end catch




