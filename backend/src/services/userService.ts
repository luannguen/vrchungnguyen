import { supabase } from '../supabase';
import { Result, success, failure, ErrorCodes, UserDTO } from '../components/data/types';

export const userService = {
    /**
     * Get user profile by ID
     */
    getProfile: async (userId: string): Promise<Result<UserDTO>> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) return failure(error.message, ErrorCodes.SERVER_ERROR);
            if (!data) return failure('Profile not found', ErrorCodes.NOT_FOUND);

            // Re-fetch email from auth user if needed, but typically profiles should have it if synced
            // For now, let's assume we might need to get email from auth.getUser() if not in profiles
            // But usually we just return what's in profiles.

            // However, UserDTO expects specific fields. 
            // In our schema, we have id, full_name, role, etc.
            // We might need to join or just use what we have.

            // Let's get the auth user email to be sure
            const { data: authUser } = await supabase.auth.getUser();
            const profileData = data as any;

            return success({
                id: profileData.id,
                email: authUser.user?.email || '', // Best effort
                role: profileData.role || 'user',
                fullName: profileData.full_name,
                avatarUrl: profileData.avatar_url,
                phoneNumber: profileData.phone_number,
                location: profileData.location,
                bio: profileData.bio,
                socialLinks: profileData.social_links,
            });
        } catch (err: any) {
            return failure(err.message, ErrorCodes.SERVER_ERROR);
        }
    },

    /**
     * Update user profile
     */
    updateProfile: async (userId: string, updates: Partial<UserDTO>): Promise<Result<void>> => {
        try {
            console.log("userService.updateProfile calling with:", userId, updates);
            const updatePayload: any = {};
            if (updates.fullName !== undefined) updatePayload.full_name = updates.fullName;
            if (updates.avatarUrl !== undefined) updatePayload.avatar_url = updates.avatarUrl;

            // Note: Role is usually updated via RBAC service, not here by user themselves.
            if (updates.phoneNumber !== undefined) updatePayload.phone_number = updates.phoneNumber;
            if (updates.location !== undefined) updatePayload.location = updates.location;
            if (updates.bio !== undefined) updatePayload.bio = updates.bio;
            if (updates.socialLinks !== undefined) updatePayload.social_links = updates.socialLinks;

            console.log("userService.updateProfile payload:", updatePayload);

            const { error } = await supabase
                .from('profiles')
                // @ts-ignore - Supabase type inference for Update is failing
                .update(updatePayload)
                .eq('id', userId);

            if (error) {
                console.error("Supabase update error:", error);
                return failure(error.message, ErrorCodes.SERVER_ERROR);
            }
            return success(undefined);
        } catch (err: any) {
            console.error("userService.updateProfile exception:", err);
            return failure(err.message, ErrorCodes.SERVER_ERROR);
        }
    },

    /**
     * Upload Avatar
     */
    /**
     * Upload Avatar
     */
    uploadAvatar: async (userId: string, file: File): Promise<Result<string>> => {
        try {
            // Validate file size (e.g., max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                return failure("File size too large. Max 2MB.", ErrorCodes.VALIDATION_ERROR);
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                return failure("Invalid file type. Only images are allowed.", ErrorCodes.VALIDATION_ERROR);
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`; // Upload to root of 'avatars' bucket or folder structure

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    upsert: true
                });

            if (uploadError) return failure(uploadError.message, ErrorCodes.SERVER_ERROR);

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

            return success(data.publicUrl);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.SERVER_ERROR);
        }
    },

    /**
     * Get all users (Admin only)
     * Fetches from profiles table.
     */
    getAllUsers: async (): Promise<Result<UserDTO[]>> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) return failure(error.message, ErrorCodes.SERVER_ERROR);

            const users: UserDTO[] = (data as any[]).map(profile => ({
                id: profile.id,
                email: profile.email || '', // Assuming email is synced to profile
                role: profile.role || 'user',
                fullName: profile.full_name,
                avatarUrl: profile.avatar_url,
            }));

            return success(users);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.SERVER_ERROR);
        }
    }
};
