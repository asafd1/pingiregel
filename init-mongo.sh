if [ "$2" = "" ] ; then
  echo must specify token and baseUrl as parameters
  exit 1
fi

mongo pingiregel --eval "db.misc.insertOne( { key: 'token', value: '$1' } );"
mongo pingiregel --eval "db.settings.insertOne( { key: 'baseUrl', value: '$2' } );"

mongo pingiregel --eval "db.settings.findOne( { key: 'baseUrl' } );"

