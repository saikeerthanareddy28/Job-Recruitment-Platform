# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Run
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -S jobportal && adduser -S jobportal -G jobportal

COPY --from=build /app/target/*.jar app.jar
RUN mkdir -p /app/uploads && chown -R jobportal:jobportal /app

USER jobportal
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=5 --start-period=60s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/jobs || exit 1

ENTRYPOINT ["java", "-jar", \
  "-Xmx512m", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "app.jar"]
