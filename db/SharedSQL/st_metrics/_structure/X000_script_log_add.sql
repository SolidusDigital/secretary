if not exists(select * from sys.databases where name = 'st_metrics')
	create database st_metrics
go
use st_metrics
go

declare @script_num varchar(10) = 'X' + '000'
declare
	@start_message varchar(100) =  @script_num + ': creation of table dbo.script_log'

print @start_message

begin transaction
begin try


create table dbo.script_log (
	script_log_id integer        not null constraint [PK_script_log] primary key identity,
	name          varchar(250)   not null,
	inserted_date datetimeoffset not null default sysutcdatetime()
);

create unique index [UX_Name] on dbo.script_log (name)

drop table if exists dbo.dba_proc_error
create table dbo.dba_proc_error
(
    dba_proc_error_id int identity
        constraint PK_dba_proc_error
            primary key
                with (fillfactor = 80),
    proc_name         varchar(100),
    internal_error    varchar(1000),
    insert_date       datetime                              not null,
    error_number      int,
    error_severity    int,
    error_state       int,
    error_procedure   nvarchar(128),
    error_line        int,
    error_message     nvarchar(4000),
    handled_flag      bit
        constraint DF_dba_proc_error_handled_flag default 0 not null,
    job_step_id       int,
    sql_statement     nvarchar(max),
    trace_log         nvarchar(max)
)

begin
drop table if exists dbo.response_raw
create table dbo.response_raw
(
    response_raw_id bigint identity
        constraint PK_response_raw2
            primary key,
    raw_response    nvarchar(max)                  not null,
    load_status     varchar(50) default 'NEW'     not null,
    request         nvarchar(max),
    response        nvarchar(max),
    inserted_date   datetime2   default getdate() not null,
    request_type    varchar(100)                  not null,
    request_id      varchar(100),
)

create index IX_LoadStatus_NEW
    on dbo.response_raw (load_status) include (request_type, request_id)
    where [load_status] = 'NEW'


create index IX_RequestType
    on dbo.response_raw (request_type) include (load_status, request_id)

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




