package com.mehdymokhtari.articleplatform.security;

import com.mehdymokhtari.articleplatform.model.entity.User;
import org.springframework.security.core.userdetails.UserDetails;

public interface JwtService {

    String generateToken(User user);

    String extractUsername(String token);

    Long extractUserId(String token);

    boolean isTokenValid(String token, UserDetails userDetails);
}