var mongoose = require("mongoose");
var User = require("./user");


var groupSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},{
    timestamps: true
});
module.exports= mongoose.model("Group",groupSchema);