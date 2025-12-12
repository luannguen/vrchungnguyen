import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { serviceService, Service, CreateServiceDTO } from "@/services/serviceService";
import { slugify } from "@/lib/utils"; // Assuming utility exists, else will define locally or handle simple slug

const serviceSchema = z.object({
    title: z.string().min(2, "Tiêu đề phải có ít nhất 2 ký tự"),
    slug: z.string().min(2, "Slug phải có ít nhất 2 ký tự"),
    description: z.string().optional(),
    content: z.string().optional(),
    icon: z.string().optional(),
    image_url: z.string().optional(),
    is_active: z.boolean().default(true),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
    initialData?: Service | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ServiceForm({ initialData, onSuccess, onCancel }: ServiceFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            title: "",
            slug: "",
            description: "",
            content: "",
            icon: "",
            image_url: "",
            is_active: true,
        },
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                title: initialData.title,
                slug: initialData.slug,
                description: initialData.description || "",
                content: initialData.content || "",
                icon: initialData.icon || "",
                image_url: initialData.image_url || "",
                is_active: initialData.is_active,
            });
        }
    }, [initialData, form]);

    // Auto-generate slug from title if slug is empty
    const title = form.watch("title");
    useEffect(() => {
        if (!initialData && title && !form.getValues("slug")) {
            // Simple slugify fallback if utils missing
            const slug = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
            form.setValue("slug", slug);
        }
    }, [title, initialData, form]);

    const onSubmit = async (data: ServiceFormValues) => {
        setIsLoading(true);
        try {
            if (initialData) {
                const result = await serviceService.updateService(initialData.id, data);
                if (result.success) {
                    toast({ title: "Thành công", description: "Cập nhật dịch vụ thành công" });
                    onSuccess();
                } else {
                    toast({ variant: "destructive", title: "Lỗi", description: result.error.message });
                }
            } else {
                const result = await serviceService.createService(data as CreateServiceDTO);
                if (result.success) {
                    toast({ title: "Thành công", description: "Tạo dịch vụ mới thành công" });
                    onSuccess();
                } else {
                    toast({ variant: "destructive", title: "Lỗi", description: result.error.message });
                }
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Lỗi", description: error.message || "Đã có lỗi xảy ra" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tiêu đề dịch vụ</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nhập tiêu đề..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Đường dẫn (Slug)</FormLabel>
                                <FormControl>
                                    <Input placeholder="duong-dan-dich-vu" {...field} />
                                </FormControl>
                                <FormDescription>Đường dẫn URL của dịch vụ (duy nhất).</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mô tả ngắn</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Mô tả ngắn về dịch vụ..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nội dung chi tiết (HTML)</FormLabel>
                            <FormControl>
                                <Textarea className="min-h-[200px] font-mono text-sm" placeholder="<p>Nội dung chi tiết...</p>" {...field} />
                            </FormControl>
                            <FormDescription>Hỗ trợ định dạng HTML cơ bản.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Icon (Lucide Name)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Wrench, Cog, ..." {...field} />
                                </FormControl>
                                <FormDescription>Tên icon từ thư viện Lucide React.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="image_url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ảnh đại diện (URL)</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Hiển thị</FormLabel>
                                <FormDescription>
                                    Bật để hiển thị dịch vụ này trên trang web.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Hủy
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Cập nhật" : "Tạo mới"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
