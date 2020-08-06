var mongoose = require("mongoose");

var schemaStudent = new mongoose.Schema({
    Name : String,
    Image : String,
    Age : Number
});

//khoi tao model lay tu cau truc schemaStudent
module.exports = mongoose.model("Student" , schemaStudent);