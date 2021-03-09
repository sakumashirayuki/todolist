//jshint esversion:6

const express = require("express");
const mongoose = require('mongoose');
const path = require("path");

const date = require(path.join(__dirname, 'date.js'));
const utils = require(path.join(__dirname, 'utils.js'));

const app = express();

app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({extended:true})); //Used to parse JSON bodies
app.use(express.static("public"));

// connect to mongoose
mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
const itemSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("item", itemSchema);

// const workItems = [];
const defaultItem1 = new Item({
  name: 'Buy Food'
});
const defaultItem2 = new Item({
  name: 'Cook Food'
});
const defaultItem3 = new Item({
  name: 'Eat Food'
});

app.get("/", function(req, res) {
  const day = date.getDate();
  const items = [];
  Item.find({},(error,docs)=>{
    if(error){
      console.log(error);
    }else{
      if(docs.length==0){ // insert default list items
        Item.insertMany([defaultItem1, defaultItem2, defaultItem3],(err)=>{
          console.log(err);
        });
        res.redirect('/');
      }else{
        res.render("list", {listTitle: day, newListItems: docs});
      }
    }

  });
});

// post to add items
app.post("/", function(req, res){
  const item = req.body.newItem;
  console.log(req.body.list);
  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    const newItem = new Item({
      name: item
    });
    newItem.save();
    res.redirect("/");
  }
});

// post to delete items
app.post("/delete", (req, res)=>{
  if(!utils.isEmpty(req.body)){ // not click, not delete
    const checkedItemId = req.body.checkbox;
    Item.findByIdAndRemove(checkedItemId,(err)=>{
      if(err){
        console.log(err);
      }else{
        console.log("successfully delete checked item!");
      }
    });
    res.redirect('/');
  }else{ // click, delete

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
