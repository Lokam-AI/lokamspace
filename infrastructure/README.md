Our plan is a fully managed AWS architecture for the Lokam Service Assistant MVP. It covers the frontend (React/Next.js), backend (FastAPI API + PostgreSQL), and a Voice Assistant microservice (FastAPI + Twilio integration). We prioritize managed services (minimal DevOps overhead), a single production-ready environment, containerized deployments, CI/CD via GitHub Actions, and integration with GoDaddy DNS. Logging and monitoring use AWS-native tools (CloudWatch, etc.) for a robust and scalable setup.


Architecture Overview

High-level architecture: The React/Next.js frontend is deployed globally via AWS Amplify Hosting (backed by S3/CloudFront CDN). The frontend communicates with a FastAPI backend running on AWS App Runner (a fully managed container service). The backend uses a managed Amazon RDS (PostgreSQL) database. A separate FastAPI Voice microservice (on App Runner or AWS Lambda) integrates with the external Twilio API to place scheduled calls. All components are in a single AWS environment (no separate staging/prod), with robust CI/CD and monitoring.


1. Frontend Hosting (React/Next.js on Amplify)
Service: Use AWS Amplify Hosting for the React/Next.js frontend. Amplify is a fully managed CI/CD and hosting platform that requires minimal setup
aws.amazon.com
. By connecting your GitHub repo, Amplify will automatically build and deploy the app on each commit, and host it on an Amazon CloudFront CDN for low-latency global access




2. Backend Service (FastAPI on AWS App Runner + RDS PostgreSQL)
Services: Deploy the FastAPI backend in Docker container(s) on AWS App Runner, and use Amazon RDS for the PostgreSQL database.
AWS App Runner (FastAPI API): App Runner is a fully managed container service for web apps and APIs
aws.amazon.com
. It will run your FastAPI app from a Docker image, handle scaling, load balancing, and HTTPS endpoint provisioning automatically
aws.amazon.com
. This is ideal for a small team because it requires no manual server or cluster management. You can deploy directly from a container registry or source repo. Deployment Steps:
Containerize: Ensure the FastAPI app has a Dockerfile. (If not already, create one using a lightweight Python base image, install FastAPI/Uvicorn, etc., and expose the port).
Container Registry: Push the Docker image to Amazon Elastic Container Registry (ECR). For example, create an ECR repository lokam-backend and push your image on each release.
Create App Runner Service: In App Runner console, click Create Service. Choose deployment from ECR (or source if you prefer App Runner to build from GitHub code). Point to your ECR image and select a runtime (if needed). Allocate CPU/Memory (start with a small size, e.g. 2 vCPU, 4GB, or adjust based on FastAPI needs).
Configure Environment: Set environment variables for the FastAPI app – notably the database connection string (host, port, DB name, username, password). Do not store secrets in code. Instead, you can use AWS Secrets Manager or SSM Parameter Store to hold the DB password and have the App Runner service pull it as an env var. App Runner can natively reference Secrets Manager secrets for env variables.
VPC Connectivity: When creating the App Runner service, enable a VPC Connector to allow it to access the RDS database (if RDS is in a private subnet). Select the VPC and subnets where your RDS resides (details in the next section). This attaches elastic network interfaces in your VPC so the container can reach the DB
aws.amazon.com
. Be aware that with a VPC connector, outbound traffic from the container will go through your VPC subnets – ensure a NAT Gateway is available if the service needs internet access (for example, to call Twilio or external APIs).
Auto-scaling & Health: App Runner will by default scale the service based on traffic. For an MVP, you can start with min-size 1 instance and allow it to scale up (it can auto-scale based on concurrent requests). App Runner provides a stable HTTPS URL for the service (e.g. https://<your-service-id>.awsapprunner.com).
Why App Runner: It’s fully managed and handles all the infrastructure (running on AWS Fargate under the hood) – you just deploy your container and get a URL
aws.amazon.com
. This fits the “no dedicated DevOps” constraint. Alternative options like ECS/Fargate or Elastic Beanstalk require more configuration, whereas App Runner is simplified. It still supports custom domains and HTTPS, and integrates with CI/CD easily.
Amazon RDS (PostgreSQL database): Use Amazon RDS to host the Postgres database, so you don’t manage database servers. RDS will handle automated backups, updates, and scaling features for you. Choose PostgreSQL engine. For an MVP/single-developer setup, a db.t3.micro or db.t4g.micro instance (if eligible for free tier) or Aurora Serverless v2 (for auto-scaling) could be used. Make sure to allocate enough storage (e.g. 20 GB) and enable automated backups. Deployment Steps:
Create DB Instance: In RDS console, “Create Database”. Engine: PostgreSQL. Use “Standard Create”. For ease, you may start with Postgres version 15 (latest) on a small instance. Enable Multi-AZ for high availability if needed (can be skipped for MVP to save cost).
Credentials: Set master username/password. Store these securely (in AWS Secrets Manager or at least as GitHub Actions secrets). You will use them in the backend’s DB connection string.
Networking: Place the RDS instance in a VPC subnet. It’s recommended to disable “Public Access” so that the DB is not exposed publicly. Instead, the FastAPI App Runner service (via the VPC connector) will communicate with it internally. If using a new VPC, RDS will need at least two subnets (for Multi-AZ deployments) – the RDS wizard can create a subnet group for you.
Security Group: Create or use a security group for the RDS allowing inbound PostgreSQL (TCP 5432) from the App Runner service. If App Runner is in the VPC, it will have an associated security group via the VPC Connector – allow that SG in the DB’s SG inbound rules. If App Runner runs outside and connects via VPC ENI, you may allow the entire VPC CIDR or specific IPs of the ENIs. E.g., inbound rule: Postgres port 5432, source = sg-AppRunner (the security group attached to App Runner’s connector).
DB Initialization: After RDS is up, record the endpoint address and port. Use a SQL client or the FastAPI app itself (via Alembic or Django migrations, etc.) to initialize the schema. You might set up a one-time Lambda or a script in CI/CD to run migrations on deployment.
Why RDS: It’s a fully managed relational database. You get automated backups and easy scaling without maintaining a database server yourself. This aligns with a production-ready mindset despite a small team.
Connecting App Runner to RDS: With the VPC Connector from App Runner, your FastAPI container will connect to the RDS endpoint (which is a hostname in the VPC). This is a private connection not exposed to the internet
aws.amazon.com
. Double-check that the subnets chosen for the connector have network route to the DB (if in same VPC, routing is internal). If those subnets have no internet, ensure NAT Gateway is configured for egress if the app needs to call external services. (Alternatively, to simplify, you could allow RDS public access = Yes and have App Runner connect over the public endpoint, but secure it by restricting the DB SG to App Runner’s public egress IP range. However, using a private setup is more secure and recommended for production).
Outcome: The FastAPI backend runs as a scalable container service (App Runner URL or custom domain). It queries the PostgreSQL RDS database over the private network. No EC2 servers are managed directly. The backend is ready to serve API requests from the frontend and can be easily scaled or updated via new Docker images.