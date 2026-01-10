# java-remap-1.2-sdk

Fork of [moysklad/java-remap-1.2-sdk](https://github.com/moysklad/java-remap-1.2-sdk) published to GitHub Packages.

New upstream tags (≥8.6) are automatically synced and published weekly.

## Authentication

GitHub Packages requires authentication even for public packages. You need a personal access token (classic) with `read:packages` scope.

[Create a personal access token](https://github.com/settings/tokens/new?scopes=read:packages)

## Installation

### Maven

Add server credentials to your `~/.m2/settings.xml`:

```xml
<settings>
  <servers>
    <server>
      <id>github</id>
      <username>YOUR_GITHUB_USERNAME</username>
      <password>YOUR_GITHUB_TOKEN</password>
    </server>
  </servers>
</settings>
```

Add the repository to your `pom.xml`:

```xml
<repositories>
  <repository>
    <id>github</id>
    <url>https://maven.pkg.github.com/yegor-usoltsev/java-remap-1.2-sdk</url>
  </repository>
</repositories>
```

Add the dependency:

```xml
<dependency>
  <groupId>io.github.yegor-usoltsev</groupId>
  <artifactId>api-remap-1.2-sdk</artifactId>
  <version>${moysklad.sdk.version}</version>
</dependency>
```

### Gradle

Add the repository to your `build.gradle.kts`:

```kotlin
repositories {
    maven {
        url = uri("https://maven.pkg.github.com/yegor-usoltsev/java-remap-1.2-sdk")
        credentials {
            username = project.findProperty("gpr.user") as String? ?: System.getenv("GITHUB_USERNAME")
            password = project.findProperty("gpr.key") as String? ?: System.getenv("GITHUB_TOKEN")
        }
    }
}
```

Add the dependency:

```kotlin
implementation("io.github.yegor-usoltsev:api-remap-1.2-sdk:$moyskladSdkVersion")
```

Configure credentials in `~/.gradle/gradle.properties`:

```properties
gpr.user=YOUR_GITHUB_USERNAME
gpr.key=YOUR_GITHUB_TOKEN
```

## License

See the [original repository](https://github.com/moysklad/java-remap-1.2-sdk) for license information.
