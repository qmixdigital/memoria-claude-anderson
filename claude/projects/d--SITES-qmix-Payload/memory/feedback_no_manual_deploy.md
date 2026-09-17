---
name: No manual deploy
description: User has automated deploy pipeline - never create manual deploy scripts, put everything in build/postbuild
type: feedback
originSessionId: 1d9f48ef-5389-46a5-b409-eedbf3ec0069
---
Never create manual deploy scripts (deploy.sh) or suggest manual deploy steps. The user has automated deploy pipelines.

**Why:** User doesn't do manual deploys. Any fix that requires a manual step will be forgotten and cause the same issue again.

**How to apply:** When fixing build/deploy issues, always put the solution in package.json scripts (build, postbuild) or in the project's CI/CD config — never in standalone shell scripts that require manual execution.
