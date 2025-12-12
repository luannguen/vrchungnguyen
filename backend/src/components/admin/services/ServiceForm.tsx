import { useState, useEffect, useMemo } from "react";
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
import { slugify } from "@/lib/utils";
import { useTranslation } from 'react-i18next';

type ServiceFormValues = {
    title: string;
    slug: string;
    description?: string;
    content?: string;
    icon?: string;
    image_url?: string;
    is_active: boolean;
};

interface ServiceFormProps {
    initialData?: Service | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ServiceForm({ initialData, onSuccess, onCancel }: ServiceFormProps) {
    const { toast } = useToast();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    const serviceSchema = useMemo(() => z.object({
        title: z.string().min(2, t('error_min_length', { count: 2 })),
        slug: z.string().min(2, t('error_min_length', { count: 2 })),
        description: z.string().optional(),
        content: z.string().optional(),
        icon: z.string().optional(),
        image_url: z.string().optional(),
        is_active: z.boolean(),
    }), [t]);

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
                is_active: initialData.is_active ?? true,
            });
        }
    }, [initialData, form]);

    // Auto-generate slug from title if slug is empty
    const title = form.watch("title");
    useEffect(() => {
        if (!initialData && title && !form.getValues("slug")) {
            const slug = slugify(title);
            form.setValue("slug", slug);
        }
    }, [title, initialData, form]);

    const onSubmit = async (data: ServiceFormValues) => {
        setIsLoading(true);
        try {
            if (initialData) {
                const result = await serviceService.updateService(initialData.id, data);
                if (result.success) {
                    toast({ title: t('success'), description: t('service_update_success') });
                    onSuccess();
                } else {
                    toast({ variant: "destructive", title: t('error'), description: result.error || t('error_occurred') });
                }
            } else {
                const result = await serviceService.createService(data as CreateServiceDTO);
                if (result.success) {
                    toast({ title: t('success'), description: t('service_create_success') });
                    onSuccess();
                } else {
                    toast({ variant: "destructive", title: t('error'), description: result.error || t('error_occurred') });
                }
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: t('error'), description: error.message || t('error_occurred') });
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
                                <FormLabel>{t('service_title')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('service_title_placeholder')} {...field} />
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
                                <FormLabel>{t('slug')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('slug_placeholder')} {...field} />
                                </FormControl>
                                <FormDescription>{t('slug_desc')}</FormDescription>
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
                            <FormLabel>{t('short_description')}</FormLabel>
                            <FormControl>
                                <Textarea placeholder={t('short_desc_placeholder')} {...field} />
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
                            <FormLabel>{t('content_html')}</FormLabel>
                            <FormControl>
                                <Textarea className="min-h-[200px] font-mono text-sm" placeholder={t('content_placeholder')} {...field} />
                            </FormControl>
                            <FormDescription>{t('html_support')}</FormDescription>
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
                                <FormLabel>{t('icon_lucide')}</FormLabel>
                                <FormControl>
                                    <Input placeholder="Wrench, Cog, ..." {...field} />
                                </FormControl>
                                <FormDescription>{t('icon_desc')}</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="image_url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('image_url')}</FormLabel>
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
                                <FormLabel className="text-base">{t('is_visible')}</FormLabel>
                                <FormDescription>
                                    {t('is_visible_desc')}
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
                        {t('cancel')}
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? t('save') : t('create_new')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
