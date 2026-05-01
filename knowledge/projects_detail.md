# Taiwo Jegede — Project Deep Dives

## AI Negotiation Agent & Advanced Negotiation System

**The problem:** Supply chain negotiations are complex multi-party interactions where the outcome depends on strategy, information asymmetry, and timing. Taiwo built an AI agent that can simulate these negotiations in real time.

**Architecture:** The initial version (TheAINegotiator) is a Python + Streamlit application. It implements strategic negotiation algorithms where the AI adapts its offers based on the counterparty's responses, simulating realistic back-and-forth dynamics.

**AWS migration (Advanced Negotiation System):** The platform was then migrated to a cloud-native serverless architecture — FastAPI backend deployed on AWS Lambda, frontend hosted on AWS Amplify. This eliminated cold-start concerns through provisioned concurrency and enabled auto-scaling for concurrent negotiation sessions.

**Architecture detail:** The agent is built on a neuro-symbolic architecture — the LLM (prompted to play "Alex from ChipSource," a chip sales representative) handles conversational role-play, while custom Python AWS Lambda functions enforce strict mathematical guardrails ensuring all negotiated deal parameters (pricing, volume, lead times) remain feasible and structurally sound. This hybrid approach prevents the LLM from hallucinating impossible deal terms while maintaining natural, adaptive dialogue. The simulation was designed for supply chain students practicing chip procurement negotiations.

GitHub: github.com/TheJegede/TheAINegotiator and github.com/TheJegede/Negotiator

## ETSU Generative AI Negotiation Simulation (Production)

**Context:** This was Taiwo's primary project during his AI Engineer role at East Tennessee State University. Unlike the personal GitHub version, this was a production system with real student users.

**Technical stack:**
- **Model:** Claude 3.5 Sonnet via AWS Bedrock for LLM inference
- **Compute:** AWS Lambda as the connective tissue — invoked Bedrock, enforced business logic, managed request/response flow with no idle cost
- **State management:** DynamoDB handled session state across multi-turn negotiations
- **Scale:** Designed and validated to support up to 500 concurrent student users per faculty requirement
- **Role-play design:** System prompts placed the model in specific negotiator personas with defined constraints (price floors, volume limits, deadline pressure) — Lambda guardrails caught and corrected any deal terms that violated those constraints before returning to the student

## Serverless NLP System (ETSU — AWS Comprehend)

Led a cross-functional team to deploy a production NLP pipeline that processed student feedback at scale.

**Architecture:**
- AWS Lambda triggered on new feedback submissions
- AWS Comprehend for sentiment analysis and key phrase extraction
- Results surfaced in Power BI dashboards for program administrators
- Reduced manual feedback review time significantly

The pipeline processed student feedback submissions at scale. Results were surfaced in Power BI dashboards giving program administrators real-time visibility into sentiment trends, recurring themes, and at-risk program areas. Analysis directly influenced resource allocation and curriculum decisions presented to university leadership.

## Customer Churn Prediction (Live Demo)

**Problem:** A telecom company needed to identify customers likely to churn before they left, enabling proactive retention interventions.

**Dataset:** ~7,000 IBM Telco customer records, 29 engineered features after domain-driven feature selection.

**Model pipeline:**
- XGBoost as primary model, LightGBM as challenger
- Optuna for hyperparameter optimization (200 trials)
- MLflow for full experiment tracking and reproducibility
- Final metrics: 0.808 recall, 0.848 AUC-ROC on held-out test set

**Deployment:**
- Dockerized Streamlit dashboard at whychurn.streamlit.app
- CI/CD via GitHub Actions (pytest + ruff linting on every push)
- 36-test suite covering preprocessing, model inference, and API contracts

**Why recall over precision:** In churn prediction, a false negative (missing a churner) costs more than a false positive (flagging a loyal customer for a retention offer). The model was optimized accordingly.

GitHub: github.com/TheJegede/Customer_ChurnPred

