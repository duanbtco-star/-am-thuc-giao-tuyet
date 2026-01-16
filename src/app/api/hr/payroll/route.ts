import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const PayrollCreateSchema = z.object({
    month: z.number().min(1).max(12),
    year: z.number().min(2000),
})

// GET /api/hr/payroll - Get payroll records with filters
export async function GET(request: Request) {
    try {
        const supabase = createClient()
        const { searchParams } = new URL(request.url)

        const month = searchParams.get('month')
        const year = searchParams.get('year')
        const employeeId = searchParams.get('employee_id')

        let query = supabase
            .from('payroll')
            .select('*, employees(full_name, employee_code, department)')
            .order('year', { ascending: false })
            .order('month', { ascending: false })

        if (employeeId) {
            query = query.eq('employee_id', employeeId)
        }

        if (month) {
            query = query.eq('month', parseInt(month))
        }

        if (year) {
            query = query.eq('year', parseInt(year))
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching payroll:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Lỗi khi tải dữ liệu lương' },
            { status: 500 }
        )
    }
}

// POST /api/hr/payroll - Calculate and create payroll for a month
export async function POST(request: Request) {
    try {
        const supabase = createClient()
        const body = await request.json()

        // Validate input
        const result = PayrollCreateSchema.safeParse(body)
        if (!result.success) {
            return NextResponse.json(
                { error: 'Dữ liệu không hợp lệ', details: result.error.flatten() },
                { status: 400 }
            )
        }

        const { month, year } = result.data

        // Get all active employees
        const { data: employees, error: empError } = await supabase
            .from('employees')
            .select('id, employee_code, full_name, base_salary, daily_rate')
            .eq('status', 'active')

        if (empError) {
            return NextResponse.json({ error: empError.message }, { status: 500 })
        }

        if (!employees || employees.length === 0) {
            return NextResponse.json(
                { error: 'Không có nhân viên nào đang hoạt động' },
                { status: 400 }
            )
        }

        // Calculate payroll for each employee
        const payrollRecords = []

        for (const employee of employees) {
            // Get attendance records for this month
            const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
            const endDate = new Date(year, month, 0).toISOString().split('T')[0]

            const { data: attendanceRecords } = await supabase
                .from('attendance')
                .select('*')
                .eq('employee_id', employee.id)
                .eq('status', 'present')
                .gte('date', startDate)
                .lte('date', endDate)

            const totalDaysWorked = attendanceRecords?.length || 0

            // Calculate salary
            // Formula: total_days_worked × daily_rate
            const baseSalary = totalDaysWorked * (employee.daily_rate || 0)

            payrollRecords.push({
                employee_id: employee.id,
                month,
                year,
                total_days_worked: totalDaysWorked,
                base_salary: baseSalary,
                allowances: 0,
                bonus: 0,
                deductions: 0,
                // total_salary will be auto-calculated by database trigger
            })
        }

        // Insert payroll records (using upsert to handle duplicates)
        const { data, error } = await supabase
            .from('payroll')
            .upsert(payrollRecords, {
                onConflict: 'employee_id,month,year',
                ignoreDuplicates: false
            })
            .select()

        if (error) {
            console.error('Error creating payroll:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(
            {
                success: true,
                count: data?.length || 0,
                data
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Lỗi khi tính lương' },
            { status: 500 }
        )
    }
}
