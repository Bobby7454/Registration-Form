const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");

const app = express();
dotenv.config();
const port = process.env.PORT || 3000;

const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;

mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.n9ynjcx.mongodb.net/RegistrationFormDB`, {
    // Removed deprecated options
});

// Registration schema
const registrationSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true }, // Ensure email is unique
    password: String,
});

// Model of registration schema
const Registration = mongoose.model("Registration", registrationSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await Registration.findOne({ email });
        if (!existingUser) {
            const registrationData = new Registration({
                name,
                email,
                password,
            });
            await registrationData.save();
            res.redirect("/success");
        } else {
            // Redirect to the error page if the user already exists
            res.redirect("/error");
        }
    } catch (error) {
        console.error('Error during registration:', error);
        res.redirect("/connection");
    }
});

app.get("/success", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "success.html"));
});

app.get("/error", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "error.html"));
});

app.get("/connection", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "connection lost.html"));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
