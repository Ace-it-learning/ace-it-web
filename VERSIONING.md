# Ace It! Version Control & Backup Strategy

## 1. Current Snapshot (Version 1.0)
You are about to start a major new feature (Maths AI). To secure your current stable version (English AI):

### **Step 1: Commit & Tag (Git)**
We have committed your recent fixes and marked this as `v1.0`.
```bash
git add .
git commit -m "Release v1.0: Stable English AI Module"
git tag v1.0
git push origin main --tags
```

### **Step 2: Local Backup (Zip)**
A physical zip file of your project folder was created at (or is currently generating):
`C:\Users\user\Documents\ace-it-web-v1.0-backup.zip`
This serves as a fail-safe "hard" backup.

---

## 2. Recommended Workflow for Maths Module
To avoid "screwing up" the working English module, use **Feature Branches**. This allows you to work largely in isolation and only merge when it's perfect.

### **The Strategy: Feature Branching**
1.  **`main` Branch**: PROD-READY text. Never work directly here. Only merge stable code here.
2.  **`feature/maths-tutor` Branch**: Your playground. Break things here. It won't affect `main`.

### **How to do it**:
You are currently on the `feature/maths-tutor` branch.
*You are now in a parallel universe. You can delete files, change server code, etc. The `v1.0` tag on `main` remains safe.*

### **If things go wrong...**
*   **Small oops:** `git checkout .` (Undo unchecked changes)
*   **Big oops:** `git checkout main` (Go back to safety)
*   **Nuclear option:** Unzip your `ace-it-web-v1.0-backup.zip`.

---

## 3. Versioning Scheme (SemVer)
We will follow Semantic Versioning (`MAJOR.MINOR.PATCH`):

*   **1.0.0**: Valid English AI (Current)
*   **1.1.0**: Added basic Maths structure (Database, API)
*   **1.2.0**: Added Maths Frontend
*   **2.0.0**: Full Launch of Maths AI + English AI (Major Release)
