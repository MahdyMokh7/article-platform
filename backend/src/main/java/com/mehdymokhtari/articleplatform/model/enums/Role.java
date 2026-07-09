package com.mehdymokhtari.articleplatform.model.enums;

import java.util.Locale;

public enum Role {
    ROLE_USER,
    ROLE_ADMIN;

    public static Role fromString(String role) {
        try {
            return Role.valueOf(role.toUpperCase(Locale.ENGLISH));
        } catch (IllegalArgumentException | NullPointerException e) {
            return ROLE_USER;
        }
    }

    public String getAuthority() {
        return this.name();
    }
}