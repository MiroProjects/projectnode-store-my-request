const express = require("express");
const app = express();
const PORT = 3000;
const db = require("./database_script");
const bodyParser = require("body-parser");
var dbCollection = [];
var counter = 1;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/Views/home.html`);
});

app.get('/database', (req, res) => {
    res.sendFile(`${__dirname}/Views/database.html`);
});

app.post('/database', (req, res) => {
    if(req.body.dbName){
        dbCollection.push(db.newDatabase(req.body.dbName));
        return res.redirect('/success');
    }

    return res.status(404).redirect('/error');
});

app.get('/table', (req, res) => {
    res.sendFile(`${__dirname}/Views/table.html`);
});

app.post('/table', (req, res) => {
    if(req.body.dbName && req.body.tbName){
        for (let index = 0; index < dbCollection.length; index++) {
            if(dbCollection[index].dbName == req.body.dbName){
                db.newTable(req.body.tbName, dbCollection[index]);
                return res.redirect('/success');
            }            
        }
    }

    return res.status(404).redirect('/error');
});

app.get('/object', (req, res) => {
    res.sendFile(`${__dirname}/Views/object.html`);
});

app.post('/object', (req, res) => {
    if(req.body.dbName && req.body.tbName){
        for (let index = 0; index < dbCollection.length; index++) {
            if(dbCollection[index].dbName == req.body.dbName){
                var database = dbCollection[index];
                for (let i = 0; i < database.tables.length; i++) {
                    if(database.tables[i].tableName == req.body.tbName){
                        var table = database.tables[i];
                        database.insert(
                            {
                                'id'   : counter,
                                'name' : `sample_${counter}`,
                                'type' : `object_${counter}`
                            },
                            table);
                        database.flush(table);
                        counter++;
                        return res.redirect('/success');
                    } 
                }
            }            
        }
    }

    return res.status(404).redirect('/error');
});

app.get('/getAll', (req, res) => {
    res.sendFile(`${__dirname}/Views/getAll.html`);
});

app.post('/getAll', (req, res) => {
    if(req.body.dbName && req.body.tbName){
        for (let index = 0; index < dbCollection.length; index++) {
            if(dbCollection[index].dbName == req.body.dbName){
                var database = dbCollection[index];
                for (let i = 0; i < database.tables.length; i++) {
                    if(database.tables[i].tableName == req.body.tbName){
                        var table = database.tables[i];
                        var result = "";

                        if(Object.keys(req.query).length > 0){
                            for(var key in req.query){
                                if(req.query.hasOwnProperty(key)){
                                    result = database.getAll(table, (n) => {
                                        if(n[key] == req.query[key]){
                                            return true;
                                        }
                                    });
                                }
                            }
                        }
                        else{
                            result = database.getAll(table);
                        }

                        var json = "";
                        for (let jsObjectIndex = 0; jsObjectIndex < result.length; jsObjectIndex++) {
                            json += JSON.stringify(result[jsObjectIndex]);              
                        }

                        return res.json(json);
                    } 
                }
            }   
        }
    }

    return res.status(404).redirect('/error');
});

app.get('/delete', (req, res) => {
    res.sendFile(`${__dirname}/Views/delete.html`);
});

app.post('/delete', (req, res) => {
    if(req.body.dbName && req.body.tbName){
        for (let index = 0; index < dbCollection.length; index++) {
            if(dbCollection[index].dbName == req.body.dbName){
                var database = dbCollection[index];
                for (let i = 0; i < database.tables.length; i++) {
                    if(database.tables[i].tableName == req.body.tbName){
                        var table = database.tables[i];
                        var result = false;
                        if(Object.keys(req.query).length > 0){
                            for(var key in req.query){
                                if(req.query.hasOwnProperty(key)){
                                    result = database.delete(table, (n) => {
                                        if(n[key] == req.query[key]){
                                            return true;
                                        }
                                    });

                                    if(result){
                                        database.save(table);
                                    }
                                }
                            }

                            if(result){
                                return res.redirect('/success');
                            }
                            else{
                                return res.status(404).redirect('/error');
                            }
                        }

                        return res.status(404).redirect('/error');
                    } 
                }
            }   
        }
    }

    return res.status(404).redirect('/error');
});

app.get('/update', (req, res) => {
    res.sendFile(`${__dirname}/Views/update.html`);
});

app.post('/update', (req, res) => {
    if(req.body.dbName && req.body.tbName && req.body.name){
        for (let index = 0; index < dbCollection.length; index++) {
            if(dbCollection[index].dbName == req.body.dbName){
                var database = dbCollection[index];
                for (let i = 0; i < database.tables.length; i++) {
                    if(database.tables[i].tableName == req.body.tbName){
                        var table = database.tables[i];
                        var result = false;
                        if(Object.keys(req.query).length > 0){
                            for(var key in req.query){
                                if(req.query.hasOwnProperty(key)){
                                    result = database.update(table, 
                                    {
                                        "name" : req.body.name
                                    },

                                    (n) => {
                                        if(n[key] == req.query[key]){
                                            return true;
                                        }
                                    });

                                    if(result){
                                        database.save(table);
                                    }
                                }
                            }

                            if(result){
                                return res.redirect('/success');
                            }
                            else{
                                return res.status(404).redirect('/error');
                            }
                        }

                        return res.status(404).redirect('/error');
                    } 
                }
            }   
        }
    }

    return res.status(404).redirect('/error');
});

app.get('/error', (req, res) => {
    res.sendFile(`${__dirname}/Views/error.html`);
});

app.get('/success', (req, res) => {
    res.sendFile(`${__dirname}/Views/success.html`);
});

app.listen(PORT, () => {
    console.log(`DB server running on ... ${PORT}`);
});