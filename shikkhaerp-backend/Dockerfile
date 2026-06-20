# Use JDK 21 (matches your pom.xml)
FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

# Install Maven
RUN apk add --no-cache maven

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build
COPY src ./src
RUN mvn clean package -DskipTests

EXPOSE 8080
CMD ["java", "-jar", "target/*.jar"]