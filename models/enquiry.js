const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema({
    name: String,
    product: String,
    phone: String,
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Enquiry", enquirySchema);
