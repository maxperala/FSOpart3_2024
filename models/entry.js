const mongoose = require("mongoose");

const numSchema = mongoose.Schema({
    
    name: {
        type: String,
        unique: true
    },
    number: String
});

numSchema.set("toJSON", {
    transform: (document, retObj) => {
        retObj.id = retObj._id.toString();
        delete retObj._id;
        delete retObj.__v;
    }
})

const Entry = mongoose.model('Entry', numSchema);

module.exports = Entry;