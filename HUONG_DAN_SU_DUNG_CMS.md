# TÀI LIỆU HƯỚNG DẪN SỬ DỤNG WEBSITE CMS SAIGONVALVE

Dự án: **Hệ thống Quản trị Nội dung (CMS) SaigonValve**  
Đối tượng sử dụng: **Quản trị viên, Biên tập viên, Nhân sự (End User)**  
Phiên bản tài liệu: **1.0.0**  
Ngày cập nhật: **05/06/2026**

---

## I. GIỚI THIỆU HỆ THỐNG

Hệ thống quản trị nội dung (CMS) SaigonValve là công cụ giúp quản lý toàn bộ dữ liệu và nội dung hiển thị trên website chính thức của công ty Sài Gòn Valve.

Hệ thống được thiết kế tối giản, hiện đại và bảo mật cao, hỗ trợ quản lý đa ngôn ngữ (Tiếng Việt và Tiếng Anh) cho các phân hệ bài viết, sản phẩm, danh mục và dự án. Người sử dụng không cần kiến thức lập trình vẫn có thể thao tác quản lý dữ liệu thông qua các bước hướng dẫn cụ thể dưới đây.

---

## II. HƯỚNG DẪN CÁC CHỨC NĂNG HỆ THỐNG CƠ BẢN

### 1. Đăng nhập hệ thống

#### Mục đích
Xác thực danh tính người dùng và cấp quyền truy cập vào bảng điều khiển quản trị CMS.

#### Cách truy cập
Mở trình duyệt web và truy cập đường dẫn: `http://<domain-cua-ban>/login` (Hoặc đường dẫn do bộ phận IT cung cấp).

#### Các bước thực hiện
1. Nhập **Tên đăng nhập hoặc Email** của tài khoản được cấp vào ô "Tên đăng nhập hoặc Email".
2. Nhập chính xác mật khẩu vào ô "Mật khẩu truy cập".
   * *Mẹo:* Bạn có thể bấm vào biểu tượng **Con mắt** ở cuối ô mật khẩu để hiển thị/ẩn mật khẩu giúp kiểm tra tính chính xác.
3. Bấm nút **Bắt đầu phiên làm việc**.

#### Kết quả
* Nếu thông tin chính xác: Hệ thống hiển thị thông báo "Đăng nhập thành công! Đang chuyển hướng..." và tự động đưa bạn vào màn hình Bảng điều khiển (Dashboard).
* Nếu thông tin sai: Hệ thống hiển thị thông báo lỗi "Sai tài khoản hoặc mật khẩu".

#### Lưu ý
* Tài khoản sẽ bị khóa nếu phát hiện hoạt động đăng nhập đáng ngờ hoặc thử sai mật khẩu quá số lần quy định (được kiểm soát bởi cấu hình bảo mật hệ thống).
* Nếu quên mật khẩu, hãy liên hệ với Quản trị viên hệ thống (SGV IT) để được hỗ trợ cấp lại.

[Hình 1.1 - Giao diện Đăng nhập hệ thống]

---

### 2. Đăng xuất hệ thống

#### Mục đích
Thoát khỏi phiên làm việc hiện tại, đảm bảo an toàn thông tin khi không còn sử dụng máy tính.

#### Cách truy cập
Nhấp vào vùng thông tin tài khoản cá nhân (chứa ảnh đại diện và tên người dùng) ở góc dưới cùng bên trái của Thanh Menu bên trái (Sidebar Footer).

#### Các bước thực hiện
1. Bấm vào nút thông tin cá nhân ở góc dưới bên trái.
2. Menu nhỏ (Dropdown Menu) xuất hiện, chọn mục **Đăng xuất** (dòng chữ màu đỏ có biểu tượng thoát).
3. Hệ thống hiển thị thông báo "Đăng xuất thành công" (hoặc ngôn ngữ tương ứng) và tự động quay về trang Đăng nhập.

#### Kết quả
Phiên làm việc kết thúc, trình duyệt chuyển hướng về màn hình Đăng nhập. Mọi quyền truy cập quản trị bị thu hồi cho đến lần đăng nhập tiếp theo.

#### Lưu ý
Luôn thực hiện Đăng xuất khi rời khỏi bàn làm việc hoặc sử dụng chung máy tính với người khác.

[Hình 1.2 - Menu tài khoản và nút Đăng xuất]

---

### 3. Bảng điều khiển (Dashboard)

#### Mục đích
Cung cấp cái nhìn tổng quan về số liệu thống kê của website như số lượng tin tức, dự án, sản phẩm, liên hệ mới và các biểu đồ tăng trưởng, phân bổ dữ liệu.

#### Cách truy cập
Sau khi đăng nhập thành công, hệ thống tự động đưa bạn đến trang này. Hoặc bạn bấm chọn mục **Bảng điều khiển** ở đầu Menu bên trái.

#### Các bước thực hiện
Tại màn hình Bảng điều khiển, bạn có thể thực hiện các thao tác sau:
1. **Xem các thẻ chỉ số nhanh:** 
   * *Bài viết tin tức:* Tổng số tin tức hiện có.
   * *Dự án hoàn thành:* Tổng số dự án đã thực hiện.
   * *Danh mục sản phẩm:* Tổng số sản phẩm trong catalog.
   * *Liên hệ mới:* Số lượng liên hệ khách hàng mới gửi đến.
   * *Thao tác nhanh:* Click vào bất kỳ thẻ nào để chuyển nhanh đến trang quản lý của phân hệ đó.
