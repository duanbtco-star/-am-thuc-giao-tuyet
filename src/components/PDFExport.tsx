'use client';

import { useCallback } from 'react';
import { FileDown } from 'lucide-react';

interface QuoteData {
    quoteNumber: string;
    customerName: string;
    phone: string;
    address: string;
    eventType: string;
    eventDate: string;
    numTables: number;
    dishes: Array<{
        name: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        totalPrice: number;
    }>;
    pricePerTable: number;
    totalRevenue: number;
    notes: string;
}

interface PDFExportButtonProps {
    quoteData: QuoteData;
    className?: string;
}

export function PDFExportButton({ quoteData, className = '' }: PDFExportButtonProps) {
    const generatePDF = useCallback(async () => {
        // Dynamically import html2pdf to avoid SSR issues
        const html2pdf = (await import('html2pdf.js')).default;

        function formatCurrency(value: number): string {
            return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
        }

        // Build dishes list HTML
        const dishesHtml = quoteData.dishes.map((dish, index) => `
            <div style="margin-bottom: 12px;">
                <div style="font-weight: 600; color: #1f2937; font-size: 14px;">
                    ${index + 1}. ${dish.name}
                </div>
            </div>
        `).join('');

        // Create HTML content for PDF - Elegant Menu Style
        const htmlContent = `
            <div style="font-family: 'Georgia', 'Times New Roman', serif; padding: 30px; max-width: 800px; margin: 0 auto; background: #fff;">
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #b45309; margin: 0; font-size: 26px; letter-spacing: 4px; font-weight: 400;">BẢNG BÁO GIÁ</h1>
                                        <p style="color: #78716c; margin: 5px 0 0 0; font-size: 12px; letter-spacing: 1px;">Mã: ${quoteData.quoteNumber}</p>
                    <div style="margin-top: 15px; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <div style="font-size: 28px; font-weight: 700; color: #92400e; font-family: 'Georgia', serif;">
                            GIÁO TUYẾT
                        </div>
                    </div>
                    <p style="color: #78716c; margin: 8px 0 0 0; font-size: 13px; letter-spacing: 1px;">DỊCH VỤ NẤU TIỆC TẠI NHÀ</p>
                </div>

                <!-- Two Column Layout -->
                <div style="display: flex; gap: 30px; align-items: flex-start;">
                    
                    <!-- Left Column: Menu Card -->
                    <div style="flex: 1; position: relative;">
                        <!-- Decorative border frame -->
                        <div style="border: 2px solid #d4a574; border-radius: 8px; padding: 25px; background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%); position: relative;">
                            
                            <!-- Corner decorations (simulated with borders) -->
                            <div style="position: absolute; top: 8px; left: 8px; right: 8px; bottom: 8px; border: 1px solid #d4a574; border-radius: 4px; pointer-events: none;"></div>
                            
                            <!-- Menu Title -->
                            <div style="text-align: center; margin-bottom: 20px; position: relative; z-index: 1;">
                                <h2 style="color: #1f2937; margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 2px;">MENU</h2>
                                <div style="width: 30px; height: 2px; background: #92400e; margin: 10px auto;"></div>
                                <p style="color: #b45309; font-size: 28px; font-weight: 700; margin: 10px 0;">
                                    ${formatCurrency(quoteData.pricePerTable)}
                                </p>
                                <p style="color: #78716c; font-size: 12px; margin: 0;">/ bàn tiệc</p>
                            </div>

                            <!-- Dishes List -->
                            <div style="position: relative; z-index: 1;">
                                <h3 style="color: #92400e; font-size: 14px; font-weight: 600; margin: 0 0 15px 0; letter-spacing: 1px;">THỰC ĐƠN:</h3>
                                ${dishesHtml}
                            </div>

                            <!-- Table Count -->
                            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed #d4a574; position: relative; z-index: 1;">
                                <p style="color: #78716c; font-size: 13px; margin: 0;">
                                    <strong style="color: #1f2937;">Số lượng:</strong> ${quoteData.numTables} bàn
                                </p>
                                <p style="color: #b45309; font-size: 18px; font-weight: 700; margin: 10px 0 0 0;">
                                    Tổng: ${formatCurrency(quoteData.totalRevenue)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Customer Info -->
                    <div style="flex: 1;">
                        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                            <h3 style="color: #374151; margin: 0 0 20px 0; font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                                <span style="color: #92400e;">📋</span> THÔNG TIN ĐẶT TIỆC
                            </h3>
                            
                            <div style="font-size: 14px;">
                                <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
                                    <span style="color: #6b7280;">📅 Ngày đãi tiệc:</span>
                                    <div style="color: #1f2937; font-weight: 500; margin-top: 4px;">${quoteData.eventDate || 'Chưa xác định'}</div>
                                </div>
                                
                                <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
                                    <span style="color: #6b7280;">🪑 Số bàn:</span>
                                    <div style="color: #1f2937; font-weight: 500; margin-top: 4px;">${quoteData.numTables} bàn</div>
                                </div>
                                
                                <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
                                    <span style="color: #6b7280;">📍 Địa chỉ đãi tiệc:</span>
                                    <div style="color: #1f2937; font-weight: 500; margin-top: 4px;">${quoteData.address || 'Chưa cung cấp'}</div>
                                </div>
                                
                                <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
                                    <span style="color: #6b7280;">👤 Họ và tên:</span>
                                    <div style="color: #1f2937; font-weight: 500; margin-top: 4px;">${quoteData.customerName}</div>
                                </div>
                                
                                <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
                                    <span style="color: #6b7280;">📞 Điện thoại:</span>
                                    <div style="color: #1f2937; font-weight: 500; margin-top: 4px;">${quoteData.phone}</div>
                                </div>

                                ${quoteData.notes ? `
                                <div style="margin-bottom: 0;">
                                    <span style="color: #6b7280;">📝 Ghi chú:</span>
                                    <div style="color: #1f2937; margin-top: 4px; font-style: italic; background: #fef3c7; padding: 10px; border-radius: 6px; border-left: 3px solid #f59e0b;">${quoteData.notes}</div>
                                </div>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Contact Info -->
                        <div style="margin-top: 15px; padding: 15px; background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 8px; text-align: center;">
                            <p style="color: #92400e; font-size: 13px; margin: 0; font-weight: 500;">
                                📞 Liên hệ đặt tiệc: <strong>0912 345 678</strong>
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #d4a574;">
                    <p style="color: #78716c; font-size: 12px; margin: 0;">
                        Cảm ơn quý khách đã tin tưởng <strong style="color: #92400e;">ẨM THỰC GIÁO TUYẾT</strong>!
                    </p>
                    <p style="color: #9ca3af; font-size: 11px; margin: 5px 0 0 0;">
                        Ngày lập báo giá: ${new Date().toLocaleDateString('vi-VN')}
                    </p>
                </div>
            </div>
        `;

        // Create a temporary div
        const element = document.createElement('div');
        element.innerHTML = htmlContent;
        document.body.appendChild(element);

        // PDF options
        const options = {
            margin: 10,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        } as any;

        // Generate PDF as blob and download with explicit filename
        const pdfBlob = await html2pdf().set(options).from(element).outputPdf('blob');

        // Create download link with explicit filename
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${quoteData.quoteNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

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
