'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    ChevronLeft,
    Search,
    Plus,
    Star,
    Phone,
    MapPin,
    ChefHat,
    Users,
    Package,
    Truck,
    Palette,
    MoreVertical,
    X,
    Edit,
    Trash2
} from 'lucide-react';
import { VENDOR_CATEGORIES } from '@/lib/constants';

// Types
interface Vendor {
    id: string;
    name: string;
    category: string;
    phone: string;
    address: string;
    specialties: string;
    rating: number;
    price_range: string;
    active: boolean;
    notes: string;
}

// Category Icons
const categoryIcons: Record<string, React.ElementType> = {
    chef: ChefHat,
    waiter: Users,
    equipment: Package,
    ingredient: Truck,
    decoration: Palette,
};

// Mock Vendors Data
const mockVendors: Vendor[] = [
    {
        id: 'VND-001',
        name: 'Anh Minh - Đầu bếp chính',
        category: 'chef',
        phone: '0912 111 222',
        address: 'Q.Bình Thạnh, TP.HCM',
        specialties: 'Món Việt truyền thống, Hải sản',
        rating: 5,
        price_range: '2,000,000 - 3,000,000/ngày',
        active: true,
        notes: 'Đầu bếp kinh nghiệm 15 năm, chuyên tiệc đám cưới'
    },
    {
        id: 'VND-002',
        name: 'Chị Lan - Đầu bếp phụ',
        category: 'chef',
        phone: '0908 333 444',
        address: 'Q.Tân Bình, TP.HCM',
        specialties: 'Món chay, Tráng miệng',
        rating: 4,
        price_range: '1,000,000 - 1,500,000/ngày',
        active: true,
        notes: 'Chuyên làm bánh và món tráng miệng'
    },
    {
        id: 'VND-003',
        name: 'Thuê Đồ Hùng Cường',
        category: 'equipment',
        phone: '0977 555 666',
        address: '123 Lý Thường Kiệt, Q.10, TP.HCM',
        specialties: 'Bàn ghế, Bát đĩa, Lều bạt',
        rating: 5,
        price_range: '50,000 - 100,000/bộ',
        active: true,
        notes: 'Đa dạng mẫu mã, giao hàng tận nơi'
    },
    {
        id: 'VND-004',
        name: 'Chợ Bình Điền',
        category: 'ingredient',
        phone: '0933 777 888',
        address: 'Chợ Bình Điền, Q.8, TP.HCM',
        specialties: 'Hải sản tươi sống, Thịt bò',
        rating: 4,
        price_range: 'Giá chợ đầu mối',
        active: true,
        notes: 'Lấy hàng từ 4h sáng, chất lượng tốt'
    },
    {
        id: 'VND-005',
        name: 'Team phục vụ Hoàng Anh',
        category: 'waiter',
        phone: '0909 999 000',
        address: 'Q.Gò Vấp, TP.HCM',
        specialties: 'Phục vụ tiệc cưới, tiệc VIP',
        rating: 5,
        price_range: '300,000 - 500,000/người/ngày',
        active: true,
        notes: 'Team 10 người, đồng phục chuyên nghiệp'
    },
    {
        id: 'VND-006',
        name: 'Trang Trí Hoa Hồng',
        category: 'decoration',
        phone: '0988 111 333',
        address: 'Q.Phú Nhuận, TP.HCM',
        specialties: 'Hoa tươi, Backdrop, Bàn Gallery',
        rating: 4,
        price_range: '5,000,000 - 15,000,000/tiệc',
        active: true,
        notes: 'Thiết kế theo theme, có sẵn mẫu'
    },
];

