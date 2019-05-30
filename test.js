var db = require('./database_script');
var myDb = new db("events_db", {overrideExisting : false});

var event = {
    name : "Sport event",
    time : new Date().getDate(),
    duration: 10,
    day: "Monday"
}

var event2 = {
    name : "Cinema event",
    time : new Date().getDate(),
    duration: 10,
    day: "Monday"
}

var event3 = {
    name : "Party event",
    time : new Date().getDate(),
    duration: 10,
    day: "Monday"
}

var event4 = {
    name : "Birthday event",
    time : new Date().getDate(),
    duration: 10,
    day: "Monday"
}

myDb.insert(event);
myDb.insert(event2);

var arr = [event3, event4];
myDb.insertAll(arr);