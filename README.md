# WCO Elephant Monitor (Next.js Version)

This is a modern web application port of the Elephant Monitoring System, built with **Next.js 14+ (App Router)**, **TypeScript**, and **Tailwind CSS**.

## 🚀 Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```

3.  **Open the app:**
    Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Features
-   **Live Dashboard:** Interactive Map (Leaflet) with real-time tracking zones.
-   **Simulation Mode:** Trigger "Buffer Breach" or "Critical Threat" scenarios to see UI responses.
-   **Analytics:** Historical data visualization using Recharts.
-   **System Control:** Device status monitoring and diagnostics.

## 📁 Structure
-   `app/`: Pages and Layout
-   `components/`: Reusable UI components (Map, Sidebar, etc.)
-   `context/`: Global state management (Simulation Context)