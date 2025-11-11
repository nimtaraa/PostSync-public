# 🤖 Post Sync
[![Python Backend CI](https://github.com/nimtaraa/PostSync-public/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/nimtaraa/PostSync-public/actions/workflows/backend-ci.yml)
[![React Frontend CI](https://github.com/nimtaraa/PostSync-public/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/nimtaraa/PostSync-public/actions/workflows/frontend-ci.yml)

> Automated LinkedIn Content Generation and Publishing, Powered by AI Agents

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![React](https://img.shields.io/badge/React-TypeScript-blue?logo=react) ![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python) ![LangGraph](https://img.shields.io/badge/AI-LangGraph-brightgreen) ![MongoDB](https://img.shields.io/badge/MongoDB-4.4-green?logo=mongodb)

---



## 🚀 [View Live Demo](https://post-sync-public-7uqj.vercel.app) 🚀

## 📖 About The Project

Post Sync is a sophisticated, full stack application designed to automate and elevate your LinkedIn content strategy. It's built for professionals, marketers, and teams who want to maintain a consistent, high quality presence on LinkedIn without the daily grind of content creation.

Simply provide a niche or a general theme, and Post Sync's multi agent AI system, built with **LangGraph**, takes over. It handles the entire workflow: from brainstorming insightful topics and writing compelling, informative posts to generating relevant, high quality images and publishing them directly to your LinkedIn profile.

It's your personal, automated content team in a single application.

## 🚀 Key Features

* 📈 **Stateful Multi-Agent Orchestration:** Leverages **LangGraph** for a cyclical, self healing workflow with transparent state management and robust retry logic.
* 🤖 **Cognitive Content Synthesis:** Employs a **GPT-4o** agent for deep niche analysis, topic ideation, and generating informative, thought-leadership-style content.
* 🔄 **Iterative Critique & Refinement Loop:** Features a "Reviewer Agent" that programmatically critiques drafts against quality heuristics, routing them for revision until approved.
* 🎨 **Semantic Image Synthesis:** A "Visual Agent" uses the **Gemini API** to analyze post context and synthesize a conceptually aligned, professional image.
* 🔗 **Autonomous Deployment & Asset Handling:** A "Publisher Agent" fully automates the LinkedIn API pipeline, including native image uploads via **asset URN** management.
* 🗂️ **Persistent Content Ledger:** Systematically archives all post artifacts, including draft history and live URLs, to **MongoDB** for auditing and analysis.
  
## 🛠️ Tech Stack

This project is built with a modern, AI-first stack:

* **Frontend:** React, TypeScript, Vite
* **Backend:** Python (FastAPI)
* **Database:** MongoDB
* **AI Core & Automation:**
    * **LangGraph:** To build and manage the multi-agent content creation graph.
    * **OpenAI GPT-4o:** For core topic and text generation.
    * **Gemini API:** For contextual image generation.

## 🧠 AI Workflow Architecture

The core of Post Sync is a stateful, cyclical graph built with LangGraph. This design allows for complex, self-correcting AI workflows.

1.  **Input:** User provides a niche (e.g., "AI in Healthcare").
2.  **Topic Generation Node (GPT-4o):** Generates a list of potential post topics.
3.  **Content Writing Node (GPT-4o):** Takes an approved topic and drafts a full LinkedIn post.
4.  **Image Generation Node (Gemini):** Reads the post content and generates a relevant image.
5.  **Smart Review Node (GPT-4o):** An agent that critiques the post and image. It checks for informativeness, tone, and relevance.
    * **If Approved:** The graph proceeds to the publishing step.
    * **If Rejected:** The graph cycles back to the writing or image nodes with specific feedback for revision.
6.  **Publisher Node:** Connects to the LinkedIn API, uploads the image to get an `asset URN`, and publishes the post.
7.  **Archive Node:** Saves the final post details to MongoDB.



## ⚡ Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js & npm 
* Python 3.10+
* A running MongoDB instance (local or cloud)
* API keys for:
    * OpenAI
    * Gemini (Google AI Studio)
    * LinkedIn Developer (Client ID & Secret)

### Installation

1.  **Clone the repo**
    ```bash
    git clone https://github.com/nimtaraa/PostSync-public
    cd post-sync
    ```

2.  **Backend Setup (Python)**
    ```bash
    cd server
    python -m venv venv
    venv\Scripts\activate      # On Windows
    pip install -r requirements.txt
    
    # Create and configure your .env file
    cp .env.example .env
    nano .env 
    
    # Run the backend server
    python app/main.py
    ```

3.  **Frontend Setup (React + TS)**
    ```bash
    cd client
    npm install
    
    # Create and configure your .env.local file
    cp .env.local.example .env.local
    nano .env.local
    
    # Run the frontend app
    npm run dev
    ```

## ⚙️ Configuration

You will need to create environment files for both the frontend and backend.

**Backend (`backend/.env`)**
```.env
# OpenAI
OPENAI_API_KEY=sk-YourOpenAIKey...

# Gemini
GEMINI_API_KEY=YourGeminiKey...

# Database
MONGO_DB_URI=mongodb://user:pass@host:port
DB_NAME=database_name
