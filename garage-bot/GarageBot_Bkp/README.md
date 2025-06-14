# 🚘 GarageBot – The AI Service Assistant for Auto Centers

**GarageBot** is an AI-powered voice assistant developed by **Lokam** to modernize customer interaction and feedback collection in the automotive service industry. It bridges intelligent voice conversations with data-driven analytics to enhance service operations at scale.

---

## 🧠 What is GarageBot?

**GarageBot** is a production-grade, end-to-end **Service AI Assistant** that:

- 📞 Initiates automated voice calls to customers via AI
- ❓ Collects structured feedback using natural language prompts
- 🧠 Processes and stores responses in a central database
- 📊 Provides a real-time dashboard with operational insights

> Built for **automobile service centers**, GarageBot helps streamline post-service engagement and drive operational excellence — using the power of AI.

---

## ✨ Core Features

- 🔗 **CRM Integration** with automobile service center systems
- 🗣️ **AI-Driven Voice Calls** using natural conversation flow
- 📥 **Automated Feedback Collection** with real-time processing
- 🧮 **Scoring & Sentiment Analysis** from AI feedback
- 📈 **Dashboard Interface** for business stakeholders
- 🔐 **User Authentication & Role-Based Access**
- 🚀 **Scalable, Containerized Microservices Architecture**

---

## ⚙️ Tech Stack

### 🧠 AI Service (Voice Assistant)
- [FastAPI](https://fastapi.tiangolo.com/) microservice
- Prompt-engineered LLM API integrations (OpenAI/custom)
- Deployed via AWS Lambda (or ECS Fargate)

### 🔧 Backend (Dashboard + API)
- FastAPI – handles core logic, authentication, and DB ops
- PostgreSQL – persistent relational storage
- Docker – containerized deployment
- GitHub Actions – CI/CD for seamless deployment
- Hosted on AWS – production-ready cloud infra

### 💻 Frontend
- React.js + Next.js – modern SSR/SPA interface
- Tailwind CSS – responsive utility-first styling
- Role-based dashboard and feedback analytics view

---

## 🌐 Deployment Architecture

The entire platform is designed for modular scalability:

```plaintext
[ Customer ]
    ⬇️
[ AI Voice Call (LLM) ] <--> [ AI Microservice (FastAPI) ]
    ⬇️
[ Feedback Aggregator ] --> [ PostgreSQL DB ]
    ⬇️
[ Dashboard Backend API (FastAPI) ]
    ⬇️
[ React + Tailwind Frontend (Next.js) ]
📂 Project Structure (High-level)
bash
Copy
Edit
/
├── frontend/         # Next.js UI with Tailwind styling
├── backend/          # FastAPI server for auth + dashboard API
├── ai-service/       # FastAPI microservice handling voice AI
├── infra/            # Docker configs, deployment scripts
├── .github/          # GitHub Actions, issue templates
└── README.md         # Project documentation
📅 Roadmap
✅ CRM Integration Framework

✅ AI-Driven Call & Feedback Engine

✅ Dashboard MVP with Real-Time Stats

 Call Recording Storage to S3/GCS

 Sentiment Analysis & Scoring Logic

 Admin Panel with Role Permissions

 Multi-Language Support

 Slack/Email Notification Hooks

🚀 How to Get Started
Clone the Repo

bash
Copy
Edit
git clone https://github.com/Lokam-AI/garagebot.git
cd garagebot
Set Up Environment

Add .env files in backend/, ai-service/, and frontend/

Include API keys, DB URL, and secrets

Run Docker Compose (Optional)

bash
Copy
Edit
docker-compose up --build
Run Frontend & Backend Locally

Backend: uvicorn main:app --reload in backend/

Frontend: npm run dev in frontend/

📊 Dashboard Preview
The GarageBot dashboard shows:

Feedback response rates

Sentiment heatmaps

AI accuracy & scoring

Service center-wise analytics

(Screenshots coming soon!) 📷

🤝 Contributing
We welcome contributions, ideas, and issue reports!

To contribute:

Fork the repo

Create a feature branch: git checkout -b feature/xyz

Submit a pull request with context and description

Check our CONTRIBUTING.md (coming soon) for code style and standards.

📬 Contact & Support
Lokam AI
📧 hello@lokam.ai
🌐 Coming soon: www.lokam.ai
📍 GitHub: Lokam-AI

🪪 License
This project is licensed under the MIT License. See LICENSE for details.

GarageBot – Talk less. Listen smart.

Built with ❤️ by Lokam – AI, culture, and operational excellence.

---

Would you like:
- A matching logo & badge to place at the top?
- A minimal version for internal docs?
- GitHub repo description + tags to go with this?

Let me know, and I’ll generate them for you!