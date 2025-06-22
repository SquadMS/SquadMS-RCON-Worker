FROM denoland/deno:latest

# Create working directory
WORKDIR /app

# Copy source
COPY . .

# Install possible dependencies
RUN deno install

# Compile the main app
RUN deno cache src/main.ts

# Run the app
CMD ["deno", "run", "--allow-all", "src/main.ts"]
