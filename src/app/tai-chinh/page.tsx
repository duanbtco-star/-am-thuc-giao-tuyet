'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    ChevronLeft,
    ChevronDown,
    Plus,
    Search,
    Calendar,
    TrendingUp,
    TrendingDown,
    Wallet,
    ArrowUpCircle,
    ArrowDownCircle,
    FileText,
    Filter,
    Download,
    X,
    DollarSign,
    ShoppingBag,
    Truck,
    Users as UsersIcon,
    Package
} from 'lucide-react';
import { formatCurrency, formatDate, generateId } from '@/lib/utils';
import { FinanceExcelExport } from '@/components/ExcelExport';

// Types
interface Transaction {
    id: string;
    order_id: string | null;
    order_name: string | null;
    date: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    payment_method: string;
    description: string;
    vendor_name?: string;
}

// Categories với icons
const incomeCategories = [
    { id: 'deposit', name: 'Tiền cọc', icon: Wallet },
    { id: 'payment', name: 'Thanh toán', icon: DollarSign },
    { id: 'other_income', name: 'Thu khác', icon: TrendingUp },
];

const expenseCategories = [
    { id: 'ingredient', name: 'Nguyên liệu', icon: ShoppingBag },
    { id: 'labor', name: 'Nhân công', icon: UsersIcon },
    { id: 'equipment', name: 'Thuê thiết bị', icon: Package },
    { id: 'transport', name: 'Vận chuyển', icon: Truck },
    { id: 'other_expense', name: 'Chi khác', icon: TrendingDown },
];

const paymentMethods = [
    { id: 'cash', name: 'Tiền mặt' },
    { id: 'transfer', name: 'Chuyển khoản' },
    { id: 'momo', name: 'MoMo' },
    { id: 'zalopay', name: 'ZaloPay' },
];

// Mock Orders for dropdown
const mockOrders = [
    { id: 'ORD-20260115-A1X', name: 'Đám cưới - Nguyễn Văn An' },
    { id: 'ORD-20260114-B2Y', name: 'Thôi nôi - Trần Thị Bích' },
    { id: 'ORD-20260113-C3Z', name: 'Đám hỏi - Lê Văn Cường' },
];

// Mock Transactions Data
const initialTransactions: Transaction[] = [
    {
        id: 'TXN-001',
        order_id: 'ORD-20260115-A1X',
        order_name: 'Đám cưới - Nguyễn Văn An',
        date: '2026-01-14',
        type: 'income',
        category: 'deposit',
        amount: 20000000,
        payment_method: 'transfer',
        description: 'Khách Nguyễn Văn An đặt cọc đơn hàng đám cưới',
    },
    {
        id: 'TXN-002',
        order_id: 'ORD-20260115-A1X',
        order_name: 'Đám cưới - Nguyễn Văn An',
        date: '2026-01-14',
        type: 'expense',
        category: 'equipment',
        amount: 5000000,
        payment_method: 'cash',
        description: 'Đặt thuê bàn ghế cho đơn hàng đám cưới',
        vendor_name: 'Thuê Đồ Hùng Cường',
    },
    {
        id: 'TXN-003',
        order_id: 'ORD-20260114-B2Y',
        order_name: 'Thôi nôi - Trần Thị Bích',
        date: '2026-01-13',
        type: 'income',
        category: 'deposit',
        amount: 5000000,
        payment_method: 'momo',
        description: 'Khách Trần Thị Bích đặt cọc tiệc thôi nôi',
    },
    {
        id: 'TXN-004',
        order_id: 'ORD-20260115-A1X',
        order_name: 'Đám cưới - Nguyễn Văn An',
        date: '2026-01-13',
        type: 'expense',
        category: 'ingredient',
        amount: 8000000,
        payment_method: 'transfer',
        description: 'Mua nguyên liệu tươi sống cho đơn hàng đám cưới',
        vendor_name: 'Chợ Bình Điền',
    },
    {
        id: 'TXN-005',
        order_id: 'ORD-20260113-C3Z',
        order_name: 'Đám hỏi - Lê Văn Cường',
        date: '2026-01-12',
        type: 'income',
        category: 'deposit',
        amount: 10000000,
        payment_method: 'transfer',
        description: 'Khách Lê Văn Cường đặt cọc tiệc đám hỏi',
    },
    {
        id: 'TXN-006',
        order_id: null,
        order_name: null,
        date: '2026-01-12',
        type: 'expense',
        category: 'labor',
        amount: 3000000,
        payment_method: 'cash',
        description: 'Trả lương đầu bếp phụ tuần 2 tháng 1',
        vendor_name: 'Anh Minh',
    },
    {
        id: 'TXN-007',
        order_id: 'ORD-20260114-B2Y',
        order_name: 'Thôi nôi - Trần Thị Bích',
        date: '2026-01-11',
        type: 'expense',
        category: 'transport',
        amount: 500000,
        payment_method: 'cash',
        description: 'Chi phí vận chuyển nguyên liệu',
    },
];

