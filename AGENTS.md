# GetMeCab engineering workflow
+
## GitHub issue and pull-request policy

Every code change must start from a GitHub issue in this repository. Before implementation,
find or create the owning issue and ensure it records the problem or business objective,
current and expected behavior, proposed scope, acceptance criteria, testing requirements,
and rollout or rollback risks. Keep the issue updated when scope or decisions change.

Every pull request must link at least one local issue in its body using `Closes #<number>`,
`Fixes #<number>`, or `Resolves #<number>`. Additional cross-repository links are allowed
but do not replace the local issue. Include an implementation summary and test evidence in
the PR. Do not create, approve, or merge a PR whose linked issue lacks the required detail.
The `Issue policy` status check is binding; do not bypass or weaken it.

## Solo developer and Codex workflow

This repository is maintained by one developer working with Codex. Codex may investigate,
implement, and test the change described by the linked issue. When explicitly authorized for
each publishing action, Codex may stage files, commit, push, and open a pull request.

Codex must:

1. Keep work within the linked issue and update it when scope or decisions change materially.
2. Preserve unrelated user changes.
3. Run relevant tests, linting, and static checks.
4. Add or update tests when behavior changes.
5. Record exact test evidence, skipped checks, and remaining risks in the pull request.
6. Review the final diff for correctness, security, and unintended changes.

Codex must not merge a pull request, deploy to production, modify production data, expose or
rotate credentials, weaken a CI or security gate, or claim verification that was not performed
without explicit authorization for that specific action. The repository owner makes the final
merge and deployment decision.
