const UserAccount = require("../model/UserAccount");

const searchPolicy = async (req, res) => {
    try {
        const username = req.query.username;

        if (!username.trim()) {
            return res.status(400).json({ message: "username is required" })
        }

        const output = await UserAccount.aggregate([
            {
                $match: {
                    accountName: { $regex: `^${username.trim()}`, $options: "i" }
                }
            },
            {
                $lookup: {
                    from: "policyinfos",
                    localField: "userId",
                    foreignField: "userId",
                    as: "policyDetails"
                }
            },
            {
                $project: {
                    _id: 0,
                    __v: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    userId: 0,

                    "policyDetails.__v": 0,
                    "policyDetails.updatedAt": 0,
                    "policyDetails.createdAt": 0,
                }
            }
        ]);

        res.json({ result: output });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "something went wrong",
        });
    }
}

const getPolicies = async (req, res) => {
    try {

        const page = Number(req.query.page);
        const limit = Number(req.query.limit);

        const skip = (page - 1) * limit;

        // Validate pagination
        if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
            return res.status(400).json({
                message: "invalid pagination parameters",
            });
        }

        // console.log(page, limit);

        const output = await UserAccount.aggregate([
            {
                $lookup: {
                    from: "policyinfos",
                    localField: "userId",
                    foreignField: "userId",
                    as: "policyDetails"
                }
            },
            {
                $project: {
                    _id: 0,
                    __v: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    userId: 0,

                    "policyDetails.__v": 0,
                    "policyDetails.updatedAt": 0,
                    "policyDetails.createdAt": 0,
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            }
        ]);

        const total = await UserAccount.countDocuments();

        res.json({
            result: output,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit: limit
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "something went wrong",
        });
    }
}

module.exports = { searchPolicy, getPolicies };