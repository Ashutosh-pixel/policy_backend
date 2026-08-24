const os = require("os")

function getCpuUsage() {
    const cpus = os.cpus();

    let idle = 0;
    let total = 0;

    cpus.forEach((cpu) => {
        idle += cpu.times.idle;

        total +=
            cpu.times.user +
            cpu.times.nice +
            cpu.times.sys +
            cpu.times.idle +
            cpu.times.irq;
    });

    return {
        idle,
        total,
    };
}

function monitorCpu(CPU_THRESHOLD_PERCENT = 70, delay = 5000) {
    const start = getCpuUsage();

    setTimeout(() => {
        const end = getCpuUsage();

        const idleDiff = end.idle - start.idle;
        const totalDiff = end.total - start.total;

        const usage = 100 - (idleDiff / totalDiff) * 100;

        console.log(`CPU Usage: ${usage.toFixed(2)}%`);

        if (usage >= CPU_THRESHOLD_PERCENT) {
            console.log(`CPU usage exceeded ${CPU_THRESHOLD_PERCENT}%. Restarting server...`);

            process.exit(1);
        }

        monitorCpu(CPU_THRESHOLD_PERCENT, delay);
    }, delay);
}

module.exports = monitorCpu;