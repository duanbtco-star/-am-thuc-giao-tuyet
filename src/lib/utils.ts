// Class name utility (simplified version without clsx)
export function cn(...inputs: (string | undefined | null | false)[]): string {
    return inputs.filter(Boolean).join(' ');
}

// Format currency to VND
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

// Format number with thousand separators
export function formatNumber(num: number): string {
    return new Intl.NumberFormat('vi-VN').format(num);
}

// Format date to Vietnamese format
export function formatDate(date: Date | string, format: 'short' | 'long' | 'full' = 'short'): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    const optionsMap: Record<string, Intl.DateTimeFormatOptions> = {
        short: { day: '2-digit', month: '2-digit', year: 'numeric' },
        long: { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' },
        full: { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' },
    };

    return new Intl.DateTimeFormat('vi-VN', optionsMap[format]).format(d);
}

// Format time
export function formatTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}

// Generate unique ID
export function generateId(prefix: string = ''): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return prefix ? `${prefix}-${timestamp}-${randomStr}` : `${timestamp}-${randomStr}`;
}

// Generate Quote ID (QT-YYYYMMDD-XXX)
export function generateQuoteId(): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `QT-${dateStr}-${random}`;
}

// Generate Order ID (ORD-YYYYMMDD-XXX)
export function generateOrderId(): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `ORD-${dateStr}-${random}`;
}

// Debounce function
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
    func: T,
    waitFor: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>): void => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), waitFor);
    };
}

// Delay/Sleep utility
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Validate Vietnamese phone number
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Format phone number for display
export function formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
}

// Calculate age from date
export function calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// Truncate text
export function truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
}

// Get initials from name
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// Parse JSON safely
export function safeJsonParse<T>(json: string, fallback: T): T {
    try {
        return JSON.parse(json) as T;
    } catch {
        return fallback;
    }
}

// Check if date is today
export function isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

// Check if date is in the past
export function isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
}

// Get days until date
export function daysUntil(date: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Scroll to element
export function scrollToElement(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ==================== FUZZY MATCHING UTILITIES ====================

/**
 * Normalize Vietnamese text for comparison
 * Removes diacritics and converts to lowercase
 */
export function normalizeVietnamese(str: string): string {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-z0-9\s]/g, '') // Keep only alphanumeric and spaces
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Calculate Levenshtein distance between two strings
 * Returns the minimum number of single-character edits required
 */
export function levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;

    // Create distance matrix
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    // Initialize first row and column
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    // Fill in the rest
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(
                    dp[i - 1][j],     // deletion
                    dp[i][j - 1],     // insertion
                    dp[i - 1][j - 1]  // substitution
                );
            }
        }
    }

    return dp[m][n];
}

/**
 * Calculate similarity score between two strings (0-1)
 * Higher score = more similar
 */
export function calculateSimilarity(str1: string, str2: string): number {
    const normalized1 = normalizeVietnamese(str1);
    const normalized2 = normalizeVietnamese(str2);

    // If one string contains the other, high similarity
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
        const minLen = Math.min(normalized1.length, normalized2.length);
        const maxLen = Math.max(normalized1.length, normalized2.length);
        return 0.7 + (0.3 * minLen / maxLen); // 0.7-1.0 range
    }

    // Token-based matching (match individual words)
    const tokens1 = normalized1.split(' ');
    const tokens2 = normalized2.split(' ');
    let matchedTokens = 0;

    for (const t1 of tokens1) {
        if (t1.length < 2) continue;
        for (const t2 of tokens2) {
            if (t2.includes(t1) || t1.includes(t2)) {
                matchedTokens++;
                break;
            }
        }
    }

    const tokenScore = tokens1.length > 0 ? matchedTokens / tokens1.length : 0;
    if (tokenScore > 0.5) {
        return 0.5 + (tokenScore * 0.4); // 0.5-0.9 range for token match
    }

    // Levenshtein-based similarity
    const distance = levenshteinDistance(normalized1, normalized2);
    const maxLen = Math.max(normalized1.length, normalized2.length);
    const levenshteinScore = maxLen > 0 ? 1 - (distance / maxLen) : 0;

    return levenshteinScore;
}

/**
 * Find similar items from a list based on name similarity
 * Returns top N matches with score above threshold
 */
export function findSimilarItems<T extends { name: string }>(
    searchTerm: string,
    items: T[],
    options: {
        threshold?: number;  // Minimum similarity score (0-1)
        limit?: number;      // Max number of results
    } = {}
): { item: T; score: number }[] {
    const { threshold = 0.35, limit = 3 } = options;

    const results = items
        .map(item => ({
            item,
            score: calculateSimilarity(searchTerm, item.name)
        }))
        .filter(x => x.score >= threshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    return results;
}
