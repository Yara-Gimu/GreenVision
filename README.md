# 🌿 GreenVision: AI-Powered Environmental Monitoring System

![GreenVision Banner](https://img.shields.io/badge/Status-MVP_Completed-10B981?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![AI/GenAI](https://img.shields.io/badge/Generative_AI-Vision-FF6F00?style=for-the-badge&logo=google&logoColor=white)

## 📌 Overview
**GreenVision** is an enterprise-grade, cloud-native platform designed to automate the detection and monitoring of invasive plant species (specifically *Prosopis juliflora* / Mesquite) in Saudi Arabia. 

By integrating autonomous drone imagery with advanced **Computer Vision AI** and **Cloud Infrastructure**, the system empowers environmental specialists to make data-driven decisions, supporting national ecological conservation efforts aligned with Saudi Vision 2030.

## 🚀 Key Features
* **AI-Driven Botanical Analysis:** Utilizes state-of-the-art multimodal AI to analyze high-resolution drone imagery, classifying vegetation as Invasive, Native, or Exotic with real-time confidence scoring.
* **Geospatial Intelligence:** Automatically extracts EXIF GPS metadata from raw drone images to map plant distribution coordinates accurately.
* **Cloud Sync & Storage:** Seamlessly uploads field data to scalable cloud blob storage, synchronized with a relational database for immediate dashboard accessibility.
* **Asynchronous Processing:** Handles bulk image uploads and large ZIP files via background task queues, preventing system timeouts during massive field surveys.
* **Dual-Portal Architecture:** * **Operator Portal:** A strict, distraction-free interface for field drone operators to upload data.
  * **Specialist Dashboard:** An analytical dashboard featuring automated Excel report generation, species distribution charts, and mitigation guidelines.

## 🧠 Core Competencies & Tech Stack Showcased

### ☁️ Cloud Computing & Architecture
* **Supabase (PostgreSQL & Storage):** Architected the cloud database schema and configured cloud blob storage for secure, scalable image hosting.
* **Security (RLS):** Implemented Row Level Security (RLS) policies and utilized Service Role Keys to secure data pipelines between the backend and the cloud.
* **Cloud Deployment:** Deployed the RESTful API via **Render** and hosted static frontend assets on high-performance CDN networks.

### 🤖 Artificial Intelligence & Prompt Engineering
* **Vision Models:** Integrated **Gemini 2.0 Flash Vision** (via OpenRouter API) for high-speed, accurate image classification.
* **Prompt Engineering:** Designed strict, role-based, few-shot prompts to enforce JSON-only outputs, enabling the AI to distinguish complex botanical nuances (e.g., differentiating invasive Mesquite from native Acacia).
* **Image Optimization:** Engineered an on-the-fly image compression pipeline using `Pillow` to reduce bandwidth and API costs without sacrificing AI classification accuracy.

### ⚙️ Backend Engineering
* **FastAPI:** Built a robust, asynchronous RESTful API.
* **ORM:** Utilized **SQLAlchemy** for database transactions and relationship mapping.
* **Data Processing:** Developed modules to parse deeply nested JSON responses, handle transient network errors, and extract ExifTags (GPS info) efficiently.

### 💻 Frontend Development
* **Tailwind CSS:** Crafted a responsive, modern UI/UX with zero external CSS files.
* **Vanilla JavaScript:** Implemented asynchronous `fetch` requests, dynamic DOM manipulation, and smart polling mechanisms for real-time task status updates.

## 🏗️ System Architecture Workflow
1. **Field Operations:** Drone captures imagery -> Operator uploads ZIP/Images via Web App.
2. **Backend Gateway:** FastAPI receives payload -> Extracts GPS metadata -> Triggers background worker.
3. **Cloud Bridge:** Images are securely synced to **Supabase Storage** -> Public URLs generated.
4. **AI Processing:** Optimized image streams are sent to the AI Model -> JSON analysis returned -> Fused with local botanical database.
5. **Persistence:** Results stored in **Supabase PostgreSQL** -> Frontend polling detects completion -> Reports generated.

## 📥 Installation & Local Setup

# 1. Clone the repository
git clone [https://github.com/Yara-Gimu/GreenVision.git](https://github.com/Yara-Gimu/GreenVision.git)
cd GreenVision

# 2. Create a virtual environment
python -m venv .venv
source .venv/Scripts/activate  # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure Environment Variables
# Create a .env file and add:
# SUPABASE_URL=your_url
# SUPABASE_KEY=your_service_role_key
# OPENROUTER_API_KEY=your_api_key

# 5. Run the FastAPI Server
python backend/main.py
👩‍💻 Author
Yara (CEO & Lead Engineer)

Computer Science Student | Cloud Computing & AI Enthusiast

Exploring the intersection of software engineering and environmental sustainability.

* [LinkedIn](https://www.linkedin.com/in/yara-alalawi999) | [GitHub](https://github.com/Yara-Gimu)
