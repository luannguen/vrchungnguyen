
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import BackToTop from "@/components/BackToTop";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Share2, Calendar, Building, User, CheckCircle, Loader2 } from "lucide-react";
import { projectService } from "@/services/projectService";
import { Project } from "@/components/data/types";
import { toast } from "@/components/ui/use-toast";

const ProjectDetail = () => {
    const { id } = useParams();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchProject = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const result = await projectService.getProject(id);
                if (result.success && result.data) {
                    setProject(result.data);
                } else {
                    setError(true);
                    toast({
                        title: "Lỗi",
                        description: "Không thể tải thông tin dự án",
                        variant: "destructive",
                    });
                }
            } catch (err) {
                console.error("Failed to fetch project details", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <Loader2 className="animate-spin h-10 w-10 text-primary" />
                </main>
                <Footer />
                <BackToTop />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow flex items-center justify-center flex-col gap-4">
                    <div className="text-red-500 text-xl font-bold">Không tìm thấy dự án!</div>
                    <Button asChild>
                        <Link to="/projects">
                            <ChevronLeft size={16} className="mr-2" />
                            Quay lại danh sách dự án
                        </Link>
                    </Button>
                </main>
                <Footer />
                <BackToTop />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-grow pt-24 pb-16">
                {/* Breadcrumb / Navigation */}
                <div className="container-custom mb-8">
                    <Link to="/projects" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
                        <ChevronLeft size={16} className="mr-1" />
                        Quay lại danh sách dự án
                    </Link>
                </div>

                <div className="container-custom">
                    {/* Header Section */}
                    <div className="max-w-4xl mx-auto mb-10 text-center">
                        {project.category && (
                            <Badge className="mb-4 text-sm px-3 py-1 font-normal bg-primary/10 text-primary hover:bg-primary/20">
                                {project.category.name}
                            </Badge>
                        )}
                        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            {project.name}
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            {project.description}
                        </p>
                    </div>

                    {/* Featured Image */}
                    {project.image_url && (
                        <div className="rounded-xl overflow-hidden mb-12 shadow-xl aspect-video max-w-5xl mx-auto">
                            <img
                                src={project.image_url}
                                alt={project.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Project Info & Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
                        {/* Sidebar / Info */}
                        <div className="lg:col-span-1 order-2 lg:order-1">
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 sticky top-28">
                                <h3 className="text-lg font-bold mb-4 border-b pb-2">Thông tin dự án</h3>

                                <ul className="space-y-4">
                                    <li className="flex items-start">
                                        <User className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                                        <div>
                                            <span className="block text-sm font-medium text-muted-foreground">Khách hàng / Chủ đầu tư</span>
                                            <span className="block font-medium">{project.client || "Đang cập nhật"}</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start">
                                        <Calendar className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                                        <div>
                                            <span className="block text-sm font-medium text-muted-foreground">Thời gian hoàn thành</span>
                                            <span className="block font-medium">
                                                {project.completion_date
                                                    ? new Date(project.completion_date).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
                                                    : "Đang cập nhật"}
                                            </span>
                                        </div>
                                    </li>
                                    {project.category && (
                                        <li className="flex items-start">
                                            <Building className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                                            <div>
                                                <span className="block text-sm font-medium text-muted-foreground">Lĩnh vực</span>
                                                <span className="block font-medium">{project.category.name}</span>
                                            </div>
                                        </li>
                                    )}
                                    <li className="flex items-start">
                                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                                        <div>
                                            <span className="block text-sm font-medium text-muted-foreground">Trạng thái</span>
                                            <span className="block font-medium text-green-600">Đã hoàn thành</span>
                                        </div>
                                    </li>
                                </ul>

                                <div className="mt-8 pt-6 border-t">
                                    <Button className="w-full">
                                        Liên hệ tư vấn dự án tương tự
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-2 order-1 lg:order-2">
                            <div className="prose prose-lg max-w-none text-gray-700">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Chi tiết dự án</h3>
                                {project.content ? (
                                    <div dangerouslySetInnerHTML={{ __html: project.content }} />
                                ) : (
                                    <p className="text-muted-foreground italic">Nội dung chi tiết dự án đang được cập nhật...</p>
                                )}
                            </div>

                            {/* Share */}
                            <div className="flex items-center gap-3 mt-10 pt-6 border-t">
                                <span className="text-muted-foreground font-medium">Chia sẻ dự án này:</span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon" className="rounded-full w-10 h-10 hover:border-primary hover:text-primary">
                                        <Share2 size={18} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
            <BackToTop />
        </div>
    );
};

export default ProjectDetail;
