FROM maven:3.9.4-eclipse-temurin-21 AS builder
WORKDIR /workspace

# copy module sources and build
COPY . /workspace
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app

# copy jar built by maven
COPY --from=builder /workspace/target/*.jar /app/app.jar

EXPOSE 8082

ENV JAVA_OPTS="-Xms128m -Xmx512m"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
