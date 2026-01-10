import { $, semver } from "bun";

const TAG_PREFIX = "api-remap-1.2-sdk-";

function ver(tag: string): string | null {
  if (!tag.startsWith(TAG_PREFIX)) return null;
  const match = tag.match(/-(\d+(?:\.\d+)*$)/);
  if (!match) return null;
  const parts = match[1]!.split(".");
  while (parts.length < 3) parts.push("0");
  const normalized = parts.join(".");
  return normalized;
}

console.log("🔍 Fetching upstream tags...");
const upstreamTags = new Set(
  (await Array.fromAsync($`cd upstream && git tag`.lines()))
    .filter((tag) => tag.length)
    .filter((tag) => {
      const v = ver(tag);
      return v !== null && semver.satisfies(v, ">=8.6");
    })
);
console.log(`📦 Found ${upstreamTags.size} upstream tags (>=8.6)`);

console.log("🔍 Fetching origin tags...");
const originTags = new Set(
  (await Array.fromAsync($`git tag`.lines())).filter((tag) => tag.length)
);
console.log(`📦 Found ${originTags.size} origin tags`);

console.log("🔄 Computing difference between upstream and origin...");
const tags = Array.from(upstreamTags.difference(originTags)).toSorted((a, b) =>
  semver.order(ver(a)!, ver(b)!)
);

if (!tags.length) {
  console.log("✅ No new tags to process");
  process.exit(0);
}

console.log(
  `🆕 Found ${tags.length} new tag(s) to process: ${tags.join(", ")}`
);

for (const tag of tags) {
  console.log(`\n🏷️  Processing tag ${tag}...`);

  console.log(`🧹 Cleaning upstream directory and checking out ${tag}...`);
  await $`cd upstream && git clean -ffdx && git reset --hard HEAD && git checkout ${tag}`;

  console.log(`🩹 Applying git patch...`);
  await $`cd upstream && git apply --3way ../git.patch`;

  console.log(`🚀 Deploying to Maven Central...`);
  await $`cd upstream && mvn deploy -B -Dmaven.test.skip -Ppublishing-central`;

  console.log(`📤 Pushing tag ${tag} to origin...`);
  await $`git tag ${tag} && git push origin ${tag}`;

  console.log(`✅ Tag ${tag} processed successfully`);
}

console.log("\n🎉 All done!");
