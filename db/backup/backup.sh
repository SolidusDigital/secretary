#!/bin/bash
sudo apt update
sudo apt install cifs-utils

sudo mkdir /mnt/cloudbox
sudo mount -t cifs -o username=u312939,password=Qr78R4YqxWZyF9Q7,dir_mode=0777,file_mode=0777 //u312939.your-storagebox.de/backup /mnt/cloudbox
cd /mnt/cloudbox/cse/backup
