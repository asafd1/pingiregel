cd ~/pingiregel

git pull
git checkout master

npm install

sudo pkill node
sudo mkdir -m 773 /var/log/pingiregel 2> /dev/null
sudo node ./server.js > /var/log/pingiregel/server.log &
ps -ef | grep node | grep -v grep
tail -f /var/log/pingiregel/server.log

