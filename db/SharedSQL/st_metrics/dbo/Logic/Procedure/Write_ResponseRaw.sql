create or alter procedure dbo.Write_ResponseRaw @input_data nvarchar(max)
as
begin
    set nocount on;

    declare @request_code      varchar(100)
          , @response_raw_id int
          , @request_type    varchar(100)
          , @error           varchar(1000)
          , @request         nvarchar(max)
          , @response        nvarchar(max)
          , @request_status  varchar(50) = 'RESPONSE_RECEIVED'
          , @load_status     varchar(50) = 'NEW'
          , @response_code   varchar(50) = 'NEW'
          , @file_path       varchar(500)

    set @request_type = coalesce(
        json_value(@input_data, '$.request.request_type')
        , json_value(@input_data, '$.request_type')
        );

    if @request_type is null
        set @error = concat('request_type is null; ', @error);

    set @request = json_query(@input_data, '$.request');
    set @response = json_query(@input_data, '$.response');
    set @response_code = json_value(@input_data, '$.response_code');

    --------------------------------------------------------------------
    begin
        set @request_code = coalesce(json_value(@input_data, '$.request_id'), json_value(@input_data, '$.request_code'));

        if @request_code is null
            set @error = concat('request_id is null; ', @error);

        if @response_code = 200
            set @request_status = 'RESPONSE_RECEIVED';
        else
            set @request_status = 'ERROR';
    end;

    if @error is not null
        throw 50000, @error, 1;

    --------------------------------------------------------------------
    insert into dbo.response_raw
    (
        raw_response
      , load_status
      , request
      , response
      , request_type
      , request_id
    )
    select @input_data  as raw_response
         , @load_status
         , @request
         , @response
         , @request_type
         , @request_code

    set @response_raw_id = scope_identity();

    if @request_type in ('MESSAGE_QUEUE_OUT')
    begin
        update bot.message_queue_out
        set response_raw_id = @response_raw_id
          , load_status = @request_status
          , updated_date = getdate()
        where message_code = @request_code;
    end;



end;
go

