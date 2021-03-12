//jshint esversion:6

const express = require("express");
const mongoose = require('mongoose');
var _ = require('lodash');
const path = require("path");

const date = require(path.join(__dirname, 'date.js'));
const utils = require(path.join(__dirname, 'utils.js'));

const app = express();

app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({extended:true})); //Used to parse JSON bodies
app.use(express.static("public"));

// const values
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// connect to mongoose
mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
// default home item schema
const itemSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("item", itemSchema);

const defaultItem1 = new Item({
  name: 'Buy Food'
});
const defaultItem2 = new Item({
  name: 'Cook Food'
});
const defaultItem3 = new Item({
  name: 'Eat Food'
});

const defaultItems = [defaultItem1, defaultItem2, defaultItem3];

// custom list schema
const listSchema = new mongoose.Schema({
  name: String, // custom list name
  items: [itemSchema] // subschema
});

const list = mongoose.model("list", listSchema);

// home route section
app.get("/", function(req, res) {
  const day = date.getDate();
  Item.find({},(error,docs)=>{
    if(error){
      console.log(error);
    }else{
      if(docs.length==0){ // insert default list items
        Item.insertMany(defaultItems, (err)=>{
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
  const listName = req.body.list.split(",").join(""); 
  // get rid of the ',', but the custom list remains the same

  const newItem = new Item({
    name: item
  });

  if(weekdays.includes(listName)){ // add to home items
    newItem.save();
    res.redirect("/");
  }else{ // add to list
    // all list name change to lowercase
    list.findOne({name: _.lowerCase(listName)}, (err, foundList)=>{
      if(err){
        console.log(err);
      }else{
        // console.log(foundList);
        foundList.items.push(newItem);
        foundList.save(); // must save again
        const redirectRoute = "/" + listName;
        res.redirect(redirectRoute);
      }
    });
  }
});

// post to delete items
app.post("/delete", (req, res)=>{
  if(!utils.isEmpty(req.body)){ // not click, not delete
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName.split(",").join("").split(" ")[0];
    // get the weekday name of the custom list name
    if(weekdays.includes(listName)){ // delete from Item
      Item.findByIdAndRemove(checkedItemId,(err)=>{
        if(err){
          console.log(err);
        }else{
          console.log("successfully delete checked item!");
          res.redirect('/');
        }
      });
    }else{ // delete from custom list
      list.findOneAndUpdate({name: _.lowerCase(listName)}, { $pull:{items: {_id: checkedItemId}}},(err)=>{
        if(err){
          console.log(err);
        }else{
          console.log("successfully delete checked item from custom list!");
          const redirectRoute = "/" + listName;
          res.redirect(redirectRoute);
        }
      });
    }
  }
});

// dynamic route name for dynamic list
app.get("/:listName", (req, res)=>{
  const listName = _.lowerCase(req.params.listName); // all change to lower case
  list.findOne({name: listName},(err, foundList)=>{
    if(err){
      console.log(err);
    }else{
      // detemine wether this list exist
      if(!foundList){ // not exist
        const newList = new list({
          name: listName,
          items: defaultItems // use default items
        });
        newList.save();
        // redirect
        const redirectRoute = "/" + listName;
        res.redirect(redirectRoute);
      }else{ // already exists
        const listTitle = _.capitalize(listName) + " List"; 
        res.render("list", {listTitle: listTitle, newListItems: foundList.items});
      }
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