2. **Lọc dữ liệu theo loại nội dung:** Bấm chọn các tab ở phía trên góc phải bao gồm: **Tất cả**, **Tin tức**, **Dự án**, **Sản phẩm** để lọc biểu đồ hoạt động.
3. **Lọc dữ liệu theo thời gian:** Bấm chọn ô **Chọn khoảng ngày** (Date Range Picker), chọn Ngày bắt đầu và Ngày kết thúc trên lịch để cập nhật số liệu. Bấm nút có biểu tượng **X** bên cạnh để xóa bộ lọc ngày.
4. **Theo dõi các biểu đồ:**
   * *Biểu đồ tăng trưởng:* Dạng biểu đồ vùng thể hiện biến động dữ liệu theo tháng.
   * *Biểu đồ phân bổ dữ liệu:* Dạng biểu đồ tròn thể hiện tỷ lệ giữa các mục Tin tức, Dự án, Sản phẩm, Liên hệ.
   * *Biểu đồ phản hồi khách hàng:* Thống kê tỷ lệ liên hệ mới và liên hệ cần xử lý.

#### Kết quả
Thông tin thống kê được hiển thị trực quan và thay đổi động ngay khi áp dụng các bộ lọc nội dung hoặc bộ lọc thời gian.

#### Lưu ý
* Thời gian cập nhật dữ liệu gần nhất được hiển thị ở góc trên bên phải dạng: "CẬP NHẬT LÚC: HH:MM AM/PM".

[Hình 1.3 - Màn hình Bảng điều khiển tổng quan]

---

## III. CÁC CHỨC NĂNG QUẢN LÝ NỘI DUNG (CMS)

### 1. Quản lý Sản phẩm

#### Mục đích
Quản lý danh sách sản phẩm thiết bị van và phụ kiện của SaigonValve hiển thị trên Catalog website.

#### Cách truy cập
Nhấp chọn mục **Quản lý Sản phẩm** trên Menu bên trái.

#### Các bước thực hiện
##### A. Tìm kiếm và Lọc sản phẩm:
1. Nhập tên sản phẩm cần tìm vào ô "Tìm kiếm sản phẩm...". Hệ thống sẽ tự động lọc danh sách sau 0.5 giây.
2. Lọc theo danh mục: Bấm nút **Lọc danh mục**, chọn danh mục sản phẩm cụ thể.
3. Lọc theo trạng thái: Bấm nút **Lọc trạng thái**, chọn "Đang hoạt động" hoặc "Ngừng hoạt động".
4. Lọc theo ngày: Bấm chọn khoảng ngày tạo sản phẩm.

##### B. Thêm sản phẩm mới:
1. Bấm nút **+ Thêm sản phẩm** ở góc trên bên phải.
2. Điền các thông tin trong form:
   * **Tên sản phẩm:** Nhập tên sản phẩm ở cả 2 tab ngôn ngữ **VI** (Tiếng Việt) và **EN** (Tiếng Anh). Hệ thống tự động sinh ra đường dẫn rút gọn (Slug) theo tên Tiếng Việt.
   * **Giá bán (VNĐ):** Nhập giá bán của sản phẩm (nhập số, mặc định 0 nếu liên hệ).
   * **Số lượng tồn kho:** Nhập số lượng sản phẩm hiện có trong kho.
   * **Slug (URL) *:** Tự động điền, có thể chỉnh sửa thủ công cho chuẩn SEO.
   * **Mô tả sản phẩm:** Nhập mô tả chi tiết bằng Trình soạn thảo văn bản RichTextEditor (hỗ trợ định dạng in đậm, in nghiêng, chèn ảnh...). Làm tương ứng cho 2 ngôn ngữ VI và EN.
   * **Tóm tắt kỹ thuật:** Nhập các thông tin kỹ thuật chung hiển thị nhanh ở trang chi tiết sản phẩm.
   * **Đặc điểm nổi bật:** Nhấp thêm các dòng đặc điểm nổi bật của sản phẩm bằng Tiếng Việt và Tiếng Anh.
   * **Thông số kỹ thuật:** Nhập bảng thông số (Ví dụ: Cột thuộc tính: "Kích thước" - Cột giá trị: "DN50 - DN300").
   * **Trạng thái hiển thị:** Gạt công tắc bật màu xanh để sản phẩm hiển thị trên web (Hoạt động) hoặc tắt để ẩn đi (Ngừng hoạt động).
   * **Danh mục:** Chọn danh mục phân loại sản phẩm.
   * **Thông tin bổ sung:** Nhập Xuất xứ (VD: OKM Japan), Bảo hành (VD: 12 tháng), Tình trạng kho (VD: Sẵn hàng), Link Catalogue PDF tài liệu kỹ thuật.
   * **Hình ảnh sản phẩm:** Click để tải lên ảnh đại diện chính của sản phẩm và album ảnh phụ (Gallery).
   * **Sản phẩm nổi bật:** Tích chọn checkbox "Sản phẩm nổi bật" nếu muốn đưa sản phẩm ra vị trí đặc biệt ở trang chủ.
3. Bấm **Lưu sản phẩm** ở góc trên bên phải để hoàn tất.

##### C. Chỉnh sửa sản phẩm:
1. Tại danh sách sản phẩm, di chuyển đến sản phẩm cần sửa, bấm biểu tượng **Ba chấm (...)** ở cột cuối cùng.
2. Chọn **Chỉnh sửa**.
3. Tiến hành cập nhật thông tin trên Form và bấm **Lưu sản phẩm**.

##### D. Xóa sản phẩm:
1. Tại danh sách sản phẩm, bấm biểu tượng **Ba chấm (...)** ở dòng sản phẩm tương ứng.
2. Chọn **Xóa sản phẩm** (dòng chữ đỏ).
3. Hộp thoại xác nhận xuất hiện, kiểm tra lại tên sản phẩm và bấm **Xác nhận xóa**.

##### E. Xuất Excel danh sách:
1. Bấm nút **Xuất dữ liệu** ở đầu trang danh sách sản phẩm.
2. Hệ thống tải xuống file định dạng `.csv` chứa toàn bộ danh sách sản phẩm hiện tại bao gồm Mã sản phẩm, Tên, SKU, Giá, Tồn kho, Danh mục và Trạng thái.

