FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

RUN apk add --no-cache maven

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests

EXPOSE 8080

# Use shell form to expand the wildcard
CMD java -jar target/*.jar