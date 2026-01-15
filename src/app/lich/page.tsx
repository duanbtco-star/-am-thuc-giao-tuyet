'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Users,
    LayoutGrid,
    List,
    X,
    RefreshCw
} from 'lucide-react';
import { EVENT_TYPES } from '@/lib/constants';
import { calendarApi, CalendarEvent } from '@/lib/google-sheets';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';

// Mock Events Data
const mockEvents = [
    {
        id: 'EVT-001',
        order_id: 'ORD-20260115-A1X',
        title: 'Đám cưới - Nguyễn Văn An',
        event_date: '2026-01-25',
        start_time: '11:00',
        end_time: '14:00',
        event_type: 'dam_cuoi',
        location: '123 Lê Văn Sỹ, Q.3, TP.HCM',
        guest_count: 150,
        status: 'confirmed',
    },
    {
        id: 'EVT-002',
        order_id: 'ORD-20260114-B2Y',
        title: 'Thôi nôi - Trần Thị Bích',
        event_date: '2026-01-20',
        start_time: '10:00',
        end_time: '12:00',
        event_type: 'thoi_noi',
        location: '456 Nguyễn Đình Chiểu, Q.1, TP.HCM',
        guest_count: 50,
        status: 'confirmed',
    },
    {
        id: 'EVT-003',
        order_id: 'ORD-20260113-C3Z',
        title: 'Đám hỏi - Lê Văn Cường',
        event_date: '2026-01-18',
        start_time: '09:00',
        end_time: '11:00',
        event_type: 'dam_hoi',
        location: '789 Điện Biên Phủ, Q.10, TP.HCM',
        guest_count: 80,
        status: 'in_progress',
    },
    {
        id: 'EVT-004',
        order_id: 'ORD-20260120-F6U',
        title: 'Sinh nhật - Ngô Thị Hương',
        event_date: '2026-01-26',
        start_time: '18:00',
        end_time: '21:00',
        event_type: 'sinh_nhat',
        location: '100 Nguyễn Huệ, Q.1, TP.HCM',
        guest_count: 30,
        status: 'confirmed',
    },
    {
        id: 'EVT-005',
        order_id: 'ORD-20260121-G7T',
        title: 'Liên hoan - Công ty ABC',
        event_date: '2026-01-28',
        start_time: '12:00',
        end_time: '14:00',
        event_type: 'lien_hoan',
        location: '200 Pasteur, Q.3, TP.HCM',
        guest_count: 100,
        status: 'confirmed',
    },
];

// Calendar Helpers
const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

interface CalendarEventItem {
    id: string;
    order_id: string;
    title: string;
    event_date: string;
    start_time: string;
    end_time: string;
    event_type: string;
    location: string;
    guest_count: number;
    status: string;
}

