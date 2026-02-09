require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const twilio = require("twilio");

const Enquiry = require("./models/enquiry");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(express.static("public"));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("MongoDB Connection Error:", err));



console.log("MongoDB Connected");


// TWILIO CONFIGURATION
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;

const client = twilio(accountSid, authToken);

const twilioNumber =process.env.TWILIO_NUMBER;


// API TO SAVE ENQUIRY AND SEND AUTOMATED MESSAGES
app.post("/api/enquiry", async (req, res) => {

    try {

        const { name, product, phone } = req.body;

        // Save to Database
        const newEnquiry = new Enquiry({
            name,
            product,
            phone
        });

        await newEnquiry.save();

        console.log("New Enquiry Saved:", req.body);


        // ---- AUTOMATED SMS ----
        client.messages.create({
            body: `Hello ${name}, your enquiry for ${product} is received at VRS Agro Service. We will contact you soon.`,
            from: twilioNumber,
            to: phone
        })
        .then(message => console.log("SMS Sent:", message.sid))
        .catch(err => console.log("SMS Error:", err));


        // ---- AUTOMATED WHATSAPP ----
        client.messages.create({
            body: `Hi ${name}, thanks for contacting VRS Agro Service about ${product}. Our team will reach you shortly.`,
            from: "whatsapp:+141552388866",
            to: "whatsapp:" + phone
        })
        .then(msg => console.log("WhatsApp Sent:", msg.sid))
        .catch(err => console.log("WhatsApp Error:", err));


        // ---- AUTOMATED VOICE CALL ----
        client.calls.create({
            twiml: `<Response><Say>Hello ${name}. Thank you for contacting VRS Agro Service. We received your enquiry for ${product}. We will call you soon.</Say></Response>`,
            to: phone,
            from: twilioNumber
        })
        .then(call => console.log("Call initiated:", call.sid))
        .catch(err => console.log("Call Error:", err));


        res.json({
            message: "Enquiry saved! SMS, WhatsApp and Call initiated."
        });


    } catch (error) {

        res.json({
            message: "Error processing enquiry"
        });

    }

});


// VIEW ALL ENQUIRIES
app.get("/api/enquiries", async (req, res) => {

    const data = await Enquiry.find();
    res.json(data);

});


app.listen(3000, () => {
    console.log("Server running on port 3000");
});
