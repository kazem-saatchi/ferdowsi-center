import fs from "fs";
import path from "path";

// A static check over app/api/actions, so a new action cannot quietly skip the
// role check. Every export of a "use server" file is an endpoint the browser
// can call with any arguments, whether or not our UI ever calls it.

const ACTIONS_DIR = path.join(process.cwd(), "app/api/actions");

function listFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

const actionFiles = listFiles(ACTIONS_DIR)
  .map((file) => ({
    rel: path.relative(ACTIONS_DIR, file).split(path.sep).join("/"),
    src: fs.readFileSync(file, "utf8"),
  }))
  .filter(({ src }) => /^\s*(\/\/[^\n]*\n\s*)*["']use server["']/.test(src));

/** Writes that are not admin-panel work: signing in and out, and a user
 *  changing their own password (the action checks it is their own). */
const SELF_SERVICE_WRITES = new Set([
  "auth/loginUser.ts",
  "auth/logoutUser.ts",
  "user/updatePersonPassword.tsx",
]);

/** Helper modules that write to the database on the caller's behalf. */
const WRITING_HELPERS = /from "[^"]*\/(recalcCharges|applyHistoryDateChange)"/;

const DB_WRITE =
  /\.(create|createMany|update|updateMany|upsert|delete|deleteMany)\(/;

function writes(src: string): boolean {
  return DB_WRITE.test(src) || WRITING_HELPERS.test(src);
}

describe("server action permissions", () => {
  it("finds the action files", () => {
    expect(actionFiles.length).toBeGreaterThan(50);
  });

  it("every action that changes data is ADMIN only", () => {
    const unguarded = actionFiles
      .filter(({ rel, src }) => writes(src) && !SELF_SERVICE_WRITES.has(rel))
      .filter(({ src }) => !/\badminWriteAction\s*[<(]/.test(src))
      .map(({ rel }) => rel);
    expect(unguarded).toEqual([]);
  });

  it("every action checks the session", () => {
    const unauthenticated = actionFiles
      .filter(({ rel }) => !rel.startsWith("auth/"))
      .filter(
        ({ src }) =>
          !/\b(adminWriteAction|adminReadAction|handleServerAction|verifyToken)\s*[<(]/.test(
            src
          )
      )
      .map(({ rel }) => rel);
    expect(unauthenticated).toEqual([]);
  });

  it("no action takes the user as an argument", () => {
    // The user must come from the session cookie. An exported function with a
    // Person parameter lets the caller hand in any id and role.
    const forgeable = actionFiles
      .filter(({ src }) =>
        /export\s+(default\s+)?async\s+function\s+\w+\s*\([^)]*:\s*(Person|SafePerson)\b/.test(
          src
        )
      )
      .map(({ rel }) => rel);
    expect(forgeable).toEqual([]);
  });
});
