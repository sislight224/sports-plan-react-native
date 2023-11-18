// Object modelling for department. This model will represent in the database and
// we will read the all the information according to this model.
// You can think that this is a representation of the database and we are using that
// for saving, reading, updating information from the database.

var mongoose = require('mongoose');

var boardSchema = mongoose.Schema({
    userId: {
        type: String
    },
    data: {
        type: String
    },
    boardType: {
        type: String
    },
    isShare: {
        type: Boolean
    },
    date: {
        type: String
    },
    name: {
        type: String
    }
});

var Board = module.exports = mongoose.model('Board', boardSchema);

// These are functions to get data from the database. You can even reach the information
// without calling this functions but I just want to show you how you can add some functions
// to your model file to get specific data.

module.exports.getAllBoards = function (query, callback) {
    Board.find(query, callback)
}
module.exports.getBoardById = function (id, callback) {
    Board.findById(id, callback);
}

module.exports.updateBoardById = function (id, newBoard, callback) {
    Board.findByIdAndUpdate(id, newBoard, callback);
}

module.exports.deleteBoardByID = function(id, callback) {
    Board.deleteOne({
        _id: id
    }, callback)
}

module.exports.createBoard = function(newBoard, callback) {
    var query = new Board(newBoard);
    query.save(callback)
}