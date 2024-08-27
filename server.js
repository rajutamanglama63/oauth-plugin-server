const express = require("express");
const dotenv = require("dotenv");
const oauthRouter = require("./controllers/oauth");

const app = express();

dotenv.config();

const Port = process.env.PORT || 4001;

app.use(express.json());

app.use("/", oauthRouter);

app.listen(Port, () => {
    console.log(`Server running on Port http://localhost:${Port}`);
})
