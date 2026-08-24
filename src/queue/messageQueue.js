const redisConnection = require("../config/redis");

const { Queue } = require("bullmq");

const messageQueue = new Queue("messageQueue", {
    connection: redisConnection
})

module.exports = messageQueue;