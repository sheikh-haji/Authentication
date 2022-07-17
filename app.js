//jshint esversion:6
require('dotenv').config()
const express=require("express");
const bodyparser=require("body-parser");
const mongoose=require("mongoose");
const encrypt=require("mongoose-encryption");
const md5=require("md5");
const app=express();

app.set("view engine","ejs");
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));

app.listen(3000,function(req,res){
   console.log("listening to port 3000");
});
mongoose.connect("mongodb+srv://sheikhhaji18:"+process.env.PASSWORD+"@cluster0.2akiep0.mongodb.net/userDB",{useNewUrlParser:true});

const user=new mongoose.Schema({username:String,password:String});
user.plugin(encrypt,{secret:process.env.SECRETS,encryptedFields:["password"]});
const Userlist=new mongoose.model("User",user);


app.get("/",function(req,res){
   res.render("home");
});

app.get("/login",function(req,res){
   res.render("login");
});

app.get("/register",function(req,res){

  res.render("register");
});

app.post("/register",function(req,res){
  const email=req.body.username;
  const ps=md5(req.body.password)
  const record=new Userlist({username:email,password:ps});
  record.save(function(err){
    if(err){
    console.log(err);}
    else{
      console.log("inserted successfully");
    }
  });

  res.render("secrets");
});
app.post("/login",function(req,res){
  const email=req.body.username;
  const ps=md5(req.body.password);
  Userlist.findOne({username:email},function(err,result){
    if(err){
      console.log(err);
    }
    else{
      if(result){
         if(result.password===ps){
           res.render("secrets");
         }}
    }
  });
  // res.render("secrets");
}
);
app.get("/logout",function(req,res){
  res.render("home");
})
