FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

COPY backend/pom.xml /app/backend/pom.xml
COPY backend/mvnw /app/backend/mvnw
COPY backend/.mvn /app/backend/.mvn
COPY backend/src /app/backend/src

RUN chmod +x /app/backend/mvnw
RUN /app/backend/mvnw -f /app/backend/pom.xml -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/backend/target/*.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]

