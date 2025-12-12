import { useState, useEffect } from 'react';
import { mediaService, MediaItem } from '@/services/mediaService';
import { Button } from '@/components/ui/button';
// Card imports removed as unused
import { Loader2, Upload, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface ImagePickerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (url: string) => void;
}

export function ImagePickerModal({ open, onOpenChange, onSelect }: ImagePickerModalProps) {
    const [images, setImages] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

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
        if (open) {
            fetchImages();
        }
    }, [open]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploading(true);
        try {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size too large. Max 5MB.');
                return;
            }

            await mediaService.uploadImage(file);
            toast.success('Image uploaded successfully');
            fetchImages();
        } catch (error: any) {
            console.error('Error uploading:', error);
            toast.error(error.message || 'Failed to upload image');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleSelect = (url: string) => {
        onSelect(url);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col h-full">
                <DialogHeader>
                    <DialogTitle>Select Image</DialogTitle>
                    <DialogDescription>
                        Choose an image from the library or upload a new one.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-between items-center py-4 gap-4">
                    <Button variant="outline" size="sm" onClick={fetchImages} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <div className="relative">
                        <input
                            type="file"
                            id="picker-file-upload"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileUpload}
                            accept="image/*"
                            disabled={uploading}
                        />
                        <Button disabled={uploading} size="sm">
                            {uploading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Upload className="h-4 w-4 mr-2" />
                            )}
                            {uploading ? 'Uploading...' : 'Upload New'}
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-1">
                    {loading && images.length === 0 ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {images.length === 0 ? (
                                <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                                    <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                    <p>No images found.</p>
                                </div>
                            ) : (
                                images.map((item) => (
                                    <div
                                        key={item.id}
                                        className="relative group aspect-square rounded-md overflow-hidden border cursor-pointer hover:ring-2 hover:ring-primary transition-all bg-muted/20"
                                        onClick={() => handleSelect(item.url)}
                                    >
                                        <img
                                            src={item.url}
                                            alt={item.name}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-xs font-medium px-2 py-1 bg-black/50 rounded">Select</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
