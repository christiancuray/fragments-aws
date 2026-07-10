# Fragments — Cloud Microservice

**Live Link:** [https://d1sekol8d6tp20.cloudfront.net](https://d1sekol8d6tp20.cloudfront.net)

A cloud-native microservice for storing and managing small pieces (fragments) of text and image data. Built and deployed on AWS with a lightweight frontend UI for interacting with the API.

---

## Tech Stack

```markdown
| Layer               | Technology                               |
|---------------------|------------------------------------------|
| Backend API         | Node.js, Express v5                      |
| Frontend UI         | Vite, Vanilla JavaScript                 |
| Authentication      | AWS Cognito (OIDC via `oidc-client-ts`)  |
| Storage             | AWS S3 (Fragments Data), DynamoDB (Metadata) |
| Containerization    | Docker, Docker Compose                   |
| CI/CD               | GitHub Actions                           |
| Hosting             | AWS ECS (API), S3 + CloudFront (UI)      |
| Local AWS Mocking   | LocalStack (S3), DynamoDB Local          |
```

---

## Core Features

- Authenticate users via AWS Cognito hosted UI
- Create fragments with support for text, markdown, HTML, CSV, JSON, and images (PNG, JPEG)
- Retrieve, update, and delete fragments by ID
- Convert fragments between supported formats via URL extension (e.g. `/v1/fragments/:id.html`)
- Expand fragment listings with full metadata
- Secured with JWT verification (`aws-jwt-verify`) and HTTP Basic Auth fallback
- Structured JSON logging with Pino
- Gzip compression and security headers via Helmet

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/) & Docker Compose
- [AWS CLI](https://aws.amazon.com/cli/) (for cloud deployment)
- AWS account with Cognito User Pool, S3 bucket, and DynamoDB table configured

---

## Installation & Setup

### 1. Clone the repo

```bash
git clone [<repo-url>](https://github.com/christiancuray/fragments-aws)
cd fragments-aws
```

### 2. Configure environment variables
```
# Backend
cp assignments/fragments/.env.example assignments/fragments/.env

# Frontend
cp assignments/fragments-ui/.env.example assignments/fragments-ui/.env
```
Fill in your AWS Cognito Pool ID, Client ID, and API URL in each .env.

### 3. Run locally with Docker Compose
```
# Bootstrap local AWS resources (S3 bucket + DynamoDB table)
bash assignments/scripts/local-aws-setup.sh

# Start all services
docker compose -f assignments/docker-compose.yml up --build
```
- API: http://localhost:8080
- DynamoDB Local: http://localhost:8000
- LocalStack S3: http://localhost:4566

### 4. Run the UI locally
```
cd assignments/fragments-ui
npm install
npm start
```




