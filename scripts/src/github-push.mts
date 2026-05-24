import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, relative } from "path";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const OWNER = "amabel1234";
const REPO = "smm-panel-pro";
const API = "https://api.github.com";

const IGNORE_DIRS = new Set([".git", "node_modules", ".local", "dist", ".vite", "coverage", "__pycache__"]);
const IGNORE_PATTERNS = [".map", ".lock"];
const MAX_SIZE = 900_000; // 900KB max per file for GitHub API

async function apiCall(method: string, path: string, body?: object) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "User-Agent": "smm-panel-deploy",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

function collectFiles(dir: string, base: string): { path: string; content: string; encoding: "utf-8" | "base64" }[] {
  const files: { path: string; content: string; encoding: "utf-8" | "base64" }[] = [];
  
  let entries: string[];
  try { entries = readdirSync(dir); } catch { return files; }
  
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry)) continue;
    if (entry.startsWith(".") && entry !== ".gitignore" && entry !== ".env.example") continue;
    
    const fullPath = join(dir, entry);
    const relPath = relative(base, fullPath);
    
    try {
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        files.push(...collectFiles(fullPath, base));
      } else if (stat.isFile()) {
        if (IGNORE_PATTERNS.some(p => entry.endsWith(p))) continue;
        if (stat.size > MAX_SIZE) { console.warn(`Skipping large file: ${relPath}`); continue; }
        
        // Determine encoding
        const textExts = [".ts", ".tsx", ".js", ".jsx", ".json", ".yaml", ".yml", ".md", ".css", ".html", ".txt", ".env.example", ".gitignore", ".toml", ".mts", ".mjs"];
        const isText = textExts.some(ext => entry.endsWith(ext)) || !entry.includes(".");
        
        if (isText) {
          files.push({ path: relPath, content: readFileSync(fullPath, "utf-8"), encoding: "utf-8" });
        } else {
          files.push({ path: relPath, content: readFileSync(fullPath).toString("base64"), encoding: "base64" });
        }
      }
    } catch { /* skip */ }
  }
  return files;
}

async function initializeRepo(): Promise<string> {
  // Create README to initialize the repo (works even for empty repos via Contents API)
  const readmeContent = Buffer.from(
    "# SMM Panel Pro\n\nProfessional Social Media Marketing Panel built with React + Vite + Express.js + PostgreSQL\n"
  ).toString("base64");
  
  const result = await apiCall("PUT", `/repos/${OWNER}/${REPO}/contents/README.md`, {
    message: "chore: initialize repository",
    content: readmeContent,
  }) as { commit?: { sha: string; tree?: { sha: string } }; message?: string };
  
  if (!result.commit?.sha) {
    throw new Error(`Failed to initialize repo: ${JSON.stringify(result)}`);
  }
  
  console.log("Initialized repo, commit SHA:", result.commit.sha);
  return result.commit.sha;
}

async function main() {
  const ROOT = "/home/runner/workspace";
  console.log("Collecting files...");
  
  const files = collectFiles(ROOT, ROOT);
  console.log(`Found ${files.length} files`);

  // Initialize repo with a README first (required for blob creation in empty repos)
  console.log("Initializing repository...");
  const initCommitSha = await initializeRepo();

  // Get the tree SHA from the init commit
  const initCommitData = await apiCall("GET", `/repos/${OWNER}/${REPO}/git/commits/${initCommitSha}`) as { tree?: { sha: string } };
  const baseTreeSha = initCommitData.tree?.sha;
  console.log("Base tree SHA:", baseTreeSha);

  // Create blobs for all files (batch of 10)
  console.log("Creating blobs...");
  const treeItems: { path: string; mode: "100644"; type: "blob"; sha: string }[] = [];
  
  const BATCH = 10;
  for (let i = 0; i < files.length; i += BATCH) {
    const batch = files.slice(i, i + BATCH);
    const results = await Promise.all(batch.map(async (f) => {
      const blob = await apiCall("POST", `/repos/${OWNER}/${REPO}/git/blobs`, {
        content: f.content,
        encoding: f.encoding === "base64" ? "base64" : "utf-8",
      }) as { sha?: string; message?: string };
      
      if (!blob.sha) {
        console.error(`Failed to create blob for ${f.path}:`, blob.message);
        return null;
      }
      return { path: f.path, mode: "100644" as const, type: "blob" as const, sha: blob.sha };
    }));
    
    for (const r of results) {
      if (r) treeItems.push(r);
    }
    
    if ((i + BATCH) % 50 === 0 || i + BATCH >= files.length) {
      console.log(`  Progress: ${Math.min(i + BATCH, files.length)}/${files.length}`);
    }
  }

  console.log(`Created ${treeItems.length} blobs`);

  // Create tree on top of base tree
  console.log("Creating tree...");
  const tree = await apiCall("POST", `/repos/${OWNER}/${REPO}/git/trees`, {
    base_tree: baseTreeSha,
    tree: treeItems,
  }) as { sha?: string };
  
  if (!tree.sha) { console.error("Failed to create tree:", tree); process.exit(1); }
  console.log("Tree SHA:", tree.sha);

  // Create commit with parent
  console.log("Creating commit...");
  const commit = await apiCall("POST", `/repos/${OWNER}/${REPO}/git/commits`, {
    message: "feat: SMM Panel Pro - Full Stack Application\n\nIncludes:\n- React + Vite + TypeScript + Tailwind CSS frontend with dark glassmorphism UI\n- Express.js API server\n- PostgreSQL + Drizzle ORM database\n- Full SMM panel: services, orders, deposits, virtual numbers (nokos), tickets, referrals, admin dashboard",
    tree: tree.sha,
    parents: [initCommitSha],
  }) as { sha?: string };
  
  if (!commit.sha) { console.error("Failed to create commit:", commit); process.exit(1); }
  console.log("Commit SHA:", commit.sha);

  // Force update branch reference
  console.log("Updating branch reference...");
  const updateResult = await apiCall("PATCH", `/repos/${OWNER}/${REPO}/git/refs/heads/main`, {
    sha: commit.sha,
    force: true,
  }) as { ref?: string; message?: string };
  
  if (updateResult.ref) {
    console.log("Updated ref:", updateResult.ref);
  } else {
    console.error("Failed to update ref:", updateResult);
  }

  console.log(`\nSUCCESS! Repository: https://github.com/${OWNER}/${REPO}`);
}

main().catch(err => { console.error(err); process.exit(1); });