## Multimodal Emotion Recognition

**Architecture:** Three parallel encoding pathways fused at the decision layer:
- Facial: CNN encoder processing video frames
- Speech: RNN/LSTM processing audio spectrograms
- Text: BERT encoder processing transcripts

**Dataset:** 35,000+ labeled samples.

**Result:** 15% improvement in classification accuracy over the best single-modality baseline.

**Fusion strategy:** Moved beyond simple late fusion to implement a hybrid attention-based fusion strategy — the attention mechanism learned to weight each modality's contribution dynamically rather than averaging outputs. Training was optimized using in-memory caching to reduce I/O overhead on large multi-modal batches. The model was benchmarked across a robust combination of datasets: IEMOCAP, CMU-MOSEI, MELD, and RAVDESS. The 15% accuracy improvement was measured against the best single-modality baseline on the held-out test split.

## E-Commerce Sales Analysis Dashboard (Power BI)

**Scope:** $12.64M total sales, 178,000 orders tracked.

**Technical depth:**
- Complex DAX measures for YoY growth, cohort retention, margin analysis
- Row-level security for multi-region access control
- **Data source:** Advanced Excel (Power Query, XLOOKUP, Pivot Tables) combined with SQL for primary data sourcing and standardization — no cloud warehouse required
- **Business questions answered:** Master data standardization across product lines, order volume trends, revenue by region/category, profit margin tracking
- **Impact:** Enabled self-service data adoption by non-technical stakeholders; drove decisions around inventory planning and sales strategy based on the $12.64M sales and 178K order dataset

## Exploratory Data Analysis Portfolio

**Titanic Survival Prediction:** Used association rule mining (Apriori algorithm) rather than standard classification — discovered that 1st class females had 97.2% survival rate as an association rule, framing survival as a pattern discovery problem rather than a binary classification.

**Album Sales Regression:** Predicted album sales from radio airplay, advertising spend, and attractiveness scores. Final model: R² = 0.617.

**NLP Suite Projects:** Spam detection (93% accuracy, 10,899 emails), NER tagging on 47,959 sentences, VADER sentiment analysis on Amazon reviews, LDA/NMF topic modeling on ABC News headlines, and from-scratch RNN/LSTM/GRU sequence model comparison. See github.com/TheJegede/NaturalLanguageProcessing.

## NLP Suite

**Spam Detection:** 93% accuracy on 10,899 emails using TF-IDF features + Naive Bayes / SVM classifiers.

**NER Tagging:** POS tagging and entity extraction on 47,959 sentences.

**Sentiment Analysis:** VADER-based analysis on Amazon product reviews — compared lexicon-based vs learned approaches.

**Topic Modeling:** LDA and NMF on ABC News headlines corpus. Compared coherence scores across different numbers of topics to find optimal k.

**Sequence Modeling:** Implemented RNN, LSTM, and GRU from scratch to compare architectures on sequence classification tasks.

GitHub: github.com/TheJegede/NaturalLanguageProcessing

## Enrollment Decline & Demographic Shift AI System

**Problem:** US higher education faces a structural enrollment crisis — the number of 18-year-olds peaked in 2025 and will decline for a decade (the "demographic cliff"). Composition is also shifting: White enrollment projected −38% by 2035, Hispanic +8%, Asian +16%, TwoOrMore +23%.

**Three integrated modules:**

**Module 1 — Demographic Forecasting:** SARIMA vs Prophet models trained on 1980–2017 NCES data, held out 2018–2023. SARIMA wins with 3.9% MAPE; Prophet over-predicts growth. Outputs 80% + 95% CI projections to 2035 by race/ethnicity and census region.

**Module 2 — Lead & Yield Prediction:** Two XGBoost classifiers on 50K synthetic applicants (calibrated to IPEDS). Lead model: ROC-AUC 0.665. Yield model: ROC-AUC 0.713. Platt-scaled calibration, SHAP top-3 explanations per prediction. Mandatory bias audit — first-gen applicants flagged (DI ratio 0.74), threshold lowered 0.50 → 0.47 to close parity gap from 2.6pp to 0.1pp.

