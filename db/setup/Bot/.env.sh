#!/bin/bash

# Append export command to ~/.bashrc
echo 'export BACKUP_SERVICE_MODE=RESTORE' >> ~/.bashrc

# Source ~/.bashrc to apply changes
source ~/.bashrc
