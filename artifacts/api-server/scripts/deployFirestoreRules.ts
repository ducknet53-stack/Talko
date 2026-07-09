/**
 * One-off script: publishes artifacts/talko/firestore.rules as the live
 * Firestore security rules for the configured Firebase project, using the
 * Firebase Rules REST API authenticated with the service account.
 *
 * Run with: pnpm --filter @workspace/api-server exec tsx scripts/deployFirestoreRules.ts
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { GoogleAuth } from "google-auth-library";

async function main() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not set.");
  const credentials = JSON.parse(raw);
  const projectId = credentials.project_id as string;

  const rulesPath = path.resolve(
    import.meta.dirname,
    "../../talko/firestore.rules",
  );
  const source = readFileSync(rulesPath, "utf-8");

  const auth = new GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/firebase"],
  });
  const client = await auth.getClient();

  async function api(pathSuffix: string, options: RequestInit = {}) {
    const token = await client.getAccessToken();
    const res = await fetch(
      `https://firebaserules.googleapis.com/v1/${pathSuffix}`,
      {
        ...options,
        headers: {
          Authorization: `Bearer ${token.token}`,
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      },
    );
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`${res.status} ${res.statusText}: ${body}`);
    }
    return res.json();
  }

  console.log(`Creating ruleset for project "${projectId}"...`);
  const ruleset = await api(`projects/${projectId}/rulesets`, {
    method: "POST",
    body: JSON.stringify({
      source: {
        files: [{ name: "firestore.rules", content: source }],
      },
    }),
  });

  const rulesetName = ruleset.name as string;
  console.log(`Created ${rulesetName}. Releasing to cloud.firestore...`);

  const releaseId = `projects/${projectId}/releases/cloud.firestore`;
  try {
    await api(`${releaseId}`, {
      method: "PATCH",
      body: JSON.stringify({ release: { name: releaseId, rulesetName } }),
    });
  } catch {
    await api(`projects/${projectId}/releases`, {
      method: "POST",
      body: JSON.stringify({ release: { name: releaseId, rulesetName } }),
    });
  }

  console.log("Firestore security rules deployed successfully.");
}

main().catch((err) => {
  console.error("Failed to deploy Firestore rules:", err.message || err);
  process.exit(1);
});
