import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
    onAddPayment: () => void;
    canCreate: boolean;
    hasActiveFilters?: boolean;
}

export default function PageHeader({ onAddPayment, canCreate, hasActiveFilters }: PageHeaderProps) {
    return (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                <h1 className="text-2xl font-bold text-foreground">Unit Payments</h1>
                <p className="text-sm text-muted-foreground">
                    Manage payments by unit, payment type, and visibility.
                    {hasActiveFilters ? ' Filters are currently applied.' : ''}
                </p>
            </div>

            {canCreate && (
                <div className="flex w-full sm:w-auto">
                    <Button onClick={onAddPayment} className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Payment
                    </Button>
                </div>
            )}
        </div>
    );
}
