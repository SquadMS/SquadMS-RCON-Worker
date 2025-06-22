# Select the DevContainer image to base off of
FROM mcr.microsoft.com/devcontainers/base:ubuntu-22.04

# Install the Deno JavaScript runtime
USER vscode

ENV DENO_INSTALL=""
RUN curl -fsSL https://deno.land/install.sh | sh -s -- --yes
