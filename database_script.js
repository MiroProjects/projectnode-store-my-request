var fs = require('fs');
var os = require('os');
const separator = os.EOL;
var db = {};

var Database = function(dbName){
    this.dbName = dbName;
    this.path = `./${dbName}`;
    this.tables = [];
    createDb(this);
}

var Table = function(tableName, db,  options){
    this.tableName = tableName;
    this.database = db.dbName;
    this.path = `./${this.database}/${this.tableName}`;
    this.options = options;
    this.bufferArray = [];
    this.savedItemsArray = [];
    this.countChangedItems = 0;
    createTable(this);
    db.tables.push(this);
};

db.newDatabase = (dbName) => {
    if(!dbName){
        console.log("Provide correct database name");
        return null;
    }
    return new Database(dbName);
};

db.newTable = (tableName, db,  options) => {
    if(!tableName){
        console.log("Provide correct table name");
        return null;
    }
    if(!db){
        console.log("Provide correct database object");
        return null;
    }
    if(!options){
        options = {};
    }
    if(!options.overrideExisting){
        options.overrideExisting = false;
    }

    return new Table(tableName, db,  options);
};

var getUniqueId = function(length, maxNumber, minNumber){
    var generator = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890.,-_()*&";
    var generatedString = "";

    for (let i = 0; i < length; i++) {
        var index = parseInt(Math.floor((Math.random() * (maxNumber - minNumber + 1) + minNumber) % generator.length));
        generatedString += generator[index];
    }
    return generatedString;
}

var addUniqueId = function(obj){
    obj["_db_id"] = getUniqueId(10, 5000, 0);
}

Database.prototype.insert = function(obj, table){
    if(!(obj && typeof obj === 'object')){
        console.log("Provide javascript object to save");
        return;
    }

    if(!(table && typeof table === 'object')){
        console.log("Provide correct table to save the object");
        return;
    }

    //Auto flush
    if(table.bufferArray.length >= 5){
        this.flush(table);
    }

    addUniqueId(obj);
    table.bufferArray.push(obj);
    table.savedItemsArray.push(obj);
}

Database.prototype.insertCollection = function(collection, table){
    if(!Array.isArray(collection)){
        console.log("Provide an array of objects to save");
        return;
    }

    if(!(table && typeof table === 'object')){
        console.log("Provide correct table to save the object");
        return;
    }

    for (let index = 0; index < collection.length; index++) {
        this.insert(collection[index], table);
    }
}

var insertAll = function(table){
    var stringCol = "";
    table.bufferArray.forEach(obj => {
        var json = JSON.stringify(obj);
        var jsonWithSeparator = json + separator;
        stringCol += jsonWithSeparator;
    });
    saveToDb(table.path, stringCol);
}

Database.prototype.getAll = function(table, filter){
    if(!(table && typeof table === 'object')){
        console.log("Provide correct table to save the object");
        return;
    }

    if (filter) {
        var filterArray = [];
        table.savedItemsArray.forEach((jsObj) => {
            if (filter(jsObj)) {
                filterArray.push(jsObj);
            }
        });
        return filterArray;
    }
    return table.savedItemsArray;
};

Database.prototype.update = function(table, set, condition){
    if(!(table && typeof table === 'object')){
        console.log("Provide a correct table to save the object");
        return;
    }

    if(!(set && typeof set === 'object')){
        console.log("Provide a correct set to update the table's objects");
        return;
    }

    if(!condition){
        console.log("Provide a correct function to find the object to update");
        return;
    }

    //Auto save
    if(table.countChangedItems >= 5){
        save(table);
    }

    for (let index = 0; index < table.savedItemsArray.length; index++) {
        if(condition(table.savedItemsArray[index])){
            for (var key in set) {
                if (set.hasOwnProperty(key)) {
                    table.savedItemsArray[index][key] = set[key];
                    table.countChangedItems++;
                    return true;
                 }
            } 
        }       
    }
    return false;
};

Database.prototype.delete = function(table, condition){
    if(!(table && typeof table === 'object')){
        console.log("Provide a correct table to save the object");
        return;
    }

    if(!condition){
        console.log("Provide a correct function to find the object to update");
        return;
    }

    //Auto save
    if(table.countChangedItems >= 5){
        save(table);
    }

    for (let index = 0; index < table.savedItemsArray.length; index++) {
        if(condition(table.savedItemsArray[index])){
            table.savedItemsArray.splice(index, 1);
            table.countChangedItems++;
            return true;
        }        
    }
    return false;
};

//Function used to save the changes made on the buffer(update and delete)
Database.prototype.save = function(table){
    if(!(table && typeof table === 'object')){
        console.log("Provide correct table to save the object");
        return;
    }
    
    var stringCol = "";
    table.savedItemsArray.forEach(obj => {
        var json = JSON.stringify(obj);
        var jsonWithSeparator = json + separator;
        stringCol += jsonWithSeparator;
    });
    overrideTable(table.path, stringCol);
};

//Function used to insert the changes added to the temporary buffer(getAll)
Database.prototype.flush = function(table){
    if(!(table && typeof table === 'object')){
        console.log("Provide correct table to save the object");
        return;
    }

    insertAll(table);
    table.bufferArray = [];
};

var getSavedElements = (path) => {
    var rawDbData = fs.readFileSync(path, 'utf8').toString();
    var jsonCollection = rawDbData.split(separator);
    jsonCollection.pop();
    return parseJsonArray(jsonCollection);
}

var parseJsonArray = (jsonArr) => {
    var jsArray = [];
    jsonArr.forEach((jsonObject) => {
        jsArray.push(JSON.parse(jsonObject));
    });
    return jsArray;
};

var saveToDb = (path, data) => {
    fs.appendFile(path, data, function (err) {
        if (err) {
            console.log('Not saved!');
            throw err;
        }
        console.log('Saved!');
      });
};

//For updating or deleting the objects in the table
var overrideTable = (path, data) => {
    fs.writeFile(path, data, (err) => {
        if(err){
            console.log("Error while writing to file");
            return;
        }
    });
};

var createDb = (db) => {
    var dir = db.path;
    if (!fs.existsSync(dir)) {
        console.log("Database was successfully created!");
        fs.mkdirSync(dir);
    }
    else{
        console.log("This database already exists!");
    }
}

var createTable = (table) => {
    //By default do not override the file
    var flag = 'a';
    table.options.overrideExisting ? flag = 'w' : flag = 'a';
    fs.closeSync(fs.openSync(table.path, flag));
    if(flag === 'a'){
        table.savedItemsArray = getSavedElements(table.path);
    }
    else{
        console.log(`Table ${table.tableName} in ${table.database} was successfully replaced!`);
        return;
    }

    console.log(`Table ${table.tableName} in ${table.database} was successfully created!`);
};

module.exports = db;