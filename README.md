# Conference-Management-System-Backend

The **backend** implementation of the Conference Management System, designed to handle core functionalities, data management, and API services. Developed as part of **CSE408: Software Development Sessional**, this backend integrates seamlessly with the frontend to deliver a robust conference management experience.

## Tech Stack

The backend is built with the following technologies:

- **Express**: Fast and minimalist web framework for Node.js.
- **PostgreSQL**: A powerful, open-source relational database for structured data.
- **Supabase**: An open-source backend-as-a-service platform for managing database and authentication.
- **Nodemailer**: A module for sending emails from the application.

## Features

- **Conference Management**:
  - Create, update, and delete conferences.
  - Manage conference schedules, participants, and events.

- **Paper and Poster Management**:
  - Handle submissions and revisions.
  - Store metadata and track submission statuses.

- **Review Management**:
  - Assign reviewers to submitted papers and posters.
  - Allow reviewers to provide scores, feedback, and recommendations.
  - Track review progress and automate notifications for deadlines.

- **User Authentication**:
  - Secure user authentication and authorization.
  - Role-based access for administrators, reviewers, and researchers.

- **Email Notifications**:
  - Automate email notifications for important updates and deadlines.
  - Send invitations to keynote speakers and workshop organizers.

- **Data Storage and Management**:
  - Store and retrieve conference, user, submission, and review data efficiently.
  - Ensure data integrity and security.

- **Dashboard API**:
  - Provide endpoints for real-time conference statistics and analytics.


## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- [PostgreSQL](https://www.postgresql.org/) (v12 or later)
- [Supabase](https://supabase.com/) account and project configured.

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/Conference-Management-System-Backend.git
   cd Conference-Management-System-Backend
2. npm install
3. npm start
