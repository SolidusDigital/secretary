import pyodbc

import Definitions
from typing import Any, List, TypeVar, Callable
import dateparser
import pytz
import json
import traceback
from decimal import Decimal

db_debug_bit = False

T = TypeVar("T")
st_file_db_name = Definitions.MSSQL_st_file_DB

def get_db_host(st_file_db_name=st_file_db_name):
    db_host_name = Definitions.MSSQL_P_STR

    if st_file_db_name == 'st_metrics':
        db_host_name = Definitions.METRICS_MSSQL_P_STR
    else:
        db_host_name = Definitions.MSSQL_P_STR
        
    print(f'db_host_name:{db_host_name}', flush=True)
    print(f'st_file_db_name:{st_file_db_name}', flush=True)
    print(f'Definitions.MSSQL_P_STR:{Definitions.MSSQL_P_STR}', flush=True)
    print(f'Definitions.METRICS_MSSQL_P_STR:{Definitions.METRICS_MSSQL_P_STR}', flush=True)
        
    return db_host_name


def parse_dt_string(datetime_str):
    d = datetime_str
    if d:
        d = dateparser.parse(datetime_str)
        if d.tzinfo is None or d.tzinfo.utcoffset(d) is None:
            d = d.replace(tzinfo=pytz.utc)
    return d


def convert_data_frame_to_json(dataframe, convert_dt_index_to_int_bool: bool = True,
                               drop_columns_list: list = None, orient: str = None):

    if not orient:
        orient = 'table'

    if drop_columns_list:
        dataframe.drop(labels=drop_columns_list, axis=1, inplace=True)

    if convert_dt_index_to_int_bool:
        nano_seconds_to_milliseconds_divisor = 10 ** 6
        dataframe.index = dataframe.index.astype('int64', copy=False) // nano_seconds_to_milliseconds_divisor

    json_str = json.loads(dataframe.to_json(orient=orient))
    if 'schema' in json_str:
        json_str.pop('schema')
    return json_str


