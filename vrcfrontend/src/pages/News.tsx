import { useState } from "react";
import { CalendarIcon, ChevronRight, User } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchIcon } from "@/components/ui/search-icon";
import { useNews } from "@/hooks/useNews";

const News = () => {
  const {
    filteredNews: allFilteredNews,
    featuredNews: unusedFeatured,
    categories,
    loading,
    error,
    activeTab,
    setActiveTab,
    searchNews
  } = useNews();

  const { category, tag } = useParams();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    searchNews(searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Slugify helper
  const slugify = (text: string) => (text || '').toLowerCase().replace(/\s+/g, '-');

  // Apply local filtering based on URL params
  let filteredNews = allFilteredNews;

  if (category) {
    filteredNews = filteredNews.filter(item => slugify(item.category) === category);
  }

  if (tag) {
    filteredNews = filteredNews.filter(item => item.tags && item.tags.some(t => slugify(t) === tag));
  }

  // Recalculate featured news based on current filter
  const featuredNews = filteredNews.length > 0 ? filteredNews[0] : null;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return <div className="container-custom py-16 text-center">Đang tải tin tức...</div>;
  }

  if (error) {
    return <div className="container-custom py-16 text-center text-red-500">Lỗi: {error}</div>;
  }

  return (
    <main className="flex-grow">
      {/* Tiêu đề trang */}
      <div className="bg-gradient-to-b from-primary/10 to-transparent py-8 md:py-12">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">Tin tức & Sự kiện</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl">
            Cập nhật những thông tin mới nhất về ngành điện lạnh, công nghệ mới và các hoạt động của chúng tôi
          </p>
        </div>
      </div>

      {/* Nội dung chính */}
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Tin nổi bật */}
            {featuredNews && (
              <div className="mb-10">
                <div className="aspect-video rounded-lg overflow-hidden mb-4">
                  <img
                    src={featuredNews.image}
                    alt={featuredNews.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-block bg-secondary text-black font-medium px-3 py-1 rounded-md text-sm">
                    {featuredNews.category}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-primary mb-3">
                  <Link to={`/news/${featuredNews.id}`} className="hover:text-accent">
                    {featuredNews.title}
                  </Link>
                </h2>
                <p className="text-muted-foreground mb-4">{featuredNews.summary}</p>

                <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-4 mb-4">
                  <div className="flex items-center">
                    <CalendarIcon size={16} className="mr-1" />
                    <span>{formatDate(featuredNews.publishDate)}</span>
                  </div>
                  <div className="flex items-center">
                    <User size={16} className="mr-1" />
                    <span>Tác giả: {featuredNews.author}</span>
                  </div>
                </div>

                <Button asChild>
                  <Link to={`/news/${featuredNews.id}`}>
                    Xem chi tiết
                    <ChevronRight size={16} className="ml-1" />
                  </Link>
                </Button>
              </div>
            )}

            {/* Tab lọc tin tức/sự kiện */}
            <Tabs defaultValue="all" className="mb-8" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full max-w-[400px]">
                <TabsTrigger value="all">Tất cả</TabsTrigger>
                <TabsTrigger value="news">Tin tức</TabsTrigger>
                <TabsTrigger value="events">Sự kiện</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Danh sách tin tức */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredNews.slice(1).map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
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

                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">
                        Tác giả: {item.author}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          {item.views}
                        </span>
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          {item.comments}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Phân trang */}
            <div className="flex justify-center mt-10">
              <div className="join">
                <button className="bg-white border border-gray-300 px-3 py-1 hover:bg-primary hover:text-white transition-colors">
                  «
                </button>
                <button className="bg-primary text-white border border-primary px-3 py-1">1</button>
                <button className="bg-white border border-gray-300 px-3 py-1 hover:bg-primary hover:text-white transition-colors">2</button>
                <button className="bg-white border border-gray-300 px-3 py-1 hover:bg-primary hover:text-white transition-colors">3</button>
                <button className="bg-white border border-gray-300 px-3 py-1 hover:bg-primary hover:text-white transition-colors">
                  »
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Tìm kiếm */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <h3 className="font-semibold text-lg mb-3">Tìm kiếm</h3>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Tìm kiếm tin tức..."
                  className="flex-grow border rounded-l-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary/90 transition-colors"
                  onClick={handleSearch}
                >
                  <SearchIcon size={18} />
                </button>
              </div>
            </div>

            {/* Danh mục */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <h3 className="font-semibold text-lg mb-3">Danh mục</h3>
              <ul className="space-y-2">
                {categories.map((category, index) => (
                  <li key={index}>
                    <Link
                      to={`/news/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="flex justify-between items-center py-2 hover:text-primary"
                    >
                      <span>{category.name}</span>
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                        {category.count}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bài viết gần đây */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <h3 className="font-semibold text-lg mb-3">Bài viết gần đây</h3>
              <div className="space-y-4">
                {filteredNews.slice(0, 5).map(news => (
                  <div key={news.id} className="flex gap-3">
                    <Link to={news.type === "news" ? `/news/${news.id}` : `/event-details/${news.id}`} className="block w-20 h-20 flex-shrink-0">
                      <img
                        src={news.image}
                        alt={news.title}
                        className="w-full h-full object-cover rounded"
                      />
                    </Link>
                    <div>
                      <Link to={news.type === "news" ? `/news/${news.id}` : `/event-details/${news.id}`} className="font-medium text-sm hover:text-primary line-clamp-2">
                        {news.title}
                      </Link>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center">
                        <CalendarIcon size={12} className="mr-1" />
                        {formatDate(news.publishDate)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags (using featured news for now for sample tags or aggregation) */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(filteredNews.flatMap(news => news.tags))).map((tag, index) => (
                  <Link
                    key={index}
                    to={`/news/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                    className="bg-gray-100 hover:bg-primary hover:text-white px-3 py-1 rounded-full text-sm transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default News;