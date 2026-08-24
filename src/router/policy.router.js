const express = require("express");
const { searchPolicy, getPolicies } = require("../controller/policy.controller");

const router = express.Router();

router.get("/search", searchPolicy);
router.get("/", getPolicies);

module.exports = router;