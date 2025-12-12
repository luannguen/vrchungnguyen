import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, BarChart3, Gauge, ArrowRight, LucideIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useResources } from '@/hooks/useResources';
import { Button } from '@/components/ui/button';

const iconMap: Record<string, LucideIcon> = {
  LineChart,
  BarChart3,
  Gauge,
  // Add other potential icons here
};

export const DataResources = () => {
  const { resources, loading } = useResources();
  const [showAll, setShowAll] = useState(false);

  // Default to showing only 2 items unless showAll is true
  const displayedResources = showAll ? resources : resources.slice(0, 2);

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="mb-12">
          <h2 className="mb-4">Công cụ & Tài nguyên</h2>
          <p className="text-muted-foreground max-w-2xl">
            Truy cập các công cụ tính toán, dữ liệu phân tích và tài nguyên hỗ trợ cho việc lựa chọn và vận hành hệ thống điều hòa không khí hiệu quả.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-10">Đang tải dữ liệu...</div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-8">
              {displayedResources.map((resource) => {
                const IconComponent = iconMap[resource.icon] || LineChart;
                return (
                  <div key={resource.id} className="bg-muted p-8 rounded-lg">
                    <div className="flex items-start mb-6">
                      <div className="bg-primary rounded-full p-3 mr-4">
                        <IconComponent className="text-white w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
                        <p className="text-muted-foreground">
                          {resource.description}
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {resource.features?.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {resource.link && (
                      <Link to={resource.link} className="inline-flex items-center text-accent hover:text-primary transition-colors font-medium">
                        Xem chi tiết
                        <ArrowRight size={18} className="ml-2" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>

            {resources.length > 2 && (
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(!showAll)}
                  className="gap-2"
                >
                  {showAll ? (
                    <>
                      Thu gọn
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Xem tất cả ({resources.length})
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};


