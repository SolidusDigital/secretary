import asyncio
from pathlib import Path
from time import sleep
import websockets
import json 
import DbApi
from decimal import Decimal
from asyncio import Queue


response_queue = Queue()


async def add_response_to_queue(response):
    await response_queue.put(response)

def debug(msg):
    print(msg, flush=True)

#********* DB Initialization **************
debug('Starting SQL DB Connection...')
db_conn = DbApi.Connection.instance()
db_conn2 = DbApi.Connection()
SqlInsert = DbApi.SqlInsert(connection=db_conn)
SqlSelect = DbApi.SqlSelect(connection=db_conn)
SqlProcess = DbApi.SqlSelect(connection=db_conn2)
DEBUG_FLAG = 1
sleep_cnt = 0
debug('SQL DB connected')

scrapper_call = None
scrapper_call_count = 1
MAX_CALL_COUNT = 10000000
ROW_LIMIT = 300
RETAILER_CODE = None
# RETAILER_CODE = 'BELLETIRE'
TEST_QUERY = None
# TEST_QUERY = 'belletire'


def remove_exponent(d):
    return d.quantize(Decimal(1)) if d == d.to_integral() else d.normalize()
class MyJSONEncoder(json.JSONEncoder):

    def default(self, obj):
        if isinstance(obj, Decimal):
            # Convert decimal instances to strings.
            return str(remove_exponent(obj))
        return super(MyJSONEncoder, self).default(obj)


async def Process_ResponseRaw ():
    debug('Process_ResponseRaw started')
    SqlProcess.Process_ResponseRaw()
    debug('Process_ResponseRaw ended')


