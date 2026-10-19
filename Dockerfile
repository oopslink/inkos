FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build
RUN pnpm --filter @actalk/inkos-studio exec vitest run src/__tests__/studio-api.flow.test.ts
RUN pnpm --filter @actalk/inkos deploy --prod /out

FROM node:22-bookworm-slim
ARG VCS_REF
LABEL org.opencontainers.image.source="https://github.com/oopslink/inkos" \
      org.opencontainers.image.revision=$VCS_REF
ENV NODE_ENV=production HOME=/data/home INKOS_STUDIO_HOST=0.0.0.0 INKOS_STUDIO_PORT=4567
WORKDIR /app
COPY --from=build /out/ /app/
RUN mkdir -p /data/home /data/project && chown -R node:node /data
USER node
EXPOSE 4567
ENTRYPOINT ["node", "dist/index.js"]
CMD ["studio", "--project", "/data/project"]
