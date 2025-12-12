
import { useState, useEffect } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import { bannerService, Banner } from '@/services/bannerService';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const result = await bannerService.getBanners('home_main');
        if (result.success && result.data.length > 0) {
          setBanners(result.data);
        } else {
          // Fallback to default if no banners found
          setBanners([
            {
              id: '1',
              title: "Hệ thống điện lạnh công nghiệp",
              description: "Giải pháp hiện đại cho mọi quy mô doanh nghiệp",
              image_url: "https://images.unsplash.com/photo-1459767129954-1b1c1f9b9ace?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
              link: "/products/industrial",
              position: 'home_main',
              order_index: 1,
              is_active: true
            },
            {
              id: '2',
              title: "Công nghệ tiết kiệm năng lượng",
              description: "Giải pháp xanh cho tương lai bền vững",
              image_url: "https://images.unsplash.com/photo-1497604401993-f2e922e5cb0a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
              link: "/technology",
              position: 'home_main',
              order_index: 2,
              is_active: true
            },
            {
              id: '3',
              title: "Dịch vụ bảo trì chuyên nghiệp",
              description: "Đội ngũ kỹ thuật hàng đầu, phục vụ 24/7",
              image_url: "https://images.unsplash.com/photo-1551038247-3d9af20df552?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
              link: "/services",
              position: 'home_main',
              order_index: 3,
              is_active: true
            }
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch banners", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  if (loading) {
    return (
      <section className="relative h-[500px] md:h-[600px] flex items-center justify-center bg-gray-100">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </section>
    );
  }

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden">
      {banners.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image_url})` }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          <div className="container-custom h-full flex items-center relative z-20">
            <div className="max-w-2xl text-white">
              <h1 className="text-white text-4xl md:text-5xl font-bold mb-4">{slide.title}</h1>
              <p className="text-xl md:text-2xl mb-8">{slide.description}</p>
              {slide.link && (
                <a
                  href={slide.link}
                  className="inline-flex items-center btn-secondary font-medium"
                >
                  Tìm hiểu thêm
                  <ChevronRight size={20} className="ml-2" />
                </a>
              )}
            </div>
          </div>
        </div>
      ))}

      {banners.length > 1 && (
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center">
          <div className="flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-white/40'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;
