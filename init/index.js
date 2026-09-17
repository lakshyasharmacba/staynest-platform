const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const mongoUrl = process.env.ATLASDB_URL;

async function main() {
    if (!mongoUrl) {
        throw new Error("ATLASDB_URL is missing. Add it to your .env file before initializing data.");
    }
    await mongoose.connect(mongoUrl);
}

main()
    .then(() => {
        console.log("Connected to DB");
        initDB();
    })
    .catch((err) => {
        console.log("Database connection error:", err);
    });

const initDB = async () => {
    try {
        await Listing.deleteMany({});

        // Find an existing user or use fallback ObjectId
        let ownerId = "6a6b17b2863179212437a447";
        const anyUser = await User.findOne({});
        if (anyUser) {
            ownerId = anyUser._id;
        }

        initData.data = initData.data.map((obj) => ({
            ...obj,
            owner: ownerId,
            geometry: {
                type: "Point",
                coordinates: [77.2090, 28.6139]
            }
        }));

        await Listing.insertMany(initData.data);
        console.log("Data was Initialized Successfully with " + initData.data.length + " listings!");
        mongoose.connection.close();
    } catch (err) {
        console.error("Initialization error:", err);
    }
};