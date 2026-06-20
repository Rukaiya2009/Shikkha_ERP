# Use an official OpenJDK runtime
FROM openjdk:17-jdk-slim

# Set the working directory
WORKDIR /app

# Copy the Maven build file
COPY pom.xml .

# Install Maven and download dependencies (cached layer)
RUN apt-get update && apt-get install -y maven && \
    mvn dependency:go-offline -B

# Copy the source code
COPY src ./src

# Build the application (skip tests to save time)
RUN mvn clean package -DskipTests

# Expose the port
EXPOSE 8080

# Run the Spring Boot jar
CMD ["java", "-jar", "target/*.jar"]