
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useSearchParams } from "react-router-dom";
import { contactService, ContactDTO } from "@/services/contactService";
import { useToast } from "@/components/ui/use-toast"; // Assuming toast exists or using local state/console

export function useContactForm() {
    const [searchParams] = useSearchParams();
    const urlSubject = searchParams.get("subject");

    // Check if the URL subject matches one of our predefined options
    const validSubjects = ["general", "support", "quote", "partnership", "other"];
    const isPredefinedSubject = urlSubject && validSubjects.includes(urlSubject);

    const [formData, setFormData] = useState<ContactDTO>({
        name: "",
        email: "",
        phone: "",
        // If subject is predefined, use it. If it's custom (like from project detail), use 'quote'
        subject: isPredefinedSubject ? urlSubject : (urlSubject ? "quote" : "general"),
        // If subject is custom, pre-fill it into the message
        message: (!isPredefinedSubject && urlSubject) ? urlSubject + "\n\n" : "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { toast } = useToast();

    // Clear error for a field when it's modified (optional UX improvement)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSelectChange = (value: string) => {
        setFormData((prev) => ({ ...prev, subject: value }));
        if (errors.subject) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.subject;
                return newErrors;
            });
        }
    };

    const [lastSubmitted, setLastSubmitted] = useState<number>(0);
    const [honeypot, setHoneypot] = useState("");

    // Validation Schema
    const contactSchema = z.object({
        name: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
        email: z.string().email("Email không hợp lệ"),
        phone: z.string().regex(/^[0-9+\-\s()]*$/, "Số điện thoại không hợp lệ").optional().or(z.literal("")),
        subject: z.string(),
        message: z.string().min(10, "Nội dung phải có ít nhất 10 ký tự"),
    });

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Reset errors
        setErrors({});

        // 1. Anti-spam: Honeypot check
        if (honeypot) {
            console.warn("Spam detected: Honeypot filled");
            // Fake success for bots
            setSubmitStatus("success");
            return;
        }

        // 2. Anti-spam: Rate limiting (e.g., 30 seconds cooldown)
        const now = Date.now();
        if (now - lastSubmitted < 30000) {
            toast({
                title: "Thao tác quá nhanh",
                description: "Vui lòng đợi 30 giây trước khi gửi lại.",
                variant: "destructive",
            });
            return;
        }

        // 3. Validation
        const validationResult = contactSchema.safeParse(formData);
        if (!validationResult.success) {
            const formattedErrors: Record<string, string> = {};

            // Use safe access to errors array, handling both 'issues' and 'errors' properties
            const errorList = (validationResult.error as any).errors || (validationResult.error as any).issues || [];

            errorList.forEach((err: any) => {
                const field = err.path[0];
                if (field) {
                    formattedErrors[field] = err.message;
                }
            });

            setErrors(formattedErrors);

            // Still show a toast for general feedback
            toast({
                title: "Thông tin chưa chính xác",
                description: "Vui lòng kiểm tra lại các trường báo đỏ.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus("idle");

        const result = await contactService.createContact(formData);

        setIsSubmitting(false);

        if (result.success) {
            setLastSubmitted(now);
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
                variant: "default",
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
        errors,
        handleChange,
        handleSelectChange,
        submit,
        isSubmitting,
        submitStatus,
        setHoneypot
    };
}
