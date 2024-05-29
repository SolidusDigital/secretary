import os
from sys import platform
import sys
from pathlib import Path
# import git
ROOT_DIR = Path(os.getcwd())
import glob
# git_head_relative_path = '.git/HEAD'
# git_head_path = ROOT_DIR / git_head_relative_path

# while not git_head_path.exists():
#     git_head_path = ROOT_DIR.parents[0] / git_head_relative_path


# def get_git_version():
#     with open(git_head_path, 'r') as file:
#         gitRef = file.read().replace('\n', '').split(": ")[1]

#         git_other_path = git_head_path.parents[0] / gitRef

#     with open(git_other_path, 'r') as file:
#         return file.read().replace('\n', '')


# VERSION = get_git_version()[0:7]


def un_cache(exclude):
    """Remove package modules from cache except excluded ones.
    On next import they will be reloaded.

    Args:
        exclude (iter<str>): Sequence of module paths.
    """
    pkgs = []
    for mod in exclude:
        pkg = mod.split('.', 1)[0]
        pkgs.append(pkg)

    to_uncache = []
    for mod in sys.modules:
        if mod in exclude:
            continue

        if mod in pkgs:
            to_uncache.append(mod)
            continue

        for pkg in pkgs:
            if mod.startswith(pkg + '.'):
                to_uncache.append(mod)
                break

    for mod in to_uncache:
        del sys.modules[mod]




ENCRYPTION_PASSWORD = 'gorder-dev-pass'
ENCRYPTION_SALT = "gorderSalt123"

# _LINUX_ODBC_DRIVER_PATH = '{/opt/microsoft/msodbcsql18/lib64/libmsodbcsql-18.1.so.1.1}'
try:
    _LINUX_ODBC_DRIVER_PATH = '{' + glob.glob('/opt/microsoft/msodbcsql18/lib64/libmsodbcsql-18*')[0] + '}'
except:
    pass
    
_MAC_ODBC_DRIVER_PATH = '{/usr/local/lib/libmsodbcsql.17.dylib}'
_WIN_ODBC_DRIVER_PATH = '{ODBC Driver 18 for SQL Server}'
_ODBC_P_STR_TEMPLATE = 'DRIVER={0};SERVER={1};Trusted_Connection={2}'
MSSQL_USER = 'sa'


KRAKEN_API_SECRET = os.getenv('KRAKEN_API_SECRET')
KRAKEN_API_KEY = os.getenv('KRAKEN_API_KEY')

ILIA_API_SECRET = os.getenv('ILIA_API_SECRET')
ILIA_API_KEY = os.getenv('ILIA_API_KEY')


class ENV_VALUES():
    DEV = "DEV"
    TEST = "TEST"
    PROD = "PROD"
    STAGING = "STAGING"

ENV = ENV_VALUES.PROD
if "pytest" in sys.modules:
    pass
    # ENV = ENV_VALUES.TEST
# elif os.getenv('PYTHON_ENV', None) == 'staging':
#     ENV = ENV_VALUES.STAGING
# elif os.getenv('PYTHON_ENV', None) == 'dev':
#     ENV = ENV_VALUES.DEV
# elif os.getenv('PYTHON_ENV', None) == 'production':
#     ENV = ENV_VALUES.PROD


_MSSQL_iac_TEST_IP = None
MSSQL_USER = None
MSSQL_PASSWORD = None
MSSQL_TrustedConnection = None


MSSQL_st_file_DB = 'st_file'

if ENV == ENV_VALUES.PROD:
    _MSSQL_iac_TEST_IP = 'tcp:st-dw-prod'
    MSSQL_USER = 'sa'
    MSSQL_PASSWORD = '1A horse cannot unlock sheeps!'
    MSSQL_TrustedConnection = 'no'
    MSSQL_st_file_DB = 'st_file'
elif ENV == ENV_VALUES.STAGING:
    _MSSQL_iac_TEST_IP = None
    MSSQL_USER = 'sa'
    MSSQL_PASSWORD = None
    MSSQL_TrustedConnection = 'no'
elif ENV == ENV_VALUES.DEV or ENV == ENV_VALUES.TEST:
    _MSSQL_iac_TEST_IP = 'localhost'
    MSSQL_USER = "sa"
    MSSQL_PASSWORD = "devSuperPass1!"
    if platform == 'win32':
        MSSQL_TrustedConnection = 'yes'
    else:
        MSSQL_TrustedConnection = 'no'

else:
    raise ValueError("Unknown environment " + ENV)

PyUnitTestKeyValidPerm_KEY = os.getenv('PyUnitTestKeyValidPerm_KEY')
PyUnitTestKeyValidPerm_SECRET = os.getenv('PyUnitTestKeyValidPerm_SECRET')




def _determine_odbc_driver():
    if platform == "linux" or platform == "linux2":
        return _LINUX_ODBC_DRIVER_PATH
    elif platform == "darwin":
        # OS X
        return _MAC_ODBC_DRIVER_PATH
    elif platform == "win32":
        return _WIN_ODBC_DRIVER_PATH


def _build_odbc_p_str():
    return _ODBC_P_STR_TEMPLATE.format(_determine_odbc_driver(), _MSSQL_iac_TEST_IP, MSSQL_TrustedConnection)


MSSQL_P_STR = _build_odbc_p_str()


def convert_interval(interval: str, output_type: str = 'ms'):
    """Convert a interval string to milliseconds | minutes

    :param interval: interval string, e.g.: 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M
    :type interval: str
    :param output_type: ms | m
    :type output_type:str

    :return:
         int value of interval in milliseconds
         None if interval prefix is not a decimal integer
         None if interval suffix is not one of m, h, d, w, M
         None if output_type not one of ms, m

    """
    interval_switcher = {
        'ms': 1000,
        'm': 1
    }
    interval_multiplier = interval_switcher.get(output_type)
    seconds_per_unit = {
        "m": 60,
        "h": 60 * 60,
        "d": 24 * 60 * 60,
        "w": 7 * 24 * 60 * 60,
        "M": 4 * 7 * 24 * 60 * 60,
    }
    try:
        return int(interval[:-1]) * seconds_per_unit[interval[-1]] * interval_multiplier
    except (ValueError, KeyError):
        raise ValueError("Invalid Interval")

# FITMENT FTP 
FTP_HOST = "ftp.fitmentgroup.com"
FTP_USERNAME = "searchtires"
FTP_PASSWORD = "SearchTires11S27"
