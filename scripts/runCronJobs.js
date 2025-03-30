const { CronJob } = require("cron");

// run every day at midnight
const dailyJob = new CronJob("0 0 * * *", () => {
  console.log("Running daily cron job at midnight");
});

// run every hour
const hourlyJob = new CronJob("0 * * * *", () => {
  console.log("Running hourly cron job");
});

// run every minute
const minuteJob = new CronJob("* * * * *", () => {
  console.log("Running minute cron job");
});

// Start the cron jobs
dailyJob.start();
hourlyJob.start();
minuteJob.start();

console.log("Cron jobs have been scheduled.");
