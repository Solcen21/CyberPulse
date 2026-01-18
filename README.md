# CyberPulse 🛡️

**Real-Time Threat Intelligence Platform**

CyberPulse is a modern, responsive dashboard that aggregates cybersecurity news, active breaches, and recent vulnerabilities (CVEs) into a single, real-time command center.

## ✨ Features

-   **Dashboard-at-a-Glance**: Live feed of the latest cyber incidents and security news.
-   **Multi-Source Intelligence**:
    -   **News**: Aggregates from The Hacker News, Dark Reading, BleepingComputer, and more.
    -   **Disclosed Breaches**: Tracks major data leaks and ransomware activities.
    -   **Vulnerability Stream**: Live connection to the NVD (National Vulnerability Database) for the latest CVEs.
-   **Advanced Search ("Discovery View")**: Search specific terms (e.g., "Chrome", "Ransomware") to generate a unified report across all data sources.
-   **Progressive Web App (PWA)**: Installable on Mobile and Desktop for offline access and native app experience.
-   **Mobile Reponsive**: Fully optimized layout for phones and tablets.

## 🚀 How It Works

CyberPulse runs entirely in the browser (Client-Side). It requires **no backend server**.

1.  **News & Breaches**: Fetches RSS feeds via a proxy to bypass CORS restrictions.
2.  **CVE Data**: Connects directly to the **NIST NVD API 2.0** to fetch vulnerability data in real-time.
3.  **Search**: Filters the loaded in-memory datasets to provide instant "Discovery" results.

## 🛠️ Installation & Usage

You can run CyberPulse locally or host it on any static web host.

### Option 1: Run Locally
1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/CyberPulse.git
    ```
2.  Open `index.html` in your browser.
    *   *Note: Detailed PWA features (Install button) may require a local server (e.g., Live Server extension).*

### Option 2: Host on GitHub Pages (Recommended)
1.  Push this code to a GitHub repository.
2.  Go to **Settings** > **Pages**.
3.  Set the Branch to `main` and **Save**.
4.  Your dashboard is now live!

## 📱 Mobile Installation (PWA)

Visit your live URL on a phone:
-   **iOS**: Tap **Share** -> **Add to Home Screen**.
-   **Android**: Tap **Menu (3 dots)** -> **Install App**.

## 💻 Tech Stack
-   **Frontend**: HTML5, Vanilla JavaScript, CSS3 (Modern Variables & Flexbox/Grid).
-   **Icons**: Custom generated neon SVG assets.
-   **APIs**: NVD API 2.0, RSS-to-JSON.

---
*Built for the security community.*
