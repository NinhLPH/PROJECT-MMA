# PHÂN TÍCH NGHIỆP VỤ & THIẾT KẾ HỆ THỐNG: FLEXFIT APP

> **Đề tài:** Ứng dụng đặt lịch tập với Huấn luyện viên cá nhân (PT) – FlexFit
> **Mục tiêu điểm số:** 4 - 5 Điểm (Đảm bảo app chạy luồng chính không lỗi, kết nối API thực tế, cơ sở dữ liệu tập trung và có trang Web Admin CRUD cơ bản)

---

## PHẦN 1: CÁC MÀN HÌNH & LUỒNG GIAO DIỆN (FRONTEND - REACT NATIVE)

Hệ thống FlexFit được thiết kế tối giản nhưng đầy đủ luồng nghiệp vụ với **5 màn hình chính**, đáp ứng tối ưu trải nghiệm trên thiết bị di động.

### 1. Màn hình Đăng nhập / Đăng ký (Auth Screen)
* **Chức năng:** Xác thực danh tính học viên, bảo vệ tài khoản và cá nhân hóa lịch tập.
* **Các thành phần giao diện:**
  * Form nhập Email / Số điện thoại và Mật khẩu.
  * Nút **Đăng nhập** (Login) và **Đăng ký** (Register).
  * Thông báo lỗi trực quan khi nhập sai định dạng hoặc sai thông tin tài khoản.

### 2. Màn hình Trang chủ & Danh sách PT (Home Screen)
* **Chức năng:** Nơi hiển thị các PT đang hoạt động để người dùng tìm kiếm và lựa chọn.
* **Các thành phần giao diện:**
  * Thanh tìm kiếm PT theo tên.
  * Bộ lọc nhanh theo chuyên môn (Giảm cân, Tăng cơ, Yoga, Pilates, Boxing...).
  * Danh sách cuộn (FlatList) hiển thị các thẻ (card) thông tin tóm tắt của PT: Ảnh đại diện, Họ tên, Chuyên môn chính và Đánh giá (số sao).

### 3. Màn hình Chi tiết PT & Chọn lịch (PT Detail & Booking Screen)
* **Chức năng:** Cung cấp thông tin chi tiết về năng lực của PT và cho phép học viên lựa chọn thời gian tập.
* **Các thành phần giao diện:**
  * Ảnh chân dung lớn, phần giới thiệu chi tiết (bio), kinh nghiệm làm việc và mức giá/giờ.
  * **Trình chọn ngày (Date Picker):** Hiển thị các ngày trong tuần.
  * **Khung chọn ca tập (Time Slots):** Các ô hiển thị giờ tập còn trống (ví dụ: `08:00 - 09:30`, `15:00 - 16:30`). Khung giờ nào đã có người đặt sẽ bị mờ đi (disabled).
  * Nút **Tiến hành đặt lịch** nổi bật ở phía dưới cùng màn hình.

### 4. Màn hình Xác nhận & Thanh toán Mô phỏng (Payment Screen)
* **Chức năng:** Tóm tắt thông tin giao dịch và thực hiện thanh toán giả lập để ghi nhận đơn đặt lịch thành công.
* **Các thành phần giao diện:**
  * Thông tin tóm tắt: Tên PT, Ngày tập, Khung giờ đã chọn, Tổng chi phí.
  * Lựa chọn phương thức thanh toán mô phỏng (ví dụ: "Ví MoMo", "Cổng VNPAY" hoặc "Thẻ ngân hàng").
  * Nút **Xác nhận đặt lịch & Thanh toán**. Khi nhấn nút, hệ thống sẽ gửi request đặt chỗ lên Server và hiển thị Popup thông báo thành công trước khi chuyển màn hình.

### 5. Màn hình Lịch sử Đặt lịch (Booking History Screen)
* **Chức năng:** Giúp người dùng quản lý và theo dõi các buổi tập đã đặt của bản thân.
* **Các thành phần giao diện:**
  * Tab phân chia trạng thái: *Sắp diễn ra* và *Lịch sử tập*.
  * Mỗi thẻ lịch hẹn bao gồm: Tên PT, Thời gian tập, Trạng thái (Chờ xác nhận, Đã xác nhận, Đã hoàn thành, Đã hủy).
  * Nút **Hủy lịch** (chỉ hiển thị đối với những lịch tập ở trạng thái "Sắp diễn ra" hoặc "Chờ xác nhận").

---

## PHẦN 2: THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA)

Để đảm bảo khả năng mở rộng tốt và đáp ứng yêu cầu **không sử dụng SQLite**, hệ thống sẽ sử dụng **MongoDB** làm cơ sở dữ liệu tập trung trên Cloud.

### 1. Bảng Người Dùng (`Users`)
Lưu trữ thông tin tài khoản của khách hàng (Học viên).

