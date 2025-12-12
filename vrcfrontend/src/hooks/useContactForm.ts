
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useSearchParams } from "react-router-dom";
import { contactService, ContactDTO } from "@/services/contactService";
import { useToast } from "@/components/ui/use-toast"; // Assuming toast exists or using local state/console

export function useContactForm() {
    const [searchParams] = useSearchParams();
    const urlSubject = searchParams.get("subject");
    const productId = searchParams.get("product");

    // Check if the URL subject matches one of our predefined options
    const validSubjects = ["general", "support", "quote", "partnership", "other"];
    const isPredefinedSubject = urlSubject && validSubjects.includes(urlSubject);

    // Determine default subject
    let defaultSubject = "general";
    if (isPredefinedSubject) defaultSubject = urlSubject;
    else if (productId) defaultSubject = "quote";
    else if (urlSubject) defaultSubject = "quote";

    // Determine default message
    let defaultMessage = "";
    if (productId) {
        defaultMessage = `Tôi quan tâm đến sản phẩm có ID: ${productId}.\nVui lòng tư vấn thêm cho tôi.`;
    } else if (!isPredefinedSubject && urlSubject) {
        defaultMessage = urlSubject + "\n\n";
    }

    const [formData, setFormData] = useState<ContactDTO>({
        name: "",
        email: "",
        phone: "",
        subject: defaultSubject,
        message: defaultMessage,
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
            const errorList = validationResult.error.issues;

            errorList.forEach((err) => {
                const field = err.path[0];
                if (field) {
                    formattedErrors[field.toString()] = err.message;
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

        try {
            const result = await contactService.createContact(formData);

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
                // Explicitly cast to failure type or any since we know it failed
                const failure = result as any;
                const errorMessage = failure.error?.message || "Gửi liên hệ thất bại (mã lỗi không xác định)";

                toast({
                    title: "Lỗi",
                    description: errorMessage,
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Submission error:", error);
            setSubmitStatus("error");
            toast({
                title: "Lỗi",
                description: "Đã xảy ra lỗi khi gửi form. Vui lòng thử lại sau.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
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
