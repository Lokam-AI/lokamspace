Our plan is a fully managed AWS architecture for the Lokam Service Assistant MVP. It covers the frontend (React/Next.js), backend (FastAPI API + PostgreSQL), and a Voice Assistant microservice (FastAPI + Twilio integration). We prioritize managed services (minimal DevOps overhead), a single production-ready environment, containerized deployments, CI/CD via GitHub Actions, and integration with GoDaddy DNS. Logging and monitoring use AWS-native tools (CloudWatch, etc.) for a robust and scalable setup.


Architecture Overview

High-level architecture: The React/Next.js frontend is deployed globally via AWS Amplify Hosting (backed by S3/CloudFront CDN). The frontend communicates with a FastAPI backend running on AWS App Runner (a fully managed container service). The backend uses a managed Amazon RDS (PostgreSQL) database. A separate FastAPI Voice microservice (on App Runner or AWS Lambda) integrates with the external Twilio API to place scheduled calls. All components are in a single AWS environment (no separate staging/prod), with robust CI/CD and monitoring.


1. Frontend Hosting (React/Next.js on Amplify)
Service: Use AWS Amplify Hosting for the React/Next.js frontend. Amplify is a fully managed CI/CD and hosting platform that requires minimal setup
aws.amazon.com
. By connecting your GitHub repo, Amplify will automatically build and deploy the app on each commit, and host it on an Amazon CloudFront CDN for low-latency global access