| Tên trường (Field) | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `_id` | ObjectId / String | Khóa chính |
| `email` | String | Email dùng để đăng nhập (Unique) |
| `password` | String | Mật khẩu (đã được mã hóa bcrypt) |
| `fullName` | String | Họ và tên học viên |
| `phoneNumber` | String | Số điện thoại liên hệ |
| `role` | String | Phân quyền tài khoản (Mặc định: `'customer'`) |

### 2. Bảng Huấn Luyện Viên (`Trainers`)
Lưu trữ thông tin chuyên môn của các PT.

| Tên trường (Field) | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `_id` | ObjectId / String | Khóa chính |
| `fullName` | String | Họ và tên PT |
| `avatar` | String | Link ảnh đại diện của PT |
| `specialty` | String | Chuyên môn chính (Tăng cơ, Giảm mỡ...) |
| `bio` | String | Tiểu sử/Kinh nghiệm làm việc ngắn |
| `pricePerHour`| Number | Giá tiền cho mỗi giờ tập (VNĐ) |

### 3. Bảng Lịch Trình Ca Tập (`Schedules`)
Quản lý các ca tập trống của từng PT để hiển thị lên App.

| Tên trường (Field) | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `_id` | ObjectId / String | Khóa chính |
| `trainerId` | ObjectId / String | Khóa ngoại liên kết tới bảng `Trainers` |
| `date` | String / Date | Ngày áp dụng ca tập (định dạng `YYYY-MM-DD`) |
| `timeSlot` | String | Khung giờ cụ thể (Ví dụ: `'08:00 - 09:30'`) |
| `isBooked` | Boolean | Trạng thái ca tập đã bị đặt chưa (`true`/`false`) |

### 4. Bảng Đơn Đặt Lịch (`Bookings`)
Ghi nhận thông tin chi tiết giao dịch đặt lịch giữa Học viên và PT.

| Tên trường (Field) | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `_id` | ObjectId / String | Khóa chính |
| `userId` | ObjectId / String | Khóa ngoại liên kết tới bảng `Users` |
| `trainerId` | ObjectId / String | Khóa ngoại liên kết tới bảng `Trainers` |
| `date` | String / Date | Ngày tập đã đặt |
| `timeSlot` | String | Khung giờ tập đã đặt |
| `totalPrice` | Number | Tổng số tiền thanh toán |
| `status` | String | Trạng thái buổi tập (`'pending'`, `'confirmed'`, `'completed'`, `'cancelled'`) |
| `paymentStatus`| String | Trạng thái thanh toán (`'unpaid'`, `'paid'`) |

---

## PHẦN 3: KIẾN TRÚC BACKEND & HỆ THỐNG API (RESTFUL API)

Hệ thống Backend được xây dựng bằng **Node.js (Express)** kết nối trực tiếp với Database Cloud. Các kết quả phản hồi giữa Client và Server luôn ở định dạng chuẩn **JSON**.

### 1. Danh sách các API chính cần thiết kế

#### Nhóm API Xác thực (Auth)
* `POST /api/auth/register` : Đăng ký tài khoản học viên mới.
* `POST /api/auth/login` : Kiểm tra thông tin đăng nhập, trả về Token JWT và thông tin User.

#### Nhóm API Huấn Luyện Viên & Lịch Biểu
* `GET /api/trainers` : Lấy danh sách toàn bộ PT để hiển thị ở Trang chủ.
* `GET /api/trainers/:id/schedules` : Truy vấn danh sách các khung giờ tập trống (`isBooked = false`) của một PT cụ thể theo ngày.

#### Nhóm API Đặt Lịch (Booking)
* `POST /api/bookings` : Tạo mới một đơn đặt lịch.
  * *Xử lý Logic nghiệp vụ:* Khi tạo đơn thành công, Server tự động cập nhật trường `isBooked` của Ca tập đó trong bảng `Schedules` thành `true` để tránh trường hợp trùng lịch.
* `GET /api/bookings/user/:userId` : Lấy danh sách lịch tập của một học viên cụ thể dựa trên ID người dùng (hiển thị ở màn hình Lịch sử).
* `PUT /api/bookings/:id/cancel` : Thực hiện hủy lịch tập và cập nhật lại trạng thái ca tập (`isBooked = false`).

---

### 2. Thiết kế Web Admin CRUD Đơn Giản (Yêu cầu bổ sung cho mốc 5 điểm)
Hệ thống Web Admin chạy độc lập trên nền tảng Web (HTML/CSS/JS hoặc ReactJS) kết nối trực tiếp đến các API quản trị của Server để thực hiện:
* **Quản lý danh sách PT (Trainers):** Xem danh sách, Thêm mới PT, Sửa thông tin chuyên môn/giá cả và Xóa PT khi ngừng hợp tác.
* **Quản lý đơn đặt lịch (Bookings):** Admin có quyền kiểm duyệt danh sách đăng ký đặt lịch từ phía học viên, bấm nút **Xác nhận (Confirm)** khi PT nhận lớp hoặc bấm **Hủy lịch (Cancel)** nếu xảy ra sự cố đột xuất.