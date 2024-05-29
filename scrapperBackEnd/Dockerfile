# FROM python:3.7.3-alpine3.9

# RUN pip install websockets

# COPY *.py ./

# CMD ["python", "backend.py"]
# Fix timezone issue


FROM ubuntu:20.04
ENV TZ=Europe/London
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get update \
    && apt-get install --yes curl iputils-ping python3 python3-venv unixodbc unixodbc-dev python3-pip wget supervisor build-essential lsb-release software-properties-common apt-transport-https ca-certificates \
    && mkdir -p /app 
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# # # ODBC Drivers 
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #


RUN if ! [[ "18.04 20.04 22.04" == *"$(lsb_release -rs)"* ]]; \
then \
    echo "Ubuntu $(lsb_release -rs) is not currently supported."; \
    exit; \
fi

# ADD "https://www.random.org/cgi-bin/randbyte?nbytes=10&format=h" skipcache
RUN echo msodbcsql18 msodbcsql/ACCEPT_EULA boolean true | debconf-set-selections
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add -
RUN curl https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/prod.list > /etc/apt/sources.list.d/mssql-release.list
# RUN echo $(lsb_release -rs)
# RUN cat /etc/apt/sources.list.d/mssql-release.list
RUN apt-get update -y \
    && apt-get install -y msodbcsql18
# RUN 



# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# # # Python Install
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# RUN wget https://www.python.org/ftp/python/3.8.0/Python-3.8.0.tgz
# RUN tar -xf Python-3.8.0.tgz
# RUN cd Python-3.8.0 && ./configure --enable-optimizations && make -j $(nproc) && make altinstall
# RUN pip3.8 install --upgrade pip
# RUN pip3.8 install wheel
# RUN wget https://bootstrap.pypa.io/get-pip.py
# RUN python3 get-pip.py



# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# # # Node start
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
WORKDIR /app
COPY requirements.txt /app/
RUN python3 --version
RUN pip install -r requirements.txt
# ADD "https://www.random.org/cgi-bin/randbyte?nbytes=10&format=h" skipcache # Site went down
COPY *.py /app/
COPY docker_filesystem /


ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]


CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]