class Connection:
    _instance = None

    def _create_conn(self):
        conn = pyodbc.connect(get_db_host(st_file_db_name),
                              user=Definitions.MSSQL_USER,
                              password=Definitions.MSSQL_PASSWORD,
                              database=Definitions.MSSQL_st_file_DB,
                              autocommit=True,
                              ENCRYPT='no')
        cursor = conn.cursor()
        return conn, cursor

    def __init__(self):
        # raise RuntimeError('Call instance() instead')
        self.db_autocommit_bit = True
        self.conn, self.cursor = self._create_conn()
        self.raise_error_bit = False
        self.fatal_restart_list = []
        self.sql_sp_prepared, self.sql_param_list, self.full_sql_statement, self.db_exception, self.sql_sp, self.trace_log, self.error_code = \
            None, None, None, None, None, None, None

    @classmethod
    def instance(cls):
        if cls._instance is None:
            cls._instance = cls.__new__(cls)
            cls._instance.db_autocommit_bit = True
            cls._instance.conn = pyodbc.connect(get_db_host(),
                                                user=Definitions.MSSQL_USER,
                                                password=Definitions.MSSQL_PASSWORD,
                                                database=Definitions.MSSQL_st_file_DB,
                                                autocommit=True,
                                                ENCRYPT='no'
                                                )
            cls._instance.cursor = cls._instance.conn.cursor()
            cls._instance.raise_error_bit = False
            cls._instance.sql_sp_prepared, cls._instance.sql_param_list, cls._instance.full_sql_statement, cls._instance.db_exception, cls._instance.sql_sp, cls.trace_log, cls.error_code = \
                None, None, None, None, None, None, None
        return cls._instance

    def _set_autocommit_off(self):
        self._instance.conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION, pyodbc.SQL_TXN_READ_UNCOMMITTED)
        self._instance.conn.autocommit = False

    def rollback(self):
        if not self.db_autocommit_bit:
            sql = "rollback"
            self.cursor.execute(sql)
            print("transaction rolled back")

    def __del__(self):
        self.rollback()
        self.close_connection()

    def print_tran_info(self):
        return ''
        sql = """
                SELECT @@SPID [@@SPID],
                @@TRANCOUNT [@@TRANCOUNT],  
                CASE transaction_isolation_level
                WHEN 0 THEN 'Unspecified'
                WHEN 1 THEN 'ReadUncommitted'
                WHEN 2 THEN 'ReadCommitted'
                WHEN 3 THEN 'Repeatable'
                WHEN 4 THEN 'Serializable'
                WHEN 5 THEN 'Snapshot' END AS TRANSACTION_ISOLATION_LEVEL,
                    case @@OPTIONS & 2 when 2 then 'implicit_transaction_mode_ON' when 0 then 'implicit_transaction_mode_AUTOCOMMIT' else  'implicit_transaction_mode_UNKNONW' end implicit_transaction_mode
                FROM sys.dm_exec_sessions
                where session_id = @@SPID;
                """

        sql_rs = self.cursor.execute(sql)
        rs_result = []
        if sql_rs.description is None:
            return rs_result
        columns = [column[0] for column in sql_rs.description]
        result_set = sql_rs.fetchall()
        for row in result_set:
            result = dict(zip(columns, row))
            rs_result.append(result)

        print(f'TRAN_INFO: {rs_result}')



    @staticmethod
    def _build_sql_str(parameterized_sql_statement, sql_parameters):
        unique = "%PARAMETER%"
        sql_statement = parameterized_sql_statement.replace("?", unique)
        for param in sql_parameters:
            sql_statement = sql_statement.replace(unique, repr(param), 1)
        return sql_statement

    def close_connection(self):
        self.conn.close()

    def _prep_tsql_sp(self, sql_sp: str, sql_params: dict):
        sql_param_list = list(sql_params.values())

        sql_sp_prepared = sql_sp + " "
        for param in sql_params.keys():
            sql_sp_prepared = sql_sp_prepared + param + " = ?, \n"
        sql_sp_prepared = sql_sp_prepared[:-3] + ";\n"

        full_sql_statement = self._build_sql_str(
            sql_sp_prepared, sql_param_list)
        if db_debug_bit and self.sql_sp != f"""exec {st_file_db_name}.dbo.dba_InsertProcError""":
            print(full_sql_statement)

        return sql_sp_prepared, sql_param_list, full_sql_statement

    def _write_to_db_proc_error(self):
        self.error_code = self.db_exception.args[0]
        sql_sp = f"""exec {st_file_db_name}.dbo.dba_InsertProcError"""

        sql_params = {'@ProcName': self.sql_sp,
                      '@InternalError': str(self.db_exception.args[1]).replace("'", ""),
                      '@RaiseErrorFlag': self.raise_error_bit,
                      '@sql_statement': self.full_sql_statement,
                      '@trace_log': str(self.trace_log),
                      }

        self.exec_tsql_sp(sql_sp, sql_params, clear_error_bit=False)
        print(f'Exception was logged to {st_file_db_name}.dbo.dba_proc_error')

    def _catch_db_exception(self):
        trace_log = str(traceback.format_stack())
        self.trace_log = trace_log

        print('execute: {0} failed. exception: {1}'.format(
            self.full_sql_statement, self.db_exception))
        if self.sql_sp != f"""exec {st_file_db_name}.dbo.dba_InsertProcError""":
            self._write_to_db_proc_error()
        else:
            raise ValueError(f'failed to execute dba_InsertProcError: {self.db_exception}')

    def exec_tsql_sp(self, sql_sp: str, sql_params: dict or list, clear_error_bit=True):
        if not self.db_autocommit_bit:
            self.print_tran_info()

        self.sql_sp = sql_sp
        result = None
        error_message = None
        error_code = None

        if sql_params is not None:
            if len(sql_params) == 1 and not type(sql_params) == dict:
                sql_params = sql_params[0]

        if type(sql_params) == dict:
            self.sql_sp_prepared, self.sql_param_list, self.full_sql_statement = self._prep_tsql_sp(
                sql_sp, sql_params)

            try:
                result = self.cursor.execute(
                    self.sql_sp_prepared, self.sql_param_list)
            except Exception as e:
                self.db_exception = e
                self._catch_db_exception()

        elif sql_params is None:
            try:
                result = self.cursor.execute(self.sql_sp)
            except Exception as e:
                self.db_exception = e
                self._catch_db_exception()

        elif type(sql_params) == list:
            self.sql_sp_prepared, self.sql_param_list, self.full_sql_statement = self._prep_tsql_sp_many(
                sql_sp, sql_params)
            self.cursor.fast_executemany = True
            try:
                result = self.cursor.executemany(
                    self.sql_sp_prepared, self.sql_param_list)
            except Exception as e:
                self.db_exception = e
                self._catch_db_exception()

        if result:
            result = self.convert_sql_rs_to_dict(result)
        if self.error_code:
            error_message = {'error': self.db_exception.args[1]}
            error_code = self.error_code

        if clear_error_bit:
            self.error_code = None
            return error_code, (result or error_message)

    def _prep_tsql_sp_many(self, sql_sp, list_of_sql_params):
        sql_param_lists = []
        sql_sp_prepared, full_sql_statement = None, None

        for sql_params in list_of_sql_params:
            sql_sp_prepared, sql_param_list, full_sql_statement = self._prep_tsql_sp(
                sql_sp, sql_params)
            sql_param_lists.append(sql_param_list)

        return sql_sp_prepared, sql_param_lists, full_sql_statement

    @staticmethod
    def convert_sql_rs_to_dict(sql_rs):
        results = []
        if sql_rs.description is None:
            return results
        columns = [column[0] for column in sql_rs.description]
        result_set = sql_rs.fetchall()
        for row in result_set:
            result = dict(zip(columns, row))
            results.append(result)
        return results

    @staticmethod
    def convert_sql_rs_to_list(sql_rs):
        results = []
        for row in sql_rs.fetchall():
            results.append(row)
        return results

    @staticmethod
    def convert_sql_rs_string(sql_rs):
        result = None
        for row in sql_rs.fetchall():
            result = row[0]
        return result

    @staticmethod
    def to_json_types(obj):
        import datetime
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, datetime.date):
            return str(obj)
        raise TypeError(
            "Object of type '{0}' is not JSON serializable".format(type(obj).__name__))

    def dict_to_json(self, dict_object):
        return json.dumps(dict_object, default=self.to_json_types)



