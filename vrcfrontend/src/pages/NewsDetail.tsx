
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeft, MapPin, Share2, Tag, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useNewsDetail } from "@/hooks/useNewsDetail";

const NewsDetail = () => {
  const { id } = useParams();
  const { newsItem, loading, error } = useNewsDetail(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div>Đang tải bài viết...</div>
      </div>
    );
  }

  if (error || !newsItem) {
    return (
      <div className="flex items-center justify-center flex-col gap-4 min-h-[60vh]">
        <div className="text-red-500 text-xl font-bold">Không tìm thấy bài viết!</div>
        <Button asChild>
          <Link to="/news">
            <ChevronLeft size={16} className="mr-2" />
            Quay lại trang tin tức
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      {/* Breadcrumb / Navigation */}
      <div className="container-custom mb-8">
        <Link to="/news" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft size={16} className="mr-1" />
          Quay lại trang tin tức
        </Link>
      </div>

      <article className="container-custom max-w-4xl">
        {/* Article Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="hover:bg-primary hover:text-white transition-colors cursor-pointer">
              {newsItem.category}
            </Badge>
            {newsItem.type === 'event' && (
              <Badge variant="outline" className="border-primary text-primary">
                Sự kiện
              </Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {newsItem.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-muted-foreground border-b border-gray-100 pb-6">
            <div className="flex items-center">
              <CalendarIcon size={18} className="mr-2" />
              <span>{new Date(newsItem.publishDate).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex items-center">
              <User size={18} className="mr-2" />
              <span>{newsItem.author}</span>
            </div>
            {newsItem.location && (
              <div className="flex items-center">
                <MapPin size={18} className="mr-2" />
                <span>{newsItem.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Featured Image */}
        <div className="rounded-xl overflow-hidden mb-10 shadow-lg">
          <img
            src={newsItem.image}
            alt={newsItem.title}
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Article Content */}
        <div
          className="prose prose-lg max-w-none text-gray-700 mb-10"
          dangerouslySetInnerHTML={{ __html: newsItem.content || newsItem.summary }}
        />

        {/* Tags & Share */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t border-gray-100 pt-8 mt-12">
          <div className="flex items-center gap-2">
            <Tag size={20} className="text-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              {newsItem.tags.map((tag, index) => (
                <Link
                  key={index}
                  to={`/news/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-sm bg-gray-100 hover:bg-primary hover:text-white px-3 py-1 rounded-full transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-muted-foreground font-medium">Chia sẻ:</span>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-full w-10 h-10 hover:border-primary hover:text-primary">
                <Share2 size={18} />
              </Button>
              {/* Add more social share buttons if needed */}
            </div>
          </div>
        </div>

      </article>

    </div >
  );
};

export default NewsDetail;