import { createClient } from "redis";

const client = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    }
});

// Pehle event listeners
client.on("error", (err) => {
    console.error("❌ Redis Client Error:", err.message);
});

client.on("ready", () => {
    console.log("✅ Redis connected successfully!");
});

// Phir connection
await client.connect();

export default client;