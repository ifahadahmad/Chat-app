const express = require("express");
const app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
var db = require("./models");
var jwt = require("jsonwebtoken");
const auth = require("./middlewares/auth");

app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

io.on("connection",()=>{
    console.log("A user is connected");
})

const login = (req,res) =>{
    db.User.findOne({username: req.body.username}).then(function(user){
        user.comparePassword(req.body.password,function(err,isMatch){
            if(isMatch){
                jwt.sign({userId:user.id,username:user.username},"secretkeygoeshere",function(err,token){
                res.cookie("token",token,{httpOnly:true});
                io.emit("user-connected",user.username);
                res.redirect("/");
                });
                
            }
            else {
                res.status(400).json({message:"invalid problem"})
            }
        })
    }).catch(function(err){
        res.status(400).json({message:err});
    })
}
const signUp = (req,res)=>{
    db.User.create(req.body).then(function(user){
        jwt.sign({userId:user.id,username:user.username},"secretkeygoeshere",function(err,token){
            res.cookie("token",token,{httpOnly:true});
            io.emit("user-connected",user.username);
            res.redirect("/");
        });
    }).catch(function(err){
        res.status(400).json(err);
    });
}   
    app.use(function(req,res,next){
        try{
            var token = req.cookies.token;
            jwt.verify(token,"secretkeygoeshere",function(err,decoded){
                if(decoded){
                    res.locals.username=decoded.username;
                    res.locals.currentId=decoded.userId;
                }else{
                    res.locals.username="";
                }
            });
        } catch(e){
            res.locals.username="";
        }
        next();
    });
    app.get("/user/delete/:id",function(req, res){
        res.clearCookie("token");
        db.User.findByIdAndRemove(req.params.id).then(function(user){
            db.Group.deleteMany({from:req.params.id}).then(function(message){
              res.redirect("/signup");  
            }).catch(function(err){
                res.json({message:err,error:"Cant delete all the messages"})
            })
        }).catch(function(err){
            res.json({message:err,error:"Can't delete the account"});
        });
    });
    app.post("/messages/delete/:userId/:to/:id",auth.checkUser,async function(req,res){
        var fromName;
        var toName;
        await db.User.findById(req.params.userId).then(function(from){
            fromName=from.username;
        });
        await db.User.findById(req.params.to).then(function(to){
            toName=to.username;
        });
        db.Chat.findByIdAndRemove(req.params.id).then(function(message){
            io.emit("delete-message",message.text);
            res.redirect(`/messages/${fromName}/${toName}`);
        }).catch(function(err){
            res.json({message:err});
        });
    });
    app.get("/",auth.loginRequired,function(req,res){
        var token = req.cookies.token;
        var myUser;
        var currentUser=[];
        jwt.verify(token,"secretkeygoeshere",function(err,decoded){
            if(decoded){
                myUser=decoded.userId;
            }
            else{
                res.render("index.ejs",{users:[],username:"",userId:""});
            }
            db.User.findById(myUser).then(function(user){
                db.User.find().then(function(users){
                    users.forEach(function(u){
                        if(u.username!=user.username){
                            currentUser.push(u);
                        }
                    });
                    res.render("index.ejs",{users:currentUser,username:user.username,userId:user._id});
                }).catch(function(err){
                    res.render("index.ejs",{users:[],username:"",userId:""});
                });
            })
        });
    });
    app.get("/group/:from",auth.loginRequired,function(req,res){
        db.Group.find().sort({createdAt:"asc"}).populate("from",{username:true}).then(function(messages){
            res.render("group.ejs",{messages,fromId:req.params.from});
        }).catch(function(err){
            res.render("group.ejs",{messages:[],fromId:req.params.from});
        });
    })
    app.post("/group/:from",function(req, res){
        db.Group.create({from:req.params.from,text:req.body.message}).then(function(message){
            message.save().then(function(message){
                return db.Group.findById(message._id)
                .populate("from",{username:true})
                .then(function(m){
                    io.emit("group",m);
                    res.redirect(`/group/${req.params.from}`);
                }).catch(function(err){});
            }).catch(function(err){});
        }).catch(function(err){});
    })
    app.post("/group/delete/:from/:id",function(req, res){
        db.Group.findByIdAndRemove(req.params.id).then(function(message){
            io.emit("delete-message-group",message.text);
            res.redirect(`/group/${req.params.from}`);
        })
    })
    app.get("/messages/:from/:to",auth.loginRequired,auth.imposter,async function(req,res){
        var fromId;
        var toId;
        await db.User.findOne({username:req.params.from}).then(function(from){
            fromId=from._id;
        });
        await db.User.findOne({username:req.params.to}).then(function(to){
            toId=to._id;
        });
        await db.Chat.find({ $or:[{from:fromId,to:toId},{from:toId,to:fromId}]}).sort({createdAt:"asc"}).then(function(messages){
            res.render("messages.ejs",{messages,fromId,toId});
        }).catch(function(err){
            res.render("messages.ejs",{messages:[],fromId,toId});
        });
    });
    app.post("/messages/:from/:to",async function(req, res){
        var fromName;
        var toName;
        await db.User.findById(req.params.from).then(function(from){
            fromName=from.username;
        });
        await db.User.findById(req.params.to).then(function(to){
            toName=to.username;
        }).catch(function(err){
            res.json({message:"User Does not exist"});
        });
        await db.Chat.create({text:req.body.message,from:req.params.from,to:req.params.to}).then(function(message){

            message.save().then(function(message){
                return db.Chat.findById(message._id)
                .populate("from",{username:true})
                .then(function(m){
                    io.emit("message",message);
                    io.emit("notify",{message:m});
                    res.redirect(`/messages/${fromName}/${toName}`);
                }).catch(function(err){});
            }).catch(function(err){});
        }).catch(function(err){});
            
    });
    app.get("/logout/:user",function(req, res){
        res.clearCookie("token");
        io.emit("user-disconnected",req.params.user);
        res.redirect("/");
    })
    app.get("/login",function(req, res){
        res.render("login.ejs");
    });
    app.get("/signup",function(req, res){
        res.render("signup.ejs");
    })
   app.post("/login",login);
   app.post("/signup",signUp);
    http.listen(process.env.PORT, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${process.env.PORT}`)
});