export default function CalendarPage() {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);
    const [events, setEvents] = useState<CalendarEventItem[]>(mockEvents);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { addToast } = useToast();

    // Fetch events from API
    const fetchEvents = useCallback(async (showToast = false) => {
        try {
            if (showToast) setRefreshing(true);
            else setLoading(true);

            const response = await calendarApi.getAll();

            if (response.success && response.data) {
                const eventsData = Array.isArray(response.data) ? response.data : [];
                if (eventsData.length > 0) {
                    setEvents(eventsData.map(e => ({
                        id: e.event_id,
                        order_id: e.order_id,
                        title: e.title,
                        event_date: e.event_date,
                        start_time: e.start_time,
                        end_time: e.end_time,
                        event_type: e.event_type,
                        location: e.location,
                        guest_count: 0,
                        status: e.status,
                    })));
                } else {
                    setEvents(mockEvents);
                }
                if (showToast) addToast('success', 'Đã cập nhật lịch');
            } else {
                setEvents(mockEvents);
            }
        } catch (err) {
            console.error('Error fetching events:', err);
            setEvents(mockEvents);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const calendarDays = useMemo(() => {
        const days: (number | null)[] = [];

        // Empty cells for days before the first day
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        // Days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        return days;
    }, [daysInMonth, firstDay]);

    const getEventsForDate = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter(e => e.event_date === dateStr);
    };

    const getEventInfo = (eventType: string) => {
        const event = Object.values(EVENT_TYPES).find(e => e.id === eventType);
        return event || { name: eventType, icon: '🍽️', color: '#888' };
    };

    const goToPreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const goToToday = () => {
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
    };

    const isToday = (day: number) => {
        return day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();
    };

    // Events for list view
    const upcomingEvents = events
        .filter(e => new Date(e.event_date) >= today)
        .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

    return (
        <main className="min-h-screen bg-background-light">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="section-container">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <ChevronLeft className="w-5 h-5 text-text-secondary" />
                            <span className="text-text-secondary hidden sm:inline">Quay lại</span>
                        </Link>

                        <h1 className="text-lg font-semibold text-primary">Quản lý lịch</h1>

                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                onClick={() => fetchEvents(true)}
                                disabled={refreshing}
                                className="p-2 rounded-lg text-text-secondary hover:bg-gray-100 disabled:opacity-50"
                            >
                                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={() => setViewMode('month')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'month' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-100'}`}
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-100'}`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="section-container py-8">
                {viewMode === 'month' ? (
                    <div className="bg-white rounded-3xl p-6">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={goToPreviousMonth}
                                    className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                <h2 className="text-2xl font-semibold text-primary">
                                    {MONTHS[currentMonth]} {currentYear}
                                </h2>

                                <button
                                    onClick={goToNextMonth}
                                    className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>

                            <button
                                onClick={goToToday}
                                className="px-4 py-2 text-sm font-medium text-accent hover:bg-accent/10 rounded-lg transition-all"
                            >
                                Hôm nay
                            </button>
                        </div>

                        {/* Days of Week Header */}
                        <div className="grid grid-cols-7 gap-2 mb-4">
                            {DAYS.map((day, index) => (
                                <div
                                    key={day}
                                    className={`text-center py-2 text-sm font-medium ${index === 0 ? 'text-red-500' : 'text-text-secondary'
                                        }`}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-2">
                            {calendarDays.map((day, index) => {
                                if (day === null) {
                                    return <div key={`empty-${index}`} className="h-24" />;
                                }

                                const events = getEventsForDate(day);
                                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                                return (
                                    <motion.div
                                        key={day}
                                        className={`h-24 p-2 rounded-xl border transition-all cursor-pointer ${isToday(day)
                                            ? 'border-accent bg-accent/5'
                                            : selectedDate === dateStr
                                                ? 'border-primary bg-primary/5'
                                                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                            }`}
                                        onClick={() => setSelectedDate(dateStr)}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className={`text-sm font-medium mb-1 ${isToday(day) ? 'text-accent' : 'text-primary'
                                            }`}>
                                            {day}
                                        </div>

                                        <div className="space-y-1 overflow-hidden">
                                            {events.slice(0, 2).map(event => {
                                                const eventInfo = getEventInfo(event.event_type);
                                                return (
                                                    <div
                                                        key={event.id}
                                                        className="text-xs px-1.5 py-0.5 rounded truncate"
                                                        style={{ backgroundColor: `${eventInfo.color}20`, color: eventInfo.color }}
                                                        onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                                                    >
                                                        {eventInfo.icon} {event.title.split(' - ')[0]}
                                                    </div>
                                                );
                                            })}
                                            {events.length > 2 && (
                                                <div className="text-xs text-text-secondary">
                                                    +{events.length - 2} sự kiện
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-100">
                            {Object.values(EVENT_TYPES).slice(0, 4).map(event => (
                                <div key={event.id} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: event.color }} />
                                    <span className="text-sm text-text-secondary">{event.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* List View */
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-primary mb-6">Sự kiện sắp tới</h2>

                        {upcomingEvents.map((event, index) => {
                            const eventInfo = getEventInfo(event.event_type);
                            const eventDate = new Date(event.event_date);

                            return (
                                <motion.div
                                    key={event.id}
                                    className="bg-white rounded-2xl p-6 hover:shadow-apple-lg transition-all cursor-pointer"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => setSelectedEvent(event)}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Date Box */}
                                        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-accent/10 flex flex-col items-center justify-center">
                                            <span className="text-2xl font-bold text-accent">{eventDate.getDate()}</span>
                                            <span className="text-xs text-accent">{MONTHS[eventDate.getMonth()]}</span>
                                        </div>

                                        {/* Event Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xl">{eventInfo.icon}</span>
                                                <h3 className="font-semibold text-primary">{event.title}</h3>
                                            </div>

                                            <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {event.start_time} - {event.end_time}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    {event.guest_count} khách
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {event.location}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div
                                            className="px-3 py-1 rounded-full text-sm font-medium"
                                            style={{ backgroundColor: `${eventInfo.color}20`, color: eventInfo.color }}
                                        >
                                            {eventInfo.name}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {upcomingEvents.length === 0 && (
                            <div className="text-center py-12 text-text-secondary">
                                Không có sự kiện sắp tới
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Event Detail Modal */}
            {selectedEvent && (
                <motion.div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setSelectedEvent(null)}
                >
                    <motion.div
                        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{getEventInfo(selectedEvent.event_type).icon}</span>
                                    <div>
                                        <h2 className="text-xl font-semibold text-primary">{selectedEvent.title}</h2>
                                        <p className="text-text-secondary">{selectedEvent.order_id}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
                                >
                                    <X className="w-5 h-5 text-text-secondary" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <CalendarIcon className="w-5 h-5 text-accent" />
                                    <div>
                                        <p className="text-sm text-text-secondary">Ngày</p>
                                        <p className="font-medium text-primary">
                                            {new Date(selectedEvent.event_date).toLocaleDateString('vi-VN', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <Clock className="w-5 h-5 text-accent" />
                                    <div>
                                        <p className="text-sm text-text-secondary">Thời gian</p>
                                        <p className="font-medium text-primary">{selectedEvent.start_time} - {selectedEvent.end_time}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <MapPin className="w-5 h-5 text-accent" />
                                    <div>
                                        <p className="text-sm text-text-secondary">Địa điểm</p>
                                        <p className="font-medium text-primary">{selectedEvent.location}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <Users className="w-5 h-5 text-accent" />
                                    <div>
                                        <p className="text-sm text-text-secondary">Số khách</p>
                                        <p className="font-medium text-primary">{selectedEvent.guest_count} người</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Link href={`/don-hang`} className="flex-1 btn-primary text-center">
                                    Xem đơn hàng
                                </Link>
                                <button className="flex-1 btn-outline">
                                    Chỉnh sửa
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </main>
    );
}
