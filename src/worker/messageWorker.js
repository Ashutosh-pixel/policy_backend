const { Worker } = require("bullmq");
const redisConnection = require("../config/redis.js");
const Message = require("../model/Message.js");
const connectDB = require("../db/connection.js");
require("dotenv").config();

const startWorker = async () => {
    await connectDB();

    const worker = new Worker(
        "messageQueue",
        async (job) => {
            await Message.create({
                message: job.data.message,
                scheduledAt: job.data.scheduledAt,
            });

            console.log(`Message ${job.id} inserted`);
        },
        {
            connection: redisConnection,
        }
    );

    worker.on("completed", (job) => {
        console.log(`Job ${job.id} completed`);
    });

    worker.on("failed", (job, error) => {
        console.error(`Job ${job?.id} failed`, error);
    });
};

startWorker();