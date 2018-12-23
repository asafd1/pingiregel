const MongoClient = require('mongodb').MongoClient;
const MongoInMemory = require('mongo-in-memory');

const DBNAME = "pingiregel";
var mongouri = "mongodb://localhost:27017/";

var mongoServerInstance;
var db;

// var inmemDB = {};
// inmemDB.settings = [];
// inmemDB.settings.push({ key : "token", value : "761179774:AAHhhwficBl8DNgDfQ7RUoqrVHIaoJGCMjA"});
// var isInmem = false;

function connect(mongouri){
    var _db;
    MongoClient.connect(mongouri, function(err, __db) {
        if (err) throw err;
        _db = __db;
    });
    console.log(_db);
    db = _db;
}

function init() {
    console.log("init....");
    mongoServerInstance = new MongoInMemory(27017);
    mongoServerInstance.start((err, config) => {
        if (err) throw err;
        console.log("HOST " + config.host);
        console.log("PORT " + config.port);
    });
    mongouri = mongoServerInstance.getMongouri(DBNAME);
    //connect(mongouri);
}
console.log("start....");

init();
console.log("mongouri=" + mongouri);

db = MongoClient.connect(mongouri, { useNewUrlParser: true }).
    then(function(db) {
        return db;
    }).catch(function (err) {})

db.then(function(result) {
    console.log(result);
    }, function(err) {
    console.log(err);
    });



// MongoClient.disconnect(url, function(err, db) {
//     if (err) throw err;
//     dbo = db.db(DBNAME);
// });



// exports.getSetting = function (name) {
//     if (isInmem) {
//         return inmemDB.table.key;
//     }
//     dbo.collection(table).find({key:name}).toArray(function(err, result) {
//         if (err) throw err;
//         console.log(result.value);
//       });
//   };