
import { Result, success, failure, ErrorCodes } from "../types";

export interface ContactDTO {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
}

export const contactAPI = {
    submit: async (data: ContactDTO): Promise<Result<void>> => {
        try {
            // Validate data
            if (!data.name || !data.email || !data.message) {
                return failure('Vui lòng điền các trường bắt buộc', ErrorCodes.VALIDATION_ERROR);
            }

            // Simulate API call delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            console.log("Contact form submitted:", data);

            // Return success
            return success(undefined);
        } catch (error: any) {
            console.error("Contact service error:", error);
            return failure(
                error.message || 'Có lỗi xảy ra khi gửi liên hệ',
                ErrorCodes.SERVER_ERROR,
                error
            );
        }
    }
};
