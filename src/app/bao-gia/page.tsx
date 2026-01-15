'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    ChevronLeft,
    ChevronRight,
    Check,
    User,
    Phone,
    MapPin,
    Calendar,
    Users,
    FileText,
    Search,
    Table,
    Armchair,
    Utensils,
    AlertCircle,
    Download,
    Printer,
    Eye,
    Sparkles,
    Loader2,
    FileOutput,
    Settings2,
    Percent
} from 'lucide-react';
import { formatCurrency, findSimilarItems } from '@/lib/utils';
import { menuApi, quoteApi, MenuItem as ApiMenuItem } from '@/lib/google-sheets';
import AutocompleteTextarea from '@/components/AutocompleteTextarea';
import { PDFExportButton } from '@/components/PDFExport';

// Types
interface MenuItem {
    id: string;
    name: string;
    unit: string;
    selling_price: number;  // Đơn giá bán
    cost_price: number;      // Giá gốc
}

interface QuoteItem extends MenuItem {
    quantity: number;
    custom_selling_price?: number;  // Override selling_price nếu người dùng chỉnh
    custom_cost_price?: number;      // Override cost_price nếu người dùng chỉnh
    total: number;
    profit: number;
}

interface CustomerInfo {
    name: string;
    phone: string;
    address: string;
    event_date: string;
    event_type: string;
    notes: string;
}

interface QuoteDetails {
    table_count: number;
    dishes_input: string;
    staff_count: number;
    table_type: 'none' | 'inox' | 'event';
    frame_count: number;  // Số khung rạp
}

// Service prices from database (default values as fallback)
interface ServicePrices {
    tableInox: { selling: number; cost: number };
    tableEvent: { selling: number; cost: number };
    frame: { selling: number; cost: number };      // Khung rạp
    staff: { selling: number; cost: number };
}

// Export options for Step 4
interface ExportOptions {
    customerHandlesStaff: boolean;
    showIndividualPrices: boolean;
    tableDiscount: number;
    frameDiscount: number;
    totalDiscount: number;
    vatPercent: number;
}

// Table Types configuration (prices will be loaded from database)
const TABLE_TYPE_IDS = {
    none: { id: 'none', name: 'Không chọn', menuId: null },
    inox: { id: 'inox', name: 'Bàn ghế inox', menuId: 'BAN-001' },
    event: { id: 'event', name: 'Bàn ghế sự kiện', menuId: 'BAN-002' },
};

// Default service prices (fallback if not found in database)
const DEFAULT_SERVICE_PRICES: ServicePrices = {
    tableInox: { selling: 250000, cost: 250000 },
    tableEvent: { selling: 500000, cost: 500000 },
    frame: { selling: 450000, cost: 400000 },
    staff: { selling: 350000, cost: 300000 },
};

// Steps Configuration
const steps = [
    { id: 1, title: 'Thông tin khách hàng', icon: User },
    { id: 2, title: 'Chi tiết đơn hàng', icon: FileText },
    { id: 3, title: 'Báo giá', icon: Table },
    { id: 4, title: 'Xuất báo giá', icon: FileOutput },
];

// Export Options interface
interface ExportOptions {
    customerHandlesStaff: boolean;      // Khách tự lo nhân viên
    showIndividualPrices: boolean;      // Hiển thị giá từng món
    tableDiscount: number;              // % giảm bàn ghế
    frameDiscount: number;              // % giảm khung rạp  
    totalDiscount: number;              // % giảm tổng
}

