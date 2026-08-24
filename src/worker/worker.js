const mongoose = require("mongoose");
const { workerData, parentPort } = require("worker_threads");
const XLSX = require("xlsx");

const Agent = require("../model/Agent.js");
const User = require("../model/User.js");
const UserAccount = require("../model/UserAccount.js");
const PolicyCategory = require("../model/PolicyCategory.js");
const PolicyCarrier = require("../model/PolicyCarrier.js");
const PolicyInfo = require("../model/PolicyInfo.js");

const BATCH_SIZE = 1000;


const processFile = async () => {
    await mongoose.connect(process.env.DB_URI);

    const workbook = XLSX.readFile(workerData.filePath);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(sheet);

    console.log(`Total rows: ${rows.length}`);

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);

        await processBatch(batch);

        console.log(
            `Processed ${Math.min(i + BATCH_SIZE, rows.length)} / ${rows.length}`
        );
    }

    await mongoose.disconnect();

    parentPort.postMessage({
        success: true,
        totalRows: rows.length,
    });
};

processFile().catch(async (error) => {
    console.error(error);

    await mongoose.disconnect();

    parentPort.postMessage({
        success: false,
        message: error.message,
    });
});


function excelDateToJSDate(serial) {
    if (!serial) return null;

    // Excel date serial → JS Date
    return new Date(
        Date.UTC(1899, 11, 30) + Number(serial) * 24 * 60 * 60 * 1000
    );
}

async function processBatch(rows) {
    // --------------------------------------------------
    // 1. AGENTS
    // --------------------------------------------------

    await Agent.bulkWrite(
        rows.map((row) => ({
            updateOne: {
                filter: {
                    agentName: row.agent.trim().toLowerCase(),
                },
                update: {
                    $setOnInsert: {
                        agentName: row.agent.trim().toLowerCase(),
                    },
                },
                upsert: true,
            },
        })),
        { ordered: false }
    );

    const agentNames = [
        ...new Set(
            rows.map((row) => row.agent.trim().toLowerCase())
        ),
    ];

    const agents = await Agent.find({
        agentName: { $in: agentNames },
    }).lean();

    const agentMap = new Map(
        agents.map((agent) => [agent.agentName, agent._id])
    );

    // --------------------------------------------------
    // 2. USERS
    // --------------------------------------------------

    const userOperations = rows.map((row) => {
        const email = row.email.trim().toLowerCase();
        // const agentId = agentMap.get(
        //     row.agent.trim().toLowerCase()
        // );

        return {
            updateOne: {
                filter: { email },
                update: {
                    $set: {
                        firstName: row.firstname?.trim(),
                        dob: excelDateToJSDate(row.dob),
                        address: row.address,
                        phone: String(row.phone),
                        state: row.state,
                        zipCode: String(row.zip),
                        email,
                        gender: row.gender || undefined,
                        userType: row.userType,
                        // agentId,
                    },
                },
                upsert: true,
            },
        };
    });

    await User.bulkWrite(userOperations, {
        ordered: false,
    });

    // --------------------------------------------------
    // 3. GET USERS
    // --------------------------------------------------

    const emails = [
        ...new Set(
            rows.map((row) => row.email.trim().toLowerCase())
        ),
    ];

    const users = await User.find({
        email: { $in: emails },
    }).lean();

    const userMap = new Map(
        users.map((user) => [user.email, user._id])
    );

    // --------------------------------------------------
    // 4. USER ACCOUNTS
    // --------------------------------------------------

    await UserAccount.bulkWrite(
        rows.map((row) => ({
            updateOne: {
                filter: {
                    accountName: row.account_name.trim().toLowerCase(),
                },
                update: {
                    $set: {
                        userId: userMap.get(
                            row.email.trim().toLowerCase()
                        ),
                    },
                },
                upsert: true,
            },
        })),
        { ordered: false }
    );

    // --------------------------------------------------
    // 5. POLICY CATEGORIES / LOB
    // --------------------------------------------------

    await PolicyCategory.bulkWrite(
        rows.map((row) => ({
            updateOne: {
                filter: {
                    categoryName: row.category_name.trim().toLowerCase(),
                },
                update: {
                    $setOnInsert: {
                        categoryName: row.category_name.trim().toLowerCase(),
                    },
                },
                upsert: true,
            },
        })),
        { ordered: false }
    );

    const categoryNames = [
        ...new Set(
            rows.map((row) =>
                row.category_name.trim().toLowerCase()
            )
        ),
    ];

    const categories = await PolicyCategory.find({
        categoryName: { $in: categoryNames },
    }).lean();

    const categoryMap = new Map(
        categories.map((category) => [
            category.categoryName,
            category._id,
        ])
    );

    // --------------------------------------------------
    // 6. POLICY CARRIERS
    // --------------------------------------------------

    await PolicyCarrier.bulkWrite(
        rows.map((row) => ({
            updateOne: {
                filter: {
                    companyName: row.company_name.trim().toLowerCase(),
                },
                update: {
                    $setOnInsert: {
                        companyName: row.company_name.trim().toLowerCase(),
                    },
                },
                upsert: true,
            },
        })),
        { ordered: false }
    );

    const companyNames = [
        ...new Set(
            rows.map((row) =>
                row.company_name.trim().toLowerCase()
            )
        ),
    ];

    const carriers = await PolicyCarrier.find({
        companyName: { $in: companyNames },
    }).lean();

    const carrierMap = new Map(
        carriers.map((carrier) => [
            carrier.companyName,
            carrier._id,
        ])
    );

    // --------------------------------------------------
    // 7. POLICIES
    // --------------------------------------------------

    const policyOperations = rows.map((row) => ({
        updateOne: {
            filter: {
                policyNumber: row.policy_number.trim().toUpperCase(),
            },
            update: {
                $set: {
                    policyNumber: row.policy_number.trim().toUpperCase(),

                    policyStartDate: excelDateToJSDate(
                        row.policy_start_date
                    ),

                    policyEndDate: excelDateToJSDate(
                        row.policy_end_date
                    ),

                    policyCategoryId: categoryMap.get(
                        row.category_name.trim().toLowerCase()
                    ),

                    carrierId: carrierMap.get(
                        row.company_name.trim().toLowerCase()
                    ),

                    userId: userMap.get(
                        row.email.trim().toLowerCase()
                    ),
                    agentId: agentMap.get(
                        row.agent.trim().toLowerCase()
                    )
                },
            },
            upsert: true,
        },
    }));

    await PolicyInfo.bulkWrite(policyOperations, {
        ordered: false,
    });
}