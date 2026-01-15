'use client';

import { useCallback } from 'react';
import { FileSpreadsheet, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Generic Excel Export Function
export function exportToExcel<T extends Record<string, unknown>>(
    data: T[],
    filename: string,
    sheetName: string = 'Sheet1',
    headers?: { [key: string]: string }
) {
    // Transform data with custom headers if provided
    const transformedData = headers
        ? data.map(row => {
            const newRow: Record<string, unknown> = {};
            Object.keys(headers).forEach(key => {
                newRow[headers[key]] = row[key];
            });
            return newRow;
        })
        : data;

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(transformedData);

    // Auto-column width
    const colWidths = Object.keys(transformedData[0] || {}).map(key => ({
        wch: Math.max(
            key.length,
            ...transformedData.map(row => String(row[key] || '').length)
        ) + 2
    }));
    worksheet['!cols'] = colWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Save file
    saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Finance Excel Export Button
interface ExcelExportButtonProps {
    data: Record<string, unknown>[];
    filename: string;
    sheetName?: string;
    headers?: { [key: string]: string };
    className?: string;
    label?: string;
}

export function ExcelExportButton({
    data,
    filename,
    sheetName = 'Data',
    headers,
    className = '',
    label = 'Xuất Excel'
}: ExcelExportButtonProps) {
    const handleExport = useCallback(() => {
        if (data.length === 0) {
            alert('Không có dữ liệu để xuất');
            return;
        }
        exportToExcel(data, filename, sheetName, headers);
    }, [data, filename, sheetName, headers]);

    return (
        <button
            onClick={handleExport}
            disabled={data.length === 0}
            className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            <FileSpreadsheet className="w-5 h-5" />
            {label}
        </button>
    );
}

// Pre-configured export for Finance
export function FinanceExcelExport({ transactions }: {
    transactions: Array<{
        id: string;
        date: string;
        type: 'income' | 'expense';
        category: string;
        amount: number;
        description: string;
        order_id?: string | null;
        payment_method: string;
        vendor_name?: string;
    }>
}) {
    const headers = {
        id: 'Mã GD',
        date: 'Ngày',
        type: 'Loại',
        category: 'Danh mục',
        amount: 'Số tiền',
        description: 'Mô tả',
        order_id: 'Mã đơn hàng',
        payment_method: 'Phương thức',
        vendor_name: 'Nhà cung cấp',
    };

    const formattedData = transactions.map(t => ({
        ...t,
        type: t.type === 'income' ? 'Thu' : 'Chi',
        amount: t.amount,
    }));

    return (
        <ExcelExportButton
            data={formattedData}
            filename="TaiChinh_BaoCao"
            sheetName="Giao dịch"
            headers={headers}
            label="Xuất Excel"
        />
    );
}

// Pre-configured export for Orders
export function OrdersExcelExport({ orders }: {
    orders: Array<{
        order_id: string;
        customer_name: string;
        phone: string;
        event_type: string;
        event_date: string;
        location: string;
        num_tables: number;
        total_revenue: number;
        deposit: number;
        balance: number;
        status: string;
    }>
}) {
    const headers = {
        order_id: 'Mã đơn',
        customer_name: 'Khách hàng',
        phone: 'SĐT',
        event_type: 'Loại tiệc',
        event_date: 'Ngày',
        location: 'Địa điểm',
        num_tables: 'Số bàn',
        total_revenue: 'Tổng tiền',
        deposit: 'Đã cọc',
        balance: 'Còn lại',
        status: 'Trạng thái',
    };

    return (
        <ExcelExportButton
            data={orders}
            filename="DonHang_BaoCao"
            sheetName="Đơn hàng"
            headers={headers}
            label="Xuất Excel"
        />
    );
}
