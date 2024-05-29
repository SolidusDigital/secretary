from pathlib import Path
import DbApi
import DbApi as DbApi2
import Definitions
import Definitions as Definitions2

DbApi2.st_file_db_name = Definitions2.METRICS_DB
db_metrics = DbApi2.Connection()
SqlInsert = DbApi2.SqlInsert(connection=db_metrics)

import time
from ftplib import FTP
from datetime import datetime, timedelta
import pandas as pd
import json
from croniter import croniter
import os
import uuid

def debug(msg):
    print(msg, flush=True)

debug('starting SQL Connection')
db_conn2 = DbApi.Connection.instance()



DEBUG_FLAG = 1
sleep_cnt = 0
debug('sql connected')

def run_for_ever(params):
    default_sleep = 5
    params['start_time'] = datetime.now()
    while True:
        debug(json.dumps(params, indent=4, default=str))
        service_mode = params.get('service_mode')
        db_names_to_restore_or_backup = params.get('db_names_to_restore_or_backup')
        
        for db_name in db_names_to_restore_or_backup:
            params['db_name'] = db_name
            debug(f'running for {db_name}')
        
            if service_mode == 'BACKUP':
                params = backup_db_service(params)

            elif service_mode == 'RESTORE':
                default_sleep = 60
                params = restore_db_service(params)
            else:
                debug(f'service mode not set {service_mode}')
                raise ValueError('service mode not set')
            
        next_run_time = params.get('next_run_time')
        future_time = next_run_time or datetime.now()
        current_time = datetime.now()
        time_difference_seconds = (future_time - current_time).total_seconds()
        debug(f'sleep until {next_run_time} or {time_difference_seconds} seconds')
        if time_difference_seconds < 0:
            time_difference_seconds = 0
        time.sleep(time_difference_seconds)

        time.sleep(default_sleep)
            

def backup_db_service(params):
    db_name = params['db_name']
    backup_path = params['backup_path']
    diff_cron_schedule = params['diff_cron_schedule']
    full_backup_exists = params.get('full_backup_exists')
    backup_diff_on_start = params.get('backup_diff_on_start')

    final_path = create_backup_folder_structure(params)
    params['final_path'] = final_path
    if not full_backup_exists:
        full_backup_exists = check_file_existence_with_path(final_path , prefix='0FULL-', suffix='.bak')
        params['full_backup_exists'] = full_backup_exists
    
    if not full_backup_exists:
        params['full_back_up_flag'] = True
        exec_tsql_backup(params)
        full_backup_exists = check_file_existence_with_path(final_path, prefix='0FULL-', suffix='.bak')
        params['full_backup_exists'] = full_backup_exists
    
    next_run_time = get_next_cron_run_time(cron_expression=diff_cron_schedule, start_time=datetime.now())
    params['next_run_time'] = next_run_time

    if next_run_time >= datetime.now() or backup_diff_on_start:
        params['full_back_up_flag'] = not check_file_existence_with_path(final_path , prefix='0FULL-', suffix='.bak')
        params['full_backup_exists'] = check_file_existence_with_path(final_path , prefix='0FULL-', suffix='.bak')
        params['backup_diff_on_start'] = False
        exec_tsql_backup(params)
    else:
        debug('Not time to backup')
    return params

def restore_db_service(params):
    
    db_name = params['db_name']
    backup_path = params['backup_path']
    diff_cron_schedule = params['diff_cron_schedule']
    full_backup_exists = params.get('full_backup_exists')
    diff_backup_exists = params.get('diff_backup_exists')
    start_time = params.get('start_time')
    
    
    final_path = create_backup_folder_structure(params)
    params['final_path'] = final_path
    if not full_backup_exists:
        full_backup_exists = check_file_existence_with_path(final_path , prefix='0FULL-', suffix='.bak')
        params['full_backup_exists'] = full_backup_exists
    
    if not full_backup_exists:
        # raise ValueError('No full backup found')
        debug('No full backup found... sleeping')
        next_run_time = datetime.now() + timedelta(minutes=15)
        params['next_run_time'] = next_run_time
        return params

    if not diff_backup_exists:
        diff_backup_exists = check_file_existence_with_path(final_path , prefix='1DIFF-', suffix='.bak')
        params['diff_backup_exists'] = diff_backup_exists
        
    next_run_time = get_next_cron_run_time(cron_expression=diff_cron_schedule, start_time= start_time or datetime.now())
    params['next_run_time'] = next_run_time
    debug(f'next run time {next_run_time}')

    params['start_time'] = datetime.now()             
    params = exec_tsql_restore(params)
    return params

def send_to_db(params, request_type=None):
    params['request_type'] = request_type or params.get('service_mode')
    params['request_id'] = uuid.uuid4().__str__()
    params = json.dumps(params, default=str)
    response = SqlInsert.Write_ReponseRaw_MetricsDB(params)
    debug(response)
        