def build_task_item(retailer_code, request_type, **kwargs):
    """ Build item for  """
    
    res = []
    if request_type == "GetInventory":
        zip_code = kwargs['zip_code']
        store_num = kwargs['store_num']
        width = kwargs['width']
        ratio = kwargs['ratio']
        diameter = kwargs['diameter']
        sku_key = kwargs.get('sku_key')
        extra_params = kwargs.get('extra_params')
    elif request_type == "GetProductDetails":
        sku = kwargs['sku']
    elif request_type == "GetStores":
        zip_code = kwargs['zip_code']
        latitude = kwargs['latitude']
        longitude = kwargs['longitude']
    
    if request_type == 'GET_LAT_LONG':
        full_address = kwargs['full_address']
        res = [
            {"action": "method", "name": "GetLatLong", "retailer_code": retailer_code, "request_type" : request_type , "args": {"full_address": full_address}},
            ]

    if request_type == 'GetReview':
        review_location = kwargs['review_location']
        res = [
            {"action": "method", "name": "GetReviews", "retailer_code": retailer_code, "request_type" : request_type , "args": {"review_location": review_location, "retailer_key": retailer_code}},
            ]

        
    elif retailer_code == 'TIREKINGDOM':
        if request_type == "GetInventory":
            res = [
            {"action": "method", "name": "GetTireKingdomInventory", "retailer_code": retailer_code, "request_type" : request_type , "args": {"store_num": store_num, "width": width, "radius": ratio, "diameter": diameter}},
            ]
        elif request_type == "GetProductDetails": 
            res = [
            {"action": "method", "name": "GetTireKingdomProductDetails", "request_type" : request_type,  "retailer_code": retailer_code, "args": {"sku": sku }},
            ]  
        elif request_type == "GetStores": 
            res = [
            {"action": "method", "name": "GetTireKingdomStores", "request_type" : request_type,  "retailer_code": retailer_code, 
                "args": {"zip_code": zip_code, "latitude": latitude, "longitude": longitude }},
            ]  
        else:
            raise Exception("Invalid Request Type: " + request_type)
    elif retailer_code == 'MIDAS':
        if request_type == "GetInventory":
            res = [
            {"action": "method", "name": "GetMidasInventory", "retailer_code": retailer_code, "request_type" : request_type , "args": {"store_num": store_num, "width": width, "radius": ratio, "diameter": diameter}},
            ]
        elif request_type == "GetProductDetails":
            res = [
            {"action": "method", "name": "GetMidasProductDetails", "request_type" : request_type,  "retailer_code": retailer_code, "args": {"sku": sku }},
            ]
        elif request_type == "GetStores":
            res = [
            {"action": "method", "name": "GetMidasStores", "request_type": request_type,  "retailer_code": retailer_code,
                "args": {"zip_code": zip_code}},
            ]
        else:
            raise Exception("Invalid Request Type: " + request_type)
    elif retailer_code == 'NTB':
        if request_type == "GetInventory":
            res = [
            {"action": "method", "name": "GetNtbInventory", "retailer_code": retailer_code, "request_type" : request_type , "args": {"store_num": store_num, "width": width, "radius": ratio, "diameter": diameter}},
            ]
        elif request_type == "GetProductDetails": 
            res = [
            {"action": "method", "name": "GetNtbProductDetails", "request_type" : request_type,  "retailer_code": retailer_code, "args": {"sku": sku }},
            ]  
        elif request_type == "GetStores": 
            res = [
            {"action": "method", "name": "GetNtbStores", "request_type" : request_type,  "retailer_code": retailer_code, 
                "args": {"zip_code": zip_code, "latitude": latitude, "longitude": longitude }},
            ]  
        else:
            raise Exception("Invalid Request Type: " + request_type)
    elif retailer_code == 'BIGOTIRES':
        if request_type == "GetInventory":
            res = [
            {"action": "method", "name": "GetBigOTiresInventory", "retailer_code": retailer_code, "request_type" : request_type , "args": {"store_num": store_num, "width": width, "radius": ratio, "diameter": diameter}},
            ]
        elif request_type == "GetStores": 
            res = [
            {"action": "method", "name": "GetBigOTiresStores", "request_type" : request_type,  "retailer_code": retailer_code, 
                "args": {"zip_code": zip_code, "latitude": latitude, "longitude": longitude }},
            ]  
        else:
            raise Exception("Invalid Request Type: " + request_type)
    elif retailer_code == 'PEPBOYS':
        if request_type == "GetInventory":
            res = [
            {"action": "method", "name": "GetPepBoysInventory", "retailer_code": retailer_code, "request_type" : request_type , "args": {"store_num": store_num, "width": width, "radius": ratio, "diameter": diameter}},
            ]
        elif request_type == "GetStores": 
            res = [
            {"action": "method", "name": "GetPepboysStores", "request_type" : request_type,  "retailer_code": retailer_code, 
                "args": {"zip_code": zip_code, "latitude": latitude, "longitude": longitude }},
            ]  
        elif request_type == "GetProductDetails": 
            link = kwargs['link']
            res = [
            {"action": "method", "name": "GetPepBoysProductDetails", "request_type" : request_type,  "retailer_code": retailer_code, "args": {"link": link }},
            ]  
        else:
            raise Exception("Invalid Request Type: " + request_type)
    elif retailer_code == 'DISCOUNTTIRE':
        if request_type == "GetInventory":
            res = [
            {
                "action": "method", "name": "GetDiscountTireInventory", "retailer_code": retailer_code, "request_type" : request_type , "args": 
                {
                    "store_num": store_num
                 , "width": width
                 , "radius": ratio
                 , "diameter": diameter
                 , "zip_code": zip_code
                 , "sku_key": sku_key
                 , "extra_params": extra_params
                 }
            },
            ]
        if request_type == 'GetStores':
            res = [
            {"action": "method", "name": "GetDiscountTireStores", "request_type" : request_type,  "retailer_code": retailer_code, 
                "args": {"zip_code": zip_code, "latitude": latitude, "longitude": longitude }},            ]
    elif retailer_code == 'AMERICASTIRE':
        if request_type == "GetInventory":
            res = [
            {"action": "method", "name": "GetAmericasTireInventory", "retailer_code": retailer_code, "request_type" : request_type , "args": {"store_num": store_num, "width": width, "radius": ratio, "diameter": diameter}},
            ]
    elif retailer_code == 'TIRERACK':
        if request_type == "GetInventory":
            res = [
            {"action": "method", "name": "GetTireRackInventory", "retailer_code": retailer_code, "request_type" : request_type , "args": {"zip_code": zip_code, "width": width, "radius": ratio, "diameter": diameter}},
            ]
    elif retailer_code == 'FIRESTONE':
        if request_type == "GetInventory":
            res = [
            {"action": "method", "name": "GetFirestoneInventory", "retailer_code": retailer_code, "request_type" : request_type , "args": {"store_num": store_num, "width": width, "radius": ratio, "diameter": diameter}},
            ]
        elif request_type == "GetProductDetails": 
            width = kwargs['width']
            diameter = kwargs['diameter']
            radius = kwargs['radius']
            res = [
            {"action": "method", "name": "GetFirestoneProductDetails", "request_type" : request_type,  "retailer_code": retailer_code, 
                "args": {"width": width, "radius": radius, "diameter": diameter }},
            ]  
        elif request_type == "GetStores": 
            res = [
            {"action": "method", "name": "GetFirestoneStores", "request_type" : request_type,  "retailer_code": retailer_code, 
                "args": {"zip_code": zip_code, "latitude": latitude, "longitude": longitude }},
            ]  
                
    elif retailer_code == 'TIRESPLUS':
        if request_type == "GetInventory":
            res = [
            {"action": "method", "name": "GetTiresPlusInventory", "retailer_code": retailer_code, "request_type" : request_type , "args": {"store_num": store_num, "width": width, "radius": ratio, "diameter": diameter}},
            ]
        elif request_type == "GetProductDetails": 
            width = kwargs['width']
            diameter = kwargs['diameter']
            radius = kwargs['radius']
            res = [
            {"action": "method", "name": "GetTiresPlusProductDetails", "request_type" : request_type,  "retailer_code": retailer_code, 
                "args": {"width": width, "radius": radius, "diameter": diameter }},
            ]  
        elif request_type == "GetStores": 
            res = [
            {"action": "method", "name": "GetTiresPlusStores", "request_type" : request_type,  "retailer_code": retailer_code, 
                "args": {"zip_code": zip_code, "latitude": latitude, "longitude": longitude }},
            ]  

    elif retailer_code == 'GOODYEAR':
        if request_type == "GetInventory":
            res = [
            {"action": "method", "name": "GetGoodYearInventory", "retailer_code": retailer_code, "request_type" : request_type , "args": {"store_num": store_num, "width": width, "radius": ratio, "diameter": diameter}},
            ]
        elif request_type == "GetStores": 
            res = [
            {"action": "method", "name": "GetGoodYearStores", "request_type" : request_type,  "retailer_code": retailer_code, 
                "args": {"zip_code": zip_code, "latitude": latitude, "longitude": longitude }},
            ]  
    elif retailer_code == 'WALMART':
        if request_type == "GetInventory":
            res = [
            {"action": "method", "name": "GetWalmartInventory", "retailer_code": retailer_code, "request_type" : request_type , "args": {"store_num": store_num, "width": width, "radius": ratio, "diameter": diameter, "zip_code": zip_code}},
            ]
        elif request_type == "GetProductDetails": 
            link = kwargs['link']
            res = [
            {"action": "method", "name": "GetWalmartProductDetails", "request_type" : request_type,  "retailer_code": retailer_code, "args": {"link": link }},
            ]  
        elif request_type == "GetStores": 
            res = [
            {"action": "method", "name": "GetWalmartStores", "request_type" : request_type,  "retailer_code": retailer_code, 
                "args": {"zip_code": zip_code, "latitude": latitude, "longitude": longitude }},
            ]  
    elif retailer_code == 'MAVIS':
        if request_type == "GetInventory":
            res = [
            {"action": "method", "name": "GetMavisInventory", "retailer_code": retailer_code, "request_type" : request_type , "args": {"store_num": store_num, "width": width, "radius": ratio, "diameter": diameter, "zip_code": zip_code}},
            ]
        elif request_type == "GetStores": 
            res = [
            {"action": "method", "name": "GetMavisStores", "request_type" : request_type,  "retailer_code": retailer_code, 
                "args": {"zip_code": zip_code, "latitude": latitude, "longitude": longitude }},
            ]  
    elif retailer_code == 'TIRECHOICE':
        if request_type == "GetInventory":
            res = [
            {"action": "method", "name": "GetTireChoiceInventory", "retailer_code": retailer_code, "request_type" : request_type , "args": {"store_num": store_num, "width": width, "radius": ratio, "diameter": diameter, "zip_code": zip_code}},
            ]
        elif request_type == "GetStores": 
            res = [
            {"action": "method", "name": "GetTireChoiceStores", "request_type" : request_type,  "retailer_code": retailer_code, 
                "args": {"zip_code": zip_code, "latitude": latitude, "longitude": longitude }},
            ]  
    elif retailer_code == 'MONRO':
        if request_type == "GetInventory":
            res = [
            {"action": "method", "name": "GetMonroInventory", "retailer_code": retailer_code, "request_type" : request_type , "args": {"store_num": store_num, "width": width, "radius": ratio, "diameter": diameter, "zip_code": zip_code}},
            ]
    elif retailer_code == 'COSTCO':
        if request_type == "GetInventory":
            res = [
            {"action": "method", "name": "GetCostcoInventory", "retailer_code": retailer_code, "request_type" : request_type , "args": {"store_num": store_num, "width": width, "radius": ratio, "diameter": diameter, "zip_code": zip_code}},
            ]
    elif retailer_code == 'AMERICANTIREDEPOT':
        if request_type == "GetInventory":
            res = [
            {"action": "method", "name": "GetAmericanTireDepotInventory", "retailer_code": retailer_code, "request_type" : request_type , "args": {"store_num": store_num, "width": width, "radius": ratio, "diameter": diameter, "zip_code": zip_code}},
            ]
    elif retailer_code == 'TIREDISCOUNTERS':
        if request_type == "GetInventory":
            res = [
            {"action": "method", "name": "GetTireDiscountersInventory", "retailer_code": retailer_code, "request_type" : request_type , "args": {"store_num": store_num, "width": width, "radius": ratio, "diameter": diameter, "zip_code": zip_code}},
            ]
        elif request_type == "GetStores": 
            res = [
            {"action": "method", "name": "GetTireDiscountersStores", "request_type" : request_type,  "retailer_code": retailer_code, 
                "args": {"zip_code": zip_code, "latitude": latitude, "longitude": longitude }},
            ]  
        else:
            raise Exception("Invalid Request Type: " + request_type)
    elif retailer_code == 'BELLETIRE':
        if request_type == "GetInventory":
            res = [
            {
                "action": "method", "name": "GetBelleTireInventory", "retailer_code": retailer_code, 
                "request_type" : request_type, 
                "args": {"store_num": store_num, "width": width, "radius": ratio, "diameter": diameter, "zip_code": zip_code}
            },
            ]
        elif request_type == "GetStores": 
            res = [
            {"action": "method", "name": "GetBelletireStores", "request_type" : request_type,  "retailer_code": retailer_code, 
                "args": {"zip_code": zip_code, "latitude": latitude, "longitude": longitude }},
            ]  

        else:
            raise Exception("Invalid Request Type: " + request_type)
    else:
        raise Exception('Unknown retailer code: ' + retailer_code)
    
    return res


