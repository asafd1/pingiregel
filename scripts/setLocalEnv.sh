BASE_URL=`curl --silent http://127.0.0.1:4040/api/tunnels | jq '.tunnels[].public_url' | grep https`
BASE_URL=`echo $BASE_URL | sed 's/"*$//g'`
BASE_URL=`echo $BASE_URL | sed 's/^"*//g'`
echo $BASE_URL
export BASE_URL
export TELEGRAM_TOKEN=$1
echo $TELEGRAM_TOKEN



