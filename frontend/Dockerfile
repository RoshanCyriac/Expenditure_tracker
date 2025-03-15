FROM node:16-alpine

WORKDIR /app

# Add a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package*.json ./

# Change ownership of the /app directory to the non-root user
RUN chown -R appuser:appgroup /app

# Install dependencies
RUN npm install

COPY --chown=appuser:appgroup . .

EXPOSE 3000

# Switch to non-root user
USER appuser

CMD ["npm", "start"] 