def get_next_cron_run_time(cron_expression, start_time=None):
    """
    Returns the next run time for a given cron expression from the start time.

    :param cron_expression: A string representing the cron schedule.
    :param start_time: A datetime object representing the time from which to calculate the next run time.
                       If not specified, the current time is used.
    :return: A datetime object representing the next scheduled run time.
    """
    # Use the current time as the default start time if none is provided
    if start_time is None:
        start_time = datetime.now()

    # Initialize the croniter with the cron expression and the start time
    iter = croniter(cron_expression, start_time)

    # Get the next scheduled run time
    next_run_time = iter.get_next(datetime)

    return next_run_time
def exec_tsql_backup(params):
    final_path = params['final_path']
    full_back_up_flag = params.get('full_back_up_flag')
    db_name = params['db_name']
    full_or_diff_file_prefix = lambda full_back_up_flag: '0FULL' if full_back_up_flag else '1DIFF'
    full_or_diff_file_prefix = full_or_diff_file_prefix(full_back_up_flag)
    backup_type = lambda full_back_up_flag: 'init' if full_back_up_flag else 'DIFFERENTIAL'
    backup_type = backup_type(full_back_up_flag)

    now = datetime.now()
    formatted_date = now.strftime("%m%d%Y_%H%M")


    file_name = f'{full_or_diff_file_prefix}-{db_name}-{formatted_date}.bak'
    tsql_statement = f"""
        ;WITH latest_backup_data AS (
            SELECT
                REVERSE(SUBSTRING(REVERSE(bmf.physical_device_name), 0, CHARINDEX('/', REVERSE(bmf.physical_device_name)))) AS file_name,
                bs.backup_finish_date,
                bs.database_name AS destination_database_name,
                bmf.physical_device_name AS file_path
            FROM
                msdb.dbo.backupset bs
                JOIN msdb.dbo.backupmediafamily bmf ON bs.media_set_id = bmf.media_set_id
            WHERE
                bs.backup_set_id IN (
                    SELECT MAX(mx.backup_set_id) AS mx_backup_set_id
                    FROM msdb.dbo.backupset mx
                    GROUP BY mx.database_name
                )
        )
        SELECT *
        FROM latest_backup_data
        where destination_database_name = '{db_name}'
    

    """
    cursor = db_conn2.conn.execute(tsql_statement)
    results = cursor.fetchall()
    last_backup_finish_date = results[0][1]
    last_backup_location = results[0][3]
    
    if results and last_backup_finish_date.date() == datetime.now().date() and Path(last_backup_location).exists():
        debug('Already backed up... Skipping')
        params['backup_success'] = True
        params['operation_success'] = True
        params['last_backup_finish_date'] = last_backup_finish_date
        params['last_backup_date'] = last_backup_finish_date.date()
        params['last_backup_file_name'] = results[0][0]
        return params
    
    
    
    
    tsql_statement = F"""
        BACKUP DATABASE {db_name}
        TO
            DISK = '{final_path / file_name}'
           WITH FORMAT,
              MEDIANAME = 'SQLServerBackups',
              NAME = '{file_name}',
            COMPRESSION,
            {backup_type},
            STATS = 10
        
        """
    debug(tsql_statement)
    try:
        cursor = db_conn2.conn.execute(tsql_statement)
        while (cursor.nextset()):
            pass
        cursor.commit()
        params['operation_success'] = True
    except Exception as e:
        params['operation_success'] = False
        params['operation_error'] = e
        
    send_to_db(params)

