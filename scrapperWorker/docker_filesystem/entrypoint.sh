#!/bin/bash
set -e

# VNC default no password
export X11VNC_AUTH="-nopw"
export RAND=$RANDOM
export WINDOW_WIDTH="$(( $RANDOM % 50 + 1 + 800 + 100 ))"
export WINDOW_HEIGHT="$(( $RANDOM % 50 + 1 + 600 + 100  ))"

echo 'WINDOW DIMS'
echo $WINDOW_WIDTH
echo $WINDOW_HEIGHT
export USER_AGENT='Mozilla\/5.0 (Linux; Android 8.1.0; LG-M200 Build\/OPM1.171019.026; wv) AppleWebKit\/537.36 (KHTML, like Gecko) Version\/4.0 Chrome\/112.0.5615.100 Mobile Safari\/537.36 [FB_IAB\/FB4A;FBAV\/410.0.0.26.115;]'
export USER_AGENT2="REDEPTION_HORSE_WIN$(( $RANDOM % 50 + 1 ))"
export BROWSER='/opt/google/chrome/chrome --no-first-run --disable-web-security --ignore-certificate-errors --proxy-server="localhost:9000" --disable-site-isolation-trials --user-data-dir=/var/chromeSession --disable-features=CrossSiteDocumentBlockingAlways,CrossSiteDocumentBlockingIfIsolating,BypassCorbOnlyForExtensionsAllowlist,RendererCodeIntegrity --enable-features=NetworkService --no-sandbox --enable-logging=stderr --window-position=0,0 --window-size=%(ENV_WINDOW_WIDTH)s,%(ENV_WINDOW_HEIGHT)s --force-device-scale-factor=1 --js-flags="--max_old_space_size=8192" --purge-memory-button --memory-model=low --load-extension=/app/chrome_extension --proxy-bypass-list="127.0.0.1,136.243.137.237,backend" --user-agent="%(ENV_HOSTNAME)s%(ENV_RAND)s"'
export n=$RANDOM
if [ $(( n % 2 )) -eq 0 ]; then
    printf '%s\n' "Number $n is Even"
    export BROWSER="/opt/brave.com/brave/brave-browser --no-first-run --disable-free --disable-web-security --ignore-certificate-errors --proxy-server='localhost:9000' --disable-site-isolation-trials --user-data-dir=/var/chromeSession --disable-features=CrossSiteDocumentBlockingAlways,CrossSiteDocumentBlockingIfIsolating,BypassCorbOnlyForExtensionsAllowlist,RendererCodeIntegrity --enable-features=NetworkService --no-sandbox --enable-logging=stderr --window-position=0,0 --window-size=${WINDOW_WIDTH},${WINDOW_HEIGHT}  --force-device-scale-factor=1 --js-flags='--max_old_space_size=8192' --purge-memory-button --memory-model=low --load-extension=/app/chrome_extension --proxy-bypass-list='127.0.0.1,136.243.137.237,backend' --user-agent='"${USER_AGENT2}"'"

else
    printf '%s\n' "Number $n is Odd"
    export BROWSER="/opt/google/chrome/chrome --no-first-run --disable-web-security --disable-free --ignore-certificate-errors --proxy-server='localhost:9000' --disable-site-isolation-trials --user-data-dir=/var/chromeSession --disable-features=CrossSiteDocumentBlockingAlways,CrossSiteDocumentBlockingIfIsolating,BypassCorbOnlyForExtensionsAllowlist,RendererCodeIntegrity --enable-features=NetworkService --no-sandbox --enable-logging=stderr --window-position=0,0 --window-size=${WINDOW_WIDTH},${WINDOW_HEIGHT}  --force-device-scale-factor=1 --js-flags='--max_old_space_size=8192' --purge-memory-button --memory-model=low --load-extension=/app/chrome_extension --proxy-bypass-list='127.0.0.1,136.243.137.237,backend' --user-agent='"${USER_AGENT2}"'"
    echo $BROWSER
    
fi

# look for VNC password file in order (first match is used)
passwd_files=(
  /home/chrome/.vnc/passwd
  /run/secrets/vncpasswd
)

for passwd_file in ${passwd_files[@]}; do
  if [[ -f ${passwd_file} ]]; then
    export X11VNC_AUTH="-rfbauth ${passwd_file}"
    break
  fi
done

# override above if VNC_PASSWORD env var is set (insecure!)
if [[ "$VNC_PASSWORD" != "" ]]; then
  export X11VNC_AUTH="-passwd $VNC_PASSWORD"
fi

echo "SCRAPPER: Cleaning up Chrome!"
rm -rf /home/chrome/.cache/google-chrome/Default || echo "ok"
# rm -rf /home/chrome/.config/BraveSoftware/Brave-Browser/Default || echo "ok"
echo "SCRAPPER: Cleaning up finished"
echo "X Authority"
touch /root/.Xauthority

# TO DO MOVE TO DOCKERFILE
# cd /app/
# wget proxy:9000/cert
# openssl x509 -inform der -outform pem -in cert -out proxyservice.crt
# cp proxyservice.crt /usr/local/share/ca-certificates/
# update-ca-certificates
# echo "Installing Proxy Certs finished"
# https://stackoverflow.com/questions/49553138/how-to-make-browser-trust-localhost-ssl-certificate this is the solution for chrome not trusting the cert 

exec "$@"
