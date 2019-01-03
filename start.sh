cd ~/pingiregel

git pull
git checkout master

sudo pkill node
sudo node ./server.js &
ps -ef | grep node | grep -v grep
