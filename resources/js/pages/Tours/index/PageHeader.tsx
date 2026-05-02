import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';

interface PageHeaderProps {
    onAddTour: () => void;
    onExport: () => void;
    canCreate: boolean;
    hasActiveFilters?: boolean;
    hasExportData: boolean;
}

export default function PageHeader({ onAddTour, onExport, canCreate, hasActiveFilters, hasExportData }: PageHeaderProps) {
    return (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                <h1 className="text-2xl font-bold text-foreground">Tours</h1>
                <p className="text-sm text-muted-foreground">
                    Manage scheduled tours, representatives, and visibility.
                    {hasActiveFilters ? ' Filters are currently applied.' : ''}
                </p>
            </div>

            <div className="flex w-full gap-2 sm:w-auto">
                {hasExportData && (
                    <Button onClick={onExport} variant="outline" className="flex-1 sm:flex-initial">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                )}
                {canCreate && (
                    <Button onClick={onAddTour} className="flex-1 sm:flex-initial">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Tour
                    </Button>
                )}
            </div>
        </div>
    );
}
