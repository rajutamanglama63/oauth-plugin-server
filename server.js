const express = require("express");
const path = require("path")
const cors = require('cors')
const dotenv = require("dotenv");
const oauthRouter = require("./controllers/oauth");
const userRouter = require("./controllers/user");

const app = express();

dotenv.config();

const Port = process.env.PORT || 4001;

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"))

app.use(express.json());

app.use(cors());

app.use("/api", oauthRouter);
app.use("/api", userRouter);

app.listen(Port, () => {
    console.log(`Server running on Port http://localhost:${Port}`);
})
