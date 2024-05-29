create or alter procedure [dbo].[dba_InsertProcError]
    @ProcName varchar(100) = null
  , @InternalError varchar(1000) = null
  , @RaiseErrorFlag bit = 0
  , @sql_statement nvarchar(max) = null
  , @trace_log nvarchar(max) = null
as
begin
    set nocount on;
    insert into dbo.dba_proc_error
    (
        proc_name
      , internal_error
      , insert_date
      , error_number
      , error_severity
      , error_state
      , error_procedure
      , error_line
      , error_message
      , sql_statement
      , trace_log
    )
    select @ProcName         ProcName
         , @InternalError    InternalError
         , getdate()         InsertDate
         , error_number()    ErrorNumber
         , error_severity()  ErrorSeverity
         , error_state()     ErrorState
         , error_procedure() ErrorProcedure
         , error_line()      ErrorLine
         , error_message()   ErrorMessage
         , @sql_statement
         , @trace_log;
    if @RaiseErrorFlag = 1
    begin
        declare @ErrorMessage  varchar(2000) = error_message()
              , @ErrorSeverity int           = error_severity()
              , @ErrorNumber   int           = error_number();
        raiserror(@ErrorMessage, @ErrorSeverity, @ErrorNumber);
    end;
end;
go