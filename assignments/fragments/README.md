# fragments

A simple node.js project

## Prerequisites

- **Node.js ≥ 20.10** (for `--env-file` and `--watch`)  
  Check: `node -v`
- **npm ≥ 9**  
  Check: `npm -v`

## Setup

```bash
# 1) Install dependencies
npm install

# 2) Verify ESLint runs
npm run lint
```

## Environment Variables

Example `debug.env`:

```
PORT=3000
LOG_LEVEL=debug
```

## NPM Scripts

### 1) Lint

```bash
npm run lint
```

Runs ESLint across the repo.

### 2) Start (normal run)

```bash
npm start
```

- No file watching
- Good for a quick local run that mirrors production behavior

### 3) Dev (watch mode)

```bash
npm run dev
```

- Restarts automatically when files change

### 4) Debug (watch + inspector)

```bash
npm run debug
```

- Same as `dev` but starts the Node inspector on **9229**
- Uses `debug.env` (so you can bump `LOG_LEVEL`, etc.)

## Project Structure (minimum)

```
fragments/
├─ src/
│  └─ server.js        # <-- app entrypoint
│  └─ logger.js        # logger (pino)
│  └─ server.js
├─ debug.env           # debug env vars
├─ .eslintrc.cjs/js    # ESLint config (Node env enabled)
├─ package.json
└─ README.md
```
