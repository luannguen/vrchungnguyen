
import { useState, useEffect } from "react";
import { pageService, StaticPage, PageFormData } from "@/services/pageService";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Pencil, Trash2, FileText, Image as ImageIcon } from "lucide-react";

export default function PagesPage() {
    const [pages, setPages] = useState<StaticPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState<StaticPage | null>(null);
    const [formData, setFormData] = useState<PageFormData>({
        slug: "",
        title: "",
        content: "",
        excerpt: "",
        image_url: "",
        is_active: true,
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            setLoading(true);
            const data = await pageService.getPages();
            setPages(data);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to load pages",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (page?: StaticPage) => {
        if (page) {
            setCurrentPage(page);
            setFormData({
                slug: page.slug,
                title: page.title,
                content: page.content,
                excerpt: page.excerpt,
                image_url: page.image_url,
                is_active: page.is_active,
            });
        } else {
            setCurrentPage(null);
            setFormData({
                slug: "",
                title: "",
                content: "",
                excerpt: "",
                image_url: "",
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
                const uploadResult = await mediaService.uploadImage(selectedFile, 'pages');
                if (uploadResult) {
                    imageUrl = uploadResult.url;
                }
            }

            if (!formData.title || !formData.slug) {
                toast({
                    title: "Validation Error",
                    description: "Title and Slug are required",
                    variant: "destructive",
                });
                return;
            }

            const pageData = { ...formData, image_url: imageUrl };

            if (currentPage) {
                await pageService.updatePage(currentPage.id, pageData);
                toast({ title: "Success", description: "Page updated successfully" });
            } else {
                await pageService.createPage(pageData);
                toast({ title: "Success", description: "Page created successfully" });
            }

            setIsDialogOpen(false);
            fetchPages();
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to save page",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this page?")) return;
        try {
            await pageService.deletePage(id);
            toast({ title: "Success", description: "Page deleted successfully" });
            fetchPages();
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to delete page",
                variant: "destructive",
            });
        }
    };

    const handleToggleActive = async (page: StaticPage) => {
        try {
            await pageService.updatePage(page.id, { is_active: !page.is_active });
            fetchPages();
        } catch (error) {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Static Pages</h1>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> Add Page
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Last Updated</TableHead>
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
                        ) : pages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No pages found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            pages.map((page) => (
                                <TableRow key={page.id}>
                                    <TableCell>
                                        {page.image_url ? (
                                            <img
                                                src={page.image_url}
                                                alt={page.title}
                                                className="h-10 w-16 object-cover rounded-md"
                                            />
                                        ) : (
                                            <div className="h-10 w-16 bg-muted rounded-md flex items-center justify-center">
                                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center">
                                            <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {page.title}
                                        </div>
                                    </TableCell>
                                    <TableCell><code className="bg-muted px-1 py-0.5 rounded text-xs">{page.slug}</code></TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(page.updated_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={page.is_active}
                                            onCheckedChange={() => handleToggleActive(page)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleOpenDialog(page)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => handleDelete(page.id)}
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
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{currentPage ? "Edit Page" : "Create Page"}</DialogTitle>
                        <DialogDescription>
                            {currentPage
                                ? "Update the content of the static page."
                                : "Create a new static page for the website."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug (URL Path)</Label>
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) =>
                                        setFormData({ ...formData, slug: e.target.value })
                                    }
                                    placeholder="e.g. about-us"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Featured Image</Label>
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

                        <div className="space-y-2">
                            <Label htmlFor="excerpt">Excerpt (Short Description)</Label>
                            <Textarea
                                id="excerpt"
                                value={formData.excerpt || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, excerpt: e.target.value })
                                }
                                placeholder="Brief summary for list views or SEO..."
                                className="h-20"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Content (HTML)</Label>
                            <Textarea
                                id="content"
                                value={formData.content || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, content: e.target.value })
                                }
                                placeholder="<p>Enter your page content here...</p>"
                                className="h-64 font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                                Currently accepts raw HTML.
                            </p>
                        </div>

                        <DialogFooter>
                            <Button type="submit">Save Page</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