def get_task_list():
    global ROW_LIMIT
    global sleep_cnt
    global RETAILER_CODE 
    global TEST_QUERY 

    task_list = []
    sleep_cnt = 0
    while not task_list:
        if TEST_QUERY:
            error, task_list = SqlSelect.test_query(limit=ROW_LIMIT, retailer_key=RETAILER_CODE, query=TEST_QUERY)
        else:
            error, task_list = SqlSelect.get_scrape_queue(limit=ROW_LIMIT, retailer_key=RETAILER_CODE)
            try:
                debug(f'got task list {task_list.count()}')
            except:
                debug('no task retuned')
        if task_list:
            break
        else:
            debug('task_list is empty!!!')
        if RETAILER_CODE:
            debug("get_task_list: retailer_key: " + RETAILER_CODE)
        if sleep_cnt > 60:
            debug('backend deep sleeping')
            sleep(60)
            sleep_cnt = sleep_cnt/2
        else:
            debug(f'sleeping {sleep_cnt}')
            sleep(1)
        sleep_cnt += 1
    sleep_cnt = 0
        
    result_list = []
    for task in task_list:
        retailer_code = task.pop('retailer_key')
        request_type = task.pop('request_type')
        request_id = task.pop('request_id')
        scapper_call = build_task_item(retailer_code = retailer_code, request_type = request_type, **task)
        scapper_call[0]["request_id"] = request_id
        result_list.append(scapper_call[0])
    return result_list


