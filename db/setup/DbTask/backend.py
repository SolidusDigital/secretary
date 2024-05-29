import asyncio
from pathlib import Path
import DbApi

import Definitions
from ftplib import FTP
import datetime
import re
import pandas as pd
import json

def debug(msg):
    print(msg, flush=True)

debug('starting SQL Connection')
db_conn = DbApi.Connection.instance()
db_conn2 = DbApi.Connection()
SqlInsert = DbApi.SqlInsert(connection=db_conn)
SqlSelect = DbApi.SqlSelect(connection=db_conn)
SqlProcess = DbApi.SqlSelect(connection=db_conn2)
DEBUG_FLAG = 1
sleep_cnt = 0
debug('sql connected')

async def Process_ResponseRaw():
    debug('Process_ResponseRaw started')
    SqlProcess.Process_ResponseRaw()
    debug('Process_ResponseRaw ended')

async def Maintain_ResponseRaw():
    debug('Maintain_ResponseRaw started')
    SqlProcess.Maintain_ResponseRaw()
    debug('Maintain_ResponseRaw ended')


async def download_tire_atlas_library():
    debug('download_tire_atlas_library started')
    remote_filepath = "/TireAtlas/TireAtlasLibrary.csv"
    local_filepath = Path("/mnt/cloudbox/cse/tmp/fitment/")
    file_name = 'TireAtlasLibrary'
    file_suffix = '.csv'
    last_loaded_date = None
    
    local_filepath.parent.mkdir(parents=True, exist_ok=True)
    last_file  = get_last_modified_file(local_filepath, file_name)
    
    if last_file:
        match = re.search(r"\d{4}_\d{2}_\d{2}_\d{6}", last_file.stem)
        if match:
            date_string = match.group()
            print("Date extracted:", date_string)
            # Set the last loaded date
            last_loaded_date = datetime.datetime.strptime(date_string, "%Y_%m_%d_%H%M%S")            
        else:
            print("No date found in the filename.")
        local_filepath = str(last_file) 
    else:
         local_filepath = str(local_filepath / (file_name + file_suffix))
    
    ftp_host = Definitions.FTP_HOST
    ftp_username = Definitions.FTP_USERNAME
    ftp_password = Definitions.FTP_PASSWORD



    # Download the file if modified
    download_file_if_modified(ftp_host, ftp_username, ftp_password, remote_filepath, local_filepath, last_loaded_date)

    
    debug('download_tire_atlas_library ended')

def get_last_modified_file(directory, prefix):
    # Create a Path object for the directory
    path = Path(directory)

    # Use glob to find files with the specified prefix
    files = path.glob(prefix + "*")

    # Filter out directories and get the last modified file
    last_modified_file = max(files, key=lambda f: f.stat().st_mtime, default=None)

    return last_modified_file

def get_last_modified_date(file_path):
    # Create a Path object
    path = Path(file_path)

    # Check if the file exists
    if not path.exists():
        print(f"File '{file_path}' does not exist.")
        return datetime.datetime(1990, 5, 1)

    # Get the last modified timestamp
    timestamp = path.stat().st_mtime

    # Convert the timestamp to a datetime object
    last_modified_date = datetime.datetime.fromtimestamp(timestamp)

    return last_modified_date


def download_file_if_modified(ftp_host, ftp_username, ftp_password, remote_filepath, local_filepath, last_loaded_date):
    # Connect to the FTP server
    local_filepath = Path(local_filepath)
    ftp = FTP(ftp_host)
    ftp.login(user=ftp_username, passwd=ftp_password)
    debug('FTP Connected')

    # Get the modified date of the remote file
    modified_date = ftp.voidcmd(f"MDTM {remote_filepath}")[4:].strip()
    modified_date = modified_date.split(".")[0]
    modified_date = datetime.datetime.strptime(modified_date, "%Y%m%d%H%M%S")
    
    # Get the file suffix
    file_suffix = Path(remote_filepath).suffix

    # Format the last modified date as "YYYY_MM_DD"
    formatted_date = modified_date.strftime("%Y_%m_%d_%H%M%S")
    
    new_local_filepath = Path(f"{local_filepath.parent}/{Path(remote_filepath).stem}_{formatted_date}{file_suffix}")

    # Compare modified date with last loaded date
    if not local_filepath.exists() or modified_date > last_loaded_date:
        # Download the file
        with open(str(new_local_filepath), "wb") as file:
            ftp.retrbinary(f"RETR {remote_filepath}", file.write)
            
        
        #Due to nested unclosed quotes, LN and Commas, we need to use a different quotechar and separator
        # Read the CSV file into a Pandas DataFrame
        df = pd.read_csv(new_local_filepath, quotechar='"')

        # Export the DataFrame to JSON
        json_data = df.to_csv(sep='>', quotechar='<', index=False)

        # Write the JSON data to a file
        with open(new_local_filepath, 'w') as file:
            file.write(json_data)

        print(f"File '{remote_filepath}' has been downloaded.")
        
        load_request = {
            "file_path": str(new_local_filepath),
            "ds" : formatted_date,
            "request_type" : "TireAtlasLibrary"
            }
        
        SqlInsert.Write_ScrapperResponse(json.dumps(load_request))
        print(f"File '{load_request}' load requested.")
        
        SqlProcess.insert_TireAtlasLibrary()
        print(f"File '{load_request}' load complete.")
    else:
        print(f"File '{remote_filepath}' is not modified.")

    # Close the FTP connection
    ftp.quit()
    



async def send_periodically():
    while True:
        await asyncio.sleep(15)  # switch to other code and continue execution in 60 seconds
        await Process_ResponseRaw()
        await Maintain_ResponseRaw()
        

async def ftp_runner():
    while True:
        await download_tire_atlas_library()
        await asyncio.sleep(3600)
        


def start():
    debug('starting')
    asyncio.get_event_loop()
    asyncio.ensure_future(send_periodically())  # before blocking call we schedule our coroutine for sending periodic messages
    asyncio.ensure_future(ftp_runner())  # before blocking call we schedule our coroutine for sending periodic messages

    asyncio.get_event_loop().run_forever()
    debug("Staring server ")


if __name__ == '__main__':
    # debug('hi')
    start()
    # x = SqlSelect.Get_ProductScrapeQueue(limit=10)
    # for task in get_task_list():
    #     print('sending task:', task)
