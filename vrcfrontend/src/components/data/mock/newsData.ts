
import { NewsItem } from "../models/news";

export const mockNewsItems: NewsItem[] = [
    {
        id: 1,
        title: "Triển lãm Quốc tế về Hệ thống Lạnh và Điều hòa Không khí 2025",
        summary: "Sự kiện triển lãm quốc tế lớn nhất trong năm 2025 về các giải pháp và sản phẩm mới trong lĩnh vực hệ thống làm lạnh và điều hòa không khí...",
        content: `
      <p>Chào mừng quý vị đến với Triển lãm Quốc tế về Hệ thống Lạnh và Điều hòa Không khí - sự kiện triển lãm quốc tế lớn nhất trong năm 2025 về các giải pháp và sản phẩm mới trong lĩnh vực hệ thống làm lạnh và điều hòa không khí.</p>
      
      <h3>Về sự kiện</h3>
      <p>Triển lãm Quốc tế về Hệ thống Lạnh và Điều hòa Không khí là sự kiện thường niên, quy tụ các nhà sản xuất, nhà cung cấp, và chuyên gia hàng đầu trong ngành điện lạnh và điều hòa không khí từ khắp nơi trên thế giới. Đây là cơ hội tuyệt vời để các doanh nghiệp trong nước và quốc tế trưng bày sản phẩm, công nghệ mới nhất và mở rộng mạng lưới đối tác.</p>
      
      <h3>Những điểm nổi bật</h3>
      <ul>
        <li>Trưng bày hơn 200 gian hàng đến từ 15+ quốc gia và vùng lãnh thổ</li>
        <li>Giới thiệu các công nghệ tiết kiệm năng lượng và thân thiện với môi trường mới nhất</li>
        <li>Các buổi hội thảo chuyên sâu với sự tham gia của các chuyên gia hàng đầu</li>
        <li>Hoạt động kết nối giao thương B2B giữa các doanh nghiệp</li>
        <li>Khu vực trình diễn công nghệ với các mô hình hoạt động thực tế</li>
      </ul>
      
      <h3>Đối tượng tham dự</h3>
      <p>Sự kiện hướng đến các nhóm đối tượng:</p>
      <ul>
        <li>Doanh nghiệp sản xuất, kinh doanh thiết bị điện lạnh</li>
        <li>Chuyên gia, kỹ thuật viên trong ngành</li>
        <li>Nhà thầu, đơn vị tư vấn thiết kế</li>
        <li>Đại diện các khu công nghiệp, nhà máy sản xuất</li>
        <li>Doanh nghiệp xuất nhập khẩu thiết bị điện lạnh</li>
      </ul>
      
      <h3>Thông tin chi tiết</h3>
      <p>Thời gian: 15-18 tháng 5 năm 2025, từ 09:00 - 17:00 hàng ngày</p>
      <p>Địa điểm: Trung tâm Hội chợ và Triển lãm Sài Gòn (SECC), 799 Nguyễn Văn Linh, Quận 7, TP.HCM</p>
      <p>Đơn vị tổ chức: Hiệp hội Điện lạnh Việt Nam phối hợp cùng Công ty Triển lãm Quốc tế ABC</p>
      
      <h3>Đăng ký tham dự</h3>
      <p>Để đăng ký tham dự hoặc đặt gian hàng, vui lòng liên hệ:</p>
      <p>Email: info@refrigerationexpo2025.vn</p>
      <p>Hotline: 1900 1234 567</p>
      
      <p>Rất mong được đón tiếp quý vị tại sự kiện!</p>
    `,
        image: "/lovable-uploads/0bd3c048-8e37-4775-a6bc-0b54ec07edbe.png",
        publishDate: "2025-04-01",
        author: "Ban Tổ Chức",
        category: "Triển lãm",
        tags: ["Triển lãm", "Điều hòa", "Công nghệ làm lạnh"],
        location: "Trung tâm Hội chợ và Triển lãm Sài Gòn (SECC), Quận 7, TP.HCM",
        organizer: "Hiệp hội Điện lạnh Việt Nam",
        comments: 5,
        views: 1250,
        type: "event",
        eventDate: "2025-05-15"
    },
    {
        id: 2,
        title: "Hội thảo Công nghệ Tiết kiệm Năng lượng trong Hệ thống Lạnh",
        summary: "Hội thảo chuyên sâu về các công nghệ tiết kiệm năng lượng mới nhất áp dụng trong hệ thống lạnh công nghiệp và thương mại...",
        content: `
      <p>Trân trọng kính mời quý đơn vị, doanh nghiệp và các chuyên gia trong ngành tham dự Hội thảo Công nghệ Tiết kiệm Năng lượng trong Hệ thống Lạnh - sự kiện chuyên sâu về các giải pháp tiết kiệm năng lượng mới nhất cho hệ thống lạnh công nghiệp và thương mại.</p>
      
      <h3>Giới thiệu</h3>
      <p>Trong bối cảnh biến đổi khí hậu và yêu cầu ngày càng cao về phát triển bền vững, việc áp dụng các công nghệ tiết kiệm năng lượng trong hệ thống lạnh đang trở thành xu hướng tất yếu. Hội thảo lần này sẽ tập trung vào các giải pháp tiên tiến nhất, giúp doanh nghiệp tối ưu hóa chi phí vận hành đồng thời giảm thiểu tác động môi trường.</p>
      
      <h3>Nội dung chính</h3>
      <ul>
        <li>Tổng quan về xu hướng công nghệ tiết kiệm năng lượng trong ngành lạnh</li>
        <li>Các giải pháp tích hợp IoT và AI trong quản lý hệ thống lạnh</li>
        <li>Nghiên cứu điển hình về các dự án tiết kiệm năng lượng thành công</li>
        <li>Công nghệ Inverter thế hệ mới và hiệu quả năng lượng</li>
        <li>Môi chất lạnh thân thiện môi trường và hiệu quả năng lượng cao</li>
        <li>Chính sách hỗ trợ và các chương trình khuyến khích tiết kiệm năng lượng</li>
      </ul>
      
      <h3>Diễn giả</h3>
      <p>Hội thảo có sự tham gia của các chuyên gia hàng đầu đến từ:</p>
      <ul>
        <li>TS. Nguyễn Văn A - Viện Nghiên cứu Năng lượng</li>
        <li>KS. Trần Văn B - Hiệp hội Điện lạnh Việt Nam</li>
        <li>TS. Phạm Văn C - Đại học Bách Khoa Hà Nội</li>
        <li>Ông David Smith - Chuyên gia quốc tế về hệ thống lạnh hiệu quả năng lượng</li>
      </ul>
      
      <h3>Thông tin chi tiết</h3>
      <p>Thời gian: 20/04/2025 (08:30 - 16:30)</p>
      <p>Địa điểm: Khách sạn Melia, 44 Lý Thường Kiệt, Hà Nội</p>
      <p>Ngôn ngữ: Tiếng Việt và Tiếng Anh (có phiên dịch)</p>
      <p>Phí tham dự: 1.500.000 VNĐ/người (bao gồm tài liệu, ăn trưa và giải khát)</p>
      
      <h3>Đăng ký tham dự</h3>
      <p>Để đăng ký tham dự, vui lòng điền form đăng ký online tại website hoặc liên hệ:</p>
      <p>Email: workshop@vrc.com.vn</p>
      <p>Hotline: 098 765 4321</p>
    `,
        image: "/assets/images/projects-overview.jpg",
        publishDate: "2025-03-25",
        author: "VRC",
        category: "Hội thảo",
        tags: ["Tiết kiệm năng lượng", "Công nghệ mới", "Hệ thống lạnh"],
        location: "Khách sạn Melia, 44 Lý Thường Kiệt, Hà Nội",
        organizer: "VRC",
        comments: 8,
        views: 734,
        type: "event",
        eventDate: "2025-04-20"
    },
    {
        id: 3,
        title: "Khóa đào tạo Kỹ thuật viên Bảo trì Hệ thống Lạnh Công nghiệp",
        summary: "Khóa đào tạo chuyên sâu dành cho kỹ thuật viên về quy trình bảo trì, sửa chữa và nâng cấp các hệ thống lạnh công nghiệp quy mô lớn...",
        content: "<p>Nội dung chi tiết đang được cập nhật...</p>",
        image: "/assets/images/service-overview.jpg",
        publishDate: "2025-03-20",
        author: "VRC Academy",
        category: "Đào tạo",
        tags: ["Đào tạo kỹ thuật", "Bảo trì", "Hệ thống lạnh công nghiệp"],
        location: "Trung tâm Đào tạo VRC, Biên Hòa, Đồng Nai",
        comments: 3,
        views: 421,
        type: "news"
    },
    {
        id: 4,
        title: "Lễ ra mắt dòng sản phẩm Điều hòa Inverter thế hệ mới",
        summary: "Sự kiện ra mắt dòng sản phẩm điều hòa không khí công nghệ Inverter thế hệ mới với khả năng tiết kiệm năng lượng vượt trội...",
        content: "<p>Nội dung chi tiết đang được cập nhật...</p>",
        image: "/assets/images/projects-overview.jpg",
        publishDate: "2025-03-10",
        author: "VRC",
        category: "Ra mắt sản phẩm",
        tags: ["Inverter", "Điều hòa", "Tiết kiệm năng lượng"],
        location: "Trung tâm Hội nghị Quốc gia, Hà Nội",
        comments: 12,
        views: 980,
        type: "event",
        eventDate: "2025-03-25"
    },
    {
        id: 5,
        title: "VRC ký kết hợp tác với tập đoàn điện lạnh hàng đầu châu Âu",
        summary: "VRC vừa ký kết thỏa thuận hợp tác chiến lược với tập đoàn điện lạnh hàng đầu châu Âu, mở rộng cơ hội phát triển thị trường và chuyển giao công nghệ...",
        content: "<p>Nội dung chi tiết đang được cập nhật...</p>",
        image: "/assets/images/service-overview.jpg",
        publishDate: "2025-03-15",
        author: "Phòng Truyền thông",
        category: "Tin công ty",
        tags: ["Hợp tác quốc tế", "Phát triển", "Công nghệ mới"],
        comments: 6,
        views: 890,
        type: "news"
    },
    {
        id: 6,
        title: "Thực trạng và giải pháp tiết kiệm năng lượng trong ngành điện lạnh tại Việt Nam",
        summary: "Báo cáo phân tích về thực trạng sử dụng năng lượng trong ngành điện lạnh tại Việt Nam và đề xuất các giải pháp tiết kiệm hiệu quả...",
        content: "<p>Nội dung chi tiết đang được cập nhật...</p>",
        image: "/lovable-uploads/0bd3c048-8e37-4775-a6bc-0b54ec07edbe.png",
        publishDate: "2025-03-05",
        author: "TS. Nguyễn Văn An",
        category: "Nghiên cứu",
        tags: ["Nghiên cứu", "Tiết kiệm năng lượng", "Thị trường Việt Nam"],
        comments: 9,
        views: 1120,
        type: "news"
    },
    {
        id: 7,
        title: "VRC nhận giải thưởng Doanh nghiệp Xanh 2025",
        summary: "VRC vinh dự nhận giải thưởng Doanh nghiệp Xanh 2025 cho những đóng góp tích cực trong việc phát triển sản phẩm và giải pháp thân thiện với môi trường...",
        content: "<p>Nội dung chi tiết đang được cập nhật...</p>",
        image: "/assets/images/service-overview.jpg",
        publishDate: "2025-02-28",
        author: "Phòng Truyền thông",
        category: "Giải thưởng",
        tags: ["Giải thưởng", "Phát triển bền vững", "Doanh nghiệp xanh"],
        comments: 15,
        views: 1500,
        type: "news"
    },
    {
        id: 8,
        title: "Diễn đàn Doanh nghiệp Điện lạnh Việt - EU",
        summary: "Diễn đàn kết nối doanh nghiệp trong lĩnh vực điện lạnh giữa Việt Nam và các nước Liên minh Châu Âu, tạo cơ hội hợp tác và phát triển thị trường...",
        content: "<p>Nội dung chi tiết đang được cập nhật...</p>",
        image: "/assets/images/service-overview.jpg",
        publishDate: "2025-04-01",
        author: "Bộ Công Thương",
        category: "Diễn đàn",
        tags: ["Hợp tác quốc tế", "EU", "Thương mại"],
        location: "Pullman Saigon Centre, TP.HCM",
        organizer: "Bộ Công Thương và Phái đoàn EU tại Việt Nam",
        comments: 7,
        views: 870,
        type: "event",
        eventDate: "2025-04-28"
    }
];

export const categories = [
    { name: "Tin công ty", count: 12 },
    { name: "Triển lãm", count: 8 },
    { name: "Hội thảo", count: 15 },
    { name: "Nghiên cứu", count: 6 },
    { name: "Công nghệ mới", count: 24 },
    { name: "Giải thưởng", count: 5 }
];
