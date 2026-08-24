const messageQueue = require("../queue/messageQueue");

const createMessage = async (req, res) => {
    try {
        const { message, day, time } = req.body;

        if (!message || !day || !time) {
            return res.status(400).json({
                message: "message, day and time are required",
            });
        }

        const scheduledAt = new Date(`${day}T${time}:00`);

        if (isNaN(scheduledAt.getTime())) {
            return res.status(400).json({
                message: "invalid date or time",
            });
        }

        const delay = scheduledAt.getTime() - Date.now();

        if (delay <= 0) {
            return res.status(400).json({
                message: "date and time already passed",
            });
        }

        await messageQueue.add(
            "insert-message",
            {
                message,
                scheduledAt,
            },
            {
                delay,
            }
        );

        res.status(201).json({
            message: "Message scheduled successfully",
            scheduledAt,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = createMessage;