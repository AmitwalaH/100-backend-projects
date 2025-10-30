const { Queue } = require('bullmq');

const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
};

// Initialize the Queue instance
const mailQueue = new Queue("email-queue", { connection });

async function addMailJob(email, subject, body) {
  // Add the job to the Redis queue
  await mailQueue.add("sendEmail", { email, subject, body });
  console.log(`Job added to queue for email: ${email}`);
}

module.exports = {
  addMailJob,
  connection,
};
