package com.mehdymokhtari.articleplatform.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PasswordServiceTest {

    private PasswordService passwordService;

    @BeforeEach
    void setUp() {
        passwordService = new PasswordService();
    }

    @Test
    void shouldHashPassword() {
        String plainPassword = "SecurePass123";
        String hashed = passwordService.hashPassword(plainPassword);

        assertThat(hashed).isNotNull();
        assertThat(hashed).isNotEqualTo(plainPassword);
        assertThat(hashed).startsWith("$2a$12$");
    }

    @Test
    void shouldVerifyCorrectPassword() {
        String plainPassword = "SecurePass123";
        String hashed = passwordService.hashPassword(plainPassword);

        boolean isValid = passwordService.verifyPassword(plainPassword, hashed);

        assertThat(isValid).isTrue();
    }

    @Test
    void shouldRejectWrongPassword() {
        String plainPassword = "SecurePass123";
        String hashed = passwordService.hashPassword(plainPassword);

        boolean isValid = passwordService.verifyPassword("WrongPassword", hashed);

        assertThat(isValid).isFalse();
    }

    @Test
    void shouldProduceDifferentHashesForSamePassword() {
        String plainPassword = "SecurePass123";
        String hash1 = passwordService.hashPassword(plainPassword);
        String hash2 = passwordService.hashPassword(plainPassword);

        assertThat(hash1).isNotEqualTo(hash2);
    }
}