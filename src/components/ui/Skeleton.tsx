'use client';

import { motion } from 'framer-motion';
import { CSSProperties } from 'react';

interface SkeletonProps {
    className?: string;
    style?: CSSProperties;
}

// Basic skeleton building block
export function Skeleton({ className = '', style }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded ${className}`}
            style={style}
        />
    );
}

// Card skeleton for KPI cards
export function CardSkeleton() {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="w-12 h-4" />
            </div>
            <Skeleton className="w-20 h-8 mb-2" />
            <Skeleton className="w-24 h-3" />
        </div>
    );
}

// Table row skeleton
export function TableRowSkeleton() {
    return (
        <div className="flex items-center gap-4 p-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="flex-1 space-y-2">
                <Skeleton className="w-3/4 h-4" />
                <Skeleton className="w-1/2 h-3" />
            </div>
            <div className="text-right space-y-2">
                <Skeleton className="w-20 h-4" />
                <Skeleton className="w-16 h-5 rounded-full" />
            </div>
        </div>
    );
}

// List skeleton
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: rows }).map((_, i) => (
                <TableRowSkeleton key={i} />
            ))}
        </div>
    );
}

// Calendar skeleton
export function CalendarSkeleton() {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <Skeleton className="w-32 h-6" />
                <div className="flex gap-2">
                    <Skeleton className="w-8 h-8 rounded" />
                    <Skeleton className="w-8 h-8 rounded" />
                </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                ))}
            </div>
            <div className="grid grid-cols-7 gap-2 mt-4">
                {Array.from({ length: 35 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 rounded-lg" />
                ))}
            </div>
        </div>
    );
}

// Full page loading skeleton
export function PageSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6">
            <div className="max-w-[1600px] mx-auto">
                {/* Header skeleton */}
                <div className="flex items-center justify-between mb-8">
                    <Skeleton className="w-48 h-8" />
                    <Skeleton className="w-32 h-10 rounded-xl" />
                </div>

                {/* KPI cards skeleton */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>

                {/* Content skeleton */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <Skeleton className="w-40 h-6 mb-6" />
                    <ListSkeleton rows={5} />
                </div>
            </div>
        </div>
    );
}

// Quote form skeleton
export function FormSkeleton() {
    return (
        <div className="bg-white rounded-2xl p-6 space-y-5">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                    <Skeleton className="w-32 h-4 mb-2" />
                    <Skeleton className="w-full h-11 rounded-xl" />
                </div>
            ))}
        </div>
    );
}

// Chart skeleton
export function ChartSkeleton() {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Skeleton className="w-40 h-5 mb-2" />
                    <Skeleton className="w-32 h-3" />
                </div>
                <Skeleton className="w-24 h-4" />
            </div>
            <div className="flex items-end justify-between h-52 gap-4 px-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex justify-center gap-1.5 h-44">
                            <Skeleton
                                className="w-6 rounded-t-lg"
                                style={{ height: `${Math.random() * 80 + 20}%` }}
                            />
                            <Skeleton
                                className="w-6 rounded-t-lg"
                                style={{ height: `${Math.random() * 60 + 20}%` }}
                            />
                        </div>
                        <Skeleton className="w-8 h-4" />
                    </div>
                ))}
            </div>
        </div>
    );
}
