const os = require("os");

const interfaces = os.networkInterfaces();

for (const name of Object.keys(interfaces)) {
  for (const iface of interfaces[name] || []) {
    if (
      iface.family === "IPv4" &&
      !iface.internal &&
      !iface.address.startsWith("169.")
    ) {
      console.log(`🌐 Interface: ${name}, IP: ${iface.address}`);
    }
  }
}
