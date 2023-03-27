# GenomeNet Labs (Server)

## Info

This runs on a EC2 t2.medium instance (22.04.2 LTS) with 40GB disk and group webappjobson group. After creation of the instance login with the key file using

```
ssh -i Key.pem ubuntu@IP.com
```

## Install

```
sudo apt-get update
sudo apt-get install -y default-jre nginx
wget https://github.com/adamkewley/jobson/releases/download/1.0.13/jobson-nix-1.0.13.tar.gz
tar xvf jobson-nix-1.0.13.tar.gz
export PATH=$PATH:/home/ubuntu/jobson-nix-1.0.13/bin
```

confirm that `jobson -h` is running

```
```bash
git clone https://github.com/GenomeNet/Labs
cd Labs
sudo cp -r www/jobson-ui /var/www/jobson-ui
cd /etc/nginx/sites-enabled
sudo cp jobson-ui /etc/nginx/sites-available/jobson-ui
sudo ln -s ../sites-available/jobson-ui jobson-ui
sudo rm default
sudo nginx -s reload
jobson serve config.yml
```