def from_list(f: Callable[[Any], T], x: Any) -> List[T]:
    assert isinstance(x, list)
    return [f(y) for y in x]



class SqlSelect:
    def __init__(self, connection: Connection):
        self.connection = connection
        pass

    def test_query(self, limit=1000, retailer_key=None, query=None):
        sql_sp = f"""exec {st_file_db_name}.dbo._TestQueries"""
        sql_params = {
            '@row_limit': limit,
            '@retailer_key': retailer_key,
            '@query': query
            }

        return self.connection.exec_tsql_sp(sql_sp, sql_params)
    





class SqlInsert:
    def __init__(self, connection):
        self.connection = connection



    def Write_ScrapperResponse(self, input_data):
        sql_sp = f"""exec {st_file_db_name}.dbo.Write_ScrapperResponse"""
        sql_param_list = []

        sql_params = {'@input_data': input_data}
        sql_param_list.append(sql_params)

        return self.connection.exec_tsql_sp(sql_sp, sql_params)

    def Write_ReponseRaw_MetricsDB(self, input_data):
        sql_sp = f"""exec {Definitions.METRICS_DB}.dbo.Write_ResponseRaw"""
        sql_param_list = []

        sql_params = {'@input_data': input_data}
        sql_param_list.append(sql_params)

        return self.connection.exec_tsql_sp(sql_sp, sql_params)




if __name__ == '__main__':
    db_conn = Connection.instance()
    SqlSelect = SqlSelect(connection=db_conn)
    SqlSelect.get_scrape_queue(limit=10)