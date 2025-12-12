
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import BackToTop from "@/components/BackToTop";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeft, MapPin, Share2, Tag, User, Clock, Loader2 } from "lucide-react";
import { eventService } from "@/services/eventService";
import { Event } from "@/components/data/types";
import { toast } from "@/components/ui/use-toast";

const EventDetail = () => {
    const { id } = useParams();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const result = await eventService.getEvent(id);
                if (result.success && result.data) {
                    setEvent(result.data);
                } else {
                    setError(true);
                    toast({
                        title: "Lỗi",
                        description: "Không thể tải thông tin sự kiện",
                        variant: "destructive",
                    });
                }
            } catch (err) {
                console.error("Failed to fetch event details", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id]);

    // Format date helper
    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status: string) => {
        if (status === "upcoming") {
            return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Sắp diễn ra</Badge>;
        } else if (status === "ongoing") {
            return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Đang diễn ra</Badge>;
        } else {
            return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Đã kết thúc</Badge>;
        }
    };

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

    if (error || !event) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow flex items-center justify-center flex-col gap-4">
                    <div className="text-red-500 text-xl font-bold">Không tìm thấy sự kiện!</div>
                    <Button asChild>
                        <Link to="/events">
                            <ChevronLeft size={16} className="mr-2" />
                            Quay lại danh sách sự kiện
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
                    <Link to="/events" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
                        <ChevronLeft size={16} className="mr-1" />
                        Quay lại danh sách sự kiện
                    </Link>
                </div>

                <article className="container-custom max-w-4xl">
                    {/* Article Header */}
                    <div className="mb-8">
                        <div className="flex flex-wrap gap-2 mb-4 items-center">
                            {event.category && (
                                <Badge variant="secondary" className="hover:bg-primary hover:text-white transition-colors">
                                    {event.category.name}
                                </Badge>
                            )}
                            {getStatusBadge(event.status)}
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            {event.title}
                        </h1>

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <CalendarIcon className="w-5 h-5 text-primary mt-1 mr-3 flex-shrink-0" />
                                        <div>
                                            <span className="block font-medium text-gray-900">Thời gian</span>
                                            <span className="text-muted-foreground">
                                                {formatDate(event.start_date)}
                                                {event.end_date && event.end_date !== event.start_date && ` - ${formatDate(event.end_date)}`}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <MapPin className="w-5 h-5 text-primary mt-1 mr-3 flex-shrink-0" />
                                        <div>
                                            <span className="block font-medium text-gray-900">Địa điểm</span>
                                            <span className="text-muted-foreground">{event.location || "Đang cập nhật"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <User className="w-5 h-5 text-primary mt-1 mr-3 flex-shrink-0" />
                                        <div>
                                            <span className="block font-medium text-gray-900">Đơn vị tổ chức</span>
                                            <span className="text-muted-foreground">{event.organizer || "VRC"}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <Clock className="w-5 h-5 text-primary mt-1 mr-3 flex-shrink-0" />
                                        <div>
                                            <span className="block font-medium text-gray-900">Trạng thái</span>
                                            <span className="capitalize text-muted-foreground">
                                                {event.status === 'upcoming' ? 'Sắp diễn ra' : event.status === 'ongoing' ? 'Đang diễn ra' : 'Đã kết thúc'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Featured Image */}
                    {event.image_url && (
                        <div className="rounded-xl overflow-hidden mb-10 shadow-lg aspect-video">
                            <img
                                src={event.image_url}
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Article Content */}
                    <div className="prose prose-lg max-w-none text-gray-700 mb-10">
                        {/* If content is HTML, render it safely. If it's Markdown, might need a parser. Assuming HTML for CMS simplicity or raw text */}
                        {event.content ? (
                            <div dangerouslySetInnerHTML={{ __html: event.content }} />
                        ) : (
                            <p>{event.summary}</p>
                        )}
                    </div>

                    {/* Tags & Share */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t border-gray-100 pt-8 mt-12">
                        <div className="flex items-center gap-2">
                            <Tag size={20} className="text-muted-foreground" />
                            <div className="flex flex-wrap gap-2">
                                {event.tags && event.tags.length > 0 ? (
                                    event.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-700"
                                        >
                                            {tag}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-sm text-gray-500">Không có thẻ</span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-muted-foreground font-medium">Chia sẻ:</span>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" className="rounded-full w-10 h-10 hover:border-primary hover:text-primary">
                                    <Share2 size={18} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </article>
            </main>

            <Footer />
            <BackToTop />
        </div>
    );
};

export default EventDetail;
