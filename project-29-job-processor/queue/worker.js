const { Worker } = require("bullmq");
const { connection } = require("./mailQueue");

const processor = async (job) => {
  const { email, subject, body } = job.data;

  // Simulating Heavy Work
  console.log(`[Worker] is Starting job ID ${job.id} for ${email}...`);
  await new Promise((resolve) => setTimeout(resolve, 2000)); // 2-second delay

  console.log(`[Worker] Success: Email sent to ${email}`);
  console.log(`[Worker] Subject: ${subject}`);
};

// Initializing the Worker
const worker = new Worker("email-queue", processor, { connection });

worker.on("ready", () => console.log("Worker is ready to process jobs."));
worker.on("failed", (job, error) =>
  console.error(`Job failed: ${job.id}`, error)
);
