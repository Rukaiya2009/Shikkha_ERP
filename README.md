# ShikkhaERP – School Management System

[![Java](https://img.shields.io/badge/Java-21-blue)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.1-brightgreen)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1)](https://www.postgresql.org/)

## Overview
Production‑ready, multi‑tenant school management system with role‑based dashboards (Super Admin, School Admin, Teacher, Student, Parent). Built with Spring Boot (Java 21) and React (TypeScript).

## Features
- JWT authentication & refresh tokens
- Database‑driven RBAC (permissions)
- Multi‑school (SaaS) support
- Academic structure, attendance, exams, results, fees
- Real‑time notifications (Email/SMS ready)

## Tech Stack
**Backend:** Java 21, Spring Boot 3.2, Spring Security, JWT, PostgreSQL, Maven  
**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Zustand, Axios

## Quick Start (Development)

### Backend
```bash
cd shikkhaerp-backend
mvn clean spring-boot:run
