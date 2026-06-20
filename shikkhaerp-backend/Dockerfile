# Use Eclipse Temurin (official OpenJDK distribution)
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Install Maven (alpine package manager)
RUN apk add --no-cache maven

# Copy pom.xml first (caches dependencies)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests

# Expose port
EXPOSE 8080

# Run the jar
CMD ["java", "-jar", "target/*.jar"]