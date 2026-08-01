# Architecture

The framework keeps authored facts, derived release artifacts, and side effects separate:

- `eagle.config.ts` is the authored configuration boundary.
- Entrypoint layout determines the project topology.
- Manifest, HTML, compiled assets, and release paths are derived during build.
- `eagle dev` and `eagle build` share configuration and topology resolution.
- `eagle check` assesses mechanical release blockers but does not approve Plugin Center submission.

## Read the decisions

- [Framework specification](/specs/0001-eagle-plugin-framework)
- [Generator selection contract](/specs/0002-create-eagle-plugin-topology-selection)
- [Architecture decision records](/adr/0001-generate-manifest-from-typed-config)