export default function QuotePage() {
    const [currentStep, setCurrentStep] = useState(1);

    // Menu data from API
    const [menuDatabase, setMenuDatabase] = useState<MenuItem[]>([]);
    const [isLoadingMenu, setIsLoadingMenu] = useState(true);
    const [menuError, setMenuError] = useState<string | null>(null);

    // Fetch menu data from Google Sheets
    useEffect(() => {
        async function fetchMenuData() {
            setIsLoadingMenu(true);
            setMenuError(null);

            const response = await menuApi.getAll();

            if (response.success && response.data) {
                // Transform API data to match our MenuItem interface
                const transformedMenu: MenuItem[] = response.data
                    .filter((item: ApiMenuItem) => item.active)
                    .map((item: ApiMenuItem) => ({
                        id: item.menu_id,
                        name: item.name,
                        unit: item.unit,
                        selling_price: item.selling_price,
                        cost_price: item.cost_price,
                    }));

                setMenuDatabase(transformedMenu);

                // Extract service prices from menu data
                const extractedPrices: ServicePrices = { ...DEFAULT_SERVICE_PRICES };

                response.data.forEach((item: ApiMenuItem) => {
                    if (item.menu_id === 'BAN-001') {
                        extractedPrices.tableInox = { selling: item.selling_price, cost: item.cost_price };
                    } else if (item.menu_id === 'BAN-002') {
                        extractedPrices.tableEvent = { selling: item.selling_price, cost: item.cost_price };
                    } else if (item.menu_id === 'BAN-003') {
                        extractedPrices.frame = { selling: item.selling_price, cost: item.cost_price };
                    } else if (item.menu_id === 'NV-001') {
                        extractedPrices.staff = { selling: item.selling_price, cost: item.cost_price };
                    }
                });

                setServicePrices(extractedPrices);
            } else {
                setMenuError(response.error || 'Không thể tải dữ liệu menu');
            }

            setIsLoadingMenu(false);
        }

        fetchMenuData();
    }, []);

    // Step 1: Customer Info
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        name: '',
        phone: '',
        address: '',
        event_date: '',
        event_type: 'dam_cuoi',
        notes: '',
    });

    // Step 2: Quote Details
    const [quoteDetails, setQuoteDetails] = useState<QuoteDetails>({
        table_count: 10,
        dishes_input: '',
        staff_count: 0,
        table_type: 'none',
        frame_count: 0,  // Default 0, will auto-suggest based on table_count
    });

    // Service prices extracted from menu database
    const [servicePrices, setServicePrices] = useState<ServicePrices>(DEFAULT_SERVICE_PRICES);

    // Step 3: Parsed Quote Items
    const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
    const [unmatchedDishes, setUnmatchedDishes] = useState<string[]>([]);
    // Suggestions for unmatched dishes
    const [dishSuggestions, setDishSuggestions] = useState<Map<string, MenuItem[]>>(new Map());

    // Custom prices for table, staff and frame (allow inline editing)
    const [customTablePrice, setCustomTablePrice] = useState<number | null>(null);
    const [customStaffPrice, setCustomStaffPrice] = useState<number | null>(null);
    const [customFramePrice, setCustomFramePrice] = useState<number | null>(null);
    const [customFrameCost, setCustomFrameCost] = useState<number | null>(null);

    // Step 4: Export Options
    const [exportOptions, setExportOptions] = useState<ExportOptions>({
        customerHandlesStaff: false,
        showIndividualPrices: true,
        tableDiscount: 0,
        frameDiscount: 0,
        totalDiscount: 0,
        vatPercent: 0,  // VAT percentage (0-100)
    });

    // Quote notes with preset options (saved to localStorage)
    const [quoteNote, setQuoteNote] = useState<string>('');
    const [savedNotes, setSavedNotes] = useState<string[]>([]);
    const [newPresetNote, setNewPresetNote] = useState<string>('');
    const [showAddNote, setShowAddNote] = useState(false);

    // Default preset notes
    const DEFAULT_PRESET_NOTES = [
        'Báo giá trên đã bao gồm bàn ghế, nhân viên phục vụ.',
        'Báo giá trên chưa bao gồm bàn ghế, nhân viên phục vụ.',
    ];

    // Load saved notes from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('quote_preset_notes');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setSavedNotes(parsed);
            } catch {
                setSavedNotes(DEFAULT_PRESET_NOTES);
            }
        } else {
            // Initialize with default preset notes
            setSavedNotes(DEFAULT_PRESET_NOTES);
            localStorage.setItem('quote_preset_notes', JSON.stringify(DEFAULT_PRESET_NOTES));
        }
    }, []);

    // Save new preset note
    const addPresetNote = () => {
        if (newPresetNote.trim() && !savedNotes.includes(newPresetNote.trim())) {
            const updated = [...savedNotes, newPresetNote.trim()];
            setSavedNotes(updated);
            localStorage.setItem('quote_preset_notes', JSON.stringify(updated));
            setNewPresetNote('');
            setShowAddNote(false);
        }
    };

    // Delete preset note
    const deletePresetNote = (noteToDelete: string) => {
        const updated = savedNotes.filter(n => n !== noteToDelete);
        setSavedNotes(updated);
        localStorage.setItem('quote_preset_notes', JSON.stringify(updated));
        if (quoteNote === noteToDelete) {
            setQuoteNote('');
        }
    };

    // Parse dishes from text input and match with database
    // Số lượng mặc định = số bàn (có thể thay đổi)
    const parseDishesFromInput = useCallback(() => {
        const inputText = quoteDetails.dishes_input.trim();
        if (!inputText) {
            setQuoteItems([]);
            setUnmatchedDishes([]);
            return;
        }

        const tableCount = quoteDetails.table_count;

        // Split by new line or comma
        const lines = inputText.split(/[\n,]+/).map(line => line.trim()).filter(Boolean);

        const matchedItems: QuoteItem[] = [];
        const unmatched: string[] = [];

        lines.forEach(line => {
            // FIRST: Strip ordinal numbers at the beginning (e.g., "1.", "2.", "3.")
            // This prevents "1. Tôm chiên" from being parsed as quantity=1
            let cleanedLine = line.replace(/^\d+\.\s*/, '').trim();

            // If the entire line was just a number with period, skip it
            if (!cleanedLine) return;

            // Try to parse "dish name x quantity" or "dish name - quantity" or just "dish name"
            // Pattern 1: "Gà luộc x 10" or "Gà luộc - 10"
            // Pattern 2: "10 x Gà luộc" or "10 Gà luộc" (quantity at start WITHOUT period)
            const match = cleanedLine.match(/^(.+?)\s*[xX×\-]\s*(\d+)$/) ||
                cleanedLine.match(/^(\d+)\s*[xX×]\s*(.+)$/);  // Require x/X/× separator for quantity-first format

            let dishName = cleanedLine;
            let quantity = tableCount; // Mặc định = số bàn
            let hasExplicitQuantity = false;

            if (match) {
                if (isNaN(parseInt(match[1]))) {
                    dishName = match[1].trim();
                    quantity = parseInt(match[2]) || tableCount;
                    hasExplicitQuantity = true;
                } else {
                    quantity = parseInt(match[1]) || tableCount;
                    dishName = match[2].trim();
                    hasExplicitQuantity = true;
                }
            }

            // Search in database (fuzzy match)
            const normalizedSearch = dishName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

            const foundItem = menuDatabase.find(item => {
                const normalizedItem = item.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                return normalizedItem.includes(normalizedSearch) || normalizedSearch.includes(normalizedItem.split(' ').slice(0, 2).join(' '));
            });

            if (foundItem) {
                const existingIndex = matchedItems.findIndex(i => i.id === foundItem.id);
                if (existingIndex >= 0) {
                    // Nếu có explicit quantity thì cộng dồn, nếu không thì giữ nguyên
                    if (hasExplicitQuantity) {
                        matchedItems[existingIndex].quantity += quantity;
                    }
                    matchedItems[existingIndex].total = matchedItems[existingIndex].selling_price * matchedItems[existingIndex].quantity;
                    matchedItems[existingIndex].profit = (matchedItems[existingIndex].selling_price - matchedItems[existingIndex].cost_price) * matchedItems[existingIndex].quantity;
                } else {
                    matchedItems.push({
                        ...foundItem,
                        quantity,
                        total: foundItem.selling_price * quantity,
                        profit: (foundItem.selling_price - foundItem.cost_price) * quantity,
                    });
                }
            } else {
                unmatched.push(line);
            }
        });

        // Find similar dishes for unmatched items
        const suggestions = new Map<string, MenuItem[]>();
        unmatched.forEach(dish => {
            const similar = findSimilarItems(dish, menuDatabase, { threshold: 0.35, limit: 3 });
            if (similar.length > 0) {
                suggestions.set(dish, similar.map(s => s.item));
            }
        });

        setQuoteItems(matchedItems);
        setUnmatchedDishes(unmatched);
        setDishSuggestions(suggestions);
    }, [quoteDetails.dishes_input, quoteDetails.table_count, menuDatabase]);

    // Helper: Get effective prices (custom or default)
    const getEffectivePrice = (item: QuoteItem) => item.custom_selling_price ?? item.selling_price;
    const getEffectiveCost = (item: QuoteItem) => item.custom_cost_price ?? item.cost_price;

    // Calculate totals
    const totals = useMemo(() => {
        const dishesTotal = quoteItems.reduce((sum, item) => {
            const effectivePrice = item.custom_selling_price ?? item.selling_price;
            return sum + (effectivePrice * item.quantity);
        }, 0);
        const dishesCost = quoteItems.reduce((sum, item) => {
            const effectiveCost = item.custom_cost_price ?? item.cost_price;
            return sum + (effectiveCost * item.quantity);
        }, 0);
        const dishesProfit = dishesTotal - dishesCost;

        // Get base table price from servicePrices based on type
        const getTablePrice = () => {
            if (quoteDetails.table_type === 'inox') return servicePrices.tableInox;
            if (quoteDetails.table_type === 'event') return servicePrices.tableEvent;
            return { selling: 0, cost: 0 };
        };
        const baseTablePrice = getTablePrice();

        // Table rental cost (use custom price if set)
        const effectiveTablePrice = customTablePrice ?? baseTablePrice.selling;
        const tableTotal = effectiveTablePrice * quoteDetails.table_count;
        const tableCost = baseTablePrice.cost * quoteDetails.table_count;

        // Staff cost (use custom price if set)
        const effectiveStaffPrice = customStaffPrice ?? servicePrices.staff.selling;
        const staffTotal = quoteDetails.staff_count * effectiveStaffPrice;
        const staffCost = quoteDetails.staff_count * servicePrices.staff.cost;

        // Frame cost (Khung rạp)
        const effectiveFramePrice = customFramePrice ?? servicePrices.frame.selling;
        const effectiveFrameCost = customFrameCost ?? servicePrices.frame.cost;
        const frameTotal = quoteDetails.frame_count * effectiveFramePrice;
        const frameCost = quoteDetails.frame_count * effectiveFrameCost;

        const grandTotal = dishesTotal + tableTotal + staffTotal + frameTotal;
        const totalCost = dishesCost + tableCost + staffCost + frameCost;
        const totalProfit = grandTotal - totalCost;

        return {
            dishesTotal,
            dishesCost,
            dishesProfit,
            tableTotal,
            tableCost,
            staffTotal,
            staffCost,
            frameTotal,
            frameCost,
            grandTotal,
            totalCost,
            totalProfit,
            effectiveTablePrice,
            effectiveStaffPrice,
            effectiveFramePrice,
            effectiveFrameCost
        };
    }, [quoteItems, quoteDetails.table_count, quoteDetails.table_type, quoteDetails.staff_count, quoteDetails.frame_count, customTablePrice, customStaffPrice, customFramePrice, customFrameCost, servicePrices]);

    // Final totals with export options (discounts and display mode)
    const finalTotals = useMemo(() => {
        // Apply discounts
        const finalTableTotal = totals.tableTotal * (1 - exportOptions.tableDiscount / 100);
        const finalFrameTotal = totals.frameTotal * (1 - exportOptions.frameDiscount / 100);
        const staffComponent = exportOptions.customerHandlesStaff ? 0 : totals.staffTotal;
        const staffCostComponent = exportOptions.customerHandlesStaff ? 0 : totals.staffCost;

        // Calculate subtotal before total discount
        const subtotal = totals.dishesTotal + finalTableTotal + finalFrameTotal + staffComponent;
        const subtotalCost = totals.dishesCost + totals.tableCost + totals.frameCost + staffCostComponent;

        // Apply total discount
        const grandTotal = subtotal * (1 - exportOptions.totalDiscount / 100);
        const totalCost = subtotalCost;  // Cost doesn't get discounted
        const totalProfit = grandTotal - totalCost;

        // Price per table (for display mode)
        const pricePerTable = quoteDetails.table_count > 0 ? grandTotal / quoteDetails.table_count : 0;

        return {
            finalTableTotal,
            finalFrameTotal,
            staffComponent,
            subtotal,
            grandTotal,
            totalCost,
            totalProfit,
            pricePerTable,
            tableDiscountAmount: totals.tableTotal - finalTableTotal,
            frameDiscountAmount: totals.frameTotal - finalFrameTotal,
            totalDiscountAmount: subtotal - grandTotal,
        };
    }, [totals, exportOptions, quoteDetails.table_count]);

    // Update quantity in quote items
    const updateQuantity = (itemId: string, newQuantity: number) => {
        setQuoteItems(items =>
            items.map(item => {
                if (item.id === itemId) {
                    const qty = Math.max(1, newQuantity);
                    const effectivePrice = item.custom_selling_price ?? item.selling_price;
                    const effectiveCost = item.custom_cost_price ?? item.cost_price;
                    return {
                        ...item,
                        quantity: qty,
                        total: effectivePrice * qty,
                        profit: (effectivePrice - effectiveCost) * qty,
                    };
                }
                return item;
            })
        );
    };

    // Update selling price (đơn giá bán) for a quote item
    const updateSellingPrice = (itemId: string, newPrice: number) => {
        setQuoteItems(items =>
            items.map(item => {
                if (item.id === itemId) {
                    const price = Math.max(0, newPrice);
                    const effectiveCost = item.custom_cost_price ?? item.cost_price;
                    return {
                        ...item,
                        custom_selling_price: price,
                        total: price * item.quantity,
                        profit: (price - effectiveCost) * item.quantity,
                    };
                }
                return item;
            })
        );
    };

    // Update cost price (giá gốc) for a quote item
    const updateCostPrice = (itemId: string, newCost: number) => {
        setQuoteItems(items =>
            items.map(item => {
                if (item.id === itemId) {
                    const cost = Math.max(0, newCost);
                    const effectivePrice = item.custom_selling_price ?? item.selling_price;
                    return {
                        ...item,
                        custom_cost_price: cost,
                        profit: (effectivePrice - cost) * item.quantity,
                    };
                }
                return item;
            })
        );
    };

    // Remove item from quote
    const removeItem = (itemId: string) => {
        setQuoteItems(items => items.filter(item => item.id !== itemId));
    };

    // Step validation
    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return customerInfo.name && customerInfo.phone && customerInfo.address;
            case 2:
                return quoteDetails.table_count > 0 && quoteDetails.dishes_input.trim();
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (canProceed() && currentStep < 4) {
            if (currentStep === 2) {
                // Parse dishes when moving to step 3
                parseDishesFromInput();
            }
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // Quote submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleSubmitQuote = async () => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const quoteData = {
                customer_name: customerInfo.name,
                phone: customerInfo.phone,
                event_type: customerInfo.event_type,
                event_date: customerInfo.event_date,
                location: customerInfo.address,
                num_tables: quoteDetails.table_count,
                dishes_input: quoteDetails.dishes_input,
                staff_count: quoteDetails.staff_count,
                table_type: quoteDetails.table_type,
                subtotal: totals.dishesTotal,
                total: totals.grandTotal,
                status: 'draft' as const,
            };

            const response = await quoteApi.create(quoteData);

            if (response.success) {
                setSubmitSuccess(true);
                setTimeout(() => {
                    // Reset form or redirect after 2 seconds
                    window.location.href = '/';
                }, 2000);
            } else {
                setSubmitError(response.error || 'Không thể lưu báo giá. Vui lòng thử lại.');
            }
        } catch (error) {
            setSubmitError('Đã xảy ra lỗi khi lưu báo giá.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-background-light">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50 print:hidden">
                <div className="section-container">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <ChevronLeft className="w-5 h-5 text-text-secondary" />
                            <span className="text-text-secondary">Quay lại</span>
                        </Link>

                        <h1 className="text-lg font-semibold text-primary">Tạo báo giá mới</h1>

                        <div className="w-20" />
                    </div>
                </div>
            </header>

            {/* Loading State */}
            {isLoadingMenu && (
                <div className="bg-blue-50 border-b border-blue-200 py-3 print:hidden">
                    <div className="section-container">
                        <div className="flex items-center justify-center gap-2 text-blue-700">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Đang tải dữ liệu menu từ Google Sheets...</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Error State */}
            {menuError && (
                <div className="bg-red-50 border-b border-red-200 py-3 print:hidden">
                    <div className="section-container">
                        <div className="flex items-center justify-center gap-2 text-red-700">
                            <AlertCircle className="w-5 h-5" />
                            <span>Lỗi: {menuError}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Submit Error State */}
            {submitError && (
                <div className="bg-red-50 border-b border-red-200 py-3 print:hidden">
                    <div className="section-container">
                        <div className="flex items-center justify-between text-red-700">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                <span>{submitError}</span>
                            </div>
                            <button
                                onClick={() => setSubmitError(null)}
                                className="text-red-500 hover:text-red-700"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Progress Steps */}
            <div className="bg-white border-b border-gray-100 py-4 print:hidden">
                <div className="section-container">
                    <div className="flex items-center justify-center">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className="flex items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${currentStep > step.id
                                            ? 'bg-accent text-white'
                                            : currentStep === step.id
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-200 text-text-secondary'
                                            }`}
                                    >
                                        {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                                    </div>
                                    <div className="ml-3 hidden sm:block">
                                        <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-primary' : 'text-text-secondary'}`}>
                                            {step.title}
                                        </p>
                                    </div>
                                </div>

                                {index < steps.length - 1 && (
                                    <div className={`w-12 sm:w-24 h-0.5 mx-4 ${currentStep > step.id ? 'bg-accent' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="section-container py-8">
                <AnimatePresence mode="wait">
                    {/* Step 1: Customer Information */}
                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-2xl mx-auto"
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-semibold text-primary mb-2">Thông tin khách hàng</h2>
                                <p className="text-text-secondary">Nhập thông tin khách hàng đặt tiệc</p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 space-y-5">
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                                            <User className="w-4 h-4" />
                                            Họ và tên khách hàng *
                                        </label>
                                        <input
                                            type="text"
                                            value={customerInfo.name}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                            placeholder="Nguyễn Văn A"
                                            className="input-apple"
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                                            <Phone className="w-4 h-4" />
                                            Số điện thoại *
                                        </label>
                                        <input
                                            type="tel"
                                            value={customerInfo.phone}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                            placeholder="0912 345 678"
                                            className="input-apple"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                                        <MapPin className="w-4 h-4" />
                                        Địa chỉ tổ chức tiệc *
                                    </label>
                                    <input
                                        type="text"
                                        value={customerInfo.address}
                                        onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                        className="input-apple"
                                    />
                                </div>

                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                                            <Calendar className="w-4 h-4" />
                                            Ngày tổ chức tiệc
                                        </label>
                                        <input
                                            type="date"
                                            value={customerInfo.event_date}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, event_date: e.target.value })}
                                            className="input-apple"
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                                            Loại tiệc
                                        </label>
                                        <select
                                            value={customerInfo.event_type}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, event_type: e.target.value })}
                                            className="input-apple"
                                        >
                                            <option value="dam_cuoi">Đám cưới</option>
                                            <option value="dam_hoi">Đám hỏi</option>
                                            <option value="thoi_noi">Thôi nôi</option>
                                            <option value="dam_do">Đám giỗ</option>
                                            <option value="sinh_nhat">Sinh nhật</option>
                                            <option value="lien_hoan">Liên hoan</option>
                                            <option value="khac">Khác</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                                        <FileText className="w-4 h-4" />
                                        Ghi chú
                                    </label>
                                    <textarea
                                        value={customerInfo.notes}
                                        onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                                        placeholder="Ghi chú thêm về yêu cầu của khách..."
                                        rows={3}
                                        className="input-apple resize-none"
                                    />
                                </div>

                                {/* Step 1 Navigation */}
                                <div className="flex justify-end pt-4 border-t border-gray-100">
                                    <button
                                        onClick={handleNext}
                                        disabled={!canProceed()}
                                        className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all ${canProceed()
                                            ? 'bg-accent text-white hover:bg-accent-hover'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        Tiếp tục
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Quote Details */}
                    {currentStep === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-3xl mx-auto"
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-semibold text-primary mb-2">Chi tiết đơn hàng</h2>
                                <p className="text-text-secondary">Nhập thông tin bàn tiệc và các món ăn</p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 space-y-6">
                                {/* Table Count & Staff & Frame */}
                                <div className="grid sm:grid-cols-3 gap-5">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                                            <Table className="w-4 h-4" />
                                            Số bàn tiệc *
                                        </label>
                                        <input
                                            type="number"
                                            value={quoteDetails.table_count}
                                            onChange={(e) => setQuoteDetails({ ...quoteDetails, table_count: parseInt(e.target.value) || 0 })}
                                            min="1"
                                            max="100"
                                            className="input-apple"
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                                            <Users className="w-4 h-4" />
                                            Số nhân viên phục vụ
                                        </label>
                                        <input
                                            type="number"
                                            value={quoteDetails.staff_count}
                                            onChange={(e) => setQuoteDetails({ ...quoteDetails, staff_count: parseInt(e.target.value) || 0 })}
                                            min="0"
                                            max="50"
                                            placeholder="0 = Không cần"
                                            className="input-apple"
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                                            🎪 Số khung rạp
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={quoteDetails.frame_count}
                                                onChange={(e) => setQuoteDetails({ ...quoteDetails, frame_count: parseInt(e.target.value) || 0 })}
                                                min="0"
                                                max="50"
                                                placeholder="0 = Không cần"
                                                className="input-apple"
                                            />
                                            {quoteDetails.table_count > 0 && quoteDetails.frame_count === 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setQuoteDetails({
                                                        ...quoteDetails,
                                                        frame_count: Math.ceil(quoteDetails.table_count / 2)
                                                    })}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-accent hover:underline"
                                                >
                                                    Gợi ý: {Math.ceil(quoteDetails.table_count / 2)}
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-text-secondary mt-1">1 khung = 2 bàn</p>
                                    </div>
                                </div>

                                {/* Table Type */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-primary mb-3">
                                        <Armchair className="w-4 h-4" />
                                        Loại bàn ghế
                                    </label>
                                    <div className="grid sm:grid-cols-3 gap-3">
                                        {Object.values(TABLE_TYPE_IDS).map(tableType => {
                                            // Get price from servicePrices
                                            const price = tableType.id === 'inox' ? servicePrices.tableInox.selling
                                                : tableType.id === 'event' ? servicePrices.tableEvent.selling
                                                    : 0;
                                            return (
                                                <button
                                                    key={tableType.id}
                                                    type="button"
                                                    onClick={() => setQuoteDetails({ ...quoteDetails, table_type: tableType.id as QuoteDetails['table_type'] })}
                                                    className={`p-4 rounded-xl border-2 text-left transition-all ${quoteDetails.table_type === tableType.id
                                                        ? 'border-accent bg-accent/5'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <p className="font-medium text-primary">{tableType.name}</p>
                                                    {price > 0 && (
                                                        <p className="text-sm text-accent mt-1">{formatCurrency(price)}/bàn</p>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Dishes Input with Autocomplete */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                                        <Utensils className="w-4 h-4" />
                                        Danh sách món ăn *
                                    </label>
                                    <p className="text-sm text-text-secondary mb-3">
                                        Nhập mỗi món một dòng. <span className="font-medium text-accent">Gõ để xem gợi ý món</span>. Số lượng mặc định = số bàn ({quoteDetails.table_count}).
                                    </p>
                                    <AutocompleteTextarea
                                        value={quoteDetails.dishes_input}
                                        onChange={(value) => setQuoteDetails({ ...quoteDetails, dishes_input: value })}
                                        menuItems={menuDatabase}
                                        tableCount={quoteDetails.table_count}
                                        placeholder={`Ví dụ:\nGà luộc\nHeo quay\nSúp cua\nBia heineken x 50\nChè thập cẩm`}
                                        rows={10}
                                        className="input-apple resize-none font-mono text-sm"
                                    />
                                    <p className="text-xs text-text-secondary mt-2">
                                        💡 Sử dụng phím ↑↓ để chọn, Enter để xác nhận, Esc để đóng gợi ý
                                    </p>
                                </div>

                                {/* Step 2 Navigation */}
                                <div className="flex justify-between pt-4 border-t border-gray-100">
                                    <button
                                        onClick={handleBack}
                                        className="flex items-center gap-2 px-6 py-3 text-text-secondary hover:bg-gray-100 rounded-xl font-medium transition-all"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                        Quay lại
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        disabled={!canProceed()}
                                        className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all ${canProceed()
                                            ? 'bg-accent text-white hover:bg-accent-hover'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        Tiếp tục
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Quote Preview */}
                    {currentStep === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-5xl mx-auto"
                        >
                            <div className="text-center mb-8 print:mb-4">
                                <h2 className="text-2xl font-semibold text-primary mb-2">Báo giá chi tiết</h2>
                                <p className="text-text-secondary print:hidden">Kiểm tra và điều chỉnh báo giá</p>
                            </div>

                            {/* Unmatched Dishes Warning with Suggestions */}
                            {unmatchedDishes.length > 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 print:hidden">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-medium text-yellow-800">Không tìm thấy {unmatchedDishes.length} món trong database:</p>
                                            <div className="mt-3 space-y-3">
                                                {unmatchedDishes.map((dish, i) => {
                                                    const suggestions = dishSuggestions.get(dish) || [];
                                                    return (
                                                        <div key={i} className="bg-white/50 rounded-lg p-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-yellow-800 font-medium">"{dish}"</span>
                                                            </div>
                                                            {suggestions.length > 0 ? (
                                                                <div className="mt-2">
                                                                    <span className="text-xs text-yellow-700">Bạn có ý là:</span>
                                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                                        {suggestions.map((item, j) => (
                                                                            <button
                                                                                key={j}
                                                                                onClick={() => {
                                                                                    // Add this item to quote
                                                                                    const qty = quoteDetails.table_count;
                                                                                    const existingIndex = quoteItems.findIndex(q => q.id === item.id);
                                                                                    if (existingIndex >= 0) {
                                                                                        // Already exists, update quantity
                                                                                        updateQuantity(item.id, quoteItems[existingIndex].quantity + qty);
                                                                                    } else {
                                                                                        // Add new item
                                                                                        setQuoteItems(prev => [...prev, {
                                                                                            ...item,
                                                                                            quantity: qty,
                                                                                            total: item.selling_price * qty,
                                                                                            profit: (item.selling_price - item.cost_price) * qty,
                                                                                        }]);
                                                                                    }
                                                                                    // Remove from unmatched
                                                                                    setUnmatchedDishes(prev => prev.filter(d => d !== dish));
                                                                                }}
                                                                                className="px-3 py-1.5 bg-accent text-white text-sm rounded-full hover:bg-accent/90 transition-colors flex items-center gap-1"
                                                                            >
                                                                                <Sparkles className="w-3 h-3" />
                                                                                {item.name}
                                                                                <span className="text-white/80 text-xs ml-1">({formatCurrency(item.selling_price)})</span>
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-yellow-600 mt-1 italic">Không tìm thấy món tương tự</p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white rounded-2xl p-6 print:p-4 print:shadow-none">
                                {/* Customer Info Header */}
                                <div className="border-b border-gray-200 pb-4 mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold text-primary">ẨM THỰC GIÁO TUYẾT</h3>
                                        <span className="text-sm text-text-secondary">Ngày: {new Date().toLocaleDateString('vi-VN')}</span>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p><span className="font-medium">Khách hàng:</span> {customerInfo.name}</p>
                                            <p><span className="font-medium">SĐT:</span> {customerInfo.phone}</p>
                                        </div>
                                        <div>
                                            <p><span className="font-medium">Địa chỉ:</span> {customerInfo.address}</p>
                                            <p><span className="font-medium">Ngày tiệc:</span> {customerInfo.event_date || 'Chưa xác định'}</p>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex gap-4 text-sm">
                                        <span className="px-3 py-1 bg-accent/10 text-accent rounded-full font-medium">
                                            {quoteDetails.table_count} bàn
                                        </span>
                                        {quoteDetails.staff_count > 0 && (
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                                {quoteDetails.staff_count} nhân viên phục vụ
                                            </span>
                                        )}
                                        {quoteDetails.table_type !== 'none' && (
                                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                                                {TABLE_TYPE_IDS[quoteDetails.table_type].name}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Quote Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-3 py-3 text-left font-semibold text-primary">STT</th>
                                                <th className="px-3 py-3 text-left font-semibold text-primary">Tên món ăn</th>
                                                <th className="px-3 py-3 text-center font-semibold text-primary">SL</th>
                                                <th className="px-3 py-3 text-right font-semibold text-primary">Đơn giá</th>
                                                <th className="px-3 py-3 text-right font-semibold text-primary">Thành tiền</th>
                                                <th className="px-3 py-3 text-right font-semibold text-primary bg-orange-50 print:hidden">Giá gốc</th>
                                                <th className="px-3 py-3 text-right font-semibold text-primary bg-green-50 print:hidden">Lợi nhuận</th>
                                                <th className="px-3 py-3 text-center print:hidden"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {quoteItems.map((item, index) => {
                                                const effectivePrice = item.custom_selling_price ?? item.selling_price;
                                                const effectiveCost = item.custom_cost_price ?? item.cost_price;
                                                const isCustomPrice = item.custom_selling_price !== undefined;
                                                const isCustomCost = item.custom_cost_price !== undefined;

                                                return (
                                                    <tr key={item.id} className="hover:bg-gray-50">
                                                        <td className="px-3 py-3 text-text-secondary">{index + 1}</td>
                                                        <td className="px-3 py-3 font-medium text-primary">
                                                            {item.name}
                                                            <span className="text-text-secondary font-normal ml-1">({item.unit})</span>
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            <input
                                                                type="number"
                                                                value={item.quantity}
                                                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                                                min="1"
                                                                className="w-16 px-2 py-1 text-center border border-gray-200 rounded-lg print:border-none print:bg-transparent"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-3 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <input
                                                                    type="number"
                                                                    value={effectivePrice}
                                                                    onChange={(e) => updateSellingPrice(item.id, parseInt(e.target.value) || 0)}
                                                                    min="0"
                                                                    step="10000"
                                                                    className={`w-24 px-2 py-1 text-right border rounded-lg print:border-none print:bg-transparent ${isCustomPrice ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                                                                        }`}
                                                                />
                                                                {isCustomPrice && (
                                                                    <span className="text-blue-500 text-xs" title="Đã chỉnh sửa">✎</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-3 text-right font-medium text-primary">
                                                            {formatCurrency(effectivePrice * item.quantity)}
                                                        </td>
                                                        <td className="px-3 py-3 text-right bg-orange-50/50 print:hidden">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <input
                                                                    type="number"
                                                                    value={effectiveCost}
                                                                    onChange={(e) => updateCostPrice(item.id, parseInt(e.target.value) || 0)}
                                                                    min="0"
                                                                    step="10000"
                                                                    className={`w-24 px-2 py-1 text-right border rounded-lg ${isCustomCost ? 'border-orange-400 bg-orange-100' : 'border-gray-200 bg-white'
                                                                        }`}
                                                                />
                                                                {isCustomCost && (
                                                                    <span className="text-orange-500 text-xs" title="Đã chỉnh sửa">✎</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-3 text-right font-medium text-green-600 bg-green-50/50 print:hidden">
                                                            {formatCurrency((effectivePrice - effectiveCost) * item.quantity)}
                                                        </td>
                                                        <td className="px-3 py-3 text-center print:hidden">
                                                            <button
                                                                onClick={() => removeItem(item.id)}
                                                                className="text-red-500 hover:text-red-700 text-xs"
                                                            >
                                                                Xóa
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}

                                            {/* Additional Rows - Bàn ghế (cho phép thay đổi số lượng VÀ đơn giá) */}
                                            {quoteDetails.table_type !== 'none' && (
                                                <tr className="bg-gray-50/50">
                                                    <td className="px-3 py-3 text-text-secondary">{quoteItems.length + 1}</td>
                                                    <td className="px-3 py-3 font-medium text-primary">
                                                        {TABLE_TYPE_IDS[quoteDetails.table_type].name}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <input
                                                            type="number"
                                                            value={quoteDetails.table_count}
                                                            onChange={(e) => setQuoteDetails({ ...quoteDetails, table_count: Math.max(1, parseInt(e.target.value) || 1) })}
                                                            min="1"
                                                            className="w-16 px-2 py-1 text-center border border-gray-200 rounded-lg print:border-none print:bg-transparent"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <input
                                                                type="number"
                                                                value={totals.effectiveTablePrice}
                                                                onChange={(e) => setCustomTablePrice(Math.max(0, parseInt(e.target.value) || 0))}
                                                                min="0"
                                                                step="10000"
                                                                className={`w-24 px-2 py-1 text-right border rounded-lg print:border-none print:bg-transparent ${customTablePrice !== null ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                                                                    }`}
                                                            />
                                                            {customTablePrice !== null && (
                                                                <span className="text-blue-500 text-xs" title="Đã chỉnh sửa">✎</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 text-right font-medium text-primary">
                                                        {formatCurrency(totals.tableTotal)}
                                                    </td>
                                                    <td className="px-3 py-3 text-right text-orange-600 bg-orange-50/50 print:hidden">
                                                        {formatCurrency(totals.tableCost)}
                                                    </td>
                                                    <td className="px-3 py-3 text-right font-medium text-green-600 bg-green-50/50 print:hidden">
                                                        {formatCurrency(totals.tableTotal - totals.tableCost)}
                                                    </td>
                                                    <td className="px-3 py-3 print:hidden"></td>
                                                </tr>
                                            )}

                                            {/* Khung rạp (cho phép thay đổi số lượng, đơn giá VÀ giá gốc) */}
                                            {quoteDetails.frame_count > 0 && (
                                                <tr className="bg-amber-50/50">
                                                    <td className="px-3 py-3 text-text-secondary">{quoteItems.length + (quoteDetails.table_type !== 'none' ? 2 : 1)}</td>
                                                    <td className="px-3 py-3 font-medium text-primary">🎪 Khung rạp</td>
                                                    <td className="px-3 py-3">
                                                        <input
                                                            type="number"
                                                            value={quoteDetails.frame_count}
                                                            onChange={(e) => setQuoteDetails({ ...quoteDetails, frame_count: Math.max(0, parseInt(e.target.value) || 0) })}
                                                            min="0"
                                                            className="w-16 px-2 py-1 text-center border border-gray-200 rounded-lg print:border-none print:bg-transparent"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <input
                                                                type="number"
                                                                value={totals.effectiveFramePrice}
                                                                onChange={(e) => setCustomFramePrice(Math.max(0, parseInt(e.target.value) || 0))}
                                                                min="0"
                                                                step="10000"
                                                                className={`w-24 px-2 py-1 text-right border rounded-lg print:border-none print:bg-transparent ${customFramePrice !== null ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                                                                    }`}
                                                            />
                                                            {customFramePrice !== null && (
                                                                <span className="text-blue-500 text-xs" title="Đã chỉnh sửa">✎</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 text-right font-medium text-primary">
                                                        {formatCurrency(totals.frameTotal)}
                                                    </td>
                                                    <td className="px-3 py-3 text-right bg-orange-50/50 print:hidden">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <input
                                                                type="number"
                                                                value={totals.effectiveFrameCost}
                                                                onChange={(e) => setCustomFrameCost(Math.max(0, parseInt(e.target.value) || 0))}
                                                                min="0"
                                                                step="10000"
                                                                className={`w-24 px-2 py-1 text-right border rounded-lg ${customFrameCost !== null ? 'border-orange-400 bg-orange-100' : 'border-gray-200 bg-white'
                                                                    }`}
                                                            />
                                                            {customFrameCost !== null && (
                                                                <span className="text-orange-500 text-xs" title="Đã chỉnh sửa">✎</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 text-right font-medium text-green-600 bg-green-50/50 print:hidden">
                                                        {formatCurrency(totals.frameTotal - totals.frameCost)}
                                                    </td>
                                                    <td className="px-3 py-3 print:hidden"></td>
                                                </tr>
                                            )}

                                            {/* Nhân viên phục vụ (cho phép thay đổi số lượng VÀ đơn giá) */}
                                            {quoteDetails.staff_count > 0 && (
                                                <tr className="bg-gray-50/50">
                                                    <td className="px-3 py-3 text-text-secondary">
                                                        {quoteItems.length + (quoteDetails.table_type !== 'none' ? 1 : 0) + (quoteDetails.frame_count > 0 ? 1 : 0) + 1}
                                                    </td>
                                                    <td className="px-3 py-3 font-medium text-primary">Nhân viên phục vụ</td>
                                                    <td className="px-3 py-3">
                                                        <input
                                                            type="number"
                                                            value={quoteDetails.staff_count}
                                                            onChange={(e) => setQuoteDetails({ ...quoteDetails, staff_count: Math.max(0, parseInt(e.target.value) || 0) })}
                                                            min="0"
                                                            className="w-16 px-2 py-1 text-center border border-gray-200 rounded-lg print:border-none print:bg-transparent"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <input
                                                                type="number"
                                                                value={totals.effectiveStaffPrice}
                                                                onChange={(e) => setCustomStaffPrice(Math.max(0, parseInt(e.target.value) || 0))}
                                                                min="0"
                                                                step="10000"
                                                                className={`w-24 px-2 py-1 text-right border rounded-lg print:border-none print:bg-transparent ${customStaffPrice !== null ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                                                                    }`}
                                                            />
                                                            {customStaffPrice !== null && (
                                                                <span className="text-blue-500 text-xs" title="Đã chỉnh sửa">✎</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 text-right font-medium text-primary">
                                                        {formatCurrency(totals.staffTotal)}
                                                    </td>
                                                    <td className="px-3 py-3 text-right text-orange-600 bg-orange-50/50 print:hidden">
                                                        {formatCurrency(totals.staffCost)}
                                                    </td>
                                                    <td className="px-3 py-3 text-right font-medium text-green-600 bg-green-50/50 print:hidden">
                                                        {formatCurrency(totals.staffTotal - totals.staffCost)}
                                                    </td>
                                                    <td className="px-3 py-3 print:hidden"></td>
                                                </tr>
                                            )}
                                        </tbody>

                                        {/* Totals */}
                                        <tfoot>
                                            <tr className="border-t-2 border-gray-300">
                                                <td colSpan={4} className="px-3 py-4 text-right font-semibold text-lg text-primary">
                                                    TỔNG CỘNG:
                                                </td>
                                                <td className="px-3 py-4 text-right font-bold text-xl text-accent">
                                                    {formatCurrency(totals.grandTotal)}
                                                </td>
                                                <td className="px-3 py-4 text-right font-semibold text-orange-600 bg-orange-50/50 print:hidden">
                                                    {formatCurrency(totals.totalCost)}
                                                </td>
                                                <td className="px-3 py-4 text-right font-bold text-green-600 bg-green-50/50 print:hidden">
                                                    {formatCurrency(totals.totalProfit)}
                                                </td>
                                                <td className="print:hidden"></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                {/* Profit Summary - Internal Only */}
                                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl print:hidden">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="w-5 h-5 text-green-600" />
                                        <h4 className="font-semibold text-primary">Tổng kết lợi nhuận (Nội bộ)</h4>
                                    </div>
                                    <div className="grid sm:grid-cols-3 gap-4 text-center">
                                        <div className="bg-white rounded-lg p-3">
                                            <p className="text-sm text-text-secondary">Tổng doanh thu</p>
                                            <p className="text-xl font-bold text-primary">{formatCurrency(totals.grandTotal)}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-3">
                                            <p className="text-sm text-text-secondary">Tổng giá gốc</p>
                                            <p className="text-xl font-bold text-orange-600">{formatCurrency(totals.totalCost)}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-3">
                                            <p className="text-sm text-text-secondary">Lợi nhuận ước tính</p>
                                            <p className="text-xl font-bold text-green-600">{formatCurrency(totals.totalProfit)}</p>
                                            <p className="text-xs text-green-600">
                                                ({((totals.totalProfit / totals.grandTotal) * 100).toFixed(1)}%)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 3 Navigation */}
                                <div className="flex justify-between pt-4">
                                    <button
                                        onClick={handleBack}
                                        className="flex items-center gap-2 px-6 py-3 text-text-secondary hover:bg-gray-100 rounded-xl font-medium transition-all"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                        Quay lại
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="flex items-center gap-2 px-8 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-hover transition-all"
                                    >
                                        Tiếp tục
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>

                            </div>
                        </motion.div>
                    )}

                    {/* Step 4: Xuất báo giá */}
                    {currentStep === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="card-apple"
                        >
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                                    <FileOutput className="w-6 h-6 text-accent" />
                                    Xuất báo giá
                                </h2>

                                {/* Export Options Panel */}
                                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <h3 className="flex items-center gap-2 font-semibold text-primary mb-4">
                                        <Settings2 className="w-5 h-5" />
                                        Tùy chọn xuất báo giá
                                    </h3>

                                    {/* Checkboxes */}
                                    <div className="space-y-3 mb-4">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={exportOptions.customerHandlesStaff}
                                                onChange={(e) => setExportOptions({ ...exportOptions, customerHandlesStaff: e.target.checked })}
                                                className="w-5 h-5 rounded border-gray-300 text-accent focus:ring-accent"
                                            />
                                            <span className="text-sm">Khách tự lo nhân viên phục vụ</span>
                                            {exportOptions.customerHandlesStaff && (
                                                <span className="text-xs text-orange-500">(không tính tiền nhân viên)</span>
                                            )}
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={exportOptions.showIndividualPrices}
                                                onChange={(e) => setExportOptions({ ...exportOptions, showIndividualPrices: e.target.checked })}
                                                className="w-5 h-5 rounded border-gray-300 text-accent focus:ring-accent"
                                            />
                                            <span className="text-sm">Hiển thị giá từng món ăn</span>
                                            {!exportOptions.showIndividualPrices && (
                                                <span className="text-xs text-blue-500">(hiển thị giá/bàn = {formatCurrency(finalTotals.pricePerTable)})</span>
                                            )}
                                        </label>
                                    </div>

                                    {/* Discount & VAT Inputs */}
                                    <div className="grid sm:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm text-text-secondary mb-1">
                                                <Percent className="w-4 h-4 inline mr-1" />
                                                Giảm giá bàn ghế
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={exportOptions.tableDiscount}
                                                    onChange={(e) => setExportOptions({ ...exportOptions, tableDiscount: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)) })}
                                                    min="0"
                                                    max="100"
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                                />
                                                <span className="text-sm text-text-secondary">%</span>
                                            </div>
                                            {exportOptions.tableDiscount > 0 && (
                                                <p className="text-xs text-green-600 mt-1">-{formatCurrency(finalTotals.tableDiscountAmount)}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm text-text-secondary mb-1">
                                                <Percent className="w-4 h-4 inline mr-1" />
                                                Giảm giá khung rạp
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={exportOptions.frameDiscount}
                                                    onChange={(e) => setExportOptions({ ...exportOptions, frameDiscount: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)) })}
                                                    min="0"
                                                    max="100"
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                                />
                                                <span className="text-sm text-text-secondary">%</span>
                                            </div>
                                            {exportOptions.frameDiscount > 0 && (
                                                <p className="text-xs text-green-600 mt-1">-{formatCurrency(finalTotals.frameDiscountAmount)}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm text-text-secondary mb-1">
                                                <Percent className="w-4 h-4 inline mr-1" />
                                                Giảm giá tổng đơn
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={exportOptions.totalDiscount}
                                                    onChange={(e) => setExportOptions({ ...exportOptions, totalDiscount: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)) })}
                                                    min="0"
                                                    max="100"
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                                />
                                                <span className="text-sm text-text-secondary">%</span>
                                            </div>
                                            {exportOptions.totalDiscount > 0 && (
                                                <p className="text-xs text-green-600 mt-1">-{formatCurrency(finalTotals.totalDiscountAmount)}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm text-text-secondary mb-1">
                                                <Percent className="w-4 h-4 inline mr-1" />
                                                Thuế VAT
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={exportOptions.vatPercent}
                                                    onChange={(e) => setExportOptions({ ...exportOptions, vatPercent: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)) })}
                                                    min="0"
                                                    max="100"
                                                    placeholder="0"
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                                />
                                                <span className="text-sm text-text-secondary">%</span>
                                            </div>
                                            {exportOptions.vatPercent > 0 && (
                                                <p className="text-xs text-accent mt-1">+{formatCurrency(finalTotals.grandTotal * exportOptions.vatPercent / 100)}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Quote Preview */}
                                <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200" id="quote-export-preview">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-primary">ẨM THỰC GIÁO TUYẾT</h3>
                                            <p className="text-sm text-text-secondary">Khách hàng: {customerInfo.name}</p>
                                            <p className="text-sm text-text-secondary">SĐT: {customerInfo.phone}</p>
                                        </div>
                                        <div className="text-right text-sm text-text-secondary">
                                            <p>Ngày: {new Date().toLocaleDateString('vi-VN')}</p>
                                            <p className="font-medium">{quoteDetails.table_count} bàn</p>
                                        </div>
                                    </div>

                                    {exportOptions.showIndividualPrices ? (
                                        /* Show individual prices table */
                                        <table className="w-full text-sm mb-4">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-2 px-2">STT</th>
                                                    <th className="text-left py-2 px-2">Tên món</th>
                                                    <th className="text-right py-2 px-2">SL</th>
                                                    <th className="text-right py-2 px-2">Đơn giá</th>
                                                    <th className="text-right py-2 px-2">Thành tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {quoteItems.map((item, idx) => (
                                                    <tr key={item.id} className="border-b border-gray-100">
                                                        <td className="py-2 px-2">{idx + 1}</td>
                                                        <td className="py-2 px-2">{item.name}</td>
                                                        <td className="py-2 px-2 text-right">{item.quantity}</td>
                                                        <td className="py-2 px-2 text-right">{formatCurrency(item.custom_selling_price ?? item.selling_price)}</td>
                                                        <td className="py-2 px-2 text-right">{formatCurrency(item.total)}</td>
                                                    </tr>
                                                ))}
                                                {/* Table rental */}
                                                {quoteDetails.table_type !== 'none' && (
                                                    <tr className="border-b border-gray-100 bg-gray-50">
                                                        <td className="py-2 px-2">{quoteItems.length + 1}</td>
                                                        <td className="py-2 px-2">{TABLE_TYPE_IDS[quoteDetails.table_type].name}</td>
                                                        <td className="py-2 px-2 text-right">{quoteDetails.table_count}</td>
                                                        <td className="py-2 px-2 text-right">{formatCurrency(totals.effectiveTablePrice)}</td>
                                                        <td className="py-2 px-2 text-right">
                                                            {formatCurrency(finalTotals.finalTableTotal)}
                                                            {exportOptions.tableDiscount > 0 && <span className="text-green-600 text-xs ml-1">(-{exportOptions.tableDiscount}%)</span>}
                                                        </td>
                                                    </tr>
                                                )}
                                                {/* Frame */}
                                                {quoteDetails.frame_count > 0 && (
                                                    <tr className="border-b border-gray-100 bg-amber-50">
                                                        <td className="py-2 px-2">{quoteItems.length + (quoteDetails.table_type !== 'none' ? 2 : 1)}</td>
                                                        <td className="py-2 px-2">🎪 Khung rạp</td>
                                                        <td className="py-2 px-2 text-right">{quoteDetails.frame_count}</td>
                                                        <td className="py-2 px-2 text-right">{formatCurrency(totals.effectiveFramePrice)}</td>
                                                        <td className="py-2 px-2 text-right">
                                                            {formatCurrency(finalTotals.finalFrameTotal)}
                                                            {exportOptions.frameDiscount > 0 && <span className="text-green-600 text-xs ml-1">(-{exportOptions.frameDiscount}%)</span>}
                                                        </td>
                                                    </tr>
                                                )}
                                                {/* Staff */}
                                                {!exportOptions.customerHandlesStaff && quoteDetails.staff_count > 0 && (
                                                    <tr className="border-b border-gray-100 bg-gray-50">
                                                        <td className="py-2 px-2">{quoteItems.length + (quoteDetails.table_type !== 'none' ? 1 : 0) + (quoteDetails.frame_count > 0 ? 1 : 0) + 1}</td>
                                                        <td className="py-2 px-2">Nhân viên phục vụ</td>
                                                        <td className="py-2 px-2 text-right">{quoteDetails.staff_count}</td>
                                                        <td className="py-2 px-2 text-right">{formatCurrency(totals.effectiveStaffPrice)}</td>
                                                        <td className="py-2 px-2 text-right">{formatCurrency(finalTotals.staffComponent)}</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                            <tfoot>
                                                <tr className="border-t-2 border-gray-300 font-bold">
                                                    <td colSpan={4} className="py-3 px-2 text-right">TỔNG CỘNG:</td>
                                                    <td className="py-3 px-2 text-right text-accent text-lg">
                                                        {formatCurrency(finalTotals.grandTotal)}
                                                        {exportOptions.totalDiscount > 0 && <span className="text-green-600 text-xs ml-1">(-{exportOptions.totalDiscount}%)</span>}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    ) : (
                                        /* Show price per table with dish names (no prices) */
                                        <div className="py-4">
                                            {/* Dish names list for verification */}
                                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm font-medium text-primary mb-2">Thực đơn gồm:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {quoteItems.map((item, idx) => (
                                                        <span key={item.id} className="inline-flex items-center px-2 py-1 bg-white border border-gray-200 rounded-lg text-sm text-text-secondary">
                                                            {idx + 1}. {item.name}
                                                        </span>
                                                    ))}
                                                    {quoteDetails.table_type !== 'none' && (
                                                        <span className="inline-flex items-center px-2 py-1 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                                                            🪑 {TABLE_TYPE_IDS[quoteDetails.table_type].name}
                                                        </span>
                                                    )}
                                                    {quoteDetails.frame_count > 0 && (
                                                        <span className="inline-flex items-center px-2 py-1 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                                                            🎪 Khung rạp x{quoteDetails.frame_count}
                                                        </span>
                                                    )}
                                                    {!exportOptions.customerHandlesStaff && quoteDetails.staff_count > 0 && (
                                                        <span className="inline-flex items-center px-2 py-1 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-700">
                                                            👤 Nhân viên x{quoteDetails.staff_count}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Price per table display */}
                                            <div className="text-center py-6 bg-gradient-to-r from-accent/5 to-accent/10 rounded-xl">
                                                <p className="text-text-secondary mb-2">Giá trọn gói / bàn tiệc</p>
                                                <p className="text-4xl font-bold text-accent">{formatCurrency(finalTotals.pricePerTable)}</p>
                                                <p className="text-sm text-text-secondary mt-2">
                                                    × {quoteDetails.table_count} bàn = <span className="font-semibold">{formatCurrency(finalTotals.grandTotal)}</span>
                                                </p>
                                                {exportOptions.vatPercent > 0 && (
                                                    <p className="text-sm text-accent mt-1">
                                                        + VAT {exportOptions.vatPercent}% = <span className="font-semibold">{formatCurrency(finalTotals.grandTotal * (1 + exportOptions.vatPercent / 100))}</span>
                                                    </p>
                                                )}
                                                {(exportOptions.tableDiscount > 0 || exportOptions.frameDiscount > 0 || exportOptions.totalDiscount > 0) && (
                                                    <p className="text-xs text-green-600 mt-1">(Đã áp dụng giảm giá)</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Quote note display */}
                                    {quoteNote && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm italic text-text-secondary">
                                            {quoteNote}
                                        </div>
                                    )}
                                </div>

                                {/* Quote Notes Section */}
                                <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="flex items-center gap-2 font-semibold text-primary">
                                            <FileText className="w-5 h-5" />
                                            Ghi chú báo giá
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setShowAddNote(!showAddNote)}
                                            className="text-sm text-accent hover:underline print:hidden"
                                        >
                                            {showAddNote ? 'Đóng' : '+ Thêm ghi chú mới'}
                                        </button>
                                    </div>

                                    {/* Preset notes selection */}
                                    <div className="space-y-2 mb-3 print:hidden">
                                        {savedNotes.map((note, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setQuoteNote(quoteNote === note ? '' : note)}
                                                    className={`flex-1 text-left px-3 py-2 rounded-lg text-sm transition-all ${quoteNote === note
                                                        ? 'bg-accent/10 border-accent border-2 text-accent'
                                                        : 'bg-gray-50 border border-gray-200 text-text-secondary hover:border-gray-300'
                                                        }`}
                                                >
                                                    {note}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deletePresetNote(note)}
                                                    className="text-red-400 hover:text-red-600 text-xs px-2"
                                                    title="Xóa ghi chú này"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add new preset note */}
                                    {showAddNote && (
                                        <div className="flex gap-2 mb-3 print:hidden">
                                            <input
                                                type="text"
                                                value={newPresetNote}
                                                onChange={(e) => setNewPresetNote(e.target.value)}
                                                placeholder="Nhập ghi chú mới để lưu..."
                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                                onKeyDown={(e) => e.key === 'Enter' && addPresetNote()}
                                            />
                                            <button
                                                type="button"
                                                onClick={addPresetNote}
                                                className="px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent-hover"
                                            >
                                                Lưu
                                            </button>
                                        </div>
                                    )}

                                    {/* Custom note input */}
                                    <textarea
                                        value={quoteNote}
                                        onChange={(e) => setQuoteNote(e.target.value)}
                                        placeholder="Hoặc nhập ghi chú tùy chỉnh..."
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none print:hidden"
                                    />
                                </div>

                                {/* Profit Summary - Internal Only */}
                                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl print:hidden">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="w-5 h-5 text-green-600" />
                                        <h4 className="font-semibold text-primary">Tổng kết lợi nhuận (Nội bộ)</h4>
                                    </div>
                                    <div className="grid sm:grid-cols-3 gap-4 text-center">
                                        <div className="bg-white rounded-lg p-3">
                                            <p className="text-sm text-text-secondary">Tổng doanh thu</p>
                                            <p className="text-xl font-bold text-primary">{formatCurrency(finalTotals.grandTotal)}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-3">
                                            <p className="text-sm text-text-secondary">Tổng giá gốc</p>
                                            <p className="text-xl font-bold text-orange-600">{formatCurrency(finalTotals.totalCost)}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-3">
                                            <p className="text-sm text-text-secondary">Lợi nhuận ước tính</p>
                                            <p className="text-xl font-bold text-green-600">{formatCurrency(finalTotals.totalProfit)}</p>
                                            <p className="text-xs text-green-600">
                                                ({finalTotals.grandTotal > 0 ? ((finalTotals.totalProfit / finalTotals.grandTotal) * 100).toFixed(1) : 0}%)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons - Improved Visual Hierarchy */}
                                <div className="flex flex-wrap items-center gap-3 justify-between print:hidden">
                                    {/* Back Button */}
                                    <button
                                        onClick={handleBack}
                                        className="flex items-center gap-2 px-6 py-3 text-text-secondary hover:bg-gray-100 rounded-xl font-medium transition-all"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                        Quay lại
                                    </button>

                                    {/* Action Buttons Group */}
                                    <div className="flex items-center gap-3">
                                        {/* Tertiary: In báo giá - Subtle gray */}
                                        <button
                                            onClick={handlePrint}
                                            className="flex items-center gap-2 px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-all"
                                        >
                                            <Printer className="w-4 h-4" />
                                            In báo giá
                                        </button>

                                        {/* Secondary: Xuất PDF - Outlined style */}
                                        <PDFExportButton
                                            quoteData={{
                                                customerName: customerInfo.name,
                                                phone: customerInfo.phone,
                                                eventType: customerInfo.event_type,
                                                eventDate: customerInfo.event_date,
                                                numTables: quoteDetails.table_count,
                                                numReserveTables: 0,
                                                dishes: quoteItems.map((item) => ({
                                                    name: item.name,
                                                    quantity: item.quantity,
                                                    unit: item.unit,
                                                    unitPrice: item.custom_selling_price ?? item.selling_price,
                                                    totalPrice: item.total,
                                                    costPrice: item.custom_cost_price ?? item.cost_price,
                                                    profit: item.profit,
                                                })),
                                                totalRevenue: finalTotals.grandTotal,
                                                totalCost: finalTotals.totalCost,
                                                estimatedProfit: finalTotals.totalProfit,
                                            }}
                                        />

                                        {/* Primary: Hoàn thành - Green filled, most prominent */}
                                        <button
                                            onClick={handleSubmitQuote}
                                            disabled={isSubmitting || submitSuccess}
                                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all ${submitSuccess
                                                ? 'bg-green-500 text-white shadow-green-200'
                                                : isSubmitting
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                                    : 'bg-green-500 text-white hover:bg-green-600 shadow-green-200 hover:shadow-green-300'
                                                }`}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Đang lưu...
                                                </>
                                            ) : submitSuccess ? (
                                                <>
                                                    <Check className="w-5 h-5" />
                                                    Đã lưu!
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="w-5 h-5" />
                                                    Hoàn thành
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>



            {/* Print Styles */}
            <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .bg-orange-50, .bg-green-50, .bg-orange-50\/50, .bg-green-50\/50 {
            display: none !important;
          }
        }
      `}</style>
        </main>
    );
}
