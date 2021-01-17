//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose=require('mongoose');
const app = express();
const _ = require('lodash');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin_harshit:punam_321@cluster0.sczkw.mongodb.net/todListDB",{useNewUrlParser: true, useUnifiedTopology: true});
//mongoose.connect("mongodb://localhost:27017/todListDB",{useNewUrlParser: true, useUnifiedTopology: true});
const itemSchema={

  name:String
};

const Item=mongoose.model("Item",itemSchema);//generally model is capitalized

const t1=new Item({
 name:"Welcome to to do list"

});

const t2=new Item({
 name:"Hit '+' button to toDo list"

});

const t3=new Item({
 name:"<--hit this to delete an item"

});

const defaultItems=[t1,t2,t3];

const listSchema={
name:String,
item:[itemSchema]
};

const List=mongoose.model("List",listSchema);

// Item.deleteMany({},function(err){
//   if(err){
//     console.log(err);
//   }
//   else{
//     console.log("sucessefully deleted");
//   }
// });


app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
    if(foundItems.length==0){

      Item.insertMany(defaultItems,function(err){

        if(err){
      
        console.log(err);
      }
      else{
        console.log("successfully saved defaultItems to todListDB");
      }
      
      });
      res.redirect("/");
    }
    else{
      //mongoose.connection.close();
     // foundItems.forEach(function(item){
  //         console.log(item.name);                        
  res.render("list", {listTitle:"Today", newListItems: foundItems});
  

    }
//})
    
  })
    

});

app.get("/:customListName",function(req,res){
  
    const customListName= _.capitalize(req.params.customListName);

      
List.findOne({name:customListName},function(err,FoundLists){
if(!err){
if(!FoundLists){
  console.log("exists");
  const list=new List({
    name:customListName,
    item:defaultItems
  });
  list.save();
  res.redirect("/"+customListName);
}
else{
res.render("list",{listTitle:FoundLists.name, newListItems:FoundLists.item})
}
}
});
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
const ListName=req.body.list;
  
const item1=new Item({
name:itemName

  });

if(ListName=="Today"){

res.redirect("/");
item1.save();
}
else{
List.findOne( {name:ListName},function(err,foundList){

foundList.item.push(item1);
foundList.save();
  res.redirect("/"+ListName);

});

}

});



app.post("/delete",function(req,res){
const checkedItemId=req.body.check;
const ListName=req.body.listName;

if(ListName=="Today"){
Item.findByIdAndRemove(checkedItemId,function(err){
if(!err){

  
    console.log("successfully deleted");
    res.redirect("/");
  }
});

}
else{
  List.findOneAndUpdate({name:ListName},{$pull:{item:{_id:checkedItemId}}},function(err,foundList){

   if(!err){
    res.redirect("/"+ListName);  


   }

  })
}

});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});
let port=process.env.PORT;
if(port==null || port==" "){
  port=3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});
