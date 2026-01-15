'use client';

import { motion } from 'framer-motion';
import {
    FolderOpen,
    FileText,
    ShoppingCart,
    Calendar,
    Users,
    Wallet,
    Search,
    Plus,
    RefreshCw
} from 'lucide-react';

interface EmptyStateProps {
    icon?: 'folder' | 'file' | 'cart' | 'calendar' | 'users' | 'wallet' | 'search';
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

const iconMap = {
    folder: FolderOpen,
    file: FileText,
    cart: ShoppingCart,
    calendar: Calendar,
    users: Users,
    wallet: Wallet,
    search: Search,
};

export function EmptyState({
    icon = 'folder',
    title,
    description,
    action
}: EmptyStateProps) {
    const Icon = iconMap[icon];

    return (
        <motion.div
            className="flex flex-col items-center justify-center py-16 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mb-6">
                <Icon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-gray-500 text-center max-w-sm mb-6">
                    {description}
                </p>
            )}
            {action && (
                <button
                    onClick={action.onClick}
                    className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    {action.label}
                </button>
            )}
        </motion.div>
    );
}

// Error state component
interface ErrorStateProps {
    title?: string;
    message: string;
    onRetry?: () => void;
}

export function ErrorState({
    title = 'Đã xảy ra lỗi',
    message,
    onRetry
}: ErrorStateProps) {
    return (
        <motion.div
            className="flex flex-col items-center justify-center py-16 px-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                {title}
            </h3>
            <p className="text-sm text-gray-500 text-center max-w-sm mb-6">
                {message}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Thử lại
                </button>
            )}
        </motion.div>
    );
}

// No search results
interface NoResultsProps {
    query: string;
    onClear?: () => void;
}

export function NoResults({ query, onClear }: NoResultsProps) {
    return (
        <motion.div
            className="flex flex-col items-center justify-center py-12 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
                Không tìm thấy kết quả
            </h3>
            <p className="text-sm text-gray-500 text-center mb-4">
                Không có kết quả phù hợp với "{query}"
            </p>
            {onClear && (
                <button
                    onClick={onClear}
                    className="text-sm text-accent hover:text-accent/80 font-medium"
                >
                    Xóa bộ lọc
                </button>
            )}
        </motion.div>
    );
}

// Success state
interface SuccessStateProps {
    title: string;
    message?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function SuccessState({ title, message, action }: SuccessStateProps) {
    return (
        <motion.div
            className="flex flex-col items-center justify-center py-12 px-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
        >
            <motion.div
                className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-green-200"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', damping: 10 }}
            >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <motion.path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                    />
                </svg>
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                {title}
            </h3>
            {message && (
                <p className="text-sm text-gray-500 text-center max-w-sm mb-6">
                    {message}
                </p>
            )}
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                    {action.label}
                </button>
            )}
        </motion.div>
    );
}
