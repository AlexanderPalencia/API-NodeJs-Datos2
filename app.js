const express = require('express');
const app = express();

var MongoClient = require('mongodb').MongoClient;
var https = require('https');
var g;
var WordSearch;

app.get('/', function (req, res, next) {
    
    WordSearch = req.query.q;
    console.log(WordSearch);
    next();
});


app.use('/', function(req, res) {

    console.log("Palabra a buscar "+WordSearch);
    var WordSearchUser = WordSearch;
    //Conexion a la base de datos MongoDB
    MongoClient.connect("mongodb://localhost:27017/mydb2", function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb2");
        var query = { WordSearch: WordSearch};
        dbo.collection("Searches").find(query).toArray(function(err, result) {
        if (err) throw err;
        if (result == ""){
            //Buscar al API crear coleccion e insertar data
            console.log("Buscando al API");
            db.close();
            // Request Get al API NYT
            https.get('https://api.nytimes.com/svc/search/v2/articlesearch.json?api-key=5e015e5f0e6d4140be010d624e839c6b&q='+WordSearchUser, (resp) => {
                let data = '';

                // A chunk of data has been recieved
                resp.on('data', (chunk) => {
                    data += chunk;
                });
                // The whole response has been received
                resp.on('end', () => {
                    g=data;
                    InsertInDB();

                });
            }).on("error", (err) => {
                console.log("Error: " + err.message);
            });
        }else{
            //Buscar data en DB & desplegar data
            console.log("documento encontrado en la base de datos");
            
            res.status(200).json(result);

        }
        db.close();
      });
    });


    function InsertInDB(){

        var myobj = { WordSearch: WordSearch, Result: g};
        MongoClient.connect("mongodb://localhost:27017/mydb2", function(err, db) {
            if (err) throw err;
            var dbo = db.db("mydb2");
            dbo.collection("Searches").insertOne(myobj, function(err, res) {
                if (err) throw err;
                console.log("Data insertada en la base de datos");
            });   
        db.close();
        });
        
        
            res.status(200).json(myobj);

    }
    
    
    
});

    



module.exports = app;









/*
const express = require('express');
const app = express();
var WordSearch;

app.get('/', function(req, res) {
    
    WordSearch = req.query.tagid;
    a();
  res.send(WordSearch);
});


function a(){
    console.log(WordSearch);

}

module.exports = app;


*/