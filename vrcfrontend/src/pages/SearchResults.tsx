import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { projectService } from "@/services/projectService";
import { newsAPI } from "@/components/data/services/newsService";
import { Project } from "@/components/data/types";
import { NewsItem } from "@/components/data/models/news";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CalendarIcon, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";

    const [projects, setProjects] = useState<Project[]>([]);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!query) return;
            setLoading(true);

            try {
                const [projectResult, newsResult] = await Promise.all([
                    projectService.getProjects({ search: query }),
                    newsAPI.getAll(query)
                ]);

                if (projectResult.success) {
                    setProjects(projectResult.data);
                }

                if (newsResult.success) {
                    setNews(newsResult.data);
                }
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [query]);

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    if (loading) {
        return <div className="container-custom py-16 text-center">Đang tìm kiếm...</div>;
    }

    const hasResults = projects.length > 0 || news.length > 0;

    return (
        <main className="flex-grow">
            <div className="bg-gray-50 py-12">
                <div className="container-custom">
                    <h1 className="text-3xl font-bold mb-4">Kết quả tìm kiếm: "{query}"</h1>
                    {!hasResults && (
                        <div className="text-muted-foreground">Không tìm thấy kết quả nào phù hợp.</div>
                    )}
                </div>
            </div>

            {hasResults && (
                <div className="container-custom py-8">
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="mb-8">
                            <TabsTrigger value="all">Tất cả ({projects.length + news.length})</TabsTrigger>
                            <TabsTrigger value="projects">Dự án ({projects.length})</TabsTrigger>
                            <TabsTrigger value="news">Tin tức ({news.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-12">
                            {/* Projects Section in All */}
                            {projects.length > 0 && (
                                <div>
                                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                                        Dự án
                                        <Link to="?q=projects" className="ml-4 text-sm font-normal text-primary hover:underline hidden">Xem tất cả</Link>
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {projects.slice(0, 3).map(project => (
                                            <ProjectCard key={project.id} project={project} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* News Section in All */}
                            {news.length > 0 && (
                                <div>
                                    <h2 className="text-2xl font-bold mb-6">Tin tức & Sự kiện</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {news.slice(0, 3).map(item => (
                                            <NewsCard key={item.id} item={item} formatDate={formatDate} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="projects">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.map(project => (
                                    <ProjectCard key={project.id} project={project} />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="news">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {news.map(item => (
                                    <NewsCard key={item.id} item={item} formatDate={formatDate} />
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </main>
    );
};

const ProjectCard = ({ project }: { project: Project }) => (
    <div className="group rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-all">
        <Link to={`/projects/${project.slug}`} className="block aspect-video overflow-hidden">
            <img
                src={project.image_url || '/placeholder-project.jpg'}
                alt={project.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
        </Link>
        <div className="p-4">
            <div className="text-xs text-primary font-medium mb-2 uppercase tracking-wider">
                {project.category?.name || 'Dự án'}
            </div>
            <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                <Link to={`/projects/${project.slug}`}>{project.name}</Link>
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                {project.description}
            </p>
            <Link
                to={`/projects/${project.slug}`}
                className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80"
            >
                Xem chi tiết <ChevronRight size={16} className="ml-1" />
            </Link>
        </div>
    </div>
);

const NewsCard = ({ item, formatDate }: { item: NewsItem, formatDate: (d?: string) => string }) => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <Link to={item.type === "news" ? `/news/${item.id}` : `/event-details/${item.id}`} className="block aspect-[4/3] overflow-hidden">
            <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform hover:scale-105"
            />
        </Link>

        <div className="p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                    {item.category}
                </span>
                <span className="text-xs text-muted-foreground flex items-center">
                    <CalendarIcon size={12} className="mr-1" />
                    {formatDate(item.publishDate)}
                </span>
            </div>

            <h3 className="text-lg font-bold text-primary mb-2 hover:text-accent">
                <Link to={item.type === "news" ? `/news/${item.id}` : `/event-details/${item.id}`}>
                    {item.title}
                </Link>
            </h3>

            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                {item.summary}
            </p>
        </div>
    </div>
);

export default SearchResults;