export default function VendorPage() {
    const [vendors, setVendors] = useState(mockVendors);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const filteredVendors = vendors.filter(vendor => {
        const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.specialties.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !categoryFilter || vendor.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const getCategoryInfo = (categoryId: string) => {
        const cat = Object.values(VENDOR_CATEGORIES).find(c => c.id === categoryId);
        return cat || { name: categoryId, icon: '📦' };
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
            />
        ));
    };

    return (
        <main className="min-h-screen bg-background-light">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="section-container">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <ChevronLeft className="w-5 h-5 text-text-secondary" />
                            <span className="text-text-secondary">Quay lại</span>
                        </Link>

                        <h1 className="text-lg font-semibold text-primary">Quản lý Vendor</h1>

                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-full text-sm font-medium hover:bg-accent-hover transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Thêm vendor</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="section-container py-8">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm theo tên, chuyên môn..."
                            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-accent focus:outline-none"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setCategoryFilter(null)}
                            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${!categoryFilter ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:bg-gray-100'
                                }`}
                        >
                            Tất cả
                        </button>
                        {Object.values(VENDOR_CATEGORIES).map(cat => {
                            const Icon = categoryIcons[cat.id] || Package;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategoryFilter(cat.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${categoryFilter === cat.id ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {cat.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Vendor Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVendors.map((vendor, index) => {
                        const categoryInfo = getCategoryInfo(vendor.category);
                        const CategoryIcon = categoryIcons[vendor.category] || Package;

                        return (
                            <motion.div
                                key={vendor.id}
                                className="bg-white rounded-2xl p-6 hover:shadow-apple-lg transition-all cursor-pointer"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setSelectedVendor(vendor)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                                            <span className="text-xl">{categoryInfo.icon}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-primary line-clamp-1">{vendor.name}</h3>
                                            <p className="text-sm text-text-secondary">{categoryInfo.name}</p>
                                        </div>
                                    </div>

                                    <button
                                        className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                                        onClick={(e) => { e.stopPropagation(); }}
                                    >
                                        <MoreVertical className="w-4 h-4 text-text-secondary" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-1 mb-3">
                                    {renderStars(vendor.rating)}
                                </div>

                                <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                                    {vendor.specialties}
                                </p>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-text-secondary">
                                        <Phone className="w-4 h-4" />
                                        {vendor.phone}
                                    </div>
                                    <div className="flex items-center gap-2 text-text-secondary">
                                        <MapPin className="w-4 h-4" />
                                        <span className="truncate">{vendor.address}</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-sm font-medium text-accent">{vendor.price_range}</p>
                                </div>
                            </motion.div>
                        );
                    })}

                    {filteredVendors.length === 0 && (
                        <div className="col-span-full text-center py-12 text-text-secondary">
                            Không tìm thấy vendor nào
                        </div>
                    )}
                </div>
            </div>

            {/* Vendor Detail Modal */}
            <AnimatePresence>
                {selectedVendor && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedVendor(null)}
                    >
                        <motion.div
                            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
                                            <span className="text-2xl">{getCategoryInfo(selectedVendor.category).icon}</span>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-primary">{selectedVendor.name}</h2>
                                            <p className="text-text-secondary">{getCategoryInfo(selectedVendor.category).name}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedVendor(null)}
                                        className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
                                    >
                                        <X className="w-5 h-5 text-text-secondary" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-1 mb-6">
                                    {renderStars(selectedVendor.rating)}
                                    <span className="ml-2 text-sm text-text-secondary">({selectedVendor.rating}/5)</span>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm text-text-secondary mb-1">Chuyên môn</p>
                                        <p className="font-medium text-primary">{selectedVendor.specialties}</p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm text-text-secondary mb-1">Số điện thoại</p>
                                        <a href={`tel:${selectedVendor.phone}`} className="font-medium text-accent">
                                            {selectedVendor.phone}
                                        </a>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm text-text-secondary mb-1">Địa chỉ</p>
                                        <p className="font-medium text-primary">{selectedVendor.address}</p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm text-text-secondary mb-1">Giá</p>
                                        <p className="font-medium text-primary">{selectedVendor.price_range}</p>
                                    </div>

                                    {selectedVendor.notes && (
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <p className="text-sm text-text-secondary mb-1">Ghi chú</p>
                                            <p className="font-medium text-primary">{selectedVendor.notes}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <a
                                        href={`tel:${selectedVendor.phone}`}
                                        className="flex-1 btn-accent flex items-center justify-center gap-2"
                                    >
                                        <Phone className="w-5 h-5" />
                                        Liên hệ
                                    </a>
                                    <button className="flex-1 btn-outline flex items-center justify-center gap-2">
                                        <Edit className="w-5 h-5" />
                                        Chỉnh sửa
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
