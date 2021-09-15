FROM zapthedingbat/obsidian-automation:0.12.15

# Copy project files
ADD ./package*.json ./

# Install dependencies
RUN npm ci

# Copy application and automation code
ADD ./ ./

# Deploy build output to test plugin directory
RUN mkdir -p /home/obsidian/vault/.obsidian/plugins/plugin \
  && cp \
    ./dist/manifest.json \
    ./dist/styles.css \
    ./dist/main.js \
    /home/obsidian/vault/.obsidian/plugins/plugin
