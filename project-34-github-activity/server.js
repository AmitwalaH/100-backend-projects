
require("dotenv").config();

const GITHUB_USERNAME = "AmitwalaH";
const GITHUB_PAT = process.env.GITHUB_PAT;
const API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/events/public`;

async function fetchUserActivity() {
  if (!GITHUB_PAT) {
    console.error("FATAL ERROR: GITHUB_PAT is missing in .env file.");
    console.log(
      "Please generate a token with 'public_repo' scope and add it to .env."
    );
    return;
  }

  try {
    const response = await fetch(API_URL, {
      headers: {
        Authorization: `token ${GITHUB_PAT}`,
        "User-Agent": GITHUB_USERNAME,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `GitHub API Error: ${response.status} (${response.statusText}). Message: ${errorData.message}`
      );
    }

    const data = await response.json();

    if (data.length === 0) {
      console.log(`\nNo public activity found for user ${GITHUB_USERNAME}.`);
      return;
    }

    console.log(`\n--- Latest Activity for ${GITHUB_USERNAME} ---`);

    data.slice(0, 5).forEach((event, index) => {
      console.log(`\n[${index + 1}] TYPE: ${event.type}`);

      // Display repo details if available
      if (event.repo) {
        console.log(`    REPO: ${event.repo.name}`);
      }

      if (event.type === "PushEvent" && event.payload.commits) {
        console.log(`    COMMITS: ${event.payload.commits.length}`);
      }
      if (event.type === "PullRequestEvent") {
        console.log(
          `    PR ID: #${event.payload.pull_request.number} - ${event.payload.action}`
        );
      }

      console.log(`    TIME: ${new Date(event.created_at).toLocaleString()}`);
    });

    console.log("\n--------------------------------------\n");
  } catch (error) {
    console.error("\n--- EXECUTION FAILED ---");
    console.error(error.message);
  }
}

fetchUserActivity();
