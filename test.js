var db = require('./database_script');

var event = {
    name : "Sport event",
    time : new Date().getDate(),
    duration: 10,
    day: "Monday"
}

var event2 = {
    name : "Cinema event",
    time : new Date().getDate(),
    duration: 25,
    day: "Mondays"
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

var event5 = {
    name : "Birthday event",
    time : new Date().getDate(),
    duration: 12,
    day: "Monday"
}

var event6 = {
    name : "Birthday event",
    time : new Date().getDate(),
    duration: 10,
    day: "Monday"
}

//New database
 var eventsDatabase = db.newDatabase("events-database");

 //New tables
 var eventsTable = db.newTable("Events", eventsDatabase);
 var eventsTable2 = db.newTable("Events2", eventsDatabase);

//insert in the first table
eventsDatabase.insert(event, eventsTable);
eventsDatabase.insert(event2, eventsTable);
eventsDatabase.flush(eventsTable);

//insert a collection in the second table using autoflush
var arr = [event, event2, event3, event4, event5, event6];
eventsDatabase.insertCollection(arr, eventsTable2);

//testing getAll
var get1 = eventsDatabase.getAll(eventsTable2);
console.log(get1);

//testing getAll with filter
var get2 = eventsDatabase.getAll(eventsTable2, (n) => {
    if(n.duration == 25){
        return true;
    }
});
console.log(get2);

//tesing update
//if more than one elements meet the condition then only the first found element is changed
var isUpdated = eventsDatabase.update(eventsTable2, 
    {
        "name" : "Birthday UPDATED event",
        "time" : "5" 
    },
    (n) => {
        if(n.duration == 12){
            return true;
        }
    });

//the update function returns true if the object is found and is successfully updated and false if it is not
console.log(isUpdated);

//delete with correct id
//if more than one elements meet the condition then only the first found element is changed
// var isDeleted = eventsDatabase.delete(eventsTable2, (n) => {
//     if(n._db_id == "correct_db_id"){
//         return true;
//     }
//  });

//the delete function returns true if the object is found and is successfully deleted and false if it is not
//  console.log(isDeleted);

 //save is used for both update and delete
 //if more than five update or/and delete operations are used then the autosave is activated
 eventsDatabase.save(eventsTable2);