package com.jobportal;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "app.jwt.secret=testSecretKeyForTestingPurposesOnly1234567890",
    "app.jwt.expiration=86400000",
    "app.jwt.refresh-expiration=604800000",
    "app.upload.directory=./test-uploads",
    "app.cors.allowed-origins=http://localhost:3000"
})
class JobPortalApplicationTests {

    @Test
    void contextLoads() {
    }
}
