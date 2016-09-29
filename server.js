var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var SAT_FLASHCARDS_COLLECTION = "satflashcards";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
    if (err) {
        console.log(err);
        process.exit(1);
    }

    // Save database object from the callback for reuse.
    db = database;
    console.log("Database connection ready");

    // Initialize the app.
    var server = app.listen(process.env.PORT || 8080, function () {
        var port = server.address().port;
        console.log("App now running on port", port);
    });
});

// CONTACTS API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
}

/*  "/satflashcards"
 *    GET: finds all sat flash cards
 *    POST: creates a new sat flash card
 */

app.get("/satflashcard", function(req, res) {
    db.collection(SAT_FLASHCARDS_COLLECTION).find({}).toArray(function(err, docs) {
        if (err) {
            handleError(res, err.message, "Failed to get flashcards.");
        } else {
            res.status(200).json(docs);
        }
    });
});

app.get("/satflashcard/next/:index", function(req, res) {
    var options = {};
    options.limit = 3;
    options.skip = parseInt(req.params.index);
    
    db.collection(SAT_FLASHCARDS_COLLECTION).find({},options).toArray(function(err, docs) {
        if (err) {
            handleError(res, err.message, "Failed to get flashcards.");
        } else {
            res.status(200).json(docs);
        }
    });
});

app.post("/satflashcard", function(req, res) {
    var newSatFlashCard = req.body;
    newSatFlashCard.createDate = new Date();

    if (!(req.body.question || req.body.answer)) {
        handleError(res, "Invalid user input", "Must provide question and an answer", 400);
    }

    db.collection(SAT_FLASHCARDS_COLLECTION).insertOne(newSatFlashCard, function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to create new sat flash card.");
        } else {
            res.status(201).json(doc.ops[0]);
        }
    });
});

/*  "/sathflashcard/:id"
 *    GET: find satflashcard by id
 *    PUT: update satflashcard by id
 *    DELETE: deletes satflashcard by id
 */

app.get("/satflashcard/:id", function(req, res) {
    db.collection(SAT_FLASHCARDS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to get sat flash card");
        } else {
            res.status(200).json(doc);
        }
    });
});

app.put("/satflashcard/:id", function(req, res) {
    var updateDoc = req.body;
    delete updateDoc._id;

    db.collection(SAT_FLASHCARDS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to update sat flash card");
        } else {
            res.status(204).end();
        }
    });
});

app.delete("/satflashcard/:id", function(req, res) {
    db.collection(SAT_FLASHCARDS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
        if (err) {
            handleError(res, err.message, "Failed to delete sat flash card");
        } else {
            res.status(204).end();
        }
    });
});

app.get("/satflashcard/question/:id", function(req, res) {
    db.collection(SAT_FLASHCARDS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to get sat flash card");
        } else {
            var question = {};
            question.text = doc.question;
            res.status(200).json(question);
        }
    });
});

app.get("/satflashcard/answer/:id", function(req, res) {
    db.collection(SAT_FLASHCARDS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to get sat flash card");
        } else {
            var answer = {};
            answer.text = doc.answer;
            res.status(200).json(answer);
        }
    });
});