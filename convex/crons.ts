import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "purge read messages",
  { hours: 1 },
  internal.messages.purgeReadMessages,
  {}
);

export default crons;
