var mongoose = require("mongoose");
mongoose.set("debug", true);
mongoose.Promise= global.Promise;
mongoose.connect("yourdatabaseurlgoeshere",{useNewUrlParser: true});
module.exports.User = require("./user");
module.exports.Chat = require("./chat");
module.exports.Group= require("./group");