import { $, semver } from "bun";

// Constants
const TAG_PREFIX = "api-remap-1.2-sdk-";
const MIN_VERSION = ">=8.6";
const UPSTREAM_DIR = "upstream";
const MAVEN_GROUP = "ru.moysklad.api";
const MAVEN_ARTIFACT = "api-remap-1.2-sdk";
const MAVEN_REPO_BASE = "https://repo.maven.apache.org/maven2";

// Extract semver version from tag, returns null if tag doesn't match expected format
function parseVersion(tag: string): string | null {
  if (!tag.startsWith(TAG_PREFIX)) return null;
  const match = tag.match(/-(\d+(?:\.\d+)*)$/);
  if (!match) return null;
  const parts = match[1]!.split(".");
  while (parts.length < 3) parts.push("0");
  return parts.join(".");
}

// Fetch git tags from a directory
async function fetchTags(dir?: string): Promise<Set<string>> {
  const cmd = dir ? $`cd ${dir} && git tag` : $`git tag`;
  const tags = (await Array.fromAsync(cmd.lines())).filter((t) => t.length);
  return new Set(tags);
}

// Filter and sort tags by version
function filterAndSortTags(
  upstream: Set<string>,
  origin: Set<string>,
): string[] {
  return Array.from(upstream.difference(origin))
    .map((tag) => parseVersion(tag))
    .filter((v): v is string => v !== null && semver.satisfies(v, MIN_VERSION))
    .toSorted((a, b) => semver.order(a, b));
}

// Check if a specific version exists in Maven Central Repository
async function hasMavenCentralArtifact(version: string): Promise<boolean> {
  const groupPath = MAVEN_GROUP.replaceAll(".", "/");
  const url = `${MAVEN_REPO_BASE}/${groupPath}/${MAVEN_ARTIFACT}/${version}/${MAVEN_ARTIFACT}-${version}.jar`;
  const res = await fetch(url, { method: "HEAD" });
  return res.ok;
}

// Process a single tag: checkout, patch, deploy, push
async function processTag(tag: string): Promise<void> {
  console.log(`\n🏷️  Processing tag ${tag}...`);

  console.log(`🧹 Cleaning and checking out ${tag}...`);
  await $`cd ${UPSTREAM_DIR} && git clean -ffdx && git reset --hard HEAD && git checkout ${tag}`;

  console.log(`🩹 Applying git patch...`);
  await $`cd ${UPSTREAM_DIR} && git apply --3way ../git.patch`;

  console.log(`🚀 Deploying to GitHub Packages...`);
  await $`cd ${UPSTREAM_DIR} && mvn deploy -B -Dmaven.test.skip -Ppublishing-central`;

  console.log(`📤 Pushing tag to origin...`);
  await $`git tag ${tag} && git push origin ${tag}`;

  console.log(`✅ Tag ${tag} processed successfully`);
}

// Main
async function main(): Promise<void> {
  console.log("🔍 Fetching tags...");
  const [rawUpstreamTags, originTags] = await Promise.all([
    fetchTags(UPSTREAM_DIR),
    fetchTags(),
  ]);
  const upstreamTags = new Set(
    (
      await Promise.all(
        Array.from(rawUpstreamTags).map(async (tag) => {
          if (!tag.startsWith(TAG_PREFIX)) return null;
          const match = tag.match(/-(\d+(?:\.\d+)*)$/);
          if (!match) return null;
          return (await hasMavenCentralArtifact(match[1]!)) ? tag : null;
        }),
      )
    ).filter((tag): tag is string => tag !== null),
  );
  console.log(
    `📦 Found ${upstreamTags.size} upstream / ${originTags.size} origin tags`,
  );

  console.log("🔄 Computing new tags to sync...");
  const newTags = filterAndSortTags(upstreamTags, originTags);

  if (!newTags.length) {
    console.log("✅ No new tags to process");
    return;
  }

  console.log(`🆕 Found ${newTags.length} new tag(s): ${newTags.join(", ")}`);

  for (const tag of newTags) {
    await processTag(tag);
  }

  console.log("\n🎉 All done!");
}

await main();
