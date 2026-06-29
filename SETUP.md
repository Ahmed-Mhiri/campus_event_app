# Optimal Development Setup for MyStudyApp

This document explains how to set up a **fast, hot‑reloading development environment** using Docker, and how to switch between **development** and **production** modes with a single command.

---

## 📁 Project Structure

Ensure you have these files in your project root:

```
campus_event_app/
├── docker-compose.yml            # production / base config (unchanged)
├── docker-compose.override.yml   # dev‑only overrides (created below)
├── .env                          # environment variables
├── backend-main/
│   ├── Dockerfile                # production build
│   ├── Dockerfile.dev            # development build (created below)
│   └── ...
├── backend-asta/
│   ├── Dockerfile                # production build
│   ├── Dockerfile.dev            # development build (created below)
│   └── ...
├── frontend/
│   ├── Dockerfile                # production build
│   ├── Dockerfile.dev            # development build (created below)
│   └── ...
└── mosquitto.conf
```

---

## 🐳 Development Mode (with live reload)

In development mode:

- **Frontend** runs a Vite dev server with **hot‑module replacement (HMR)** – changes reflect instantly.
- **Backends** run with `spring-boot:run` – Spring Boot DevTools automatically restarts the app when you change Java code.
- No need to rebuild Docker images after every change – source code is mounted as a volume.

### 1. Create the Dev Dockerfiles

#### `backend-main/Dockerfile.dev`
```dockerfile
FROM maven:3.9-eclipse-temurin-17
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
EXPOSE 8081
CMD ["mvn", "spring-boot:run"]
```

#### `backend-asta/Dockerfile.dev`
```dockerfile
FROM maven:3.9-eclipse-temurin-17
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
EXPOSE 8082
CMD ["mvn", "spring-boot:run"]
```

#### `frontend/Dockerfile.dev`
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### 2. Create the Docker Compose Override

Create `docker-compose.override.yml` in the project root:

```yaml
version: '3.8'

services:
  backend-main:
    build:
      context: ./backend-main
      dockerfile: Dockerfile.dev
    volumes:
      - ./backend-main:/app
      - ~/.m2:/root/.m2          # caches Maven dependencies
    environment:
      - SPRING_PROFILES_ACTIVE=dev
    command: mvn spring-boot:run
    ports:
      - "8081:8081"

  backend-asta:
    build:
      context: ./backend-asta
      dockerfile: Dockerfile.dev
    volumes:
      - ./backend-asta:/app
      - ~/.m2:/root/.m2
    environment:
      - SPRING_PROFILES_ACTIVE=dev
    command: mvn spring-boot:run
    ports:
      - "8082:8082"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_BASE_URL=http://localhost:8081   # adjust if needed
    command: npm run dev -- --host 0.0.0.0
```

### 3. Start Development Environment

```bash
docker-compose down           # stop any running containers
docker-compose up --build -d  # build and start everything
```

**Access:**  
- Frontend: http://localhost:5173  
- Backend APIs: http://localhost:8081, http://localhost:8082

### 4. Make Changes and See Them Live

- **Frontend**: edit any `.tsx`, `.css` file – the browser updates instantly.
- **Backend**: edit any Java file – Spring Boot DevTools restarts the app, and changes are reflected.

To view logs:
```bash
docker-compose logs -f
```

---

## 🏭 Production Mode (built assets)

In production mode:

- **Frontend** is built to static files and served via Nginx on port 80.
- **Backends** run the compiled JAR files (fast startup, no DevTools).
- Changes require a rebuild of images.

### Switch from Dev to Production

Temporarily disable the override file:

```bash
mv docker-compose.override.yml docker-compose.override.yml.bak
docker-compose down
docker-compose up --build -d
```

Now your app is served at:
- Frontend: http://localhost (port 80)
- Backend APIs: same ports (8081, 8082)

### Switch back to Dev

```bash
mv docker-compose.override.yml.bak docker-compose.override.yml
docker-compose down
docker-compose up --build -d   # or just `up -d` if no Dockerfile changes
```

---

## 🔧 Important Notes

- **API Base URL**: The frontend must call `http://localhost:8081`. If your code uses a different address, update the `VITE_API_BASE_URL` environment variable in the override file or modify your frontend `.env` file.
- **Ports**: The frontend dev server uses port `5173` – if that conflicts with another service, change the host port in `ports: "5173:5173"` to something else.
- **Maven Cache**: The `~/.m2` volume speeds up builds but may cause permission issues on some OS. If you encounter problems, remove that line from the override.
- **Database & MQTT**: PostgreSQL and Mosquitto are unchanged in both modes – data persists via volumes.

---

## 🧹 Clean Up

To stop all containers and remove volumes (clear database):

```bash
docker-compose down -v
```

---

## 📖 Summary

| Mode       | Frontend URL       | Backend Startup   | Code Changes            | Command to start        |
|------------|--------------------|-------------------|-------------------------|-------------------------|
| **Dev**    | `http://localhost:5173` | `mvn spring-boot:run` | Instant reload / restart | `docker-compose up --build -d` (with override present) |
| **Prod**   | `http://localhost`       | Compiled JAR      | Requires rebuild        | `docker-compose up --build -d` (without override) |

With this setup you get an **optimal development workflow** – fast, reliable, and easy to switch between environments. Happy coding! 🚀