var fs = require('fs');
var os = require('os');
var date = new Date();
const folder = "Saves";

var db = function(name, options){
    this.name = name;
    if(!options){
        options = {};
        options.overrideExisting = false;
    }
    createDb(name, options.overrideExisting);
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
    saveToDb(this.name, json + os.EOL);
}

db.prototype.insertAll = function(arr){
    arr.forEach(obj => {
        addUniqueId(obj);
        var json = JSON.stringify(obj);
        saveToDb(this.name, json + os.EOL); 
    });
}

var saveToDb = (fileName, data) => {
    var path = `./${folder}/${fileName}`;
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

var createDb = (fileName, overrideFile) => {
    createFolder();
    var path = `./${folder}/${fileName}`;
    //By default do not override the file
    var flag;
    overrideFile ? flag = 'w' : flag = 'a';
    fs.closeSync(fs.openSync(path, flag));
}

module.exports = db;