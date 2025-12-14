# Web Search RAG Project

A Retrieval-Augmented Generation (RAG) system that uses web-crawled content as knowledge base, starting with Biwase newsletter PDFs.

![alt text](/asset/image.png "Web Search RAG Platform")

## Hướng dẫn chạy chương trình

Hệ thống bao gồm 2 phần chính: **Backend (Python/FastAPI)** và **Frontend (Next.js)**. Bạn cần chạy cả hai đồng thời trong 2 terminal riêng biệt.

### 1. Chạy Backend (Server)

Xử lý dữ liệu, crawling và API.

1. Mở **terminal mới**.
2. Di chuyển vào thư mục backend:

    ```bash
    cd src/web-rag-platform/backend
    ```

3. Kích hoạt môi trường ảo Python (nếu chưa làm):

    ```bash
    # Windows
    ..\..\..\venv\Scripts\activate
    ```

4. Khởi động server (chạy trên port **8080**):

    ```bash
    python -m uvicorn main:app --reload --host 127.0.0.1 --port 8080
    ```

### 2. Chạy Frontend (Giao diện người dùng)

Giao diện web để tương tác.

1. Mở **terminal thứ hai**.
2. Di chuyển vào thư mục frontend:

    ```bash
    cd src/web-rag-platform
    ```

3. Cài đặt dependencies (chỉ cần lần đầu):

    ```bash
    npm install
    ```

4. Khởi động development server:

    ```bash
    npm run dev
    ```

### 3. Truy cập ứng dụng

- Mở trình duyệt và truy cập: **[http://localhost:3000](http://localhost:3000)**