#### Kết quả
Sản phẩm được tạo mới, cập nhật hoặc xóa thành công sẽ ngay lập tức được đồng bộ trên trang Catalog hiển thị ngoài website cho khách hàng.

#### Lưu ý
* Tên sản phẩm, mô tả và thông số kỹ thuật nên được nhập ở cả hai ngôn ngữ (VI và EN) để tránh việc hiển thị trống khi khách hàng chuyển đổi ngôn ngữ trên website.
* Ảnh tải lên nên có định dạng `.jpg`, `.png`, hoặc `.webp` và dung lượng dưới 10MB để tối ưu tốc độ tải trang.

[Hình 3.1 - Danh sách quản lý sản phẩm]  
[Hình 3.2 - Form nhập liệu thông tin chi tiết sản phẩm]

---

### 2. Quản lý Danh mục Sản phẩm

#### Mục đích
Quản lý cấu trúc phân loại đa cấp của sản phẩm để tổ chức danh mục khoa học trên website.

#### Cách truy cập
Nhấp vào nút **Danh mục** nằm trong trang **Quản lý Sản phẩm**.

#### Các bước thực hiện
##### A. Xem danh sách danh mục:
* Danh sách hiển thị theo dạng cây thư mục phân cấp thụt lề. Bấm vào mũi tên trước thư mục cha để mở rộng hoặc thu gọn các danh mục con.
* Hiển thị số lượng sản phẩm liên kết trong từng danh mục.

##### B. Thêm danh mục mới:
1. Bấm nút **Thêm danh mục** ở góc trên bên phải.
2. Điền thông tin vào form:
   * **Tên danh mục:** Nhập tên bằng Tiếng Việt và Tiếng Anh.
   * **Danh mục cha:** Chọn danh mục cấp trên từ Dropdown. Nếu để trống hệ thống mặc định đây là danh mục gốc.
   * **Thứ tự hiển thị:** Nhập số thứ tự (số nhỏ hơn sẽ ưu tiên hiển thị trước trên thanh menu website).
   * **Trạng thái hiển thị:** Gạt bật Switch để hiển thị danh mục trên menu website, hoặc tắt để ẩn đi.
3. Bấm **Lưu danh mục mới**.

##### C. Chỉnh sửa danh mục:
1. Bấm nút biểu tượng **Edit (Bút chì màu xám)** bên phải dòng danh mục cần sửa.
2. Cập nhật thông tin và bấm **Cập nhật danh mục**.

##### D. Xóa danh mục:
1. Bấm nút biểu tượng **Xóa (Thùng rác màu đỏ)** bên phải dòng danh mục.
2. Hộp thoại xác nhận xuất hiện cảnh báo việc xóa danh mục. Nhấn **Xác nhận xóa** để đồng ý.

#### Kết quả
Cấu trúc menu danh mục sản phẩm ngoài website thay đổi tương ứng theo phân cấp vừa thiết lập.

#### Lưu ý
* Khi xóa danh mục cha, các sản phẩm nằm trong danh mục đó sẽ trở về trạng thái "Chưa phân loại" nhưng không bị xóa khỏi hệ thống.

[Hình 4.1 - Cây danh mục sản phẩm đa cấp]

---

### 3. Quản lý Tin tức (Blog)

#### Mục đích
Đăng tải và quản lý các bài viết tin tức, thông báo kỹ thuật, hoạt động công ty hiển thị trên website.

#### Cách truy cập
Nhấp chọn mục **Quản lý Tin tức** trên Menu bên trái.

#### Các bước thực hiện
##### A. Thêm bài viết mới:
1. Bấm nút **+ Thêm bài viết** ở góc trên bên phải.
2. Trên màn hình soạn thảo, điền các thông tin:
   * **Tiêu đề bài viết:** Nhập tiêu đề ở tab VI và EN. Slug sẽ tự động sinh ra.
   * **Slug (URL) *:** URL rút gọn của bài viết.
   * **Mô tả ngắn:** Tóm tắt ngắn gọn nội dung bài viết hiển thị ở trang danh sách tin.
   * **Nội dung bài viết:** Soạn thảo chi tiết nội dung, định dạng văn bản và chèn ảnh minh họa.
   * **Trạng thái xuất bản:** Chọn Bật công tắc để chuyển trạng thái "Đã xuất bản" (hiển thị công khai) hoặc tắt để lưu ở dạng "Bản nháp" (chỉ xem nội bộ quản trị).
   * **Danh mục:** Chọn phân loại tin tức phù hợp.
   * **Ngày xuất bản:** Bấm chọn ngày hiển thị của bài viết.
   * **Hình ảnh bài viết:** Chọn ảnh đại diện chính hiển thị dạng thumbnail.
3. **Sử dụng tính năng xem trước (Preview):** Trước khi lưu, bạn có thể bấm vào Tab **Xem trước** ở đầu trang. Hệ thống sẽ hiển thị giả lập giao diện bài viết thực tế ngoài website để bạn kiểm tra lỗi bố cục, chính tả. Bấm quay lại Tab **Soạn thảo** để tiếp tục sửa.
4. Bấm **Xuất bản bài viết** để lưu lại.

##### B. Sửa và xóa bài viết:
* Thực hiện tương tự như phân hệ sản phẩm thông qua nút Tùy chọn **Ba chấm (...)** của từng bài viết trong danh sách.

#### Kết quả
Bài viết ở trạng thái "Đã xuất bản" sẽ xuất hiện trên trang tin tức của website SaigonValve theo đúng thời gian thiết lập.

#### Lưu ý
* Luôn sử dụng chức năng "Xem trước" để rà soát hình ảnh và bố cục bài viết trước khi xuất bản.
* Tác giả bài viết sẽ được hệ thống tự động nhận diện dựa trên tài khoản đang đăng nhập.

[Hình 5.1 - Danh sách tin tức và bộ lọc trạng thái]  
[Hình 5.2 - Giao diện soạn thảo kết hợp chế độ Xem trước bài viết]

---

