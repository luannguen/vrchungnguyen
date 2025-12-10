export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    username: string | null
                    full_name: string | null
                    avatar_url: string | null
                    website: string | null
                    phone: string | null
                    bio: string | null
                    role: string | null // derived in logic
                    updated_at: string | null
                    created_at: string | null
                }
                Insert: {
                    id: string
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    website?: string | null
                    phone?: string | null
                    bio?: string | null
                    updated_at?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    website?: string | null
                    phone?: string | null
                    bio?: string | null
                    updated_at?: string | null
                    created_at?: string | null
                }
            }
            products: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    description: string | null
                    category_id: string | null
                    image_url: string | null
                    gallery_images: string[] | null
                    features: string[] | null
                    specifications: Json | null
                    price: string | null
                    is_new: boolean | null
                    is_bestseller: boolean | null
                    is_published: boolean | null
                    view_count: number | null
                    metadata: Json | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    description?: string | null
                    category_id?: string | null
                    image_url?: string | null
                    gallery_images?: string[] | null
                    features?: string[] | null
                    specifications?: Json | null
                    price?: string | null
                    is_new?: boolean | null
                    is_bestseller?: boolean | null
                    is_published?: boolean | null
                    view_count?: number | null
                    metadata?: Json | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    description?: string | null
                    category_id?: string | null
                    image_url?: string | null
                    gallery_images?: string[] | null
                    features?: string[] | null
                    specifications?: Json | null
                    price?: string | null
                    is_new?: boolean | null
                    is_bestseller?: boolean | null
                    is_published?: boolean | null
                    view_count?: number | null
                    metadata?: Json | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            categories: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    type: string
                    description: string | null
                    parent_id: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    type: string
                    description?: string | null
                    parent_id?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    type?: string
                    description?: string | null
                    parent_id?: string | null
                    created_at?: string | null
                }
            }
            roles: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    created_at?: string
                }
            }
            user_roles: {
                Row: {
                    user_id: string
                    role_id: string
                    created_at: string
                }
                Insert: {
                    user_id: string
                    role_id: string
                    created_at?: string
                }
                Update: {
                    user_id?: string
                    role_id?: string
                    created_at?: string
                }
            }
            // Add other tables like permissions, role_permissions, news, projects, pages...
            // (kept shortened for brevity, can expand later as needed)
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            is_admin: {
                Args: Record<PropertyKey, never>
                Returns: boolean
            }
            has_permission: {
                Args: {
                    permission_code: string
                }
                Returns: boolean
            }
        }
        Enums: {
            [_ in never]: never
        }
    }
}
