package com.shikkhaerp.tools;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class QueryUsers {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/shikkhaerp";
        String user = "postgres";
        String password = "Farhana251@";

        String sql = "SELECT id, email, name, role, status, created_at FROM users ORDER BY created_at DESC LIMIT 100";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            System.out.println("Connected to database. Querying users...");
            int count = 0;
            while (rs.next()) {
                count++;
                String id = rs.getString("id");
                String email = rs.getString("email");
                String name = rs.getString("name");
                String role = rs.getString("role");
                String status = rs.getString("status");
                String createdAt = rs.getString("created_at");
                System.out.printf("%d: id=%s, email=%s, name=%s, role=%s, status=%s, created_at=%s%n",
                        count, id, email, name, role, status, createdAt);
            }
            if (count == 0) {
                System.out.println("No users found in the users table.");
            }
        } catch (SQLException e) {
            System.err.println("Database query failed: " + e.getMessage());
            e.printStackTrace(System.err);
        }
    }
}
