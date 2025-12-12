import { CalendarIcon, ChevronRight, Clock, Eye, MapPin, Tag, User, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SearchIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { eventService } from "@/services/eventService";
import { productService } from "@/services/productService"; // reusing for categories
import { Event, Category } from "@/components/data/types";

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch events
        const eventsResult = await eventService.getEvents();
        if (eventsResult.success) {
          setEvents(eventsResult.data);
        }

        // Fetch categories
        const categoriesResult = await productService.getCategories();
        if (categoriesResult.success) {
          // Filter for event-related categories if you distinguish them, 
          // otherwise just use all or filter by type 'event' if added to backend
          // For now assuming shared categories or filtering on backend
          setCategories(categoriesResult.data);
        }

        // Fetch featured event (or pick latest upcoming)
        const featuredResult = await eventService.getFeaturedEvent();
        if (featuredResult.success) {
          setFeaturedEvent(featuredResult.data);
        }
      } catch (error) {
        console.error("Failed to fetch event data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter logic
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesCategory = selectedCategory ? event.category?.name === selectedCategory : true;
    const matchesStatus = selectedStatus ? event.status === selectedStatus : true;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const upcomingEvents = filteredEvents.filter(e => e.status === 'upcoming');
  const pastEvents = filteredEvents.filter(e => e.status === 'past');
  const ongoingEvents = filteredEvents.filter(e => e.status === 'ongoing'); // Maybe group with upcoming?

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Get event status badge
  const getStatusBadge = (status: string) => {
    if (status === "upcoming") {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Sắp diễn ra</Badge>;
    } else if (status === "ongoing") {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Đang diễn ra</Badge>;
    } else {
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Đã kết thúc</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <main className="flex-grow">
      {/* Tiêu đề trang */}
      <div className="bg-gradient-to-b from-primary/10 to-transparent py-8 md:py-12">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">Sự kiện</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl">
            Các sự kiện, hội thảo và triển lãm liên quan đến lĩnh vực điện lạnh và điều hòa không khí
          </p>
        </div>
      </div>

      {/* Nội dung chính */}
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Sự kiện nổi bật */}
            {featuredEvent && (
              <div className="mb-10">
                <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-muted">
                  <img
                    src={featuredEvent.image_url || "/assets/images/placeholder.jpg"}
                    alt={featuredEvent.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                    onError={(e) => { e.currentTarget.src = "/assets/images/placeholder.jpg"; }}
                  />
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {featuredEvent.category && (
                    <span className="inline-block bg-secondary text-black font-medium px-3 py-1 rounded-md text-sm">
                      {featuredEvent.category.name}
                    </span>
                  )}
                  {getStatusBadge(featuredEvent.status)}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-primary mb-3">
                  <Link to={`/events/${featuredEvent.slug || featuredEvent.id}`} className="hover:text-accent">
                    {featuredEvent.title}
                  </Link>
                </h2>
                <p className="text-muted-foreground mb-4">{featuredEvent.summary}</p>

                <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-4 mb-4">
                  <div className="flex items-center">
                    <CalendarIcon size={16} className="mr-1" />
                    <span>{formatDate(featuredEvent.start_date)}{featuredEvent.end_date !== featuredEvent.start_date ? ` - ${formatDate(featuredEvent.end_date)}` : ''}</span>
                  </div>
                  {featuredEvent.location && (
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-1" />
                      <span>{featuredEvent.location}</span>
                    </div>
                  )}
                  {featuredEvent.organizer && (
                    <div className="flex items-center">
                      <User size={16} className="mr-1" />
                      <span>Tổ chức bởi: {featuredEvent.organizer}</span>
                    </div>
                  )}
                </div>

                <Button asChild>
                  <Link to={`/events/${featuredEvent.slug || featuredEvent.id}`}>
                    Xem chi tiết
                    <ChevronRight size={16} className="ml-1" />
                  </Link>
                </Button>
              </div>
            )}

            {/* Bộ lọc sự kiện */}
            <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-4">Lọc sự kiện</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-1">Danh mục</label>
                  <select
                    className="w-full rounded border border-gray-300 p-2"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Tất cả danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Trạng thái</label>
                  <select
                    className="w-full rounded border border-gray-300 p-2"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="upcoming">Sắp diễn ra</option>
                    <option value="ongoing">Đang diễn ra</option>
                    <option value="past">Đã kết thúc</option>
                  </select>
                </div>
                <div className="self-end">
                  <Button
                    className="w-full"
                    onClick={() => { setSelectedCategory(""); setSelectedStatus(""); setSearchTerm(""); }}
                    variant="outline"
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              </div>
            </div>

            {/* Danh sách sự kiện */}
            <div className="space-y-8">
              {(upcomingEvents.length > 0 || ongoingEvents.length > 0) && (
                <>
                  <h2 className="text-2xl font-bold text-primary border-b border-gray-200 pb-2">
                    Sự kiện sắp tới & đang diễn ra
                  </h2>

                  <div className="space-y-6">
                    {[...upcomingEvents, ...ongoingEvents].map(event => (
                      <div key={event.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col md:flex-row">
                        <div className="md:w-1/3">
                          <div className="h-48 md:h-full bg-muted">
                            <img
                              src={event.image_url || "/assets/images/placeholder.jpg"}
                              alt={event.title}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.src = "/assets/images/placeholder.jpg"; }}
                            />
                          </div>
                        </div>

                        <div className="p-4 md:w-2/3 flex flex-col">
                          <div className="flex items-center gap-2 mb-2">
                            {event.category && (
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                                {event.category.name}
                              </span>
                            )}
                            {getStatusBadge(event.status)}
                          </div>

                          <h3 className="text-lg font-bold text-primary mb-2 hover:text-accent">
                            <Link to={`/events/${event.slug || event.id}`}>
                              {event.title}
                            </Link>
                          </h3>

                          <p className="text-muted-foreground text-sm mb-3 flex-grow line-clamp-3">
                            {event.summary}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground mt-auto">
                            <div className="flex items-center">
                              <CalendarIcon size={14} className="mr-1 flex-shrink-0" />
                              <span className="truncate">{formatDate(event.start_date)}{event.end_date !== event.start_date ? ` - ${formatDate(event.end_date)}` : ''}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center">
                                <MapPin size={14} className="mr-1 flex-shrink-0" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-8" />
                </>
              )}

              {pastEvents.length > 0 && (
                <>
                  <h2 className="text-2xl font-bold text-primary border-b border-gray-200 pb-2">
                    Sự kiện đã diễn ra
                  </h2>

                  <div className="space-y-6">
                    {pastEvents.map(event => (
                      <div key={event.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col md:flex-row">
                        <div className="md:w-1/3">
                          <div className="h-48 md:h-full bg-muted">
                            <img
                              src={event.image_url || "/assets/images/placeholder.jpg"}
                              alt={event.title}
                              className="w-full h-full object-cover grayscale opacity-90"
                              onError={(e) => { e.currentTarget.src = "/assets/images/placeholder.jpg"; }}
                            />
                          </div>
                        </div>

                        <div className="p-4 md:w-2/3 flex flex-col">
                          <div className="flex items-center gap-2 mb-2">
                            {event.category && (
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                                {event.category.name}
                              </span>
                            )}
                            {getStatusBadge(event.status)}
                          </div>

                          <h3 className="text-lg font-bold text-primary mb-2 hover:text-accent">
                            <Link to={`/events/${event.slug || event.id}`}>
                              {event.title}
                            </Link>
                          </h3>

                          <p className="text-muted-foreground text-sm mb-3 flex-grow line-clamp-3">
                            {event.summary}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground mt-auto">
                            <div className="flex items-center">
                              <CalendarIcon size={14} className="mr-1 flex-shrink-0" />
                              <span className="truncate">{formatDate(event.start_date)}{event.end_date !== event.start_date ? ` - ${formatDate(event.end_date)}` : ''}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center">
                                <MapPin size={14} className="mr-1 flex-shrink-0" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {filteredEvents.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  Không tìm thấy sự kiện nào phù hợp với bộ lọc.
                </div>
              )}
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
                  placeholder="Tìm kiếm sự kiện..."
                  className="flex-grow border rounded-l-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="bg-primary text-white px-4 py-2 rounded-r-md">
                  <SearchIcon size={18} />
                </button>
              </div>
            </div>

            {/* Danh mục */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <h3 className="font-semibold text-lg mb-3">Danh mục sự kiện</h3>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      onClick={() => setSelectedCategory(category.name)}
                      className={`flex justify-between items-center py-2 w-full text-left hover:text-primary ${selectedCategory === category.name ? 'text-primary font-medium' : ''}`}
                    >
                      <span>{category.name}</span>
                      {/* You might want to calculate counts if possible, otherwise remove count or fetch counts separate */}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Lịch sự kiện (simplified for now, showing upcoming) */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <h3 className="font-semibold text-lg mb-3">Sắp diễn ra</h3>
              <ul className="space-y-3">
                {upcomingEvents
                  .slice(0, 5) // Show top 5 upcoming
                  .map((event) => (
                    <li key={event.id} className="flex gap-3 items-start border-b pb-3 relative group">
                      <div className="bg-primary/10 p-2 rounded text-center min-w-[40px]">
                        <span className="block text-sm font-medium">
                          {event.start_date ? new Date(event.start_date).getDate() : '?'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {event.start_date ? `Th${new Date(event.start_date).getMonth() + 1}` : ''}
                        </span>
                      </div>
                      <div className="flex-grow">
                        <h5 className="font-medium text-sm line-clamp-2 hover:text-primary">
                          <Link to={`/events/${event.slug || event.id}`}>{event.title}</Link>
                        </h5>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <MapPin size={12} className="mr-1" />
                          <span className="truncate">{event.location?.split(',')[0]}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                {upcomingEvents.length === 0 && <li className="text-muted-foreground text-sm">Chưa có sự kiện sắp tới.</li>}
              </ul>
            </div>

            {/* Tags */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {/* Dynamically extract tags from all events */}
                {Array.from(new Set(events.flatMap(event => event.tags || []))).map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchTerm(tag)} // Simple tag filter by search
                    className="bg-gray-100 hover:bg-primary hover:text-white px-3 py-1 rounded-full text-sm transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Events;