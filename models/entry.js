const mongoose = require("mongoose");

const numSchema = mongoose.Schema({
    
    name: {
        type: String,
        unique: true,
        minlength: 3,
    },
    number: {
        type: String,
        minlength: 8,
        validate: {
            validator: (num) => {
                return /^(0\d{1,2})-\d{5,10}$/.test(num);
            }
        }
    }
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