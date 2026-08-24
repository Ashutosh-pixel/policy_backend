const { Worker } = require("worker_threads");
const path = require("path");

const uploadPolicies = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "file is required" });
    }

    // console.log("file=", req.file);

    const workerpath = path.resolve("src/worker/worker.js");

    const worker = new Worker(workerpath, {
        workerData: {
            filePath: req.file.path,
        },
    });

    worker.on("message", (result) => {
        if (result.success) {
            return res.status(200).json({
                message: "file processed successfully",
                result,
            });
        }

        return res.status(500).json({
            message: result.message,
        });
    });

    worker.on("error", (error) => {
        console.error(error);

        return res.status(500).json({
            message: "file processing failed",
        });
    });
}

module.exports = uploadPolicies;