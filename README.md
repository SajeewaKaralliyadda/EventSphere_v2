<div align="center">
  <h1>🎉 EventSphere</h1>
  <p>A Modern, Multi-Tenant Event Management Platform</p>
</div>

## 📖 About The Project

EventSphere is a comprehensive, full-stack event management system designed to handle everything from event creation and ticketing to role-based team management and automated email campaigns. Built with a robust multi-tenant architecture, it provides isolated environments for different organizations to manage their events securely.

**Live Application:** [https://eventsphere-ashy.vercel.app](https://eventsphere-ashy.vercel.app)

### ✨ Key Features

- **Multi-Tenancy:** Isolated data and dashboards for different organizations/tenants.
- **Role-Based Access Control (RBAC):** Dedicated flows for Super Admins, Tenant Admins, Organizers, Gate Scanners, and Attendees.
- **Event & Ticket Management:** End-to-end event creation, capacity planning, and QR code generation for tickets.
- **Gate Scanning:** Mobile-friendly QR scanner interface for fast event check-ins.
- **Automated Email Campaigns:** Weekly newsletters and secure user invitation workflows (via Brevo SMTP).
- **Secure Payments:** Integrated checkout processes using Stripe.

### 🛠️ Built With

**Frontend:**

- React.js (with Vite)
- React Router DOM
- Tailwind CSS & Lucide Icons
- Vercel (Hosting)

**Backend:**

- Java 17 & Spring Boot 3
- Spring Security (JWT Authentication)
- PostgreSQL (Hosted on Supabase)
- Brevo (SMTP Relay for Emails)
- Cloudinary (Media Storage)
- Render (Hosting)

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

- Node.js (v18 or higher)
- Java 17 (JDK)
- Maven

### Frontend Setup

1. Clone the repository and navigate to the frontend directory.
2. Install dependencies:
   ```bash
   npm install
   ```