**Module 3 — RAG Admissions Chatbot:** 3,040 chunks from 250 ASU admissions pages, embedded with all-MiniLM-L6-v2, stored in ChromaDB, generated with Groq llama-3.1-8b-instant. Trick-refusal rate: 5/5 (100%). Mean latency 5.2s on free tier.

**Simulated impact:** 3pp yield improvement → ~150 additional enrollments/year at a 5K-student institution → $4.5M annual tuition revenue.

**Stack:** Python, Streamlit, Prophet, statsmodels SARIMA, scikit-learn, XGBoost, SMOTE, SHAP, sentence-transformers, ChromaDB, LangChain, Groq API, Plotly, NCES/IPEDS data.

Live demo: enrollementdecline.streamlit.app | GitHub: github.com/TheJegede/EnrollementDecline

## Student Attrition & Retention AI System

**Problem:** Universities lack early warning — formal academic warnings come too late. Students have already disengaged weeks before. This system detects risk signals 6–8 weeks before any official intervention using behavioral data from the Open University Learning Analytics Dataset (OULAD).

**Dataset:** OULAD — ~32K student records across 7 CSV files, CC BY 4.0 licensed. Features engineered from VLE interaction logs: days_since_last_vle, submission_count_w6, avg_score_w6, early_submission_days, studied_credits.

**Model:** Calibrated XGBoost classifier.
- F1 Score: 0.6575 (withdrawal prediction)
- ROC-AUC: 0.8444
- Precision: 0.782 | Recall: 0.567
- SHAP explainability — top-3 features surfaced per at-risk student

**Deliverable:** Four-page Streamlit advisor dashboard — risk scores (0–100), at-risk student lists, individual student profiles with SHAP explanations, model performance metrics.

**Pipeline:** 5 sequential Jupyter notebooks (EDA → feature engineering → modeling → explainability → bias audit) before dashboard launch.

**Stack:** Python, scikit-learn, XGBoost, SHAP, Streamlit, imbalanced-learn, OULAD dataset.

Live demo: studentretentionsystem.streamlit.app | GitHub: github.com/TheJegede/StudentRetentionSystem

## Student Mental Health Early-Warning AI System

**Problem:** Campus counseling centers are overwhelmed. This system acts as an AI-assisted triage tool — it flags students whose behavioral patterns or written text suggest reduced wellbeing, so coordinators can prioritize outreach. Explicitly NOT a clinical tool. Requires IRB approval and clinical board review for real deployment.

**Three components:**

**Behavioral Risk Classifier:** XGBoost model trained on 30K synthetic rows calibrated to Healthy Minds Study distributions. Flags students showing at-risk behavioral patterns. SHAP explainability throughout.

**NLP Distress Detector:** Three-layer classifier using DAIC-WOZ + eRisk academic datasets. Scores written text for distress signals. Word-level explainability via LIME. Models: DistilBERT and RoBERTa.

**Crisis-Aware Chatbot:** Groq/Llama 3.1-powered resource navigator. Architecture enforces a crisis keyword detection layer that executes FIRST — before any other processing, non-negotiably. Knowledge base: 36 markdown documents across 6 topic areas, UCLA CAPS as canonical reference, national crisis resources included. Vector store: ChromaDB. Output filtered to prevent clinical language; responses stay resource-focused.

**Ethics:** System does not diagnose. All data is synthetic — no real PII. Real deployment requires IRB approval and pilot validation.

**Stack:** Python 3.11, Streamlit, XGBoost, SHAP, LIME, DistilBERT, RoBERTa, ChromaDB, Groq API, uv package manager.

Live demo: mental-health-application.streamlit.app | GitHub: github.com/TheJegede/Mental-Health-Application
