var httpContext = require('express-http-context');

exports.log = function (msg) {
    var time = new Date();
    var message = httpContext.get('message');
    if (message) {
        chatId = `: chatId=${httpContext.get('message').chat.id} `;
    } else {
        chatId = "";
    }
    console.log(`${time} ${chatId}: ${msg}`);
}