### 4. Quản lý Danh mục Tin tức

#### Mục đích
Phân chia tin tức thành các chuyên mục khác nhau (Ví dụ: Tin tức sự kiện, Tin kỹ thuật, Thông báo chung).

#### Cách truy cập
Nhấp nút **Danh mục** nằm trong trang **Quản lý Tin tức**.

#### Các bước thực hiện
* Thao tác Thêm, Sửa, Xóa và Sắp xếp thứ tự tương tự như phần **Quản lý Danh mục Sản phẩm**.

[Hình 6.1 - Quản lý danh mục tin tức]

---

### 5. Quản lý Dự án

#### Mục đích
Giới thiệu các dự án, công trình tiêu biểu sử dụng sản phẩm van của SaigonValve nhằm tăng uy tín thương hiệu.

#### Cách truy cập
Nhấp chọn mục **Quản lý Dự án** trên Menu bên trái.

#### Các bước thực hiện
##### A. Thêm dự án mới:
1. Bấm nút **+ Thêm dự án** ở góc trên bên phải.
2. Nhập các thông tin bắt buộc:
   * **Tên dự án:** Nhập tên dự án bằng Tiếng Việt và Tiếng Anh.
   * **Slug (URL) *:** Tự sinh từ tên tiếng Việt.
   * **Mô tả dự án:** Chi tiết thông tin gói thầu, hạng mục cung cấp van, giải pháp kỹ thuật.
   * **Tên khách hàng / Chủ đầu tư:** Nhập tên đối tác trực tiếp thực hiện dự án.
   * **Thời gian thực hiện dự án:** Chọn ngày bắt đầu và ngày kết thúc triển khai thực tế.
   * **Trạng thái hoàn thành:** Bật Switch để đánh dấu dự án đã "Hoàn thành" (Completed) hoặc tắt để hiển thị ở trạng thái "Đang thực hiện" (Ongoing).
   * **Danh mục:** Chọn phân loại dự án (Ví dụ: Cấp thoát nước, Năng lượng, Tòa nhà...).
   * **Hình ảnh dự án:** Tải ảnh đại diện dự án và album ảnh thực tế tại công trình (Gallery).
3. Bấm nút **Lưu dự án**.

##### B. Sửa và Xóa dự án:
* Thao tác thông qua nút **Ba chấm (...)** ở cuối dòng dự án tương tự các phân hệ khác.

#### Kết quả
Dự án được bổ sung vào trang "Dự án tiêu biểu" hiển thị trên website giúp nâng cao năng lực hồ sơ công ty.

[Hình 7.1 - Danh sách dự án đã thực hiện]  
[Hình 7.2 - Form nhập liệu thông tin dự án công trình]

---

### 6. Quản lý Danh mục Dự án

#### Mục đích
Tạo các nhóm dự án theo phân ngành kỹ thuật (Ví dụ: Dự án Nhiệt điện, Dự án Xử lý nước thải, Dự án Lọc hóa dầu).

#### Cách truy cập
Nhấp nút **Danh mục** nằm trong trang **Quản lý Dự án**.

#### Các bước thực hiện
* Thực hiện tương tự như quản lý danh mục sản phẩm.

[Hình 8.1 - Danh sách danh mục dự án công trình]

---

### 7. Quản lý Tuyển dụng (Tin tuyển dụng)

#### Mục đích
Đăng tin tuyển dụng nhân sự cho các phòng ban trực thuộc SaigonValve trên website.

#### Cách truy cập
Nhấp chọn mục **Quản lý Tuyển dụng** trên Menu bên trái.

#### Các bước thực hiện
##### A. Thêm tin tuyển dụng mới:
1. Bấm nút **Tạo tin tuyển dụng mới** (hoặc biểu tượng tương tự ở góc phải).
2. Điền các trường thông tin:
   * **Tiêu đề *:** Tên vị trí cần tuyển (VD: Kỹ sư Tự động hóa).
   * **Đường dẫn (Slug) *:** Đường dẫn URL của tin tuyển dụng.
   * **Mô tả công việc *:** Chi tiết các đầu việc cần đảm nhận.
   * **Yêu cầu ứng viên:** Trình độ, bằng cấp, kinh nghiệm yêu cầu.
   * **Quyền lợi:** Mức lương, chế độ đãi ngộ, bảo hiểm.
   * **Trạng thái tuyển dụng:** Bật Switch để hiển thị tin tuyển dụng "Đang mở" (Open) hoặc tắt để đóng tin tuyển dụng (Closed).
   * **Phòng ban:** Nhập tên phòng ban làm việc (VD: Phòng Kỹ thuật).
   * **Địa điểm:** Nơi làm việc thực tế (VD: TP. Hồ Chí Minh).
   * **Loại hình:** Chọn Toàn thời gian, Bán thời gian, Hợp đồng, Thực tập.
   * **Mức lương:** Nhập thông tin lương hiển thị (VD: 15-25 triệu VND).
   * **Kinh nghiệm:** Số năm kinh nghiệm yêu cầu (VD: 2-3 năm).
   * **Hạn nộp hồ sơ:** Chọn ngày hết hạn nhận hồ sơ ứng tuyển.
3. Bấm **Lưu tin tuyển dụng**.

##### B. Sửa và Xóa tin tuyển dụng:
* Thực hiện thông qua nút Tùy chọn trên danh sách tuyển dụng.

#### Kết quả
Vị trí tuyển dụng hiển thị trên trang Tuyển dụng của website, cho phép ứng viên nộp hồ sơ ứng tuyển trực tuyến.

[Hình 9.1 - Danh sách tin tuyển dụng nhân sự]  
[Hình 9.2 - Chi tiết form tạo tin tuyển dụng]

---

### 8. Danh sách Ứng viên (Hồ sơ ứng tuyển)

#### Mục đích
Theo dõi, đánh giá và phê duyệt các hồ sơ CV do ứng viên nộp trực tuyến từ website SaigonValve.

