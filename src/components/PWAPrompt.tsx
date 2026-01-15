'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then((reg) => {
                console.log('Service Worker registered:', reg.scope);
            }).catch((err) => {
                console.log('Service Worker registration failed:', err);
            });
        }

        // Listen for install prompt
        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Show prompt after 5 seconds
            setTimeout(() => {
                setShowPrompt(true);
            }, 5000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        // Check if installed
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowPrompt(false);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setIsInstalled(true);
        }
        setShowPrompt(false);
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Don't show again for 7 days
        localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    };

    // Check if dismissed recently
    useEffect(() => {
        const dismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (dismissed) {
            const dismissedTime = parseInt(dismissed);
            const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            if (dismissedTime > weekAgo) {
                setShowPrompt(false);
            }
        }
    }, []);

    if (isInstalled) return null;

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50"
                >
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                        <Smartphone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Cài đặt ứng dụng</h3>
                                        <p className="text-sm text-white/80">Truy cập nhanh hơn</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDismiss}
                                    className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <p className="text-sm text-text-secondary mb-4">
                                Thêm <strong>ẨM THỰC GIÁO TUYẾT</strong> vào màn hình chính để:
                            </p>
                            <ul className="space-y-2 mb-4">
                                {[
                                    'Truy cập nhanh không cần mở trình duyệt',
                                    'Hoạt động offline (không cần mạng)',
                                    'Nhận thông báo đơn hàng mới',
                                ].map((benefit, index) => (
                                    <li key={index} className="flex items-center gap-2 text-sm text-text-secondary">
                                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        {benefit}
                                    </li>
                                ))}
                            </ul>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleDismiss}
                                    className="flex-1 px-4 py-3 text-text-secondary hover:bg-gray-100 rounded-xl font-medium transition-all"
                                >
                                    Để sau
                                </button>
                                <button
                                    onClick={handleInstall}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all"
                                >
                                    <Download className="w-5 h-5" />
                                    Cài đặt
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Offline indicator component
export function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        setIsOnline(navigator.onLine);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-yellow-500 text-yellow-900 py-2 px-4 text-center text-sm font-medium"
        >
            📴 Bạn đang offline - Dữ liệu có thể không được cập nhật
        </motion.div>
    );
}