export default function FinancePage() {
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // New transaction form
    const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
        type: 'income',
        date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
    });

    // Calculations
    const filteredTransactions = useMemo(() => {
        return transactions.filter(txn => {
            const matchesType = typeFilter === 'all' || txn.type === typeFilter;
            const matchesSearch = txn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                txn.order_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                txn.category.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDateRange = (!dateRange.start || txn.date >= dateRange.start) &&
                (!dateRange.end || txn.date <= dateRange.end);
            return matchesType && matchesSearch && matchesDateRange;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, typeFilter, searchTerm, dateRange]);

    const summary = useMemo(() => {
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const profit = totalIncome - totalExpense;

        return { totalIncome, totalExpense, profit };
    }, [transactions]);

    const getCategoryInfo = (type: 'income' | 'expense', categoryId: string) => {
        const categories = type === 'income' ? incomeCategories : expenseCategories;
        return categories.find(c => c.id === categoryId) || { name: categoryId, icon: FileText };
    };

    const handleAddTransaction = () => {
        if (!newTransaction.category || !newTransaction.amount || !newTransaction.description) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }

        const order = mockOrders.find(o => o.id === newTransaction.order_id);

        const transaction: Transaction = {
            id: `TXN-${generateId()}`,
            order_id: newTransaction.order_id || null,
            order_name: order?.name || null,
            date: newTransaction.date || new Date().toISOString().split('T')[0],
            type: newTransaction.type as 'income' | 'expense',
            category: newTransaction.category,
            amount: newTransaction.amount,
            payment_method: newTransaction.payment_method || 'cash',
            description: newTransaction.description,
            vendor_name: newTransaction.vendor_name,
        };

        setTransactions([transaction, ...transactions]);
        setShowAddModal(false);
        setNewTransaction({
            type: 'income',
            date: new Date().toISOString().split('T')[0],
            payment_method: 'cash',
        });
    };

    return (
        <main className="min-h-screen bg-background-light">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
                <div className="section-container">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <ChevronLeft className="w-5 h-5 text-text-secondary" />
                            <span className="text-text-secondary">Quay lại</span>
                        </Link>

                        <h1 className="text-lg font-semibold text-primary">Quản lý tài chính</h1>

                        <div className="flex items-center gap-2">
                            <FinanceExcelExport transactions={filteredTransactions} />
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-full text-sm font-medium hover:bg-accent-hover transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Thêm giao dịch</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="section-container py-8">
                {/* Summary Cards */}
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                    <motion.div
                        className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                <ArrowUpCircle className="w-6 h-6" />
                            </div>
                            <span className="text-white/80">Tổng thu</span>
                        </div>
                        <p className="text-3xl font-bold">{formatCurrency(summary.totalIncome)}</p>
                    </motion.div>

                    <motion.div
                        className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                <ArrowDownCircle className="w-6 h-6" />
                            </div>
                            <span className="text-white/80">Tổng chi</span>
                        </div>
                        <p className="text-3xl font-bold">{formatCurrency(summary.totalExpense)}</p>
                    </motion.div>

                    <motion.div
                        className={`bg-gradient-to-br ${summary.profit >= 0 ? 'from-blue-500 to-indigo-600' : 'from-orange-500 to-red-600'} rounded-2xl p-6 text-white`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <span className="text-white/80">Lợi nhuận</span>
                        </div>
                        <p className="text-3xl font-bold">{formatCurrency(summary.profit)}</p>
                    </motion.div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-4 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm theo mô tả, đơn hàng..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-accent"
                            />
                        </div>

                        {/* Type Filter */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setTypeFilter('all')}
                                className={`px-4 py-2 rounded-xl font-medium transition-all ${typeFilter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                                    }`}
                            >
                                Tất cả
                            </button>
                            <button
                                onClick={() => setTypeFilter('income')}
                                className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${typeFilter === 'income' ? 'bg-green-500 text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                                    }`}
                            >
                                <ArrowUpCircle className="w-4 h-4" />
                                Thu
                            </button>
                            <button
                                onClick={() => setTypeFilter('expense')}
                                className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${typeFilter === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                                    }`}
                            >
                                <ArrowDownCircle className="w-4 h-4" />
                                Chi
                            </button>
                        </div>

                        {/* Date Range */}
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="px-3 py-2 bg-gray-50 rounded-xl border-0 text-sm"
                            />
                            <span className="text-text-secondary">-</span>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="px-3 py-2 bg-gray-50 rounded-xl border-0 text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Transactions Table / List */}
                <div className="bg-white rounded-2xl overflow-hidden">
                    {/* Table Header */}
                    <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-4 bg-gray-50 text-sm font-medium text-text-secondary">
                        <div className="col-span-1">Ngày</div>
                        <div className="col-span-3">Mô tả</div>
                        <div className="col-span-2">Đơn hàng</div>
                        <div className="col-span-2">Danh mục</div>
                        <div className="col-span-2">Thanh toán</div>
                        <div className="col-span-2 text-right">Số tiền</div>
                    </div>

                    {/* Transactions List */}
                    <div className="divide-y divide-gray-100">
                        {filteredTransactions.map((txn, index) => {
                            const categoryInfo = getCategoryInfo(txn.type, txn.category);
                            const CategoryIcon = categoryInfo.icon;

                            return (
                                <motion.div
                                    key={txn.id}
                                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    {/* Desktop View */}
                                    <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
                                        <div className="col-span-1 text-sm text-text-secondary">
                                            {formatDate(txn.date)}
                                        </div>

                                        <div className="col-span-3">
                                            <p className="font-medium text-primary truncate">{txn.description}</p>
                                            {txn.vendor_name && (
                                                <p className="text-sm text-text-secondary">{txn.vendor_name}</p>
                                            )}
                                        </div>

                                        <div className="col-span-2">
                                            {txn.order_id ? (
                                                <span className="text-sm text-text-secondary">{txn.order_id}</span>
                                            ) : (
                                                <span className="text-sm text-text-secondary italic">Không có</span>
                                            )}
                                        </div>

                                        <div className="col-span-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${txn.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                    }`}>
                                                    <CategoryIcon className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm">{categoryInfo.name}</span>
                                            </div>
                                        </div>

                                        <div className="col-span-2 text-sm text-text-secondary capitalize">
                                            {paymentMethods.find(m => m.id === txn.payment_method)?.name || txn.payment_method}
                                        </div>

                                        <div className={`col-span-2 text-right font-semibold ${txn.type === 'income' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                                        </div>
                                    </div>

                                    {/* Mobile View */}
                                    <div className="lg:hidden flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${txn.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                            <CategoryIcon className="w-5 h-5" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="font-medium text-primary truncate pr-4">{txn.description}</p>
                                                <p className={`font-semibold flex-shrink-0 ${txn.type === 'income' ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary">
                                                <span>{formatDate(txn.date)}</span>
                                                <span>{categoryInfo.name}</span>
                                                {txn.order_id && <span>{txn.order_id}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {filteredTransactions.length === 0 && (
                            <div className="py-12 text-center text-text-secondary">
                                Không có giao dịch nào
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Transaction Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-primary">Thêm giao dịch mới</h2>
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
                                    >
                                        <X className="w-5 h-5 text-text-secondary" />
                                    </button>
                                </div>

                                <div className="space-y-5">
                                    {/* Transaction Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-primary mb-2">Loại giao dịch</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setNewTransaction({ ...newTransaction, type: 'income', category: '' })}
                                                className={`flex items-center justify-center gap-2 p-4 rounded-xl font-medium transition-all ${newTransaction.type === 'income'
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                                                    }`}
                                            >
                                                <ArrowUpCircle className="w-5 h-5" />
                                                Thu (Cột thu)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setNewTransaction({ ...newTransaction, type: 'expense', category: '' })}
                                                className={`flex items-center justify-center gap-2 p-4 rounded-xl font-medium transition-all ${newTransaction.type === 'expense'
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                                                    }`}
                                            >
                                                <ArrowDownCircle className="w-5 h-5" />
                                                Chi (Cột chi)
                                            </button>
                                        </div>
                                    </div>

                                    {/* Linked Order */}
                                    <div>
                                        <label className="block text-sm font-medium text-primary mb-2">
                                            Liên kết đơn hàng (tùy chọn)
                                        </label>
                                        <select
                                            value={newTransaction.order_id || ''}
                                            onChange={(e) => setNewTransaction({ ...newTransaction, order_id: e.target.value })}
                                            className="input-apple"
                                        >
                                            <option value="">-- Chọn đơn hàng --</option>
                                            {mockOrders.map(order => (
                                                <option key={order.id} value={order.id}>{order.name}</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-text-secondary mt-1">
                                            Ví dụ: Khách A đặt cọc cho đơn hàng A, thuê bàn ghế cho đơn hàng A
                                        </p>
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-medium text-primary mb-2">Danh mục</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {(newTransaction.type === 'income' ? incomeCategories : expenseCategories).map(cat => {
                                                const isSelected = newTransaction.category === cat.id;
                                                return (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        onClick={() => setNewTransaction({ ...newTransaction, category: cat.id })}
                                                        className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all ${isSelected
                                                            ? newTransaction.type === 'income' ? 'bg-green-100 text-green-700 ring-2 ring-green-500' : 'bg-red-100 text-red-700 ring-2 ring-red-500'
                                                            : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        <cat.icon className="w-4 h-4" />
                                                        {cat.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div>
                                        <label className="block text-sm font-medium text-primary mb-2">Số tiền (VNĐ)</label>
                                        <input
                                            type="number"
                                            value={newTransaction.amount || ''}
                                            onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseInt(e.target.value) || 0 })}
                                            placeholder="0"
                                            className="input-apple"
                                        />
                                    </div>

                                    {/* Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-primary mb-2">Ngày giao dịch</label>
                                        <input
                                            type="date"
                                            value={newTransaction.date}
                                            onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                            className="input-apple"
                                        />
                                    </div>

                                    {/* Payment Method */}
                                    <div>
                                        <label className="block text-sm font-medium text-primary mb-2">Phương thức thanh toán</label>
                                        <select
                                            value={newTransaction.payment_method}
                                            onChange={(e) => setNewTransaction({ ...newTransaction, payment_method: e.target.value })}
                                            className="input-apple"
                                        >
                                            {paymentMethods.map(method => (
                                                <option key={method.id} value={method.id}>{method.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Vendor (for expense) */}
                                    {newTransaction.type === 'expense' && (
                                        <div>
                                            <label className="block text-sm font-medium text-primary mb-2">Nhà cung cấp (tùy chọn)</label>
                                            <input
                                                type="text"
                                                value={newTransaction.vendor_name || ''}
                                                onChange={(e) => setNewTransaction({ ...newTransaction, vendor_name: e.target.value })}
                                                placeholder="Tên nhà cung cấp / người nhận"
                                                className="input-apple"
                                            />
                                        </div>
                                    )}

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-primary mb-2">Mô tả chi tiết</label>
                                        <textarea
                                            value={newTransaction.description || ''}
                                            onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                                            placeholder={newTransaction.type === 'income'
                                                ? 'Ví dụ: Khách Nguyễn Văn A đặt cọc đơn hàng đám cưới'
                                                : 'Ví dụ: Đặt thuê 20 bộ bàn ghế cho đơn hàng A'}
                                            rows={3}
                                            className="input-apple resize-none"
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddModal(false)}
                                            className="flex-1 btn-outline"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleAddTransaction}
                                            className={`flex-1 font-medium py-4 rounded-full transition-all ${newTransaction.type === 'income'
                                                ? 'bg-green-500 text-white hover:bg-green-600'
                                                : 'bg-red-500 text-white hover:bg-red-600'
                                                }`}
                                        >
                                            {newTransaction.type === 'income' ? 'Ghi thu' : 'Ghi chi'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