#### Cách truy cập
Nhấp chọn mục **Danh sách Ứng viên** trên Menu bên trái.

#### Các bước thực hiện
##### A. Tìm kiếm ứng viên:
* Nhập tên ứng viên, email hoặc số điện thoại vào ô tìm kiếm ở thanh công cụ.

##### B. Xem chi tiết hồ sơ và tải CV:
1. Tại dòng hồ sơ của ứng viên, bấm biểu tượng **Con mắt** (Xem chi tiết) hoặc biểu tượng **Tải file (Mũi tên xuống)** để mở file CV PDF của ứng viên trong tab mới.
2. Khi bấm biểu tượng Con mắt, một thanh trượt thông tin (Sheet) sẽ mở ra bên phải, hiển thị đầy đủ thông tin: Họ tên, vị trí ứng tuyển, email, số điện thoại, ngày nộp, thư giới thiệu và liên kết tải CV.

##### C. Cập nhật trạng thái duyệt hồ sơ:
* **Cách 1 (Trong bảng danh sách):** Click nút **Ba chấm (...)** ở cuối dòng ứng viên -> Dưới mục "Cập nhật trạng thái", chọn trạng thái tương ứng: **Chờ duyệt**, **Đã xem**, **Phỏng vấn**, **Từ chối**, **Trúng tuyển**.
* **Cách 2 (Trong màn hình chi tiết):** Ở cuối Sheet chi tiết bên phải, bạn có thể click nhanh nút **Đánh dấu đã xem** hoặc chuyển đổi trạng thái bằng các nút thao tác nhanh.

##### D. Xóa hồ sơ ứng viên:
1. Click nút **Ba chấm (...)** ở cuối dòng ứng viên.
2. Chọn **Xóa hồ sơ** (dòng chữ đỏ).
3. Xác nhận trên hộp thoại để xóa vĩnh viễn hồ sơ khỏi hệ thống.

#### Kết quả
Trạng thái của ứng viên thay đổi tương ứng trên hệ thống giúp bộ phận Nhân sự dễ dàng sàng lọc ứng viên.

#### Lưu ý
* Hãy kiểm tra định kỳ phân hệ này để không bỏ lỡ các CV mới của ứng viên gửi về.

[Hình 10.1 - Danh sách hồ sơ ứng viên gửi CV]  
[Hình 10.2 - Sheet chi tiết thông tin ứng viên và trạng thái phê duyệt]

---

### 9. Quản lý Bình luận

#### Mục đích
Kiểm duyệt, phê duyệt và phản hồi các bình luận, đánh giá của người dùng/khách hàng gửi từ trang chi tiết sản phẩm trên website.

#### Cách truy cập
Nhấp chọn mục **Quản lý Bình luận** trên Menu bên trái.

#### Các bước thực hiện
##### A. Tìm kiếm và lọc bình luận:
* Nhập từ khóa cần tìm vào ô tìm kiếm (Tìm theo Tên khách, Email, Nội dung).
* Lọc danh sách bình luận theo trạng thái: **Tất cả**, **Chờ duyệt**, **Đã duyệt**.

##### B. Phê duyệt hoặc Ẩn bình luận:
1. Tìm bình luận cần duyệt, bấm nút **Ba chấm (...)** ở cuối dòng.
2. Chọn **Duyệt bình luận** để cho phép bình luận hiển thị công khai trên website.
3. Nếu muốn gỡ bỏ bình luận đã duyệt, click **Ba chấm (...)** -> Chọn **Ẩn bình luận**.

##### C. Phản hồi bình luận từ hệ thống:
1. Bấm nút **Phản hồi** (có biểu tượng mũi tên quay lại) trực tiếp trên dòng bình luận.
2. Hộp thoại "Phản hồi tương tác" xuất hiện:
   * Xem nội dung câu hỏi của khách hàng.
   * Nhập nội dung trả lời chính thức của SaigonValve vào ô "Nội dung trả lời hệ thống".
3. Bấm nút **GỬI PHẢN HỒI & PHÊ DUYỆT**.

##### D. Xóa bình luận:
* Click nút **Ba chấm (...)** -> Chọn **Xóa vĩnh viễn**. Xác nhận xóa trên hộp thoại cảnh báo.

#### Kết quả
* Bình luận được duyệt và nội dung phản hồi của hệ thống sẽ hiển thị ngay bên dưới sản phẩm tương ứng ngoài website.
* Bình luận bị ẩn hoặc xóa sẽ biến mất hoàn toàn trên giao diện người dùng.

#### Lưu ý
* Khi bạn bấm "GỬI PHẢN HỒI & PHÊ DUYỆT" cho một bình luận đang ở trạng thái "Chờ duyệt", hệ thống sẽ tự động duyệt bình luận đó lên website cùng với câu trả lời của bạn.

[Hình 11.1 - Danh sách kiểm duyệt bình luận sản phẩm]  
[Hình 11.2 - Hộp thoại soạn thảo câu trả lời phản hồi khách hàng]

---

### 10. Thư viện Media

#### Mục đích
Quản lý tập trung toàn bộ hình ảnh và tài liệu kỹ thuật được tải lên hệ thống để tái sử dụng trong các bài viết, sản phẩm và dự án.

#### Cách truy cập
Nhấp chọn mục **Thư viện Media** trên Menu bên trái.

#### Các bước thực hiện
##### A. Xem ảnh phóng to (Lightbox):
* Click vào biểu tượng **Phóng to (Kính lúp/Bốn mũi tên)** ở giữa tấm ảnh để xem ảnh kích thước đầy đủ. Sử dụng mũi tên trái/phải để duyệt qua các ảnh khác.

##### B. Tải hình ảnh mới lên:
1. Bấm nút **Tải ảnh mới** ở góc trên bên phải.
2. Chọn file ảnh bằng cách kéo thả file vào vùng chỉ định hoặc click trực tiếp vào vùng nét đứt để chọn file từ máy tính.
3. Hệ thống hiển thị ảnh xem trước (Preview) cùng tên và dung lượng file.
4. Bấm **Xác nhận tải lên**.