async def process_message(msg, websocket):
    """ Process message. """

    json_msg = None
    global scrapper_call
    global scrapper_call_count
    global MAX_CALL_COUNT
    # print('Read json response...')
    try:
        json_msg = json.loads(msg)
        # print('Success')
    except:
        # print('Error. Not json:', msg[:50]) 
        pass
    
    # Authenticate client with random key AKA READY 
    if msg == "ac1114d771649840a01419c224e4174393653fbbc73385c1d473c52a3c1b43f9": 
        if not scrapper_call:
            scrapper_call = get_task_list()
            scrapper_call_count += 1
        if not scrapper_call or scrapper_call_count > MAX_CALL_COUNT:
            await websocket.send(json.dumps({"action": "shutdown"}))
            await websocket.close()

        task = scrapper_call.pop()
        debug(f'sending task: {task.get("name")}, {task.get("request_id")}')
        retailer_code = task['retailer_code'] 
        # debug(f'sleeping for {retailer_code}')
        if retailer_code == 'PEPBOYS':
            sleep(.800)
        if retailer_code == 'AMERICANTIREDEPOT':
            sleep(1)
        if retailer_code in ('MAVIS'):
            sleep(.100)
        if retailer_code == 'DISCOUNTTIRE':
            sleep(.05)                
            
        await websocket.send(json.dumps(task, cls=MyJSONEncoder))
    elif json_msg:
        if json_msg.get('file_name'):
            with Path(json_msg.get('file_name')).open('w') as f:
                json.dump(json_msg, f, indent=4)
        formatted_json = json.dumps(json_msg)
        await add_response_to_queue(formatted_json)
    else:
        print("Unknown message: " + msg)

async def write_responses_to_db():
    while True:
        response = await response_queue.get()
        try:
            SqlInsert.Write_ScrapperResponse(response)
        except Exception as e:
            debug(f"Failed to write response to DB: {e}")
        response_queue.task_done()
        name = None
        request_id = None
        # debug(response)
        try:
            js = json.loads(response)
            name = js.get('request').get('name')
            request_id = js.get('request').get('request_id')
        except:
            pass
        debug(f"DB Item Inserted: {name} {request_id}")


async def handle_loop(websocket, path):
    """ Check Message. """
    
    debug("New handler loop...")
    while True:
        msg = await websocket.recv()
        # Process each message in a new task
        asyncio.create_task(process_message(msg, websocket))
        debug("New handler loop...Finished")



def start():
    """ Starts websocket server to listen front. """
    
    debug('starting')
    start_server = websockets.serve(handle_loop, "0.0.0.0", 8087, max_size=int(2 ** 30)) # 2048 MB

    loop = asyncio.get_event_loop()
    loop.run_until_complete(start_server)
    # Start the background task
    loop.create_task(write_responses_to_db())
    loop.run_forever()
    debug("Starting server")

if __name__ == '__main__':
    start()
