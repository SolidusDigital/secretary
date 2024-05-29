# FROM python:3.7.3-alpine3.9

# RUN pip install websockets

# COPY *.py ./

# CMD ["python", "backend.py"]
# Fix timezone issue


FROM ubuntu:20.04
ENV TZ=Europe/London
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
ARG BACKUP_SERVICE_MODE
ENV BACKUP_SERVICE_MODE=${BACKUP_SERVICE_MODE}
RUN apt-get update \
    && apt-get install --yes curl iputils-ping python3 nano python3-venv unixodbc unixodbc-dev python3-pip wget supervisor build-essential lsb-release software-properties-common apt-transport-https ca-certificates rsync openssh-client lsof \
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
COPY *.sh /app/
COPY docker_filesystem /
# WORKDIR /~/.ssh/
COPY ssh/ /root/.ssh/
RUN chmod 600 /root/.ssh/config
RUN chown root /root/.ssh/hetzner_storage_full
RUN chmod 600 /root/.ssh/hetzner_storage_full

# RUN touch /sbin/mount.davfs
# RUN chmod u+s /sbin/mount.davfs

# RUN apt-get --yes --force-yes install cifs-utils keyutils 

# RUN yes | DEBIAN_FRONTEND=noninteractive apt-get -yqq install davfs2
 
USER root

RUN mkdir /mnt/cloudbox
RUN chmod -R a+rw /mnt/cloudbox/
# RUN echo 'https://u312939.your-storagebox.de /mnt/cloudbox davfs rw,uid=10001,gid=10001,file_mode=0770,dir_mode=0770 0 0' >> /etc/fstab
# RUN echo 'https://u312939.your-storagebox.de u312939 Qr78R4YqxWZyF9Q7' >> /etc/davfs2/secrets



ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]


CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]