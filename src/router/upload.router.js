const express = require("express");
const multer = require("multer");
const uploadPolicies = require("../controller/upload.controller");

const router = express.Router();

const upload = multer({
    dest: "uploads/",
});


router.post("/", upload.single("file"), uploadPolicies);

module.exports = router;