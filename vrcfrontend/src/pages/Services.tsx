import { useEffect, useState } from "react";
import {
  ArrowRight, CheckCircle, ArrowUpRight,
  FileCheck, Wrench, Cog, Shield, Clock,
  HelpCircle, LucideIcon
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { serviceService, Service } from "@/services/serviceService";

// Map icon strings from DB to Lucide components
const iconMap: Record<string, LucideIcon> = {
  FileCheck,
  Wrench,
  Cog,
  Shield,
  Clock,
  HelpCircle,
  // Add defaults or fallbacks
  default: FileCheck
};

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const result = await serviceService.getServices();
        if (result.success && result.data) {
          setServices(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch services", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const getIcon = (iconName: string | undefined) => {
    if (!iconName) return iconMap.default;
    return iconMap[iconName] || iconMap.default;
  };

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="bg-primary/90 py-16 text-white">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-white mb-6">Dịch vụ chuyên nghiệp</h1>
            <p className="text-xl md:text-2xl mb-8">
              Cung cấp đầy đủ các giải pháp dịch vụ kỹ thuật điện lạnh chất lượng cao từ tư vấn, lắp đặt đến bảo trì và sửa chữa.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/contact" className="btn-accent">
                Liên hệ tư vấn
              </Link>
              <Link to="/service-support" className="btn-white">
                Hỗ trợ kỹ thuật
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="mb-6">Dịch vụ toàn diện</h2>
              <p className="text-muted-foreground mb-6">
                Với hơn 20 năm kinh nghiệm trong lĩnh vực điện lạnh công nghiệp và dân dụng, VRC đã trở thành đối tác tin cậy của hàng nghìn khách hàng trên cả nước. Chúng tôi tự hào cung cấp các dịch vụ kỹ thuật chất lượng cao với đội ngũ chuyên viên được đào tạo bài bản.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-primary mr-3 mt-1" />
                  <span>Đội ngũ kỹ sư giàu kinh nghiệm, được chứng nhận chuyên môn</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-primary mr-3 mt-1" />
                  <span>Phục vụ 24/7 với thời gian phản hồi nhanh chóng</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-primary mr-3 mt-1" />
                  <span>Trang thiết bị hiện đại, công nghệ tiên tiến</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-primary mr-3 mt-1" />
                  <span>Cam kết chất lượng và bảo hành dài hạn</span>
                </li>
              </ul>
            </div>
            <div>
              <img
                src="/assets/images/service-overview.jpg"
                alt="Dịch vụ điện lạnh chuyên nghiệp"
                className="rounded-lg shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                  e.currentTarget.alt = "Placeholder image";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Services Section */}
      <section className="py-12 bg-muted">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="mb-4">Danh mục dịch vụ</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Chúng tôi cung cấp đầy đủ các dịch vụ điện lạnh công nghiệp và dân dụng, từ tư vấn thiết kế đến lắp đặt, bảo trì và sửa chữa.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              // Loading skeletons
              Array(6).fill(0).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))
            ) : services.length > 0 ? (
              services.map((service) => {
                const Icon = getIcon(service.icon);
                return (
                  <Card key={service.id} className="transition-all hover:shadow-md flex flex-col">
                    <CardHeader>
                      <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="text-primary" />
                      </div>
                      <CardTitle>{service.title}</CardTitle>
                      {/* Optional: if you had a subtitle, CardDescription goes here */}
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-muted-foreground line-clamp-3">
                        {service.description || "Xem chi tiết để biết thêm thông tin."}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Link
                        to={`/services/${service.slug}`}
                        className="text-primary hover:text-accent flex items-center"
                      >
                        Chi tiết
                        <ArrowUpRight size={16} className="ml-1" />
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">Hiện chưa có dịch vụ nào.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Client Types Section */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <h2 className="mb-8">Đối tượng phục vụ</h2>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="rounded-lg border border-muted p-6">
              <h3 className="text-xl font-semibold mb-4">Khách hàng công nghiệp</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle size={16} className="text-primary mr-3 mt-1" />
                  <span>Nhà máy sản xuất và xưởng công nghiệp</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={16} className="text-primary mr-3 mt-1" />
                  <span>Kho lạnh và hệ thống bảo quản</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={16} className="text-primary mr-3 mt-1" />
                  <span>Nhà máy chế biến thực phẩm</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={16} className="text-primary mr-3 mt-1" />
                  <span>Hệ thống điều hòa trung tâm công suất lớn</span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-muted p-6">
              <h3 className="text-xl font-semibold mb-4">Khách hàng thương mại</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle size={16} className="text-primary mr-3 mt-1" />
                  <span>Cao ốc văn phòng và trung tâm thương mại</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={16} className="text-primary mr-3 mt-1" />
                  <span>Khách sạn, nhà hàng và khu nghỉ dưỡng</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={16} className="text-primary mr-3 mt-1" />
                  <span>Bệnh viện và các cơ sở y tế</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={16} className="text-primary mr-3 mt-1" />
                  <span>Siêu thị và cửa hàng bán lẻ</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-accent/10">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="mb-6">Bắt đầu với dịch vụ của chúng tôi</h2>
            <p className="text-muted-foreground mb-8">
              Hãy liên hệ với chúng tôi ngay hôm nay để được tư vấn và báo giá các dịch vụ điện lạnh phù hợp với nhu cầu của bạn. Đội ngũ kỹ thuật của VRC luôn sẵn sàng hỗ trợ.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact" className="btn-primary">
                Liên hệ ngay
              </Link>
              <Link to="/service-support" className="btn-outline">
                Tìm hiểu thêm
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Services;