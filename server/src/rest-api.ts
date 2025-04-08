import schedule from "node-schedule";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
dotenv.config();

const app = express();
import { db } from "./db/knex";
import {
  createSecret,
  fetchSecretUsingSlug,
} from "./services/secret-sharing/secret-sharing-service";

// Middleware
app.use(cors());
app.use(express.json());

// Clean expired secrets chron job (every day at 3 AM)
//
// To see in action: Set a secret's expires_at date to before today and change the first chron job param to "*/5 * * * * *" so it runs every 5 seconds.
schedule.scheduleJob("0 3 * * *", async function () {
  console.log("--- Clearing Expired Secrets ---");

  const deletedCount = await db("secrets")
    .where("expires_at", "<=", new Date())
    .del();

  console.log(`Successfully deleted ${deletedCount} expired secrets`);
});

/*
##################################################
||                                              ||
||              Example endpoints               ||
||                                              ||
##################################################
*/

// My error handling here is a bit wacky due to my time restraints.
// I need custom error codes but dont want to waste time on a whole error handling setup.

// Get secret endpoint
app.get("/secret/:secretSlug", async (req, res) => {
  const { secretSlug } = req.params;
  const { password } = req.query;

  if (typeof password !== "string" && password) {
    res.json({
      success: false,
      errorCode: "BAD_REQUEST",
      errorMessage:
        "Password query parameter must be of type string or undefined",
    });
    return;
  }

  const response = await fetchSecretUsingSlug(
    secretSlug,
    password as string | undefined,
  );

  res.json(response);
});

// Create shareable secret link endpoint
app.post("/secret", async (req, res) => {
  const {
    activeDays,
    password,
    content,
    viewsCount,
  }: {
    activeDays: number;
    password?: string;
    content: string;
    viewsCount: number;
  } = req.body;

  console.log(viewsCount);

  // Input validation & error handling
  if (!content || !activeDays) {
    res.json({
      success: false,
      errorCode: "BAD_REQUEST",
      errorMessage: "Request body must contain content and activeDays",
    });
    return;
  }

  if (activeDays <= 0 || activeDays > 365) {
    res.json({
      success: false,
      errorCode: "BAD_REQUEST",
      errorMessage: "activeDays parameter must be between 0 and 365",
    });
    return;
  }

  if (viewsCount <= 0 || viewsCount > 100) {
    res.json({
      success: false,
      errorCode: "BAD_REQUEST",
      errorMessage: "viewsCount parameter must be between 0 and 100",
    });
    return;
  }

  if (typeof password !== "string" && password) {
    res.json({
      success: false,
      errorCode: "BAD_REQUEST",
      errorMessage: "Password parameter must be of type string or undefined",
    });
    return;
  }

  // Create the secret
  const secret = await createSecret({
    content,
    daysActive: activeDays,
    viewsCount,
    password: password || undefined,
  });

  res.json({ success: true, data: secret });
});

// ---------------------------------------- BOILERPLATE CODE BELOW ----------------------------------------

// Root endpoint - Returns a simple hello world message and default client port
app.get("/", async (_req, res) => {
  res.json({ hello: "world", "client-default-port": 3000 });
});

// GET /examples - Fetches all records from the example_foreign_table
app.get("/examples", async (_req, res) => {
  const docs = await db("example_foreign_table").select("*");
  res.json({ docs });
});

// POST /examples - Creates a new record with auth method and name, returns the created document
app.post("/examples", async (req, res) => {
  const { authMethod, name } = req.body;
  const [doc] = await db("example_foreign_table")
    .insert({
      authMethod,
      name,
    })
    .returning("*");
  res.json({ doc });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`server has started on port ${PORT}`);
});
