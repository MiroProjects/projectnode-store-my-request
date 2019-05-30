var fs = require('fs');
var os = require('os');
var date = new Date();
const folder = "Saves";
const separator = os.EOL;

var db = function(name, options){
    this.name = name;
    this.path = `./${folder}/${this.name}`;
    if(!options){
        options = {};
    }
    if(!options.overrideExisting){
        options.overrideExisting = false;
    }
    this.options = options;
    createDb(this);
}

var getUniqueId = function(){
    return date.getTime();
}

var addUniqueId = function(obj){
    obj["_db_id"] = getUniqueId();
}

db.prototype.insert = function(obj){
    addUniqueId(obj);
    var json = JSON.stringify(obj);
    saveToDb(this.path, json + separator);
}

db.prototype.insertAll = function(arr){
    arr.forEach(obj => {
        addUniqueId(obj);
        var json = JSON.stringify(obj);
        saveToDb(this.path, json + separator); 
    });
}

db.prototype.getAll = function (result) {
    fs.readFile(this.path, 'utf8', (err, data) => {
        if(!err){
            var jsonArr = data.split(separator);
            //Remove the last separator
            jsonArr.pop();
            var jsArray = parseJsonArray(jsonArr);
            result(jsArray);
        } else{
            console.log(`An error occured: ${err}`);
        }
    });
}

db.prototype.get = function (filter, result) {
    this.getAll((jsArray) => {
        jsArray.forEach((jsObject) => {
            if(filter(jsObject)){
                result(jsObject);
            }
        });
    });
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
}

var createFolder = () => {
    var dir = `./${folder}`;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

var createDb = (db) => {
    createFolder();
    //By default do not override the file
    var flag;
    db.options.overrideExisting ? flag = 'w' : flag = 'a';
    fs.closeSync(fs.openSync(db.path, flag));
}

module.exports = db;