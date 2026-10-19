# InkOS Studio container

Build from this repository with `docker build -t inkos:local .`. The multi-stage
image includes the compiled CLI, Studio, core and production dependencies.
Run one replica with a writable persistent volume at `/data` (UID/GID 1000).
The CLI initializes `/data/project` on first start; home configuration lives in
`/data/home`. Do not mount application source or build at startup.

Studio listens on port 4567. Terminate HTTPS at an authenticated reverse proxy
and set `INKOS_STUDIO_ALLOWED_ORIGINS=https://inkos.example.com` to the exact
public origin (comma-separated if needed). Other browser origins remain rejected.
The container does not implement per-user authorization: restrict ingress to
the authenticated proxy and treat the installation as a shared trusted workspace.
Configure model services and API keys through Studio after login. Back up the
entire `/data` volume; SQLite and filesystem data are authoritative.
