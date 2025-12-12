import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { resourceAPI, Resource } from '@/components/data/services/resourcesService';

const ResourceDetail: React.FC = () => {
    const { category, slug } = useParams<{ category: string; slug: string }>();
    const [resource, setResource] = useState<Resource | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                const result = await resourceAPI.getBySlug(slug);
                if (result.success && result.data) {
                    setResource(result.data);
                }
            } catch (error) {
                console.error('Error fetching resource detail:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    if (loading) {
        return <div className="container-custom py-12 text-center">Đang tải...</div>;
    }

    if (!resource) {
        return (
            <div className="container-custom py-12 text-center">
                <h1 className="text-2xl font-bold">Không tìm thấy nội dung</h1>
                <Link to={`/data/${category}`} className="text-primary hover:underline mt-4 inline-block">Quay lại danh mục</Link>
            </div>
        );
    }

    return (
        <div className="container-custom py-12">
            <Link to={`/data/${category}`} className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
                <ArrowLeft size={20} className="mr-2" />
                Quay lại {category === 'statistics' ? 'Thống kê' : 'Công cụ'}
            </Link>

            <article className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold mb-6">{resource.title}</h1>

                <div className="flex items-center text-muted-foreground mb-8 text-sm">
                    <span className="flex items-center mr-6">
                        <Calendar size={16} className="mr-2" />
                        {new Date(resource.created_at || Date.now()).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="flex items-center">
                        <User size={16} className="mr-2" />
                        VRC Admin
                    </span>
                </div>

                <div
                    className="prose prose-lg max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: resource.content || '' }}
                />

                {!resource.content && (
                    <div className="bg-muted p-8 rounded-lg text-center my-8">
                        <p className="text-muted-foreground">Nội dung đang được cập nhật...</p>
                    </div>
                )}
            </article>
        </div>
    );
};

export default ResourceDetail;
