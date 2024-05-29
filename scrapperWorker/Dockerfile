# FROM python:3.7.3-alpine3.9

# RUN pip install websockets

# COPY *.py ./

# CMD ["python", "backend.py"]

FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive
ENV QT_X11_NO_MITSHM=1
RUN export QT_X11_NO_MITSHM=1

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# # # Node install
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

RUN apt-get update \
    && apt-get install --yes curl iputils-ping python3  build-essential software-properties-common apt-transport-https ca-certificates nodejs npm\
    && mkdir -p /app 
   

RUN npm cache clean -f \
    && npm install -g n \
    && n stable

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# # # Chrome and fluxbox install
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

RUN echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list
RUN echo "deb http://dl.google.com/linux/chrome-remote-desktop/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list

ADD https://dl.google.com/linux/linux_signing_key.pub /tmp/



RUN apt-key add /tmp/linux_signing_key.pub \
    && apt-get update \
    && apt-get install -y \
    google-chrome-stable \
    chrome-remote-desktop \
    imagemagick \
    fonts-takao \
    pulseaudio \
    supervisor \
    x11vnc \
    nano \
    fluxbox \
    python3 \
    python3-tk \
    python3-dev \
    xauth \
    gnome-screenshot \
    python3-pip

RUN curl -fsSLo /usr/share/keyrings/brave-browser-archive-keyring.gpg https://brave-browser-apt-release.s3.brave.com/brave-browser-archive-keyring.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/brave-browser-archive-keyring.gpg] https://brave-browser-apt-release.s3.brave.com/ stable main"|tee /etc/apt/sources.list.d/brave-browser-release.list \
    && apt update \
    && apt install -y brave-browser \
    && apt install -y jq

# RUN  add-apt-repository ppa:deadsnakes/ppa
# RUN apt-get update
# RUN  apt install python3.10 -y
# RUN ls -lth /usr/local/bin/python*
# RUN ls -lth /usr/local/bin/pip*
# RUN which python3.8
# # RUN apt install python3-pip -y
# RUN python3.9 -m pip install --upgrade pip
# RUN python3 --version

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# # # Node start
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

WORKDIR /app

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# # # Chrome config
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

COPY docker_filesystem /
COPY Brave-Browser /home/chrome/.config/BraveSoftware

RUN  getent group chrome-remote-desktop || addgroup chrome-remote-desktop \
    && useradd -m -G chrome-remote-desktop,pulse-access chrome \
    && ln -s /crdonly /usr/local/sbin/crdonly \
    && ln -s /update /usr/local/sbin/update \
    && mkdir -p /home/chrome/.config/chrome-remote-desktop \
    && mkdir -p /home/chrome/.fluxbox \
    && echo ' \n\
    session.screen0.toolbar.visible:        false\n\
    session.screen0.fullMaximization:       true\n\
    session.screen0.maxDisableResize:       true\n\
    session.screen0.maxDisableMove: true\n\
    session.screen0.defaultDeco:    NONE\n\
    ' >> /home/chrome/.fluxbox/init \
    && chown -R chrome:chrome /home/chrome/.config /home/chrome/.fluxbox

EXPOSE 5900

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# # # ALL CHANGES AFTER THIS LINE
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #


ARG INCUBATOR_VER=unknown

RUN INCUBATOR_VER=${INCUBATOR_VER} echo $INCUBATOR_VER # clear cache


EXPOSE 8080
EXPOSE 1883

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# # # proxy-rotator
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
RUN mkdir -p /app/proxy 
RUN cd /app/proxy && npm install proxy-chain


# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# # # Extension
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

COPY captcha/requirements.txt /app/captcha/requirements.txt
RUN pip install -r /app/captcha/requirements.txt
RUN pip install --upgrade Pillow
RUN pip install opencv-python
COPY ext /app/chrome_extension
COPY proxy /app/proxy
COPY captcha /app/captcha

RUN TZ=America/New_York
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# # # Start
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]


CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]