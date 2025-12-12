import { ArrowRight, CheckCircle, ArrowUpRight, Building, Building2, Factory, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Project, Category } from "@/components/data/types";
import { projectService } from "@/services/projectService";
import { productService } from "@/services/productService";
import AchievementsSection from "@/components/AchievementsSection";

const Projects = () => {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch featured projects
        const projectsResult = await projectService.getProjects({ featured: true, limit: 3 });
        if (projectsResult.success && projectsResult.data) {
          setFeaturedProjects(projectsResult.data);
        }

        // Fetch categories 
        const categoriesResult = await projectService.getProjectCategories();
        if (categoriesResult.success && categoriesResult.data) {
          setCategories(categoriesResult.data);
        }
      } catch (error) {
        console.error("Failed to fetch project data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper to map category name to icon
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes("công nghiệp") || name.includes("nhà máy")) return <Factory className="text-primary" />;
    if (name.includes("thương mại") || name.includes("tòa nhà")) return <Building className="text-primary" />;
    return <Building2 className="text-primary" />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[60vh]">
        <Loader2 className="animate-spin text-primary h-12 w-12" />
      </div>
    );
  }

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="bg-primary/90 py-16 text-white">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-white mb-6">Dự án tiêu biểu</h1>
            <p className="text-xl md:text-2xl mb-8">
              Những công trình thực tế đã được VRC thiết kế, cung cấp thiết bị và thi công lắp đặt trên khắp cả nước.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/contact" className="btn-accent">
                Đặt lịch tư vấn
              </Link>
              <Link to="/services" className="btn-white">
                Xem dịch vụ
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
              <h2 className="mb-6">Năng lực và kinh nghiệm</h2>
              <p className="text-muted-foreground mb-6">
                Với hơn 20 năm kinh nghiệm, VRC đã thực hiện hàng trăm dự án lớn nhỏ trong lĩnh vực điện lạnh công nghiệp và dân dụng. Chúng tôi tự hào là đối tác tin cậy của nhiều tập đoàn lớn và các đơn vị hàng đầu trong các ngành công nghiệp.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-primary mr-3 mt-1" />
                  <span>Hơn 500 dự án lớn nhỏ đã hoàn thành</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-primary mr-3 mt-1" />
                  <span>Đối tác của các tập đoàn và doanh nghiệp hàng đầu</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-primary mr-3 mt-1" />
                  <span>Đội ngũ kỹ sư và chuyên viên giàu kinh nghiệm</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-primary mr-3 mt-1" />
                  <span>Cam kết chất lượng và tiến độ thi công</span>
                </li>
              </ul>
            </div>
            <div>
              <img
                src="/assets/images/projects-overview.jpg"
                alt="Dự án điện lạnh công nghiệp"
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

      {/* Project Categories */}
      <section className="py-12 bg-muted">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="mb-4">Danh mục dự án</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              VRC tự hào thực hiện các dự án đa dạng với quy mô khác nhau, từ hệ thống điều hòa không khí trung tâm cho tòa nhà thương mại đến các hệ thống làm lạnh công nghiệp phức tạp.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    {getCategoryIcon(category.name)}
                  </div>
                  <CardTitle>{category.name}</CardTitle>
                  <CardDescription>
                    {category.description || `Các dự án thuộc lĩnh vực ${category.name}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-2">
                    {category.description || "Khám phá các dự án tiêu biểu và giải pháp kỹ thuật chuyên sâu của chúng tôi trong lĩnh vực này."}
                  </p>
                </CardContent>
                <CardFooter>
                  <Link to={`/projects/category/${category.slug || category.id}`} className="text-primary hover:text-accent flex items-center">
                    Xem dự án
                    <ArrowUpRight size={16} className="ml-1" />
                  </Link>
                </CardFooter>
              </Card>
            ))}

            {/* Fallback if no categories found */}
            {categories.length === 0 && !isLoading && (
              <div className="col-span-full text-center text-muted-foreground p-8">
                Chưa có danh mục dự án nào.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <h2 className="mb-8">Dự án nổi bật</h2>

          {featuredProjects.length > 0 ? (
            <div className="space-y-8">
              {featuredProjects.map((project) => (
                <div key={project.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="grid md:grid-cols-2">
                    <div className="h-60 md:h-auto bg-muted">
                      <img
                        src={project.image_url || "/placeholder.svg"}
                        alt={project.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                      {project.completion_date && (
                        <p className="text-sm text-muted-foreground mb-4">
                          Hoàn thành: {new Date(project.completion_date).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}
                        </p>
                      )}

                      <p className="mb-4 line-clamp-3 text-muted-foreground">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.category && (
                          <span className="bg-primary/10 px-2 py-1 rounded-md text-primary text-sm">
                            {typeof project.category === 'object' ? (project.category as any).name : 'Dự án'}
                          </span>
                        )}
                      </div>

                      <Link to={`/project-details/${project.id}`} className="text-primary hover:text-accent flex items-center">
                        Chi tiết dự án
                        <ArrowRight size={16} className="ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-muted-foreground">Chưa có dự án nổi bật nào.</p>
            </div>
          )}

          <div className="mt-10 text-center">
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white transition-colors">
              <Link to="/contact">Liên hệ để được tư vấn thêm</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section - Dynamic */}
      <AchievementsSection />

      {/* CTA Section */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="mb-6">Bạn có dự án cần tư vấn?</h2>
            <p className="text-muted-foreground mb-8">
              Hãy liên hệ với đội ngũ kỹ sư của chúng tôi để được tư vấn giải pháp tối ưu cho dự án của bạn.
              VRC cam kết mang đến các giải pháp điện lạnh hiện đại, hiệu quả và tiết kiệm chi phí.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact" className="btn-primary">
                Liên hệ tư vấn
              </Link>
              <Link to="/services" className="btn-outline">
                Xem dịch vụ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Projects;