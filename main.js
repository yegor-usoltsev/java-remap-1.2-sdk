import { $ } from "bun";

const MIN_VERSION = "8.6";
const MAVEN_URL =
  "https://repo.maven.apache.org/maven2/ru/moysklad/api/api-remap-1.2-sdk";

const version = (tag) =>
  /^api-remap-1\.2-sdk-(?<v>\d+(?:\.\d+)*)$/u.exec(tag)?.groups.v;
const byVersion = (a, b) => a.localeCompare(b, "en", { numeric: true });
const tags = async (cwd) =>
  new Set(await Array.fromAsync($`git tag`.cwd(cwd).lines()));

// Skip upstream tags that were never released to Maven Central
const isReleased = async (tag) => {
  const v = version(tag);
  const res = await fetch(`${MAVEN_URL}/${v}/api-remap-1.2-sdk-${v}.jar`, {
    method: "HEAD",
  });
  return res.ok;
};

const [upstream, origin] = await Promise.all([tags("upstream"), tags(".")]);
const candidates = [...upstream.difference(origin)]
  .filter((tag) => version(tag) && byVersion(version(tag), MIN_VERSION) >= 0)
  .toSorted(byVersion);
const released = await Promise.all(candidates.map(isReleased));
const newTags = candidates.filter((_, i) => released[i]);
console.log(`🆕 New tags: ${newTags.join(", ") || "none"}`);

for (const tag of newTags) {
  console.log(`\n🏷️  Publishing ${tag}...`);
  await $`git clean -ffdx && git reset --hard && git checkout ${tag}`.cwd(
    "upstream"
  );
  await $`git apply --3way ../git.patch`.cwd("upstream");
  await $`mvn deploy -B -Dmaven.test.skip -Ppublishing-central`.cwd("upstream");
  await $`git tag ${tag} && git push origin ${tag}`;
}
