# Parea: Full-Stack Receipt Processing and Expense Allocation System

Parea is an end-to-end web application designed to automate the extraction of line items from physical receipts and manage equitable expense distribution among multiple participants. The system integrates a React-based frontend utilizing Optical Character Recognition (OCR) with a robust Spring Boot REST API.

## System Architecture

The project is architected as a monorepo to maintain a tight feedback loop between the data model and the presentation layer.

* **Frontend**: Built with React and TypeScript, leveraging asynchronous worker threads for OCR processing via Tesseract.js. The UI is designed with a mobile-first approach, utilizing the native MediaDevices API for receipt capture.
* **Backend**: A Java-based microservice built on Spring Boot 3. It manages session persistence, participant state, and transactional integrity for bulk data entry.
* **Database**: Utilizes Spring Data JPA with a relational schema optimized for many-to-many relationships (item sharing) and one-to-many session hierarchies.

## Engineering Challenges and Solutions

### 1. Multilingual OCR Normalization and Heuristics
A core challenge was the accurate extraction of data from receipts containing mixed Greek (EL) and English (EN) character sets.
* **Solution**: Implemented a multi-language Tesseract worker configuration (`eng+ell`). To handle "noisy" receipt data, a heuristic-based regex engine was developed to distinguish between billable items and metadata (VAT, sub-totals, and timestamps) by analyzing character patterns and punctuation markers.

### 2. High-Precision Financial Arithmetic
Floating-point errors in JavaScript and Java can lead to significant discrepancies when splitting large bills.
* **Solution**: The backend utilizes `BigDecimal` with `RoundingMode.HALF_UP` for all currency calculations. This ensures that the sum of split debts always matches the total receipt price, maintaining mathematical accuracy across distributed debts.

### 3. ACID Compliance in Bulk Data Entry
Uploading an entire receipt's worth of items in individual requests would be inefficient and prone to partial failure.
* **Solution**: Designed a Bulk-Add API endpoint that processes a collection of DTOs within a single `@Transactional` context. By utilizing `saveAndFlush` and manual persistence context synchronization, the system guarantees that all receipt items are either committed successfully or rolled back entirely.

## Technology Stack

### Backend
- **Java 17**
- **Spring Boot 3.x**
- **Spring Data JPA**
- **H2/PostgreSQL**

### Frontend
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Tesseract.js**

## Setup and Installation

### Prerequisites
- JDK 17 or higher
- Node.js 18.x or higher
- Maven 3.x

### Execution
1. **Clone the repository**:
   ```bash
   git clone [https://github.com/StefanosHUA/BillSplitter.git](https://github.com/StefanosHUA/BillSplitter.git)
2. Backend: Navigate to /parea-backend and run ./mvnw spring-boot:run.

3. Frontend: Navigate to /parea-frontend, run npm install, then npm run dev.
