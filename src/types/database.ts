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
            users: {
                Row: {
                    id: string
                    email: string
                    // We don't expose password_hash to the frontend usually, but for completeness of the type definition based on SQL
                    role: 'member' | 'admin'
                    subscription_status: 'active' | 'inactive' | 'cancelled'
                    subscription_expires_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    email: string
                    password_hash: string
                    role?: 'member' | 'admin'
                    subscription_status?: 'active' | 'inactive' | 'cancelled'
                    subscription_expires_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    password_hash?: string
                    role?: 'member' | 'admin'
                    subscription_status?: 'active' | 'inactive' | 'cancelled'
                    subscription_expires_at?: string | null
                    created_at?: string
                }
            }
            categories: {
                Row: {
                    id: number
                    name: string
                    slug: string
                }
                Insert: {
                    id?: number
                    name: string
                    slug: string
                }
                Update: {
                    id?: number
                    name?: string
                    slug?: string
                }
            }
            sound_effects: {
                Row: {
                    id: number
                    name: string
                    description: string | null
                    file_url: string
                    tags: string[] | null
                    category_id: number | null
                    created_at: string
                }
                Insert: {
                    id?: number
                    name: string
                    description?: string | null
                    file_url: string
                    tags?: string[] | null
                    category_id?: number | null
                    created_at?: string
                }
                Update: {
                    id?: number
                    name?: string
                    description?: string | null
                    file_url?: string
                    tags?: string[] | null
                    category_id?: number | null
                    created_at?: string
                }
            }
            banners: {
                Row: {
                    id: number
                    title: string
                    image_url: string
                    link_target: string | null
                }
                Insert: {
                    id?: number
                    title: string
                    image_url: string
                    link_target?: string | null
                }
                Update: {
                    id?: number
                    title?: string
                    image_url?: string
                    link_target?: string | null
                }
            }
        }
    }
}
