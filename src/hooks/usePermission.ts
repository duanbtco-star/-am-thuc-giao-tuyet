'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState, useCallback } from 'react'

export type UserRole = 'admin' | 'manager' | 'staff' | 'viewer'

interface UserProfile {
    id: string
    role: UserRole
    full_name: string | null
}

interface PermissionCheck {
    module?: string
    action?: string
    resource?: { type: string; id: string }
}

// Module access configuration
const ModuleAccess: Record<string, UserRole[]> = {
    dashboard: ['admin', 'manager', 'staff', 'viewer'],
    'bao-gia': ['admin', 'manager', 'staff'],
    'don-hang': ['admin', 'manager', 'staff'],
    lich: ['admin', 'manager', 'staff', 'viewer'],
    'tai-chinh': ['admin', 'manager'],
    vendor: ['admin', 'manager', 'staff'],
    'bao-cao': ['admin', 'manager'],
    hr: ['admin', 'manager'],
    settings: ['admin'],
}

// CRUD permissions per role
const RolePermissions: Record<UserRole, string[]> = {
    admin: ['create', 'read', 'update', 'delete', 'approve', 'manage'],
    manager: ['create', 'read', 'update', 'approve'],
    staff: ['create', 'read', 'update'],
    viewer: ['read'],
}

export function usePermission() {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        async function loadProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    setLoading(false)
                    return
                }

                const { data } = await supabase
                    .from('user_profiles')
                    .select('id, role, full_name')
                    .eq('id', user.id)
                    .single()

                setProfile(data)
            } catch (error) {
                console.error('Error loading profile:', error)
            } finally {
                setLoading(false)
            }
        }

        loadProfile()
    }, [supabase])

    // Check if user can access a module
    const canAccessModule = useCallback((module: string): boolean => {
        if (!profile) return false

        const allowedRoles = ModuleAccess[module]
        if (!allowedRoles) return false

        return allowedRoles.includes(profile.role)
    }, [profile])

    // Check if user has a specific permission
    const canDo = useCallback((action: string): boolean => {
        if (!profile) return false

        const permissions = RolePermissions[profile.role]
        return permissions.includes(action)
    }, [profile])

    // Comprehensive permission check
    const can = useCallback((check: PermissionCheck): boolean => {
        if (!profile) return false

        // 1. Module access check
        if (check.module) {
            if (!canAccessModule(check.module)) return false
        }

        // 2. Action check
        if (check.action) {
            if (!canDo(check.action)) return false
        }

        return true
    }, [profile, canAccessModule, canDo])

    // Check if user is admin
    const isAdmin = profile?.role === 'admin'
    const isManager = profile?.role === 'admin' || profile?.role === 'manager'

    return {
        profile,
        role: profile?.role || null,
        loading,
        can,
        canAccessModule,
        canDo,
        isAdmin,
        isManager,
    }
}
