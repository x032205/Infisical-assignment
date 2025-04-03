/* eslint-disable */
import { execSync } from "child_process";
import path, { dirname } from "path";
import promptSync from "prompt-sync";
import slugify from "@sindresorhus/slugify";
import { fileURLToPath } from "url";

// Fix for "ReferenceError: __dirname is not defined in ES module scope"
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prompt = promptSync({ sigint: true });

const migrationName = prompt("Enter name for migration: ");

// Remove spaces from migration name and replace with hyphens
const formattedMigrationName = slugify(migrationName);

execSync(
  `npx knex migrate:make --knexfile ${path.join(__dirname, "./knexfile.js")} ${formattedMigrationName}`,
  { stdio: "inherit" },
);
