import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { settingsService } from '@/services/settingsService';

interface SEOHelmetProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
}

const SEOHelmet: React.FC<SEOHelmetProps> = ({ title, description, keywords, image }) => {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchSettings = async () => {
            const result = await settingsService.getSettings();
            if (result.success && result.data) {
                setSettings(result.data);
            }
        };
        fetchSettings();
    }, []);

    if (!mounted) return null;

    const siteTitle = settings['site_title'] || 'VRC - Tổng công ty kỹ thuật điện lạnh Việt Nam';
    const finalTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const finalDescription = description || settings['site_description'] || 'Giải pháp điện lạnh toàn diện cho mọi công trình';
    const finalKeywords = keywords || settings['site_keywords'] || 'điện lạnh, vrc, hvac';
    const finalImage = image || settings['og_image_url'] || '/lovable-uploads/0bd3c048-8e37-4775-a6bc-0b54ec07edbe.png';

    const headerScripts = settings['header_scripts'];

    return (
        <>
            <Helmet>
                <title>{finalTitle}</title>
                <meta name="description" content={finalDescription} />
                <meta name="keywords" content={finalKeywords} />

                <meta property="og:title" content={finalTitle} />
                <meta property="og:description" content={finalDescription} />
                <meta property="og:image" content={finalImage} />

                <meta name="twitter:title" content={finalTitle} />
                <meta name="twitter:description" content={finalDescription} />
                <meta name="twitter:image" content={finalImage} />

                {/* Safe script injection if needed, usually we avoid dangerouslySetInnerHTML in Helmet directly for scripts, 
                    but if required we can use it. For now let's just do meta tags. 
                */}
            </Helmet>
            {/* We might need a safer way to inject scripts if really needed, e.g. GTM */}
        </>
    );
};

export default SEOHelmet;
