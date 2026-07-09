```markdown
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
| **Java 17** | Core programming language |
| **Spring Boot 3.x** | Application framework & dependency injection |
| **Spring Security** | Authentication & authorization |
| **Spring Data JPA** | Database operations & ORM |
| **Hibernate** | JPA implementation |
| **PostgreSQL** | Relational database |
| **Maven** | Build automation |
| **JWT** | Token-based authentication |
| **BCrypt** | Password hashing |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI library |
| **Vite** | Build tool & development server |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client for API communication |
| **CSS Modules** | Component-scoped styling |
| **ESLint** | Code quality & consistency |

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
│   │   │   │   └── ArticlePlatformApplication.java
│   │   │   └── resources/
│   │   │       └── application.yml
│   │   └── test/
│   ├── pom.xml
│   └── Dockerfile
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API service layer
│   │   ├── App.jsx              # Root component
│   │   └── main.jsx             # Application entry point
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
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
- **Java** 17 (for local development)
- **Maven** 3.8+ (for local development)
- **Node.js** 18+ and **NPM** (for local development)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/article-platform.git
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
| GET | `/api/articles` | Get all articles with search |
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
| GET | `/api/articles/{id}/references` | Get article references |
| GET | `/api/articles/{id}/citations` | Get articles citing this article |

---

## 🧪 Testing

### Backend
```bash
cd backend
mvn test
```

### Frontend
```bash
cd frontend
npm test
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

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

## 👤 Contact

**Mehdy Mokhtari**
- 📧 Email: mh.mokhtari7@gmail.com
- 🐙 GitHub: [@MahdyMokh7](https://github.com/MahdyMokh7)
- 🔗 LinkedIn: [Mehdy Mokhtari](https://linkedin.com/in/mehdymokhtari)


---

## 🙏 Acknowledgments

- Open-source community for amazing tools and libraries
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://reactjs.org/docs)
- [Docker Documentation](https://docs.docker.com)

---

**Built with ❤️ using Spring Boot, React, and PostgreSQL**
```