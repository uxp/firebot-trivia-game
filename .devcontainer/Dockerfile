# [Choice] Node.js version (use -bullseye variants on local arm64/Apple Silicon): 22, 20, 18,
# 22-bookworm, 20-bookworm, 18-bookworm, 22-bullseye, 20-bullseye, 18-bullseye,
ARG VARIANT="20-bookworm"
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:${VARIANT}

# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# [Optional] Uncomment if you want to install an additional version of node using nvm
#ARG EXTRA_NODE_VERSION=20
#RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node packages
RUN su node -c "npm install -g pnpm ts-node"