# Build environment for the drawio-obsidian plugin.
# Pinned to Node 18 to match the Rollup 2.x / TypeScript 4.4 toolchain the
# project was written against. Everything needed to build lives in this image,
# so nothing has to be installed on the host.
FROM node:18-bookworm

# git: required to fetch / update the jgraph/drawio submodule.
# ca-certificates: HTTPS for npm + git.
RUN apt-get update \
    && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace
