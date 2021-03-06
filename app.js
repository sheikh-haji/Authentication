//jshint esversion:6
require('dotenv').config()
const express=require("express");
const bodyparser=require("body-parser");
const mongoose=require("mongoose");
const ejs=require("ejs");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const app=express();
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const FacebookStrategy=require("passport-facebook");




app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
     userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
      // const { email, first_name, last_name } = profile._json;
      // const userData = {
      //   email,
      //   firstName: first_name,
      //   lastName: last_name
      // };
      // new userModel(userData).save();
      // done(null, profile);
      console.log(profile);
      User.findOrCreate({ facebookId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);
app.use(passport.initialize());
app.use(passport.session());

app.listen(3000,function(req,res){
   console.log("listening to port 3000");
});
mongoose.connect("mongodb+srv://sheikhhaji18:"+process.env.PASSWORD+"@cluster0.2akiep0.mongodb.net/userDB",{useNewUrlParser:true});
// mongoose.set("useCreateIndex", true);
// plugin to put in the schema
const user=new mongoose.Schema({username:String,password:String,googleId:String,secret:String,facebookId:String});
user.plugin(passportLocalMongoose);
user.plugin(findOrCreate);
const User=new mongoose.model("user",user);
// User is a collection
passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);
app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/secrets");
  });
  app.get("/auth/facebook",
    passport.authenticate('facebook')
  );
  app.get("/auth/facebook/callback",
    passport.authenticate('facebook', { failureRedirect: "/login" }),
    function(req, res) {
      // Successful authentication, redirect to secrets.
      res.redirect("/secrets");
    });
app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.get("/secrets", function(req, res){
  if (req.isAuthenticated()){
    User.find({secret:{$ne:null}},function(err,result){
      if(err){
        console.log(err);
      }
      else{
        res.render("secrets",{result1:result});
      }
    })

  } else {

    res.redirect("/login");
  }
});

app.get("/logout", function(req, res){
  req.logout(function(err){
    if(err){
      return err;
    }
  });
  res.redirect("/");
});

app.post("/register", function(req, res){

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});

app.post("/login", function(req, res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});

app.get("/submit",function(req,res){
     if(req.isAuthenticated()){
       res.render("submit");
     }
     else{
       res.redirect("/");
     }
});
app.post("/submit",function(req,res){
  const pro=req.user;
  // console.log(pro._id);
  // res.send("hddasjghdg");
  User.findById(pro._id,function(err,result){
    if(err){
      console.log(err);
    }
    else{
      // console.log(res);
      result.secret=req.body.secret;
      result.save();
      res.redirect("/secrets")
    }
  })
});




// app.listen(3000, function() {
  // console.log("Server started on port 3000.");
// });
