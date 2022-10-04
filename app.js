const express=require('express');
const bodyParser=require('body-parser');
const app=express();
const mongoose=require('mongoose');
app.use(bodyParser.urlencoded({extended:true}));

app.set('view engine', 'ejs');
app.use(express.static('public'));
mongoose.connect("mongodb://localhost:27017/toDoListDB",{useNewURLParser:true});
const itemSchema = new mongoose.Schema({
    name: String
});
const Item = mongoose.model("Items",itemSchema);
const DefaultItems=[];

const listSchema = new mongoose.Schema({
    name : String,
    items : [itemSchema]
});

const List = new mongoose.model("List",listSchema);

app.get("/",function(req,res){
    Item.find({},function(err,foundItems){
        if(err){
            console.log(err);
        }else{
            res.render('index',{"day":"Today","listItems":foundItems});
        }
    });
});

app.get("/:customListName",function(req,res){
    var customListName = req.params.customListName;
    customListName=customListName.charAt(0).toUpperCase() + customListName.slice(1);

    const new_list = new List({
        name : customListName,
        items : DefaultItems
    });
    List.findOne({name:customListName},function(err,foundList){
        if(err){
            console.log(err);
        }else{
            if(!foundList){
                new_list.save();
                res.redirect("/"+customListName);
            }else{
                res.render('index',{"day":foundList.name,"listItems":foundList.items});
            }
        }
    });
});

app.post("/",function(req,res){
    const listName = req.body.add;
    const itemName=req.body.newItem
    const item = new Item({
        name:itemName
    });
    if(listName==="Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
        });
        res.redirect("/"+listName);
    }
    
    
});

app.post("/delete",function(req,res){
    const id_to_be_deleted = req.body.id;
    var table=req.body.listName;
    table=table.charAt(0).toUpperCase() + table.slice(1);

    if(table==="Today"){
        Item.deleteOne({_id:id_to_be_deleted},function(err){
            if(err){
                console.log(err);
            }
        });
        res.redirect("/")
    }else{
        List.findOneAndUpdate({name:table},{$pull:{items:{_id : id_to_be_deleted}}} ,function(err,foundList){
            if(!err){
                res.redirect("/"+table);
            }
        });

        
    }

    
});


app.listen(3000,function(){
    console.log("Listening on port 3000");
});