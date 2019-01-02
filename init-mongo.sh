mongo pingiregel --eval "db.misc.insertOne( { key: 'token', value: '761179774:AAGuO9b2j794j8mbv2xAJRwBobSaoMp0PGs' } );"
mongo pingiregel --eval "db.settings.insertOne( { key: 'baseUrl', value: '$2' } );"

mongo pingiregel --eval "db.settings.findOne( { key: 'baseUrl' } );"

