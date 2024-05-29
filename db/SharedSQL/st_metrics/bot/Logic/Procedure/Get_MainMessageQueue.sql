create or alter procedure bot.Get_MainMessageQueue
-- declare
    @run_limit int = 10000
as
set nocount on;
begin

    exec bot.Write_MessageQueueOut
    exec dbo.Process_ResponseRaw
    exec bot.Get_MessageQueueOut
end

go

