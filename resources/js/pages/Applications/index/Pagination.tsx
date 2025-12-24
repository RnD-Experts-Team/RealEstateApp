import { router } from '@inertiajs/react';
import {
    Pagination as UiPagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PaginationLinkItem {
    url: string | null;
    label: string;
    active: boolean;
}

interface Filters {
    [key: string]: string | boolean | undefined;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface PaginationProps {
    links: PaginationLinkItem[];
    meta: PaginationMeta;
    filters: Filters;
    perPage: string;
    onPerPageChange: (value: string) => void;
}

const PER_PAGE_OPTIONS = ['15', '30', '50', 'all'];

export default function Pagination({ links, meta, filters, perPage, onPerPageChange }: PaginationProps) {
    const buildParams = (extra: Record<string, any> = {}) => {
        const params: Record<string, any> = {};

        Object.keys(filters || {}).forEach((k) => {
            const v = filters[k];

            // Special handling: mimic Payments behavior
            // Only send is_hidden when it's true
            if (k === 'is_hidden') {
                if (v === true) params.is_hidden = 'true';
                return;
            }

            // Default: include non-empty strings
            if (typeof v === 'string' && v !== '') {
                params[k] = v;
            }
        });

        params.per_page = extra.per_page ?? perPage;
        return { ...params, ...extra };
    };

    const handlePerPageChange = (value: string) => {
        onPerPageChange(value);
        router.get(route('applications.index'), buildParams({ page: 1, per_page: value }), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const navigateTo = (url: string | null, page?: number) => {
        if (typeof page === 'number') {
            router.get(route('applications.index'), buildParams({ page }), {
                preserveState: true,
                preserveScroll: true,
            });
            return;
        }
        if (!url) return;

        // If the link URLs already include query params from Laravel pagination,
        // you could navigate directly. But to guarantee we keep our filters,
        // we prefer using route + params when possible.
        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    const renderLink = (link: PaginationLinkItem, index: number) => {
        const lower = link.label.toLowerCase();

        if (lower.includes('previous')) {
            return (
                <PaginationItem key={`prev-${index}`}>
                    <PaginationPrevious
                        size="sm"
                        href={link.url || '#'}
                        onClick={(e) => {
                            e.preventDefault();
                            navigateTo(null, (meta.current_page || 2) - 1);
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
                            navigateTo(null, (meta.current_page || 1) + 1);
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
        <div className="mt-6 flex items-center justify-between relative z-30">
            <UiPagination className="flex-1">
                <PaginationContent>
                    {Array.isArray(links) && links.length > 0 && links.map((l, i) => renderLink(l, i))}
                </PaginationContent>
            </UiPagination>

            <div className="w-32">
                <Select value={perPage} onValueChange={(value) => handlePerPageChange(value)}>
                    <SelectTrigger className="relative z-50">
                        <SelectValue placeholder="Per page" />
                    </SelectTrigger>
                    <SelectContent className="z-50">
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
