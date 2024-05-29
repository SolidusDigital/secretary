import DbApi as DbApi2
import Definitions as Definitions2


import asyncio
import json
import sys
import concurrent.futures
import functools
import requests
import datetime
from requests import Session
import backoff


DbApi2.st_file_db_name = Definitions2.METRICS_DB
db_metrics = DbApi2.Connection()

db_metrics2 = DbApi2.Connection()

SqlInsert = DbApi2.SqlInsert(connection=db_metrics)
SqlSelect = DbApi2.SqlSelect(connection=db_metrics2)



def debug(msg):
    print(msg, flush=True)

debug('starting SQL Connection')


async def write_to_db(data, conn_db):
    SqlInsert = DbApi2.SqlInsert(connection=conn_db)
    debug('Started SQL Write')
    SqlInsert.Write_ReponseRaw_MetricsDB(data)
    debug('Finished SQL Write')



@backoff.on_exception(backoff.expo, ValueError, max_time=3)
async def Get_MainMessageQueue():
    try:
        while True:
            debug('start Get_MainMessageQueue')
            default_sleep_sec = 10
            current_sleep_sec = 0

            sql_tuple = SqlSelect.Get_MainMessageQueue()
            if sql_tuple[0]:
                raise ValueError(f'Query Error:{sql_tuple[1]}')
            data = sql_tuple[1]

            if data and len(data) > 0:
                await execute_coroutines_message_queue(data)

            else:
                current_sleep_sec = default_sleep_sec
            debug('ending Get_MainMessageQueue')
            await asyncio.sleep(current_sleep_sec)
    except Exception as e:
            debug(e)
            raise e
        

def is_json(myjson):
  try:
    json_object = json.loads(myjson)
  except ValueError as e:
    return False
  return True



def escape_markdown_v2(text):
    escape_chars = '_*[]()~`>#+-=|{}.!'
    return ''.join(['\\' + char if char in escape_chars else char for char in text])


@backoff.on_exception(backoff.expo, Exception, max_time=30)
async def SendMessage(data, **kwargs):
    headers = {"Accept": "application/json", "Content-Type": "application/x-www-form-urlencoded", 'Accept-Encoding':'gzip, deflate, br'}
    request_code = data['message_code']
    request_type = data['request_type']
    message = data['message']
    message_header =json.loads(message).pop('message_header')
    
    message_to_send = message
    disable_notification = data.get('disable_notification', True)
    
    
    s = requests.Session()
     
    if is_json(message_to_send):
        # Escape MarkdownV2 special characters here if necessary
        message_to_send = json.loads(message_to_send)  # Assuming message needs to be a JSON string
        del message_to_send['message_header']  # Assuming message needs to be a JSON string
        
        message_to_send = json.dumps(message_to_send, indent=4)  # Assuming message needs to be a JSON string
        message_to_send = escape_markdown_v2(message_to_send)
        
        message_to_send = f'```\n{message_to_send}\n```'
    
    if message_header:
        message_header = escape_markdown_v2(message_header)
        message_to_send = f'*{message_header}*\n\n {message_to_send}'
    
    if '❗' in message_to_send:
        disable_notification = False
        
    # Ensure 'chat_id' is correctly determined from 'group_id' or 'user_id'
    chat_id = data.get('group_id') or data.get('user_id')
    
    params = {
        'chat_id': chat_id,
        'text': message_to_send,
        'parse_mode': 'MarkdownV2' if is_json(data['message']) else None,
        'disable_notification': disable_notification,
    }
    
    if request_type == 'MESSAGE_QUEUE_OUT':
        url = f'https://api.telegram.org/{Definitions2.SEARCHTIRES_TG_BOT_KEY}/sendMessage'
        req = requests.Request(method='POST', url=url, headers=headers, data=params)

        r = req.prepare()
        response_code = None
        resp = s.send(r)        
        response_code = resp.status_code
        try:
            resp_json = resp.json()
        except Exception as e:
            print("Failed to decode JSON:", e)
            resp_json = resp.text
        if response_code == 429:
            retry_after = resp_json.get('parameters').get('retry_after')
            debug(f"Rate limit exceeded: {retry_after}")
            raise RateLimitExceeded(f"Rate limit exceeded: {retry_after}", wait=retry_after)
        to_db = {
            "request": data,
            "response": resp_json,
            "response_code": response_code,
            "request_type": request_type,
            "request_id": request_code,
        }
        to_db_json = json.dumps(to_db)
        # Ensure your DB writing mechanism supports async or is appropriately handled in sync context
        db_conn2 = DbApi2.Connection()  # Ensure DbApi2 supports async or is appropriately handled
        
        await write_to_db(to_db_json, db_conn2)

    # Assuming debug is an existing function that supports the data format
    debug(resp_json)
    return resp_json

class RateLimitExceeded(Exception):
    def __init__(self, message, wait):
        super().__init__(message)
        self.wait = wait


def synchronous_get_main_message_queue(data):
    return asyncio.run(SendMessage(data))


async def execute_coroutines_message_queue(data):
    loop = asyncio.get_event_loop()
    max_workers = 2

    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        coroutines = []

        for record in data:
            partial_get_append_req_response = functools.partial(
                synchronous_get_main_message_queue,
                record
            )

            # Append the wrapper function to the list
            coroutines.append(partial_get_append_req_response)

        await asyncio.gather(
            *[loop.run_in_executor(executor, coroutine) for coroutine in coroutines]
        )
        debug('Ended SendMessage')



if __name__ == '__main__':
    try:
        # time.sleep(random.randint(1,10))
        asyncio.ensure_future(Get_MainMessageQueue())
        asyncio.get_event_loop().run_forever()
    except Exception as e:
        print('ERROR EXPLODED')
        print(e)
        sys.exit()

