# CI & Docker Infrastructure

Docker image builds and GitHub Actions CI untuk monorepo **E-Learning Math**.

- **Frontend:** Nuxt 4 (Bun untuk install/build, Node.js untuk runtime Nitro)
- **Backend:** Bun + Elysia (`src/index.ts`, health endpoint `GET /api/health`)
- **Database:** MongoDB Community **di host VPS** (bukan container) — container Mongo hanya opsional untuk local testing (profile `mongo`)
- **Reverse proxy:** Nginx **di host VPS** (belum diimplementasikan di repo ini)
- **Domain:** `faridpens.my.id` (frontend), `api.faridpens.my.id` (backend API)

> Repo ini berisi **CI + image preparation saja** — tidak ada deploy otomatis ke VPS.

---

## 1. Arsitektur Docker Image

| Image | Konteks | Base | Runtime | Port | User |
|---|---|---|---|---|---|
| `<repo>-frontend` | `frontend/` | build: `oven/bun:1.4.3` → runtime: `node:22.22.2-alpine` | `node .output/server/index.mjs` (Nitro node-server) | 3000 | `node` (non-root) |
| `<repo>-backend` | `backend/` | `oven/bun:1.4.3` (multi-stage: deps → runtime) | `bun run src/index.ts` | 3001 | `bun` (non-root) |

Prinsip:
- Install **reproducible** memakai lockfile ter-commit (`bun install --frozen-lockfile`).
- Tidak ada `.env`/secrets dalam image (lihat `.dockerignore` per konteks).
- Runtime non-root, `STOPSIGNAL SIGTERM`, `HEALTHCHECK` (frontend `/`, backend `/api/health`).
- Config via env saat **run**: backend `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`; frontend `NUXT_PUBLIC_API_BASE` (override runtimeConfig Nitro — tidak perlu di-build time).
- File upload backend ada di volume named `backend-uploads` → bertahan saat container restart.

## 2. Build image lokal

```bash
# Backend
docker build -t e-math-backend:local ./backend

# Frontend
docker build -t e-math-frontend:local ./frontend
```

## 3. Menjalankan dengan Docker Compose

### Local integration (default)

```bash
# Butuh MongoDB di host mesin lokal (default MONGODB_URI → host.docker.internal:27017)
docker compose up -d --build

# ATAU pakai container MongoDB sementara (profile `mongo`, OFF by default)
docker compose --profile mongo up -d --build
$env:MONGODB_URI = "mongodb://mongo:27017/e-learning-math"   # PowerShell
docker compose up -d
```

- Frontend: `http://localhost:3000` (browser) — API dipanggil via `NUXT_PUBLIC_API_BASE` (default `http://localhost:3001/api`).
- Backend: `http://localhost:3001/api/health`.
- Port dipublish **hanya ke 127.0.0.1** — tidak terekspos ke publik.

### Produksi (VPS — override file terpisah)

```bash
cp .env.example .env      # isi nilai nyata; JANGAN commit .env
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

- `docker-compose.prod.yml` **wajibkan `JWT_SECRET`** (compose gagal cepat jika kosong), default domain produksi (`https://api.faridpens.my.id/api`, `CORS_ORIGIN=https://faridpens.my.id`), `restart: unless-stopped`.
- **MongoDB tetap di host** — service `mongo` tidak pernah aktif di produksi (terkunci di profile `mongo`).
- Catatan koneksi: dari dalam container, `localhost` = container itu sendiri, sehingga `MONGODB_URI` memakai `host.docker.internal` (di-mapping ke host lewat `extra_hosts: host-gateway`). Pastikan `mongod` menerima koneksi dari jaringan Docker bridge (mis. `bindIp` termasuk IP docker0, misalnya `172.17.0.1`) **dan** port 27017 tidak pernah terekspos ke publik (firewall hanya localhost/bridge).

## 4. Konfigurasi CI

Workflow: `.github/workflows/ci.yml`

| Trigger | Trigger | Cek | Build image | Push GHCR |
|---|---|---|---|---|
| PR → `main` | `pull_request` | install frozen + backend `typecheck` + `docker compose config` | ✅ (kedua image) | ❌ tidak pernah |
| Push → `main` | `push` | cek yang sama | ✅ | ✅ (GHCR) |

Check yang dijalankan (hanya yang benar-benar ada di repo):
- `backend`: `bun install --frozen-lockfile` → `bun run typecheck` (`tsc --noEmit`).
- `frontend`: `bun install --frozen-lockfile` (postinstall `nuxt prepare` memvalidasi app). Belum ada skrip lint/test di repo — tidak ada yang difabrikasi; validasi build frontend terjadi di dalam Docker build (`bun run build`).
- `docker compose -f docker-compose.yml config --quiet` + kombinasi dengan `docker-compose.prod.yml` (memakai dummy `JWT_SECRET` khusus CI).

## 5. Permissions & secrets GitHub

| Item | Nilai |
|---|---|
| Settings → Actions → General → Workflow permissions | **Read repository contents and write packages** (atau biarkan default & izinkan `packages: write` yang sudah dideklarasikan di job) |
| `secrets.GITHUB_TOKEN` | otomatis — dipakai untuk push ke GHCR di branch `main` |
| Secret lain | **tidak diperlukan** — jangan taruh kredensial apa pun di workflow |

