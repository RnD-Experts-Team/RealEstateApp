import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router } from '@inertiajs/react';

interface Filters {
    city?: string;
    property?: string;
    unit?: string;
    permanent?: string[];
    is_hidden?: boolean;
    remind?: boolean | null;
    added_to_ledger?: boolean | null;
}

interface PaginationControlsProps {
    meta: any;
    links: Array<{ url: string | null; label: string; active?: boolean }>;
    perPage: string;
    onPerPageChange: (value: string) => void;
    filters: Filters;
}

const PER_PAGE_OPTIONS = ['15', '30', '50', 'all'];

export default function PaginationControls({ meta, links, perPage, onPerPageChange, filters }: PaginationControlsProps) {

    const buildParams = (extra: Record<string, any> = {}) => {
        const params: Record<string, any> = {};
        if (filters.city) params.city = filters.city;
        if (filters.property) params.property = filters.property;
        if (filters.unit) params.unit = filters.unit;
        if (filters.permanent && filters.permanent.length > 0) params.permanent = filters.permanent.join(',');
        if (filters.is_hidden) params.is_hidden = 'true';
        if (typeof filters.remind === 'boolean') params.remind = String(filters.remind);
        if (typeof filters.added_to_ledger === 'boolean') params.added_to_ledger = String(filters.added_to_ledger);
        params.per_page = extra.per_page ?? perPage;
        return { ...params, ...extra };
    };

    const handlePerPageChange = (value: string) => {
        onPerPageChange(value);
        router.get(route('payments.index'), buildParams({ page: 1, per_page: value }), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const navigateTo = (url: string | null, page?: number) => {
        if (typeof page === 'number') {
            router.get(route('payments.index'), buildParams({ page }), {
                preserveState: true,
                preserveScroll: true,
            });
            return;
        }
        if (!url) return;
        // Fallback: use URL if page number cannot be derived
        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    const renderLink = (link: { url: string | null; label: string; active?: boolean }, index: number) => {
        const lower = link.label.toLowerCase();
        if (lower.includes('previous')) {
            return (
                <PaginationItem key={`prev-${index}`}>
                    <PaginationPrevious
                        size="sm"
                        href={link.url || '#'}
                        onClick={(e) => {
                            e.preventDefault();
                            navigateTo(link.url, (meta?.current_page || 2) - 1);
                        }}
                        className={!link.url ? 'pointer-events-none opacity-50' : ''}
                    />
                </PaginationItem>
            );
        }
        if (lower.includes('next')) {
            return (
                <PaginationItem key={`next-${index}`}>
                    <PaginationNext
                        size="sm"
                        href={link.url || '#'}
                        onClick={(e) => {
                            e.preventDefault();
                            navigateTo(link.url, (meta?.current_page || 1) + 1);
                        }}
                        className={!link.url ? 'pointer-events-none opacity-50' : ''}
                    />
                </PaginationItem>
            );
        }
        if (link.label === '...') {
            return (
                <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                </PaginationItem>
            );
        }
        // Numeric page link
        const pageNum = Number(link.label);
        return (
            <PaginationItem key={`page-${index}`}>
                <PaginationLink
                    size="sm"
                    href={link.url || '#'}
                    isActive={!!link.active}
                    onClick={(e) => {
                        e.preventDefault();
                        if (!Number.isNaN(pageNum)) {
                            navigateTo(null, pageNum);
                        } else {
                            navigateTo(link.url);
                        }
                    }}
                >
                    {link.label}
                </PaginationLink>
            </PaginationItem>
        );
    };

    return (
        <div className="mt-4 flex items-center justify-between">
            <Pagination className="flex-1">
                <PaginationContent>{Array.isArray(links) && links.length > 0 && links.map((l, i) => renderLink(l, i))}</PaginationContent>
            </Pagination>

            <div className="w-32">
                <Select value={perPage} onValueChange={handlePerPageChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Per page" />
                    </SelectTrigger>
                    <SelectContent>
                        {PER_PAGE_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                                {opt === 'all' ? 'All' : opt}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
