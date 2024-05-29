-- create schema bot
go
declare @script_num varchar(10) = 'X' + '001'
declare
	@start_message varchar(100) =  @script_num + ': messages'

print @start_message

begin transaction
begin try
begin

    drop table if exists bot.message_queue_out
    drop table if exists bot.message_queue_in
    create table bot.message_queue_in (
        message_queue_in_id bigint not null primary key identity,
        request_code varchar(100) not null default newid(),
        message nvarchar(max) not null,
        load_status varchar(100) not null default 'NEW',
        group_id varchar(100) null,
        user_id varchar(100) null,
        response_raw_id bigint references dbo.response_raw,
        inserted_date datetime2 not null default getdate(),
        updated_date datetime2 not null default getdate()

    )

    create table bot.message_queue_out (
        message_queue_out_id bigint not null primary key identity,
        request_code varchar(100) not null default newid(),
        message nvarchar(max) not null,
        load_status varchar(100) not null default 'NEW',
        group_id varchar(100) null,
        user_id varchar(100) null,
        message_queue_in_id bigint null references bot.message_queue_in,
        response_raw_id bigint references dbo.response_raw,
        inserted_date datetime2 not null default getdate(),
        updated_date datetime2 not null default getdate()
    )

    alter table bot.message_queue_out add message_code varchar(100) not null default newid()
end


insert into dbo.script_log(name)
select *
from (values (@script_num)) t (name)
where name not in (select name from dbo.script_log l)


commit
print @script_num +  ' OK'
end try
begin catch
	rollback
	;throw
end catch




