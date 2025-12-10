
import { useState } from "react";
import { contactAPI, ContactDTO } from "@/components/data/services/contactService";
import { useToast } from "@/components/ui/use-toast"; // Assuming toast exists or using local state/console

export function useContactForm() {
    const [formData, setFormData] = useState<ContactDTO>({
        name: "",
        email: "",
        phone: "",
        subject: "general",
        message: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
    const { toast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData((prev) => ({ ...prev, subject: value }));
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus("idle");

        const result = await contactAPI.submit(formData);

        setIsSubmitting(false);

        if (result.success) {
            setSubmitStatus("success");
            setFormData({
                name: "",
                email: "",
                phone: "",
                subject: "general",
                message: "",
            });
            toast({
                title: "Thành công",
                description: "Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất!",
                variant: "default", // or "success" if configured
            });
        } else {
            setSubmitStatus("error");
            toast({
                title: "Lỗi",
                description: result.error.message,
                variant: "destructive",
            });
        }
    };

    return {
        formData,
        handleChange,
        handleSelectChange,
        submit,
        isSubmitting,
        submitStatus
    };
}
