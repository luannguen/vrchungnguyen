import { useFAQs } from "@/hooks/useContent";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2 } from "lucide-react";

interface FAQSectionProps {
    category?: string;
    title?: string;
}

const FAQSection = ({ category, title = "Câu hỏi thường gặp" }: FAQSectionProps) => {
    const { faqs, isLoading } = useFAQs(category);

    if (isLoading) {
        return (
            <section className="container mx-auto px-4 pb-24">
                <div className="max-w-3xl mx-auto flex justify-center">
                    <Loader2 className="animate-spin h-8 w-8 text-primary" />
                </div>
            </section>
        );
    }

    if (faqs.length === 0) return null;

    return (
        <section className="container mx-auto px-4 pb-24">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">{title}</h2>
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={faq.id} value={`item-${index}`} className="border rounded-xl px-4 shadow-sm bg-white">
                            <AccordionTrigger className="hover:no-underline hover:text-primary font-medium text-lg text-left">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 leading-relaxed">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
};

export default FAQSection;
