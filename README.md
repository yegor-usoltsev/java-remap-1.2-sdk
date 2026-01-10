# java-remap-1.2-sdk

Fork of [moysklad/java-remap-1.2-sdk](https://github.com/moysklad/java-remap-1.2-sdk) published to GitHub Packages.

New upstream tags (≥8.6) are automatically synced and published weekly.

## Installation

### Maven

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
  <version>${moysklad.version}</version>
</dependency>
```

### Gradle

Add the repository to your `build.gradle.kts`:

```kotlin
repositories {
    maven {
        url = uri("https://maven.pkg.github.com/yegor-usoltsev/java-remap-1.2-sdk")
    }
}
```

Add the dependency:

```kotlin
implementation("io.github.yegor-usoltsev:api-remap-1.2-sdk:$moyskladVersion")
```

## License

See the [original repository](https://github.com/moysklad/java-remap-1.2-sdk) for license information.