##### C. Sao chép liên kết ảnh (URL):
* Di chuột qua ảnh cần lấy link, bấm biểu tượng **Copy (Hai trang giấy)** ở góc trên bên phải ảnh.
* Hệ thống hiển thị thông báo "Đã sao chép đường dẫn ảnh". Bạn có thể dán (Paste) đường dẫn này vào bài viết hoặc gửi cho người khác.

##### D. Xóa ảnh khỏi thư viện:
1. Di chuột qua ảnh, bấm biểu tượng **Xóa (Thùng rác màu đỏ)**.
2. Hộp thoại xác nhận xuất hiện, kiểm tra kỹ và bấm **Xác nhận xóa**.

#### Kết quả
Hình ảnh được tải lên thành công sẽ lưu trữ vĩnh viễn trên máy chủ và sẵn sàng để chèn vào các phân hệ quản lý nội dung khác.

#### Lưu ý
* **Hết sức cẩn thận khi xóa ảnh:** Nếu ảnh đang được sử dụng làm ảnh đại diện sản phẩm hoặc hình ảnh trong bài viết tin tức, việc xóa ảnh trong thư viện Media sẽ khiến hình ảnh trên website bị lỗi hiển thị (ảnh bị vỡ).

[Hình 12.1 - Lưới hình ảnh thư viện Media]  
[Hình 12.2 - Dialog drag & drop tải hình ảnh lên server]

---

### 11. Quản lý Liên hệ (Yêu cầu hỗ trợ)

#### Mục đích
Tiếp nhận và xử lý các thông tin liên hệ, yêu cầu báo giá van, hoặc hỗ trợ kỹ thuật do khách hàng gửi từ form liên hệ trên website.

#### Cách truy cập
Nhấp chọn mục **Quản lý Liên hệ** trên Menu bên trái.

#### Các bước thực hiện
##### A. Xem chi tiết nội dung liên hệ:
1. Nhấn nút biểu tượng **Con mắt** (Xem chi tiết) ở cuối dòng liên hệ.
2. Một thanh trượt thông tin (Sheet) sẽ mở ra bên phải hiển thị đầy đủ: Họ tên khách hàng, email, số điện thoại, địa chỉ, chủ đề và **nội dung chi tiết yêu cầu liên hệ**.

##### B. Cập nhật trạng thái xử lý liên hệ:
* **Cách 1 (Trong bảng danh sách):** Click nút **Ba chấm (...)** cuối dòng liên hệ -> Chọn trạng thái xử lý tương ứng: **Đã đọc** (read), **Đã trả lời** (replied), **Đã lưu trữ** (archived), **Spam** (spam).
* **Cách 2 (Trong màn hình chi tiết):** Ở cuối Sheet chi tiết bên phải, nhấp chọn nhanh nút **Đánh dấu đã trả lời** hoặc **Đánh dấu Spam** tùy theo tiến độ xử lý thực tế của bạn với khách hàng.

##### C. Xuất danh sách liên hệ ra Excel/CSV:
1. Bấm nút **Xuất dữ liệu** (nút màu xanh có biểu tượng FileSpreadsheet) ở thanh công cụ.
2. Hệ thống tự động xuất và tải xuống file `.csv` chứa danh sách liên hệ theo đúng bộ lọc thời gian hoặc từ khóa tìm kiếm hiện tại.

##### D. Xóa liên hệ:
* Click nút **Ba chấm (...)** -> Chọn **Xóa liên hệ** -> Xác nhận trên hộp thoại.

#### Kết quả
Các yêu cầu của khách hàng được phân loại trạng thái rõ ràng, giúp đội ngũ kinh doanh SaigonValve không bỏ sót thông tin liên hệ.

[Hình 13.1 - Danh sách liên hệ gửi từ website]  
[Hình 13.2 - Giao diện trượt hiển thị chi tiết nội dung thư liên hệ]

---

## IV. HƯỚNG DẪN CÁC CHỨC NĂNG HỆ THỐNG & BẢO MẬT

### 1. Cài đặt hệ thống

#### Mục đích
Cập nhật thông tin hồ sơ cá nhân của người quản trị và cấu hình các thông tin hiển thị cố định của website SaigonValve.

#### Cách truy cập
Bấm chọn mục **Cài đặt hệ thống** ở cuối Menu bên trái. Hoặc bấm vào tên người dùng ở Sidebar Footer -> Chọn **Hồ sơ**.

#### Các bước thực hiện
##### Tab 1: Hồ sơ cá nhân
1. **Thay đổi ảnh đại diện:** Click vào khung ảnh đại diện để tải lên ảnh mới từ máy tính.
2. **Cập nhật thông tin:** Nhập Họ và tên mới, Số điện thoại cá nhân.
   * *Lưu ý:* Email liên hệ được cố định theo tài khoản và không thể chỉnh sửa tại đây.
3. Bấm **Lưu thay đổi** để cập nhật.

##### Tab 2: Thông tin website (Dành cho Quản trị viên cao cấp)
Tại đây bạn cấu hình các thông tin hiển thị trên website chính:
1. **Thông tin doanh nghiệp & SEO:** Nhập Tên thương hiệu, Tên viết tắt, Tên đầy đủ công ty, Mã số thuế, Năm thành lập và Slogan doanh nghiệp.
2. **Thông tin liên hệ chính:** Nhập Số điện thoại hotline hiển thị (VD: `0903.123.456`), Hotline gọi trực tiếp (chỉ ghi số liền nhau: `0903123456` để tích hợp nút gọi nhanh trên điện thoại), Email liên hệ chính, Email hỗ trợ kỹ thuật, Địa chỉ văn phòng/Nhà xưởng.
3. **Mạng xã hội & Liên kết:** Nhập liên kết Website, Facebook, Zalo, YouTube, LinkedIn của công ty.
4. **Thời gian làm việc & Copyright:** Nhập giờ làm việc ngày thường, Thứ bảy, Chủ nhật và dòng bản quyền dưới chân trang.
5. Bấm nút **Cập nhật cấu hình website** để lưu lại toàn bộ thông tin.

