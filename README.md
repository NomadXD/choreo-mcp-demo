# Book Manager Service

A simple Express.js service to manage books in a bookstore.

## Features

- Add a book (`POST /books`)
- List all books (`GET /books`)
- Get a book by ID (`GET /books/{id}`)

## Book Object

- `id` (auto-generated)
- `name`
- `author`

## Getting Started

### Prerequisites

- Node.js (v14 or newer recommended)

### Installation

```
npm install
```

### Running the Service

```
npm start
```

The service will run at [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Add a Book

- **POST** `/books`
- **Body:**
  ```json
  {
    "name": "Book Title",
    "author": "Author Name"
  }
  ```
- **Response:**
  ```json
  {
    "id": "...",
    "name": "Book Title",
    "author": "Author Name"
  }
  ```

### Get All Books

- **GET** `/books`
- **Response:**
  ```json
  [
    {
      "id": "...",
      "name": "Book Title",
      "author": "Author Name"
    },
    ...
  ]
  ```

### Get Book by ID

- **GET** `/books/{id}`
- **Response:**
  ```json
  {
    "id": "...",
    "name": "Book Title",
    "author": "Author Name"
  }
  ```
- **404 Response:**
  ```json
  { "error": "Book not found." }
  ```
