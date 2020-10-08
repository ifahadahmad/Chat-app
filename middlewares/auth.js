const jwt = require("jsonwebtoken");

exports.loginRequired= function(req, res, next){
    try {
        const token = req.cookies.token;
        jwt.verify(token,"secretkeygoeshere",function(err,decoded){
            if(decoded){
                next();
            }
            else {
                res.redirect("/signup");
            }
        })
    }
    catch(e){
        res.redirect("/signup");
    }
}
exports.checkUser = function(req, res, next){
    try {
        const token = req.cookies.token;
        jwt.verify(token,"secretkeygoeshere",function(err,decoded){
            if(decoded.userId===req.params.userId){
                next();
            }
            else {
                res.status(401).json({message:"unauthorized"});
            }
        })
    }
    catch(e){
        res.status(401).json({message:"unauthorized"});
    }
}
exports.imposter = function(req, res, next){
    try {
        const token = req.cookies.token;
        jwt.verify(token,"secretkeygoeshere",function(err,decoded){
            if(decoded.username===req.params.from){
                next();
            }
            else {
                res.status(401).json({message:"unauthorized"});
            }
        })
    }
    catch(e){
        res.status(401).json({message:"unauthorized"});
    }
}