Jika suatu saat pakai registry selain GHCR, tambahkan secret registry (mis. `REGISTRY_USERNAME`/`REGISTRY_PASSWORD`) lalu ganti `docker/login-action`.

## 6. Konvensi nama & tag image

```
ghcr.io/muhammad2341/e-math-learning-backend:<commit-sha>   # immutable
ghcr.io/muhammad2341/e-math-learning-backend:latest         # hanya dari main
ghcr.io/muhammad2341/e-math-learning-frontend:<commit-sha>
ghcr.io/muhammad2341/e-math-learning-frontend:latest        # hanya dari main
```

Format: `ghcr.io/<owner>/<repo>-frontend` dan `ghcr.io/<owner>/<repo>-backend` (dihuruf-kecil-kan otomatis di workflow). Tag `latest` **hanya** dihasilkan dari push ke `main`.

## 7. Mereproduksi kegagalan CI lokal

```bash
# Cek yang sama dengan CI (urutannya sama)
cd backend && bun install --frozen-lockfile && bun run typecheck
cd ../frontend && bun install --frozen-lockfile

JWT_SECRET=ci-validation-dummy docker compose -f docker-compose.yml config --quiet
JWT_SECRET=ci-validation-dummy docker compose -f docker-compose.yml -f docker-compose.prod.yml config --quiet

docker build ./backend -t e-math-backend:local
docker build ./frontend -t e-math-frontend:local
```

Jika CI gagal di step tertentu, jalankan perintah step itu persis di mesin lokal (Bun 1.4.3, Docker Buildx).

## 8. Deploy: pull image ke VPS

Image GHCR bersifat **private by default** — sekali saja di VPS, login dulu.

### 8a. Login sekali (butuh token GitHub)

1. GitHub → Settings → Developer settings → **Personal access token → Tokens (classic)**
2. Generate token dengan scope **`read:packages`** (jangan pakai token yang sama untuk hal lain, jangan commit token ini).
3. Di VPS:

```bash
echo "<TOKEN>" | docker login ghcr.io -u muhammad2341 --password-stdin
```

> Alternatif tanpa login: jadikan package publik (repo → Packages → package → Package settings → Change visibility → Public), lalu `docker pull` anonim bisa.

### 8b. Pull + jalankan dengan Compose

Clone repo (hanya untuk file compose + `.env`), lalu:

```bash
git clone https://github.com/muhammad2341/E-Math-Learning.git && cd E-Math-Learning
cp .env.example .env          # isi JWT_SECRET nyata + nilai VPS (lihat komentar di dalamnya)
                              # BACKEND_IMAGE/FRONTEND_IMAGE sudah menunjuk ke GHCR

# Tarik image (tidak build di VPS)
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull backend frontend

# Jalankan (image sudah ada → compose TIDAK membangun ulang)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Verifikasi
curl -fsS http://127.0.0.1:3001/api/health
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
```

### 8c. Atau pull manual (tanpa compose)

```bash
docker pull ghcr.io/muhammad2341/e-math-learning-backend:latest
docker pull ghcr.io/muhammad2341/e-math-learning-frontend:latest
# Untuk versi deterministik, pakai tag SHA dari commit yang mau dideploy:
docker pull ghcr.io/muhammad2341/e-math-learning-backend:2320b966ac332076b119334373802f31bc01e424
```

### 8d. Update ke versi baru

```bash
cd E-Math-Learning && git pull            # (opsional, kalau file compose ikut berubah)
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull backend frontend
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Tag `latest` selalu = push terakhir ke `main`; tag `<sha>` tidak berubah (immutable), aman untuk rollback: set `BACKEND_IMAGE`/`FRONTEND_IMAGE` di `.env` ke SHA lama lalu `up -d` lagi.

## 9. Pemakaian image untuk deploy VPS (RENCANA — bagian lain di luar CI)

Arsitektur tujuan ( dokumentasi saja, **bukan bagian dari tugas CI ini** ):

1. Host **Nginx** menerima HTTP/HTTPS:
   - `faridpens.my.id` → reverse proxy ke `127.0.0.1:3000` (frontend container)
   - `api.faridpens.my.id` → reverse proxy ke `127.0.0.1:3001` (backend container)
2. Tarik image GHCR di VPS: `docker pull ghcr.io/muhammad2341/e-math-learning-backend:<sha>`
3. Jalankan dengan `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`
4. **MongoDB tetap terpasang di host VPS**, hanya diakses lewat koneksi lokal/privat (lihat catatan `bindIp` di bagian 3). Jangan ekspos 27017 ke publik.
5. `.env` berisi `JWT_SECRET` & `MONGODB_URI` nyata hanya ada di VPS — tidak pernah di Git/GitHub Actions.

Belum (di luar cakupan tugas CI ini): SSH ke VPS, instal Docker/software, konfigurasi Nginx host, DNS, rotasi secrets, deploy otomatis.

## 10. Validasi yang sudah dijalankan

Lihat **Final Report** pada sesi implementasi. Ringkasan perintah:

```bash
cd backend && bun run typecheck          # exit 0
docker compose ... config --quiet        # exit 0
docker build ./backend ./frontend        # exit 0 (jika Docker tersedia)
git ls-files | Select-String '\.env$'    # tidak boleh ada .env ter-commit
```
