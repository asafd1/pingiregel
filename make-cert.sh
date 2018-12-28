if [ "$1" = "" ] ; then
  echo must specify domain name
  exit 1
fi

echo domain name: $1
cmd='openssl req -newkey rsa:2048 -sha256 -nodes -keyout ./creds/pingiregel-private.key -x509 -days 3650 -out ./creds/pingiregel-public.pem -subj "/C=US/ST=New York/L=Brooklyn/O=Pingiregel/CN='
cmd+=$1
cmd+='"'
echo $cmd
#cmd

