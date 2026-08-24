const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./db/connection");
const uploadRoutes = require("./router/upload.router");
const policyRoutes = require("./router/policy.router");
const messageRoutes = require("./router/message.router");
const monitorCpu = require("./utils/process");

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/upload", uploadRoutes);
app.use("/api/policy", policyRoutes);
app.use("/api/message", messageRoutes);

connectDB().then(() => {
    console.log("DB connected👍");
    app.listen(process.env.PORT, async () => {
        console.log(`server started at ${process.env.PORT}😊`);
    })
}).then(() => {
    // server stop after 70% threshold
    monitorCpu(70, 5000);
})
