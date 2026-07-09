# 📄 Article Platform

> A modern full-stack article publishing platform with secure authentication, RESTful API, and containerized deployment.

## ✨ Overview

Article Platform is a production-ready web application that enables users to publish, share, and discover articles seamlessly. Built with a clean separation of concerns, the platform features a React-based single-page application frontend, a Spring Boot REST API backend, and PostgreSQL for persistent data storage. The entire system is containerized using Docker for consistent development and production environments.

### 🎯 Key Features

- **Article Management** – Create, read, search, and manage articles with title, abstract, and body content
- **Smart Search** – Search articles by title or abstract with relevance-based ordering
- **Reference System** – Track article citations and display referenced works
- **Authentication** – Secure JWT-based authentication with BCrypt password hashing
- **User Profiles** – Manage profile information and view published articles
- **Responsive UI** – Modern component-based interface built with React
- **Containerized** – Fully Dockerized with Docker Compose for easy deployment

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Client Browser (React SPA)                 │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────▼───────────────────────────────────┐
│                Reverse Proxy (Nginx)                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                  Backend API (Spring Boot)                  │
│              RESTful endpoints + JWT Authentication         │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│               Database (PostgreSQL)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Java 22** | Core programming language |
| **Spring Boot 3.3.0** | Application framework & dependency injection |
| **Spring Security** | Authentication & authorization |
| **Spring Data JPA** | Database operations & ORM |
| **Hibernate** | JPA implementation |
| **PostgreSQL 42.7.3** | Relational database driver |
| **Maven** | Build automation & dependency management |
| **JWT** | Token-based authentication |
| **BCrypt** | Password hashing |
| **Spring Validation** | Request validation |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI library |
| **Vite 8** | Build tool & development server |
| **React Router v7** | Client-side routing |
| **Axios** | HTTP client for API communication |
| **React Toastify** | Toast notifications for system messages |
| **CSS Modules** | Component-scoped styling |
| **ESLint 10** | Code quality & consistency |
| **Vitest 4** | Unit testing framework |
| **Testing Library** | React component testing |
| **jsdom** | DOM environment for testing |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **Nginx** | Static file serving & reverse proxy |

---

## 📁 Project Structure

```
article-platform/
├── backend/                     # Spring Boot REST API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/mehdymokhtari/articleplatform/
│   │   │   │   ├── config/         # Configuration classes
│   │   │   │   ├── controller/     # REST endpoints
│   │   │   │   ├── service/        # Business logic
│   │   │   │   ├── repository/     # Data access layer
│   │   │   │   ├── model/          # JPA entities
│   │   │   │   ├── dto/            # Data transfer objects
│   │   │   │   ├── exception/      # Global exception handling
│   │   │   │   ├── DataInitializer.java  # Initial data loader
│   │   │   │   └── ArticlePlatformApplication.java
│   │   │   └── resources/
│   │   │       └── application.yml
│   │   └── test/
│   ├── pom.xml                   # Maven dependencies
│   ├── Dockerfile                # Backend container build
│   ├── test-api.http             # HTTP client test file (IntelliJ)
│   └── test-api.bat              # Windows API test script
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API service layer (Axios)
│   │   ├── test/                # Test setup and utilities
│   │   ├── App.jsx              # Root component with routing
│   │   ├── App.module.css       # Root component styles
│   │   ├── main.jsx             # Application entry point
│   │   └── index.css            # Global styles
│   ├── public/                  # Static assets
│   ├── .env                     # Environment variables
│   ├── index.html               # HTML template
│   ├── package.json             # NPM dependencies
│   ├── vite.config.js           # Vite configuration with Vitest
│   └── Dockerfile
├── docker-compose.yaml          # Multi-container orchestration
├── docs/                        # Project documentation
│   ├── api/                     # API specifications
│   ├── architecture/            # System design documents
│   └── deployment/              # Deployment guides
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Docker** 20.10+ and **Docker Compose** 2.0+
- **Java** 22 (for local development)
- **Maven** 3.8+ (for local development)
- **PostgreSQL** 15+ (for local development without Docker)
- **Node.js** 18+ and **NPM** (for local development)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/MahdyMokh7/article-platform.git
   cd article-platform
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - API Documentation: http://localhost:8080/swagger-ui.html

4. **Stop the application**
   ```bash
   docker-compose down
   ```

### Development Setup

#### Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Authentication Flow

1. **Registration** – Users create accounts with username, email, and password
2. **Login** – Authenticated users receive a JWT token
3. **Authorization** – Token must be included in `Authorization: Bearer <token>` header
4. **Security** – Passwords are hashed with BCrypt; tokens expire after a configurable time
5. **Protected Routes** – Frontend guards routes based on authentication status

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT token |

### Articles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/articles` | Get all articles |
| GET | `/api/articles/search?q={query}` | Search articles by title or abstract |
| GET | `/api/articles/popular` | Get articles sorted by citation count |
| GET | `/api/articles/check-title?title={title}` | Check if article title exists |
| GET | `/api/articles/{id}` | Get article by ID |
| POST | `/api/articles` | Create a new article (auth required) |
| PUT | `/api/articles/{id}` | Update an article (auth required) |
| DELETE | `/api/articles/{id}` | Delete an article (auth required) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get current user profile (auth required) |
| PUT | `/api/users/profile` | Update user profile (auth required) |
| PUT | `/api/users/password` | Change password (auth required) |

### References
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/articles/{id}/references` | Get articles referenced by this article |
| GET | `/api/articles/{id}/citations` | Get articles citing this article |

> **Note:** All API endpoints are prefixed with `/api`. The server runs on `http://localhost:8080`.

---

## 🧪 Testing

### Backend
```bash
cd backend
mvn test                    # Run all tests
mvn clean install           # Clean, compile, and run tests
```

### Frontend
```bash
cd frontend
npm test                # Run tests with Vitest
npm run test:ui         # Run tests with UI interface
npm run test:run        # Run tests once
npm run coverage        # Run tests with coverage report
```

---

## 🚢 Deployment

### Production Build
```bash
# Build all services
docker-compose -f docker-compose.prod.yaml build

# Deploy
docker-compose -f docker-compose.prod.yaml up -d
```

### Environment Variables
Create a `.env` file in the root directory:

```env
# Database
POSTGRES_DB=article_platform
POSTGRES_USER=admin
POSTGRES_PASSWORD=secure_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=86400000

# Backend
BACKEND_PORT=8080

# Frontend
FRONTEND_PORT=3000
```

---

## 📚 Documentation

- [API Documentation](docs/api/openapi.yaml) – OpenAPI specification
- [System Architecture](docs/architecture/system-design.md) – Design decisions and architecture
- [Deployment Guide](docs/deployment/production-guide.md) – Production deployment instructions

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards
- **Backend** – Follow Java conventions and Spring best practices
- **Frontend** – Follow ESLint configuration
- **Commits** – Use conventional commit messages

---

## 🙏 Acknowledgments

- Open-source community for amazing tools and libraries
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://reactjs.org/docs)
- [Docker Documentation](https://docs.docker.com)

---

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

## 👤 Contact

**Mehdy Mokhtari**
- 📧 Email: mh.mokhtari7@gmail.com
- 🐙 GitHub: [@MahdyMokh7](https://github.com/MahdyMokh7)
- 🔗 LinkedIn: [Mehdy Mokhtari](https://linkedin.com/in/mehdymokhtari)

