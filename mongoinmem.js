var assert = require('assert');
const MongoInMemory = require('mongo-in-memory');
 
var mongoServerInstance = new MongoInMemory(27017);
 
mongoServerInstance.start((err, config) => {
    assert.equal(null, err);
    console.log("HOST " + config.host);
    console.log("PORT " + config.port); 
});
