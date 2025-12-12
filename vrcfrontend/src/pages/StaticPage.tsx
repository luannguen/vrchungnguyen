
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { pageService, StaticPage as IStaticPage } from '@/services/pageService';
import { Loader2 } from 'lucide-react';
import NotFound from './NotFound';

interface StaticPageProps {
    slug?: string; // Optional: allow passing slug directly
}

const StaticPage: React.FC<StaticPageProps> = ({ slug: propSlug }) => {
    const { slug: paramSlug } = useParams<{ slug: string }>();
    const slug = propSlug || paramSlug;

    const [page, setPage] = useState<IStaticPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchPage = async () => {
            if (!slug) {
                setLoading(false);
                setError(true);
                return;
            }

            try {
                setLoading(true);
                const data = await pageService.getPageBySlug(slug);
                if (data) {
                    setPage(data);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Failed to fetch page", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchPage();
    }, [slug]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !page) {
        return <NotFound />;
    }

    return (
        <main className="flex-grow">
            {/* Header Section */}
            <div className="bg-gradient-to-b from-primary/10 to-transparent py-12 md:py-20">
                <div className="container-custom">
                    <h1 className="text-3xl md:text-5xl font-bold text-primary mb-6">{page.title}</h1>
                    {page.excerpt && (
                        <p className="text-lg text-muted-foreground max-w-3xl">
                            {page.excerpt}
                        </p>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <section className="py-12 md:py-16">
                <div className="container-custom">
                    <div
                        className="prose prose-lg max-w-none dark:prose-invert 
                        prose-headings:text-primary prose-a:text-primary hover:prose-a:text-primary/80
                        prose-img:rounded-lg prose-img:shadow-md"
                        dangerouslySetInnerHTML={{ __html: page.content || '' }}
                    />
                </div>
            </section>
        </main>
    );
};

export default StaticPage;
