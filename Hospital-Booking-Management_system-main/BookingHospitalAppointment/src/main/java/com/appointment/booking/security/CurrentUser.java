package com.appointment.booking.security;

public class CurrentUser {

    private final String email;
    private final String name;
    private final String role;

    public CurrentUser(String email, String name, String role) {
        this.email = email;
        this.name = name;
        this.role = role;
    }

    public String getEmail() { return email; }
    public String getName() { return name; }
    public String getRole() { return role; }
}
