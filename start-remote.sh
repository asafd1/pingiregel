if [ "$2" = "" ] ; then
  echo must specify server key and ip as parameters
  exit 1
fi

ssh -o "StrictHostKeyChecking no" -i $1 ubuntu@$2 "sh -c 'nohup bash ./pingiregel/start.sh >> ~/pingiregel.log 2>&1 &'"
