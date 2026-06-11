# EduCore Pro - Hệ thống Quản lý Học tập & Tài chính Toàn diện

Đây là dự án Frontend (Vue 3 + Vite) kết nối 3 Microservices (N1, N2, N3) cho một Trung tâm đào tạo.

## 🌟 Chức năng chính
- **Admin Dashboard**: Tích hợp dữ liệu từ cả 3 cụm Microservices N1 (Khóa học), N2 (Ghi danh, Học viên), N3 (Tài chính). Cung cấp cái nhìn tổng quan về sức khỏe tài chính và hoạt động của trung tâm.
- **Microservice N1 (Course Management)**: Quản lý khóa học, lớp học, thời khóa biểu, phòng học.
- **Microservice N2 (Student & Attendance)**: Đăng ký ghi danh, quản lý học viên, điểm danh, bảng điểm.
- **Microservice N3 (Finance)**: Thu học phí, quản lý công nợ, xuất hóa đơn, báo cáo doanh thu.
- **Role-based Access Control (RBAC)**: Phân quyền rõ ràng cho 3 đối tượng (Admin, Giáo viên, Học viên).

## 🛠 Công nghệ sử dụng
- **Core**: Vue 3 (Composition API), Vite
- **Thiết kế**: Giao diện Premium, sử dụng CSS Native thuần (không phụ thuộc framework), Glassmorphism, Responsive Grid.
- **Tích hợp**: Fetch API với cơ chế tự động ép Timeout & Fallback dữ liệu Mock thông minh khi Backend bị gián đoạn.

## 🚀 Hướng dẫn cài đặt & chạy
```bash
# Cài đặt thư viện
npm install

# Chạy môi trường phát triển
npm run dev
```

## 🌐 Danh sách API (Endpoints)
- **N1**: `http://180.93.36.113:8081/api`
- **N2**: `http://172.16.68.127:5210/api`
- **N3**: `http://180.93.36.113:5000/api`
