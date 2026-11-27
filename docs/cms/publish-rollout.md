# CMS publish rollout (prepared, not applied)

Status: prepared on branch cms/publish-prep. Nothing here is deployed. The live CMS service
is built from a pinned older commit plus inline patches and is not touched by merging to main.

## What changed in this branch
- deploy/cms/gateway.mjs: forwards /api/v1/admin/publish only when CMS_PUBLISH_ENABLED=true. Default stays blocked.
- deploy/cms/Dockerfile: adds git and openssh-client, and pinned GitHub host keys for strict ssh.
- deploy/cms/compose.yaml: adds CMS_PUBLISH_* variables. Publishing is off by default. Branch is cms/publish, never main.

## Parity with the running CMS (checked)
Source of the running image rebuilt from its pinned commit and inline patches, compared with main:
only the publish feature (routes, service, admin Publish page, publish-git script, tests),
GTM analytics, a lint-only change and the Google verification tag differ. Gateway, start script and
compose template are identical in the tree.

## Apply (needs approval; the CMS restarts for a few minutes, the public site is unaffected)
1. In Coolify, save the current compose and environment names first (values stay in Coolify; do not copy secrets into files).
2. Change the cms image build to clone this repo at the reviewed commit and drop the inline patch lines.
3. Keep every existing environment value, the /runtime volume and the database service as they are.
4. Add: CMS_PUBLISH_ENABLED=true, CMS_PUBLISH_ROOT=/app, CMS_PUBLISH_WORKDIR=/app/runtime/publish,
   CMS_PUBLISH_REMOTE=git@github.com:thapasushanta980-stack/Yutidigitalsolution.git,
   CMS_PUBLISH_BRANCH=cms/publish, CMS_PUBLISH_SSH_KEY=/run/cms-publish/key.
5. Mount the private deploy key (kept in the vault) as a file at /run/cms-publish/key, mode 0600.
6. Add the matching public key as a write deploy key on the repository.
7. Redeploy cms. Check /admin/login health, then one private test publish to cms/publish.

## Rollback
Restore the saved compose, remove CMS_PUBLISH_* variables, and delete the deploy key.
A publish only ever writes branch cms/publish, which does not deploy the public site.
