if [ "$2" = "" ] ; then
  echo must specify token and baseUrl as parameters
  exit 1
fi

mongo pingiregel --eval "db.misc.insertOne( { key: 'token', value: '$1' } );"
mongo pingiregel --eval "db.settings.insertOne( { key: 'baseUrl', value: '$2' } );"

mongo pingiregel --eval "db.settings.findOne( { key: 'baseUrl' } );"

# common mongo actions 
# login to shell: mongo mongodb://localhost:27017/
# use pingiregel;
# show all games: db.games.find({});
# show all players: db.players.find({});
# update game: db.games.update({ "_id._id" : 20190404 }, { $set: { messageId: 999 } });
# update player: db.players.update({ "_id._id" : "123456789" }, { $set: { vote : "nill" }});
# update chat: db.chats.updateOne({_id:-123456789}, {$set:{ admins : [123456789], venue : { title: "בית השאנטי" }, hour: 17, dayOfWeek : 2}}, {"upsert": true});
# add admin to chat: db.chats.updateOne({_id:-1001312698335}, {$set:{ admins : [84374572] }}, {"upsert": true});

# mongo via node & MongoClient
# p = db.collection("players").insertOne(
# ... {
# .....     _id:{
# .......         _id:"123456",
# .......         chatId:-265465291
# .......     },
# .....     username:null,
# .....     firstname:"adi",
# .....     lastname:"gordon",
# .....     vote:"nill",
# .....     friends:0,
# .....     historicVotes:{
# .......         20190411:"yes"
# .......     },
# .....     joinedAt:"Sun Apr 07 22:55:25 IDT 2019",
# .....     chatTitle:"asaf test priv"
# ..... });
