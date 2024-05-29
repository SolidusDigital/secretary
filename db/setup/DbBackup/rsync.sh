#!/bin/bash

remote_alt_base_path=/mnt/cloudbox/cse/sql_server_backup/
local_base_path=/mnt/backup_drive/sql_server_backup/

if [ "$BACKUP_SERVICE_MODE" = "BACKUP" ]; then
    remote_base_path=/home/cse/
    local_base_path=/mnt/backup_drive/sql_server_backup
else
    local_base_path=/mnt/backup_drive/sql_server_backup/
    remote_base_path=/home/cse/sql_server_backup/
fi

mkdir -p $local_base_path

cd $remote_alt_base_path
latest_dir=$(ls -dt * | head -n1)
remote_final_path=$remote_base_path$latest_dir
source_directory=$remote_final_path
echo "source_directory: $remote_final_path"
echo "local_base_path: $local_base_path"
bandwidth_limit_mbps=800
bandwidth_limit_kbps=$(expr $bandwidth_limit_mbps \* 1000)

echo "bandwidth limit ${bandwidth_limit_kbps} Kbps"

check_file_locks() {
    local path_to_check=$1
    local locked=0
    local file_list=()  # Array to store locked files

    echo "Checking files in: $path_to_check"

    while IFS= read -r file; do
        if lsof "$file" &>/dev/null; then
            echo "Warning: File $file is currently in use."
            file_list+=("$file")
            locked=1
        fi
    done < <(find "$path_to_check" -type f)

    if [ $locked -eq 1 ]; then
        echo "Locked files:"
        printf '%s\n' "${file_list[@]}"
    else
        echo "No locked files detected."
    fi

    return $locked
}

while true; do
    if [ "$BACKUP_SERVICE_MODE" = "BACKUP" ]; then
        check_file_locks "$local_base_path"
        if [ $? -eq 0 ]; then
            rsync -e "ssh -p 23" $local_base_path "storagebox:$remote_base_path" --archive --verbose --partial --progress --bwlimit=$bandwidth_limit_kbps
        else
            echo "Skipping rsync due to locked files."
        fi
    else
        check_file_locks "$source_directory"
        if [ $? -eq 0 ]; then
            echo rsync -e "ssh -p 23" --archive --include='*.bak' --exclude='*' --verbose --partial --progress --bwlimit==$bandwidth_limit_kbps "storagebox:$source_directory" $local_base_path
            sleep 5
            rsync -e "ssh -p 23" --archive --include='*.bak' --exclude='.*' --verbose --partial --progress --bwlimit=$bandwidth_limit_kbps "storagebox:$source_directory" $local_base_path

        else
            echo "Skipping rsync due to locked files."
        fi
    fi
    
    sleep 50
done
