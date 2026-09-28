# Student Management System

A web-based Student Management System built using Spring Boot, Spring Data JPA, MySQL, HTML, CSS, and JavaScript.

The application provides a simple interface to manage student records and perform common student-management operations.

## Features

* Add new student
* View student records
* Update student information
* Delete student records
* Search students
* Pagination and sorting
* Input validation
* Duplicate email handling
* Global exception handling
* RESTful APIs
* MySQL database integration
* Frontend and backend integration

## Technologies Used

### Backend

* Java 21
* Spring Boot 4.1.1
* Spring Data JPA
* Hibernate
* Maven

### Database

* MySQL

### Frontend

* HTML
* CSS
* JavaScript

## Project Structure

```text
StudentManagementSystem
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com.amar.sms
│   │   └── resources
│   │       ├── static
│   │       └── application.properties
│   └── test
├── pom.xml
└── README.md
```

## Database Setup

Create the MySQL database:

```sql
CREATE DATABASE student_management_db;
```

The application uses the following database configuration:

```text
Database: student_management_db
Username: root
```

The database password is supplied through an environment variable and is not stored directly in `application.properties`.

## Configuration

`application.properties` uses:

```properties
spring.datasource.password=${DB_PASSWORD}
```

Set the environment variable before running the application:

```text
DB_PASSWORD=your_mysql_password
```

For Eclipse, the variable can be added through:

```text
Run Configurations
→ Environment
→ New
```

## Running the Application

1. Clone the repository.
2. Open the project in Eclipse or another Java IDE.
3. Make sure MySQL is running.
4. Create the `student_management_db` database.
5. Configure the `DB_PASSWORD` environment variable.
6. Run `StudentManagementSystemApplication`.
7. Open:

```text
http://localhost:8080
```

## API

The application provides REST APIs for student management, including operations for:

* Creating students
* Retrieving students
* Updating students
* Deleting students
* Searching students
* Pagination and sorting

## Application Port

```text
8080
```

## Author

Amar
