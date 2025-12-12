import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, BarChart3, PieChart, Calculator, Thermometer, Settings, FileText, BookOpen, ArrowRight, LucideIcon, Gauge } from 'lucide-react';
import { resourceAPI, Resource } from '@/components/data/services/resourcesService';

const iconMap: Record<string, LucideIcon> = {
    LineChart,
    BarChart3,
    PieChart,
    Calculator,
    Thermometer,
    Settings,
    FileText,
    BookOpen,
    Gauge
};

const ResourceCategory: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [category, setCategory] = useState<Resource | null>(null);
    const [children, setChildren] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                // Fetch category
                const catResult = await resourceAPI.getBySlug(slug);
                if (catResult.success && catResult.data) {
                    setCategory(catResult.data);

                    // Fetch children
                    const childrenResult = await resourceAPI.getChildren(catResult.data.id);
                    if (childrenResult.success && childrenResult.data) {
                        setChildren(childrenResult.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching resource category:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    if (loading) {
        return <div className="container-custom py-12 text-center">Đang tải...</div>;
    }

    if (!category) {
        return (
            <div className="container-custom py-12 text-center">
                <h1 className="text-2xl font-bold">Không tìm thấy danh mục</h1>
                <Link to="/data" className="text-primary hover:underline mt-4 inline-block">Quay lại trang dữ liệu</Link>
            </div>
        );
    }

    return (
        <div className="container-custom py-12">
            <div className="mb-10">
                <h1 className="text-3xl font-bold mb-4">{category.title}</h1>
                <p className="text-lg text-muted-foreground max-w-3xl">
                    {category.description}
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {children.map((item) => {
                    const IconComponent = iconMap[item.icon] || LineChart;
                    return (
                        <div key={item.id} className="bg-muted rounded-lg p-6 border border-border hover:border-primary transition-colors">
                            <div className="bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                                <IconComponent className="text-primary w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                            <p className="text-muted-foreground mb-4 line-clamp-3">
                                {item.description}
                            </p>

                            {item.features && item.features.length > 0 && (
                                <ul className="space-y-2 mb-4">
                                    {item.features.slice(0, 3).map((feature, idx) => (
                                        <li key={idx} className="flex items-center text-sm text-muted-foreground">
                                            <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <Link
                                to={`/data/${slug}/${item.slug}`}
                                className="inline-flex items-center text-primary hover:underline font-medium"
                            >
                                {item.type === 'tool' ? 'Sử dụng công cụ' : 'Xem chi tiết'}
                                <ArrowRight size={16} className="ml-2" />
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ResourceCategory;
