require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
//const encrypt = require('mongoose-encryption');
//const md5 = require('md5');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

//console.log(process.env.SECRET);

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.set('strictQuery', true); //to remove annoying warning in iTerm.
mongoose.connect('mongodb://localhost:27017/userDB');

const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

//userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });


const User = new mongoose.model("User", userSchema);


app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

//This one is for creating  new user.
app.post("/register", (req, res) => {

  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    const newUser = new User({
      email: req.body.username, //comes from input name in register.ejs
      //password: md5(req.body.password)
      password: hash
    });
    newUser.save(function(err) {
      if (err) {
        console.log(err);
      } else {
        res.render("secrets");
      }
    });
  });

});

app.post("/login", (req, res) => {
  const username = req.body.username;
  //const password = md5(req.body.password);
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function(err, result) { //hash  is stored in foundUser.password field.
          if (result === true) {
            res.render("secrets");
          }
        });
      }
    }
  });
});


app.listen(3000, () => {
  console.log("Server started on port 3000");
});
