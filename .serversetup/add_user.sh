echo "user: $1"
echo "pass: $2"
# cbr5KihSD4WV5i
# First, create a new user with useradd:
sudo groupadd docker
sudo usermod -aG docker $1
sudo useradd -m -d /home/$1 -s /bin/bash $1
# Next, set the user’s password:
git config --global user.name $1
git config --global user.email "$1@solidus.digital"
yes $2 | passwd $1
mkdir -p /cd /home/$1/.ssh/
# Then, copy the contents of the user’s public key into /home/$1/.ssh/authorized_keys. This is a plain text file where you can paste one public key per line.
cp default.pub /home/$1/.ssh/authorized_keys
# After that, set up the correct permissions for both the .ssh directory and the authorized_keys file:

# ensure the directory ir owned by the new user
chown -R $1:$1 /home/$1/.ssh

# make sure only the new user has permissions
chmod 700 /home/$1/.ssh
chmod 600 /home/$1/.ssh/authorized_keys
# Last, if you want the new user to have sudo access, be sure to add them to the sudo group:

sudo usermod -a -G sudo $1
mkdir -p /home/$1/repos
chown -R $1:$1 /home/$1/repos