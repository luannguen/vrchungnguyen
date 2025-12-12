
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Project, Category } from "@/components/data/types";
import { projectService } from "@/services/projectService";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProjectCategory = () => {
    const { slug } = useParams();
    const [category, setCategory] = useState<Category | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                // 1. Get Category
                const catResult = await projectService.getCategoryBySlug(slug);
                if (!catResult.success || !catResult.data) {
                    setError(true);
                    return;
                }
                setCategory(catResult.data);

                // 2. Get Projects for this category
                const projResult = await projectService.getProjects({ categoryId: catResult.data.id });
                if (projResult.success && projResult.data) {
                    setProjects(projResult.data);
                }
            } catch (err) {
                console.error("Failed to fetch data", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 min-h-[60vh]">
                <Loader2 className="animate-spin text-primary h-12 w-12" />
            </div>
        );
    }

    if (error || !category) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh] gap-4">
                <h1 className="text-2xl font-bold">Danh mục không tồn tại</h1>
                <Button asChild>
                    <Link to="/projects">Quay lại Dự án</Link>
                </Button>
            </div>
        );
    }

    return (
        <main className="flex-grow pt-20">
            {/* Header */}
            <section className="bg-primary/90 py-16 text-white">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <Link to="/projects" className="text-white/80 hover:text-white mb-4 inline-block">
                            &larr; Tất cả dự án
                        </Link>
                        <h1 className="text-white mb-4">{category.name}</h1>
                        <p className="text-xl opacity-90">
                            {category.description || `Danh sách các dự án thuộc lĩnh vực ${category.name}`}
                        </p>
                    </div>
                </div>
            </section>

            {/* Projects Grid */}
            <section className="py-12 bg-white">
                <div className="container-custom">
                    {projects.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {projects.map((project) => (
                                <div key={project.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-all group">
                                    <Link to={`/project-details/${project.id || project.slug}`} className="block h-full">
                                        <div className="h-60 bg-muted overflow-hidden">
                                            <img
                                                src={project.image_url || "/placeholder.svg"}
                                                alt={project.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                onError={(e) => {
                                                    e.currentTarget.src = "/placeholder.svg";
                                                }}
                                            />
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                                                {project.name}
                                            </h3>
                                            {project.completion_date && (
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {new Date(project.completion_date).toLocaleDateString('vi-VN')}
                                                </p>
                                            )}
                                            <p className="text-muted-foreground line-clamp-2 mb-4">
                                                {project.description}
                                            </p>
                                            <div className="flex items-center text-primary font-medium">
                                                Xem chi tiết <ArrowRight size={16} className="ml-1" />
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <p className="text-lg text-muted-foreground">Chưa có dự án nào trong danh mục này.</p>
                            <Button className="mt-4" asChild>
                                <Link to="/contact">Liên hệ tư vấn</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default ProjectCategory;
