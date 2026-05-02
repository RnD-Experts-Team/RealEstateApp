import { Button } from '@/components/ui/button';

interface PaginationInfoProps {
    meta: {
        from?: number;
        to?: number;
        total?: number;
        current_page?: number;
        last_page?: number;
    };
    perPage?: string;
    onPageChange: (page: number) => void;
}

export default function PaginationInfo({ meta, perPage, onPageChange }: PaginationInfoProps) {
    const currentPage = meta.current_page ?? 1;
    const lastPage = meta.last_page ?? 1;
    const isAll = perPage === 'all';

    const canPrev = !isAll && currentPage > 1;
    const canNext = !isAll && currentPage < lastPage;

    return (
        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <div className="text-sm text-muted-foreground">
                Showing {meta.from || 0} to {meta.to || 0} of {meta.total || 0} results
            </div>
            <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {lastPage}
                </span>
                <div className="flex items-center gap-2">
                    <Button variant="outline" disabled={!canPrev} onClick={() => onPageChange(currentPage - 1)}>
                        Previous
                    </Button>
                    <Button variant="outline" disabled={!canNext} onClick={() => onPageChange(currentPage + 1)}>
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