def exec_tsql_restore(params):
    final_path = params['final_path']
    full_back_up_flag = True
    diff_backup_exists = params.get('diff_backup_exists')
    db_name = params['db_name']
    full_or_diff_file_prefix = lambda full_back_up_flag: '0FULL' if full_back_up_flag else '1DIFF'
    full_or_diff_file_prefix = full_or_diff_file_prefix(full_back_up_flag)
    db_restored_path = params.get('db_restored_path')
    diff_back_up = None
    
    full_back_up_path_list = list(final_path.glob(f'0FULL-{db_name}-*.bak'))
    diff_back_up_path_list = (final_path.glob(f'1DIFF-{db_name}-*.bak')) 

    full_back_up = max(full_back_up_path_list, key=os.path.getctime) if full_back_up_path_list else None
    
    if diff_backup_exists:
        diff_back_up = max(diff_back_up_path_list, key=os.path.getctime) if diff_back_up_path_list else None
    

    cursor = db_conn2.conn.execute(""" SELECT @@SERVERNAME AS 'Server Name'  """).fetchall()
    servername = cursor[0][0]
    
    if '_restore' not in servername:
        raise ValueError(f'Not on restore server, server name:{servername}')
    
    
    tsql_statement = f"""
        ;with latest_restore_data as (
        SELECT reverse(substring(reverse(bmf.physical_device_name), 0,
            charindex('/', reverse(bmf.physical_device_name)))) file_name,
            rh.restore_date,
            bs.backup_finish_date,
            rh.destination_database_name,
            bmf.physical_device_name file_path
        FROM msdb.dbo.restorehistory rh
        JOIN msdb.dbo.backupset bs ON rh.backup_set_id = bs.backup_set_id
        JOIN msdb.dbo.backupmediafamily bmf ON bs.media_set_id = bmf.media_set_id
        where rh.restore_history_id in (
            SELECT max(mx.restore_history_id) mx_restore_history_id
            FROM msdb.dbo.restorehistory mx
            group by mx.destination_database_name
            )
        )
        select *
        from latest_restore_data
        where destination_database_name = '{db_name}'
        and file_name = '{getattr(diff_back_up, 'name', None) or getattr(full_back_up, 'name', None)}'

    """
    cursor = db_conn2.conn.execute(tsql_statement)
    results = cursor.fetchall()
    if results:
        debug('Already restored... Skipping')
        params['restore_success'] = True
        params['last_restore_backup_finish_date'] = results[0][2]
        params['last_restore_date'] = results[0][1]
        params['last_restore_file_name'] = results[0][0]
        return params
    
    

    tsql_statement_list = []
    if diff_back_up:
        with_no_recovery = ' NORECOVERY, REPLACE'
        tsql_statement = f""";
        RESTORE DATABASE {db_name}
        FROM DISK = '{diff_back_up}' WITH RECOVERY
        """
    else:
        with_no_recovery = 'REPLACE'

    now = datetime.now()
    formatted_date = now.strftime("%m%d%Y_%H%M")
    

    tsql_statement_list.append(tsql_statement)
    tsql_statement = f"""
        RESTORE DATABASE {db_name}
        FROM DISK = '{full_back_up}'  WITH {with_no_recovery}
        """
        
    
    tsql_statement_list.append(tsql_statement)
    tsql_statement_list.reverse()
    
    for sql in tsql_statement_list:
        debug(sql)
        cursor = db_conn2.conn.execute(sql)
        while (cursor.nextset()):
            pass
        cursor.commit()
        
    params['restore_success'] = True
    params['last_restore_time'] = datetime.now().__str__()
    
    
    if diff_back_up:
        params['db_restored_path'] = diff_back_up
    elif full_back_up:
        params['db_restored_path'] = full_back_up
    
    send_to_db(params)
        
    return params
        
def check_file_existence_with_path(directory, prefix='0FULL_', suffix='.bak'):
    """
    Checks if there is any file in the specified directory that starts with the prefix '0FULL_'
    and ends with the suffix '.bak' using the pathlib module.

    :param directory: The path to the directory where files should be checked.
    :param prefix: The prefix of the file names to match.
    :param suffix: The suffix of the file names to match.
    :return: True if such a file exists, False otherwise.
    """
    # Create a Path object for the directory
    dir_path = Path(directory)

    if not dir_path.exists() or not dir_path.is_dir():
        print(f"The directory {directory} does not exist or is not a directory.")
        return False

    # Iterate over files in the directory
    for file_path in dir_path.iterdir():
        # Check if the path is a file and matches the prefix and suffix
        if file_path.is_file() and file_path.name.startswith(prefix) and file_path.name.endswith(suffix):
            debug(f'{prefix} {suffix} FILE EXISTS')
            return True

    return False


def create_backup_folder_structure(params):
    db_name = params['db_name']
    backup_path = params['backup_path']

    # Get the current year and week number
    current_date = datetime.now()
    year_week_number = f"{current_date.strftime('%Y')}-{current_date.strftime('%U')}"

    # Construct the final path
    final_path = Path(backup_path) / year_week_number / db_name

    # Check if the directory exists, and if not, create it (including any necessary parent directories)
    if not final_path.exists():
        final_path.mkdir(parents=True, exist_ok=True)

    return final_path

def start():
    debug('starting')
    params = {
        'db_name': "st_file",
        'backup_path': Definitions.BACKUP_PATH or Definitions.RESTORE_PATH,
        'diff_cron_schedule': "*/5 * * * *",
        'backup_diff_on_start':True,
        'service_mode': Definitions.BACKUP_SERVICE_MODE,
        'db_names_to_restore_or_backup': Definitions.DB_NAMES_TO_RESTORE_OR_BACKUP,
        'restore_on_start': True
        # 'db_names_to_restore_or_backup': ['test']
    }
    debug('starting backup service')
    debug(params)
    run_for_ever(params)
    debug("Staring backups")


if __name__ == '__main__':
    start()