#### Kết quả
Thông tin hồ sơ cá nhân được cập nhật. Các thông tin liên hệ, hotline, địa chỉ, bản quyền trên giao diện website chính thức cũng thay đổi tương ứng.

[Hình 14.1 - Trang cập nhật thông tin cá nhân và cấu hình website]

---

### 2. Quản lý Tài khoản (User Management)

#### Mục đích
Quản lý danh sách nhân sự có quyền truy cập vào hệ thống CMS SaigonValve, phân quyền vai trò và kiểm soát bảo mật tài khoản.

#### Cách truy cập
Nhấp chọn mục **Quản lý Tài khoản** trên Menu bên trái.

#### Các bước thực hiện
##### A. Tạo tài khoản quản trị mới:
1. Bấm nút **Tạo tài khoản mới** ở góc trên bên phải.
2. Nhập đầy đủ thông tin: Tên đăng nhập (Username), Email, Họ tên, Mật khẩu, Số điện thoại và tích chọn gán Vai trò (Role) cho tài khoản này.
3. Bấm nút Lưu để hoàn tất tạo mới.

##### B. Khóa hoặc Mở khóa tài khoản:
1. Tìm tài khoản cần xử lý, bấm nút **Ba chấm (...)** ở cuối dòng.
2. Chọn **Khóa tài khoản** nếu muốn tạm dừng quyền đăng nhập của nhân sự đó. Xác nhận trên hộp thoại xuất hiện. Tài khoản bị khóa sẽ có badge đỏ "Đã khóa" bên cạnh tên.
3. Để cho phép đăng nhập lại, bấm **Ba chấm (...)** -> Chọn **Mở khóa tài khoản** -> Xác nhận mở khóa.

##### C. Xóa tài khoản:
* Bấm **Ba chấm (...)** -> Chọn **Xóa tài khoản** -> Xác nhận xóa.

#### Kết quả
Tài khoản được phân quyền chính xác. Tài khoản bị khóa sẽ không thể đăng nhập vào hệ thống quản trị dù nhập đúng mật khẩu.

#### Lưu ý
* **Quy tắc bảo mật:** Hệ thống chặn tính năng tự khóa hoặc tự xóa tài khoản của chính mình (tài khoản đang đăng nhập hiện tại). Nút chức năng này sẽ tự động bị vô hiệu hóa (mờ đi).

[Hình 15.1 - Danh sách quản lý tài khoản và trạng thái khóa/mở khóa]

---

### 3. Phân quyền & Vai trò (Roles & Permissions)

#### Mục đích
Định nghĩa các chức danh/vai trò công việc khác nhau trong hệ thống CMS và thiết lập giới hạn quyền hạn tương ứng cho từng vai trò.

#### Cách truy cập
Nhấp chọn mục **Phân quyền & Vai trò** trên Menu bên trái.

#### Các bước thực hiện
##### A. Tạo vai trò mới:
1. Bấm nút **Tạo vai trò mới** ở góc trên bên phải.
2. Nhập tên vai trò (VD: Biên tập viên Tin tức) và mô tả vai trò.
3. Tích chọn các quyền cụ thể được phép thực hiện (Ví dụ: Chỉ tích chọn quyền liên quan đến `Tin tức` và `Bình luận`, không tích chọn quyền liên quan đến `Sản phẩm` và `Tài khoản`).
4. Bấm lưu để hoàn tất.

##### B. Chỉnh sửa và cấu hình quyền hạn:
1. Bấm nút biểu tượng **Edit (Bút chì)** bên phải dòng vai trò tương ứng.
2. Thay đổi mô tả hoặc tích/bỏ tích các quyền hạn thao tác.
3. Bấm **Cập nhật vai trò** để áp dụng thay đổi.

##### C. Xóa vai trò:
* Bấm biểu tượng **Xóa (Thùng rác đỏ)** -> Xác nhận xóa.

#### Kết quả
Các quyền hạn được áp dụng ngay lập tức cho toàn bộ các tài khoản đang được gán vai trò này.

#### Lưu ý
* Các vai trò hệ thống mặc định (có badge **Hệ thống** màu vàng như Administrator) sẽ bị khóa chức năng xóa nhằm đảm bảo an toàn vận hành.

[Hình 16.1 - Giao diện phân bổ quyền hạn cho từng vai trò]

---

### 4. Nhật ký Hệ thống (Audit Logs)

#### Mục đích
Giám sát và ghi nhận toàn bộ hoạt động của người dùng trên hệ thống CMS (ai đã đăng nhập, sửa sản phẩm nào, xóa bài viết nào, thay đổi lúc nào từ IP nào) để phục vụ công tác bảo mật và kiểm tra lỗi.

#### Cách truy cập
Nhấp chọn mục **Nhật ký hệ thống** trên Menu bên trái.

#### Các bước thực hiện
##### A. Tìm kiếm và lọc nhật ký:
* Nhập tên người dùng hoặc mô tả hành động vào ô tìm kiếm.
* Lọc theo Phân hệ (Module): **Tất cả**, **Authentication** (Xác thực/Đăng nhập), **Người dùng**, **Vai trò**, **Modules**.
* Lọc theo Loại hành động (Action): **Tất cả**, **Tạo mới** (CREATE), **Cập nhật** (UPDATE), **Xóa** (DELETE), **Đăng nhập** (LOGIN).

