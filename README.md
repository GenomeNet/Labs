# GenomeNet Labs

This repository provides instructions and configurations to set up GenomeNet Labs on a server using EC2 instance, Nginx, and Jobson.

## Info

The server runs on an AWS EC2 t2.medium instance (Ubuntu 22.04.2 LTS) with a 40GB disk and belongs to the webappjobson security group.

## Installation and Configuration

Follow the steps below to install necessary dependencies and set up GenomeNet Labs:

```
sudo apt-get update
sudo apt-get install -y default-jre nginx podman python3-pip runc

# Install Jobson
wget https://github.com/adamkewley/jobson/releases/download/1.0.13/jobson-nix-1.0.13.tar.gz
tar xvf jobson-nix-1.0.13.tar.gz
echo "export PATH=\$PATH:/home/ubuntu/jobson-nix-1.0.13/bin" >> ~/.bashrc
source ~/.bashrc
```

Confirm that Jobson is installed correctly by checking the help command `jobson -h`

```
git clone https://github.com/GenomeNet/Labs

cd Labs
sudo cp jobson-ui /etc/nginx/sites-available/jobson-ui

sudo cp -r www/genomenet /var/www/genomenet
cd /etc/nginx/sites-enabled
sudo ln -s ../sites-available/jobson-ui jobson-ui
sudo rm default
sudo nginx -s reload

cd ~/Labs
screen

jobson serve config.yml
```
