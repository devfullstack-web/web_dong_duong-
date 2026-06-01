import type { LocalizedText } from './i18n';
import type {
    ContactStatus,
    NewsStatus,
    ProductStatus,
    ProjectStatus,
} from '@/constants/content';

export interface NewsArticle {
    id: string;
    slug: string;
    title: string;
    summary: string;
    desc?: string; // Legacy field for frontend compatibility
    content?: string;
    published_at?: string;
    date?: string; // Legacy field for frontend compatibility
    readTime?: string; // Legacy field for frontend compatibility
    image?: string;
    image_url: string;
    category_id: string;
    category?: string;
    author_id: string;
    author?: string;
    status: NewsStatus;
    featured?: boolean; // For highlighted news on site
}

export interface Product {
    id: string;
    slug: string;
    name: string;
    name_localized?: LocalizedText | null;
    category_id: string;
    category?: string;
    category_localized?: LocalizedText | null;
    status: ProductStatus;
    price: string;
    stock: string;
    image?: string;
    image_url: string;
    sku: string;
    is_featured?: boolean;
    tech_specs?: Record<string, unknown>;
    features?: string[];
    gallery?: string[];
    tech_summary?: string;
    catalog_url?: string;
    warranty?: string;
    origin?: string;
    availability?: string;
    delivery_info?: string;
}

export interface Project {
    id: string;
    slug: string;
    name: string;
    description: string;
    client_name?: string;
    start_date?: string;
    end_date?: string;
    category_id: string;
    category?: string;
    image?: string;
    image_url: string;
    status: ProjectStatus;
}

export interface Contact {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    message: string;
    status: ContactStatus;
    created_at: string;
}

export interface User {
    id: string;
    username: string;
    email?: string;
    full_name?: string;
    fullName?: string; // CamelCase from API
    phone?: string;
    is_active?: boolean;
    isActive?: boolean; // CamelCase from API
    is_locked?: boolean;
    isLocked?: boolean; // CamelCase from API
    avatarUrl?: string; // Image URL for profile
    role?: string; // Legacy field
    roles?: Role[]; // For list/detail views
    permissions?: string[]; // Flattened permission strings
    created_at?: string;
    createdAt?: string; // CamelCase from API
    updated_at?: string;
    updatedAt?: string; // CamelCase from API
    deleted_at?: string | null;
    deletedAt?: string | null; // CamelCase from API
}

export interface Module {
    id: string;
    code: string;
    name: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
}

export interface Permission {
    id: string;
    moduleId: string;
    roleId: string;
    module?: Module;
    canView: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
}

export interface Role {
    id: string;
    code: string;
    name: string;
    description: string;
    is_super?: boolean;
    permissions?: Permission[];
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
}