##### B. Xem chi tiết dữ liệu thay đổi:
1. Tại dòng nhật ký cần kiểm tra, bấm nút biểu tượng **Con mắt** ở cột cuối cùng.
2. Hộp thoại "Chi tiết Nhật ký" xuất hiện hiển thị:
   * Thời gian chính xác, Họ tên, Tên đăng nhập và địa chỉ IP thực hiện.
   * Hành động và phân hệ bị tác động.
   * Mô tả hành động cụ thể.
   * **Dữ liệu thay đổi (JSON):** Hiển thị rõ các giá trị dữ liệu cũ trước khi sửa và giá trị dữ liệu mới sau khi sửa.
   * Thông tin thiết bị (User Agent) sử dụng để thao tác.

#### Kết quả
Thông tin lịch sử thao tác hệ thống được hiển thị chi tiết, minh bạch và không thể bị sửa đổi bởi người dùng thường.

#### Lưu ý
Nhật ký hệ thống được ghi nhận tự động bởi máy chủ và là dữ liệu chỉ đọc (Read-Only), không ai có quyền sửa đổi hoặc xóa các bản ghi nhật ký này để đảm bảo tính khách quan tối đa.

[Hình 17.1 - Danh sách nhật ký hoạt động của quản trị viên]  
[Hình 17.2 - Chi tiết bản ghi nhật ký và lịch sử thay đổi dữ liệu JSON]

---

## V. CÁC LƯU Ý KHI SỬ DỤNG HỆ THỐNG

Để hệ thống hoạt động ổn định và website SaigonValve luôn hiển thị tối ưu nhất, người dùng cần lưu ý các quy tắc vận hành sau:

1. **Nhập liệu đa ngôn ngữ đầy đủ:** Website hỗ trợ song song tiếng Việt và tiếng Anh. Khi thêm mới/sửa Sản phẩm, Danh mục, Tin tức, Dự án, hãy nhớ chuyển qua lại giữa các tab ngôn ngữ **VI** và **EN** để hoàn thiện thông tin. Tránh để trống thông tin ở một trong hai ngôn ngữ.
2. **Kích thước và Dung lượng hình ảnh:**
   * Ảnh đại diện sản phẩm, tin tức nên sử dụng ảnh có tỷ lệ vuông (1:1) hoặc tỷ lệ (4:3) để giao diện hiển thị đồng đều.
   * Dung lượng ảnh tải lên tối đa là **10MB**. Tuy nhiên, để website tải nhanh, bạn nên nén ảnh xuống dưới **500KB** trước khi tải lên.
3. **Liên kết ảnh trong thư viện Media:** Khi đã chèn ảnh từ thư viện Media vào bài viết tin tức hoặc sản phẩm, tuyệt đối không được xóa hình ảnh đó trong phân hệ "Thư viện Media". Hành động xóa ảnh này sẽ làm vỡ liên kết ngoài trang chủ.
4. **Tự động lưu Slug (URL):** Khi nhập Tên sản phẩm hoặc Tiêu đề tin tức bằng tiếng Việt, hệ thống sẽ tự động tạo ra đường dẫn Slug không dấu ngăn cách bằng dấu gạch ngang. Hãy kiểm tra lại đường dẫn này xem đã ngắn gọn và tối ưu SEO chưa trước khi lưu.
5. **Đăng xuất bảo mật:** Luôn nhấn đăng xuất hệ thống khi không còn ngồi trước máy tính làm việc để ngăn chặn người khác tự ý thay đổi dữ liệu.

---

## VI. CÂU HỎI THƯỜNG GẶP (FAQ)

**Q1: Tại sao tôi không thấy nút "Tạo tài khoản mới" hay "Xóa sản phẩm"?**
* **Trả lời:** Hệ thống hoạt động dựa trên phân quyền vai trò (RBAC). Nếu tài khoản của bạn được gán vai trò có quyền hạn hạn chế (ví dụ: Cộng tác viên viết bài), bạn sẽ không thể thực hiện các thao tác quản trị nâng cao hoặc quản lý tài khoản. Hãy liên hệ với Administrator (Quản trị hệ thống) để kiểm tra vai trò của mình.

**Q2: Tại sao sản phẩm tôi vừa thêm mới không hiển thị ngoài website?**
* **Trả lời:** Vui lòng kiểm tra lại trạng thái của sản phẩm đó.
  1. Sản phẩm phải được bật nút trạng thái "Hoạt động" (Active). Nếu trạng thái là "Ngừng hoạt động" (Inactive), sản phẩm sẽ bị ẩn.
  2. Hãy chắc chắn sản phẩm đã được chọn đúng "Danh mục sản phẩm" tương ứng.

**Q3: Tôi lỡ tay xóa một bài viết tin tức, tôi có thể khôi phục lại được không?**
* **Trả lời:** Không. Thao tác xóa dữ liệu (Sản phẩm, Tin tức, Dự án, Tài khoản) trên hệ thống CMS SaigonValve là xóa vĩnh viễn khỏi cơ sở dữ liệu. Bạn nên chuyển trạng thái bài viết về "Bản nháp" (Draft) thay vì xóa nếu chưa chắc chắn.

**Q4: Hệ thống báo lỗi khi tôi cố gắng tải ảnh lên thư viện Media?**
* **Trả lời:** Lỗi này thường xảy ra do 2 nguyên nhân:
  1. File tải lên không đúng định dạng hình ảnh cho phép (Chỉ chấp nhận: JPEG, PNG, WebP, GIF).
  2. Dung lượng file ảnh vượt quá giới hạn **10MB** của hệ thống. Hãy nén nhỏ ảnh lại và thử lại.

**Q5: Tại sao dòng bản quyền (Copyright) hoặc số Hotline ở chân trang website chính chưa thay đổi sau khi tôi sửa trong Cài đặt?**
* **Trả lời:** Vui lòng kiểm tra xem bạn đã bấm nút **Cập nhật cấu hình website** ở cuối trang Cài đặt chưa. Ngoài ra, sau khi cập nhật, bạn cần tải lại trang website chính (nhấn Ctrl + F5) để trình duyệt xóa bộ nhớ đệm (cache) và hiển thị thông tin mới nhất.
