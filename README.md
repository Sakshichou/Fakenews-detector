# 🛡️ FakeShield XAI

> **Spot fake news instantly with AI that shows its work.**

FakeShield XAI is an end-to-end Machine Learning pipeline and web application designed to verify text authenticity and flag misleading news content. By bridging high-performance deep learning with model accountability, this project utilizes a fine-tuned Transformer model accompanied by real-time feature attribution mapping via SHAP (SHapley Additive exPlanations).

## 🚀 Overview
Modern misinformation is sophisticated, and "black box" AI predictions are no longer enough to build user trust. FakeShield XAI not only predicts whether a news article is deceptive or authentic, but it also visually maps the exact mathematical impact of every single word in the text, allowing users to understand *why* the model made its decision.

## 🧠 Architecture & Tech Stack

The project is built on a highly modular, decoupled architecture:

* **Frontend UI (React / Tailwind):** A modern, responsive web application featuring dynamic state changes, a liquid confidence gauge, and a custom text-rendering engine to display the color-coded SHAP token highlights.
* **Backend API (FastAPI / Python):** A high-performance RESTful API server handling cross-origin requests, hosted dynamically on a cloud GPU and exposed via Localtunnel.
* **Classification Engine (DistilBERT / PyTorch):** The core intelligence. A highly efficient `distilbert-base-uncased` Transformer model loaded via Hugging Face.
* **Explainable AI (SHAP):** Utilizing a `PartitionExplainer` to calculate token-level attribution weights, rendering the "black box" transparent.

## 📊 Dataset & Performance Metrics

The AI model was fine-tuned on the comprehensive *Fake and Real News Dataset* (via Kaggle), ensuring robust, real-world context understanding.

* **Model Used:** `therealcyberlord/fake-news-classification-distilbert`.
* **Training Corpus:** 32,326 real and fake news articles.
* **Data Structure:** Cleanly split between objective, factual reporting (Real) and sensationalized, deceptive, or entirely manufactured news (Fake).
* **Accuracy:** ~99.9%.
* **Precision:** ~99.9%.
* **Recall:** ~99.9%.
* **F1-Score:** ~99.9%.

*(Metrics based on internal benchmark testing sets)*

## 💡 Key Features

1. **Instant Verification:** Real-time processing of news snippets, headlines, or articles.
2. **Visual Token Mapping:** Words that trigger a "Fake" classification are highlighted in stark alert tones (e.g., coral/red), while factual markers are highlighted in supportive tones (e.g., neon teal).
3. **Dynamic Trimming:** The backend includes a smart-truncation safeguard that optimizes processing times and prevents server timeouts on lengthy articles.
4. **Interactive Templates:** One-click quick-start cards for users to instantly test factual reporting, sensational clickbait, or tricky contextual statements.

## ⚙️ Local Setup & Usage

### 1. Backend Server (Google Colab / Cloud GPU)
1. Upload the `FakeShield_Backend.ipynb` notebook to Google Colab.
2. Ensure the Runtime is set to **T4 GPU**.
3. Run the complete notebook to download the DistilBERT weights, initialize the SHAP explainer, and start the FastAPI server.
4. Copy the generated `loca.lt` URL.

### 2. Frontend Client
1. Clone this repository. 
2.  Navigate to the frontend directory and install dependencies:
   ```bash
npm install
```
3.Update the API endpoint in the fetch request to match your active Localtunnel URL.

4.Start the development server:
```bash
npm run dev
```

 
