import { $, fetch, semver } from "bun";

function ver(tag: string) {
  const match = tag.match(/-(\d+(?:\.\d+)*$)/);
  if (!match) throw new Error(`${tag} is not valid version tag`);
  const parts = match[1]!.split(".");
  while (parts.length < 3) parts.push("0");
  const normalized = parts.join(".");
  return normalized;
}

const upstreamTags = new Set(
  (
    (await (
      await fetch(
        "https://api.github.com/repos/moysklad/java-remap-1.2-sdk/tags"
      )
    ).json()) as { name: string }[]
  )
    .map((tag) => tag.name)
    .filter((tag) => semver.satisfies(ver(tag), ">=8.6"))
);

const originTags = new Set(
  (await Array.fromAsync($`git tag`.lines())).filter((tag) => tag.length)
);

const tags = Array.from(upstreamTags.difference(originTags)).toSorted((a, b) =>
  semver.order(ver(a), ver(b))
);

if (!tags.length) {
  console.log("No new tags to process");
  process.exit(0);
}

await $`git config user.name "github-actions[bot]"`;
await $`git config user.email "github-actions[bot]@users.noreply.github.com"`;

for (const tag of tags) {
  console.log(`Processing tag ${tag}...`);

  await $`rm -rf ${tag} && git clone --branch ${tag} https://github.com/moysklad/java-remap-1.2-sdk.git ${tag}`;
  await $`cd ${tag} && git apply --3way ../git.patch`;
  await $`cd ${tag} && mvn deploy -B -Dmaven.test.skip -Ppublishing-central`;
  await $`git tag ${tag} && git push origin ${tag}`;

  console.log(`Tag ${tag} processed`);
}

console.log("All done!");
