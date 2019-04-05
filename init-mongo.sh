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
# update game: db.games.update({ _id: 20190404 }, { $set: { messageId: 999 } });
# update player: db.players.update({ _id: "509453115" }, { $set: { vote : "yes" }});
