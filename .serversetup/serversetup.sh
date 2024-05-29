# bin/bash
sudo apt update
sudo apt upgrade
reboot

######################################### DOCKER ########################################
sudo apt-get update
sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    glances \
    gpg


sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

######### TAIL SCALE VPN ##########
sudo apt-get install apt-transport-https
curl -fsSL https://pkgs.tailscale.com/stable/ubuntu/xenial.gpg | sudo apt-key add -
curl -fsSL https://pkgs.tailscale.com/stable/ubuntu/xenial.list | sudo tee /etc/apt/sources.list.d/tailscale.list

sudo apt-get update
sudo apt-get install tailscale
sudo tailscale up --ssh
######### CHANGE HOSTNAME ##########
# sudo nano /etc/hostname
# sudo nano /etc/hosts
sudo usermod -aG docker ${USER}

