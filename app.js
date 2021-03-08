//jshint esversion:6

const express = require("express");
const mongoose = require('mongoose');
const path = require("path");
const date = require(path.join(__dirname, 'date.js'));

const app = express();

app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({extended:true})); //Used to parse JSON bodies
app.use(express.static("public"));

// connect to mongoose
mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connnection error:'));
db.once('open',()=>{
  const itemSchema = new mongoose.Schema({
    name: String
  });
  const Item = mongoose.model("item", itemSchema);
  // default items
  const defaultItem1 = new Item({
    name: 'Buy Food'
  });
  const defaultItem2 = new Item({
    name: 'Cook Food'
  });
  const defaultItem3 = new Item({
    name: 'Eat Food'
  });
  // Item.insertMany([defaultItem1, defaultItem2, defaultItem3]); // better to have a callback function
});

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function(req, res) {

const day = date.getDate();

  res.render("list", {listTitle: day, newListItems: items});

});

app.post("/", function(req, res){

  const item = req.body.newItem;
  console.log(req.body.list);
  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
