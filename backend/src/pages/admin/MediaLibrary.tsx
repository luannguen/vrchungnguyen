
import { useState, useEffect } from 'react';
import { mediaService, MediaItem } from '@/services/mediaService';
import { Button } from '@/components/ui/button';
import { Card, CardFooter } from '@/components/ui/card';
import { Loader2, Upload, Trash2, Copy, Check, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function MediaLibrary() {
    const [images, setImages] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const data = await mediaService.getImages();
            setImages(data);
        } catch (error) {
            console.error('Error fetching images:', error);
            toast.error('Failed to load images');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploading(true);
        try {
            // Check file specific logic if needed (e.g. size, type)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size too large. Max 5MB.');
                return;
            }

            await mediaService.uploadImage(file);
            toast.success('Image uploaded successfully');
            fetchImages(); // Refresh list
        } catch (error: any) {
            console.error('Error uploading:', error);
            toast.error(error.message || 'Failed to upload image');
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleDelete = async (path: string) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            await mediaService.deleteImage(path);
            toast.success('Image deleted');
            setImages(images.filter(img => img.path !== path && `${'uploads'}/${img.name}` !== path)); // Optimistic update or just filter
            fetchImages(); // Refresh to be sure
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error('Failed to delete image');
        }
    };

    const handleCopyUrl = (url: string, id: string) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        toast.success('URL copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchImages} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <div className="relative">
                        <input
                            type="file"
                            id="file-upload"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileUpload}
                            accept="image/*"
                            disabled={uploading}
                        />
                        <Button disabled={uploading}>
                            {uploading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Upload className="h-4 w-4 mr-2" />
                            )}
                            {uploading ? 'Uploading...' : 'Upload Image'}
                        </Button>
                    </div>
                </div>
            </div>

            {loading && images.length === 0 ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {images.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                            <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No images found. Upload your first image!</p>
                        </div>
                    ) : (
                        images.map((item) => (
                            <Card key={item.id} className="overflow-hidden group">
                                <div className="aspect-square relative bg-muted/20">
                                    <img
                                        src={item.url}
                                        alt={item.name}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleCopyUrl(item.url, item.id)}
                                            title="Copy URL"
                                        >
                                            {copiedId === item.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => {
                                                handleDelete(item.path);
                                            }}
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <CardFooter className="p-2 text-xs text-muted-foreground truncate border-t bg-muted/10">
                                    <span className="truncate w-full block text-center" title={item.name}>
                                        {item.name}
                                    </span>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
