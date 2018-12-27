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
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

exports.decryptSync = function (encrypted) {
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
        console.log('Line from file:', line);
        password = line;
      });
}

readPass();