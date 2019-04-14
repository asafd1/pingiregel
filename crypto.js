const crypto = require('crypto');

const algorithm = 'aes-192-cbc';
const iv = Buffer.alloc(16, 0); // Initialization vector.
var key;
var cipher; 
var decipher;
var password;

exports.init = function () {
    key = crypto.scryptSync(password, 'salt', 24);
    cipher = crypto.createCipheriv(algorithm, key, iv);
    decipher = crypto.createDecipheriv(algorithm, key, iv);
}

exports.encryptSync = function (text) {
    if (!cipher) exports.init();
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

exports.decryptSync = function (encrypted) {
    if (!cipher) exports.init();
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

exports.getPassword = function () {
    return password;
}

function readPass() {
    var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream('./creds/pingiregel')
    });
    
    lineReader.on('line', function (line) {
        password = line;
    });      
}

readPass(); // this is async
// password = "***";
// exports.init();
// console.log(exports.encryptSync("***"));