
import { useState, useEffect } from "react";
import { bannerService, Banner, BannerFormData } from "@/services/bannerService";
import { mediaService } from "@/services/mediaService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";

export default function BannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentBanner, setCurrentBanner] = useState<Banner | null>(null);
    const [formData, setFormData] = useState<BannerFormData>({
        title: "",
        image_url: "",
        link: "",
        description: "",
        position: "home_main",
        order_index: 0,
        is_active: true,
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const data = await bannerService.getBanners();
            setBanners(data);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to load banners",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (banner?: Banner) => {
        if (banner) {
            setCurrentBanner(banner);
            setFormData({
                title: banner.title,
                image_url: banner.image_url,
                link: banner.link,
                description: banner.description,
                position: banner.position,
                order_index: banner.order_index,
                is_active: banner.is_active,
            });
        } else {
            setCurrentBanner(null);
            setFormData({
                title: "",
                image_url: "",
                link: "",
                description: "",
                position: "home_main",
                order_index: 0,
                is_active: true,
            });
        }
        setSelectedFile(null);
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let imageUrl = formData.image_url;

            if (selectedFile) {
                const uploadResult = await mediaService.uploadImage(selectedFile, 'banners');
                if (uploadResult) {
                    imageUrl = uploadResult.url;
                }
            }

            if (!imageUrl) {
                toast({
                    title: "Validation Error",
                    description: "Image is required",
                    variant: "destructive",
                });
                return;
            }

            const bannerData = { ...formData, image_url: imageUrl };

            if (currentBanner) {
                await bannerService.updateBanner(currentBanner.id, bannerData);
                toast({ title: "Success", description: "Banner updated successfully" });
            } else {
                await bannerService.createBanner(bannerData);
                toast({ title: "Success", description: "Banner created successfully" });
            }

            setIsDialogOpen(false);
            fetchBanners();
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to save banner",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this banner?")) return;
        try {
            await bannerService.deleteBanner(id);
            toast({ title: "Success", description: "Banner deleted successfully" });
            fetchBanners();
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to delete banner",
                variant: "destructive",
            });
        }
    };

    const handleToggleActive = async (banner: Banner) => {
        try {
            await bannerService.updateBanner(banner.id, { is_active: !banner.is_active });
            fetchBanners();
        } catch (error) {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Banners & Sliders</h1>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> Add Banner
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <div className="flex justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : banners.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No banners found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            banners.map((banner) => (
                                <TableRow key={banner.id}>
                                    <TableCell>
                                        {banner.image_url ? (
                                            <img
                                                src={banner.image_url}
                                                alt={banner.title || "Banner"}
                                                className="h-12 w-20 object-cover rounded-md"
                                            />
                                        ) : (
                                            <div className="h-12 w-20 bg-muted rounded-md flex items-center justify-center">
                                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{banner.title || "-"}</TableCell>
                                    <TableCell><Badge variant="outline">{banner.position}</Badge></TableCell>
                                    <TableCell>{banner.order_index}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={banner.is_active}
                                            onCheckedChange={() => handleToggleActive(banner)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleOpenDialog(banner)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => handleDelete(banner.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{currentBanner ? "Edit Banner" : "Create Banner"}</DialogTitle>
                        <DialogDescription>
                            {currentBanner
                                ? "Make changes to the banner here."
                                : "Add a new banner to the website."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={formData.title || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Image</Label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            setSelectedFile(e.target.files[0]);
                                        }
                                    }}
                                />
                            </div>
                            {formData.image_url && !selectedFile && (
                                <p className="text-xs text-muted-foreground break-all">Current: {formData.image_url}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="position">Position</Label>
                                <select
                                    id="position"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.position}
                                    onChange={(e) =>
                                        setFormData({ ...formData, position: e.target.value })
                                    }
                                >
                                    <option value="home_main">Home Main Slider</option>
                                    <option value="popup">Popup</option>
                                    <option value="sidebar">Sidebar</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="order">Order</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    value={formData.order_index}
                                    onChange={(e) =>
                                        setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="link">Link (Optional)</Label>
                            <Input
                                id="link"
                                value={formData.link || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, link: e.target.value })
                                }
                                placeholder="/products/abc"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                            />
                        </div>

                        <DialogFooter>
                            <Button type="submit">Save changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
