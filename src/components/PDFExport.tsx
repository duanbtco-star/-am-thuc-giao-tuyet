'use client';

import { useCallback } from 'react';
import { FileDown } from 'lucide-react';

interface QuoteData {
    customerName: string;
    phone: string;
    eventType: string;
    eventDate: string;
    numTables: number;
    numReserveTables: number;
    dishes: Array<{
        name: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        totalPrice: number;
        costPrice?: number;
        profit?: number;
    }>;
    totalRevenue: number;
    totalCost: number;
    estimatedProfit: number;
}

interface PDFExportButtonProps {
    quoteData: QuoteData;
    className?: string;
}

export function PDFExportButton({ quoteData, className = '' }: PDFExportButtonProps) {
    const generatePDF = useCallback(async () => {
        // Dynamically import html2pdf to avoid SSR issues
        const html2pdf = (await import('html2pdf.js')).default;

        // Create HTML content for PDF
        const htmlContent = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px;">
                    <h1 style="color: #1e40af; margin: 0; font-size: 28px;">ẨM THỰC GIÁO TUYẾT</h1>
                    <p style="color: #64748b; margin: 5px 0;">Dịch Vụ Nấu Ăn Tiệc Tại Nhà</p>
                    <p style="color: #64748b; margin: 5px 0; font-size: 14px;">📞 0912 345 678 | 📧 contact@amthucgiatuyet.com</p>
                </div>

                <!-- Quote Title -->
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #1f2937; margin: 0; font-size: 22px;">BÁO GIÁ DỊCH VỤ</h2>
                    <p style="color: #6b7280; font-size: 14px;">Ngày lập: ${new Date().toLocaleDateString('vi-VN')}</p>
                </div>

                <!-- Customer Info -->
                <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
                    <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">THÔNG TIN KHÁCH HÀNG</h3>
                    <table style="width: 100%; font-size: 14px;">
                        <tr>
                            <td style="padding: 5px 0; color: #6b7280; width: 40%;">Khách hàng:</td>
                            <td style="padding: 5px 0; font-weight: 600; color: #1f2937;">${quoteData.customerName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #6b7280;">Số điện thoại:</td>
                            <td style="padding: 5px 0; color: #1f2937;">${quoteData.phone}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #6b7280;">Loại tiệc:</td>
                            <td style="padding: 5px 0; color: #1f2937;">${quoteData.eventType}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #6b7280;">Ngày tổ chức:</td>
                            <td style="padding: 5px 0; color: #1f2937;">${quoteData.eventDate}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #6b7280;">Số bàn:</td>
                            <td style="padding: 5px 0; color: #1f2937;">${quoteData.numTables} bàn chính + ${quoteData.numReserveTables} bàn dự phòng</td>
                        </tr>
                    </table>
                </div>

                <!-- Dishes Table -->
                <div style="margin-bottom: 25px;">
                    <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">CHI TIẾT THỰC ĐƠN</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                        <thead>
                            <tr style="background: #3b82f6; color: white;">
                                <th style="padding: 12px 10px; text-align: left; border-radius: 5px 0 0 0;">STT</th>
                                <th style="padding: 12px 10px; text-align: left;">Tên món</th>
                                <th style="padding: 12px 10px; text-align: center;">SL</th>
                                <th style="padding: 12px 10px; text-align: right;">Đơn giá</th>
                                <th style="padding: 12px 10px; text-align: right; border-radius: 0 5px 0 0;">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${quoteData.dishes.map((dish, index) => `
                                <tr style="border-bottom: 1px solid #e5e7eb; ${index % 2 === 1 ? 'background: #f9fafb;' : ''}">
                                    <td style="padding: 10px;">${index + 1}</td>
                                    <td style="padding: 10px; font-weight: 500;">${dish.name}</td>
                                    <td style="padding: 10px; text-align: center;">${dish.quantity} ${dish.unit}</td>
                                    <td style="padding: 10px; text-align: right;">${formatCurrency(dish.unitPrice)}</td>
                                    <td style="padding: 10px; text-align: right; font-weight: 600;">${formatCurrency(dish.totalPrice)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Summary -->
                <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
                    <table style="width: 100%; font-size: 16px;">
                        <tr>
                            <td style="padding: 8px 0;">Tổng giá trị báo giá:</td>
                            <td style="padding: 8px 0; text-align: right; font-size: 24px; font-weight: 700;">${formatCurrency(quoteData.totalRevenue)}</td>
                        </tr>
                    </table>
                </div>

                <!-- Terms -->
                <div style="background: #fef3c7; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #f59e0b;">
                    <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 14px;">📝 ĐIỀU KHOẢN</h4>
                    <ul style="color: #78350f; font-size: 13px; margin: 0; padding-left: 20px; line-height: 1.8;">
                        <li>Đặt cọc 50% giá trị đơn hàng khi xác nhận</li>
                        <li>Thanh toán 50% còn lại sau khi hoàn thành</li>
                        <li>Báo giá có hiệu lực trong 7 ngày</li>
                        <li>Giá có thể thay đổi nếu số bàn thay đổi</li>
                    </ul>
                </div>

                <!-- Footer -->
                <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 13px; margin: 0;">Cảm ơn quý khách đã tin tưởng ẨM THỰC GIÁO TUYẾT!</p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">Mọi thắc mắc xin liên hệ: 0912 345 678</p>
                </div>
            </div>
        `;

        function formatCurrency(value: number): string {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(value);
        }

        // Create a temporary div
        const element = document.createElement('div');
        element.innerHTML = htmlContent;
        document.body.appendChild(element);

        // PDF options
        const options = {
            margin: 10,
            filename: `BaoGia_${quoteData.customerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        } as any;

        // Generate PDF
        await html2pdf().set(options).from(element).save();

        // Clean up
        document.body.removeChild(element);
    }, [quoteData]);

    return (
        <button
            onClick={generatePDF}
            className={`flex items-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all ${className}`}
        >
            <FileDown className="w-5 h-5" />
            Xuất PDF
        </button>
    );
}
