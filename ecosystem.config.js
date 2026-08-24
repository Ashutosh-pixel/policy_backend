module.exports = {
    apps: [
        {
            name: "backend",
            script: "./src/index.js",
            autorestart: true,
            watch: false
        }
    ]
};