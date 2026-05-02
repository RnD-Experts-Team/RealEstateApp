// resources/js/Pages/Properties/Index.tsx
import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Property, PaginatedProperties, PropertyFilters as PropertyFiltersType, PropertyStatistics, PropertyWithoutInsurance, InsuranceRepresentative } from '@/types/property';
import type { PageProps } from '@/types/auth';
import { usePermissions } from '@/hooks/usePermissions';
import { City } from '@/types/City';
import PropertyCreateDrawer from './PropertyCreateDrawer';
import PropertyEditDrawer from './PropertyEditDrawer';
import RepresentativePopover from './RepresentativePopover';
import PropertyPageHeader from './index/PropertyPageHeader';
import PropertyFilters from './index/PropertyFilters';
import PropertyTable from './index/PropertyTable';
import PropertyEmptyState from './index/PropertyEmptyState';
import FlashMessages from './index/FlashMessages';
import PropertyPagination from './index/PropertyPagination';


// CSV Export utility function
const exportToCSV = (data: Property[], filename: string = 'properties.csv') => {
    const headers = [
        'ID',
        'Property Name',
        'Insurance Company',
        'Amount',
        'Effective Date',
        'Policy Number',
        'Expiration Date',
        'Days Left',
        'Status'
    ];


    const calculateDaysLeft = (expirationDate: string): number => {
        const today = new Date();
        const expDate = new Date(expirationDate);
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };


    const csvData = [
        headers.join(','),
        ...data.map(property => [
            property.id,
            `"${property.property?.property_name || 'N/A'}"`,
            `"${property.insurance_company_name}"`,
            `"${property.formatted_amount}"`,
            `"${property.effective_date}"`,
            `"${property.policy_number}"`,
            `"${property.expiration_date}"`,
            calculateDaysLeft(property.expiration_date),
            `"${property.status}"`
        ].join(','))
    ].join('\n');


    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);


    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';


    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};


interface Props extends PageProps {
    properties: PaginatedProperties;
    statistics: PropertyStatistics;
    filters: PropertyFiltersType;
    cities: City[];
    availableProperties: PropertyWithoutInsurance[];
    representatives: InsuranceRepresentative[];
}


export default function Index({ properties, filters, cities = [], availableProperties = [], representatives = [] }: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
    
    // State for filters - initialized with filters from backend
    const [searchFilters, setSearchFilters] = useState<PropertyFiltersType>(filters);
    
    // State for export loading
    const [isExporting, setIsExporting] = useState(false);
    
    // State for create drawer
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    
    // State for edit drawer
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    
    // State for selected property to edit
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    
    // Get flash messages from Inertia
    const { flash } = usePage().props;

    // Derive current per-page selection from filters (supports 'all'), fallback to paginator meta
    const currentPerPageSelection: number | 'all' = ((filters as any)?.per_page ?? properties.per_page) as number | 'all';


    /**
     * Get current query parameters including page and per_page
     * This is used to preserve pagination state when making requests
     */
    const getCurrentQueryParams = (): Record<string, string> => {
        const params: Record<string, string> = {};
        
        // Add current page if exists
        if (properties.current_page && properties.current_page > 1) {
            params.page = properties.current_page.toString();
        }
        
        // Add per_page if exists
        if (currentPerPageSelection) {
            params.per_page = currentPerPageSelection.toString();
        }
        
        // Add filters
        Object.entries(searchFilters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params[key] = String(value);
            }
        });
        
        return params;
    };

    /**
     * Build namespaced params for non-GET actions (e.g., delete) so
     * they don't collide with form fields. Mirrors create/edit behavior.
     */
    const buildNamespacedParams = (): Record<string, string> => {
        const params: Record<string, string> = {};

        // Filters
        if (searchFilters.property_name) params['filter_property_name'] = String(searchFilters.property_name);
        if (searchFilters.insurance_company_name) params['filter_insurance_company_name'] = String(searchFilters.insurance_company_name);
        if (searchFilters.policy_number) params['filter_policy_number'] = String(searchFilters.policy_number);
        if (typeof searchFilters.status !== 'undefined' && searchFilters.status !== null) {
            params['filter_status'] = String(searchFilters.status);
        }

        // Pagination
        if (currentPerPageSelection) params['filter_per_page'] = String(currentPerPageSelection);
        if (properties.current_page && properties.current_page > 1) params['filter_page'] = String(properties.current_page);

        return params;
    };


    /**
     * Handle filter input changes
     * Updates local state but doesn't trigger API call until search is clicked
     */
    const handleFilterChange = (key: keyof PropertyFiltersType, value: string) => {
        const newFilters = { ...searchFilters, [key]: value };
        setSearchFilters(newFilters);
    };


    /**
     * Handle search button click
     * Makes API call with current filters and resets to page 1
     */
    const handleSearch = () => {
        const filterParams: Record<string, string> = {};
        
        // Add filters to params
        Object.entries(searchFilters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                filterParams[key] = String(value);
            }
        });
        
        // Add per_page if exists to maintain user's selection
        if (currentPerPageSelection) {
            filterParams.per_page = currentPerPageSelection.toString();
        }
        
        // Reset to page 1 when searching with new filters
        router.get(route('properties-info.index'), filterParams, {
            preserveState: true,  // Preserve component state
            preserveScroll: true, // Keep scroll position
        });
    };


    /**
     * Handle clear filters button click
     * Resets all filters and returns to page 1
     */
    const handleClearFilters = () => {
        const clearedFilters: PropertyFiltersType = {
            property_name: '',
            insurance_company_name: '',
            policy_number: '',
            status: undefined
        };
        setSearchFilters(clearedFilters);
        
        // Only preserve per_page when clearing filters
        const params: Record<string, string> = {};
        if (currentPerPageSelection) {
            params.per_page = currentPerPageSelection.toString();
        }
        
        router.get(route('properties-info.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };


    /**
     * Handle delete action
     * Sends delete request with current query params to maintain pagination/filter state
     */
    const handleDelete = (property: Property) => {
        if (confirm('Are you sure you want to delete this property?')) {
            // Include current query params in the delete request
            // This preserves pagination and filters when redirecting back to index
            router.delete(route('properties-info.destroy', property.id), {
                data: buildNamespacedParams(),
                preserveState: true,
                preserveScroll: true,
            });
        }
    };


    /**
     * Handle CSV export
     * Exports current page data to CSV file
     */
    const handleCSVExport = () => {
        if (properties.data.length === 0) {
            alert('No data to export');
            return;
        }


        setIsExporting(true);
        try {
            const filename = `properties-insurance-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(properties.data, filename);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    /**
     * Handle successful edit in drawer
     * Reloads the page to show updated data while preserving state
     */
    const handleEditDrawerSuccess = () => {
        setIsEditDrawerOpen(false);
        router.get(route('properties-info.index'), getCurrentQueryParams(), {
            preserveState: true,
            preserveScroll: true,
        });
    };


    /**
     * Handle edit button click
     * Opens edit drawer with selected property
     */
    const handleEdit = (property: Property) => {
        setSelectedProperty(property);
        setIsEditDrawerOpen(true);
    };


    /**
     * Handle per page change
     * Updates the number of records per page and resets to page 1
     */
    const handlePerPageChange = (perPage: number | 'all') => {
        const params = getCurrentQueryParams();
        
        // Remove current page when changing per_page (reset to page 1)
        delete params.page;
        
        // Set new per_page value
        params.per_page = perPage.toString();
        
        router.get(route('properties-info.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };


    /**
     * Handle show/view button click
     * Navigates to show page with current filters as query params
     */
    const handleShow = (property: Property) => {
        // Pass current filters to the show page for next/previous navigation
        const params = getCurrentQueryParams();

        router.get(route('properties-info.show', property.id), params, {
            preserveState: false, // Don't preserve state when navigating to different page
        });
    };

    /**
     * Handle representative updates in popover
     * Reloads the page to refresh the representatives list
     */
    const handleRepresentativeUpdated = () => {
        router.get(route('properties-info.index'), getCurrentQueryParams(), {
            preserveState: true,
            preserveScroll: true,
        });
    };


    return (
        <AppLayout>
            <Head title="Properties Insurance" />
            <div className="py-12 bg-background text-foreground transition-colors min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Flash messages for success/error notifications */}
                    <FlashMessages
                        success={(flash as any)?.success}
                        error={(flash as any)?.error}
                    />

                    {/* Page header section with export/add buttons and representative management */}
                    <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="flex-1">
                            {/* Page header with export and add buttons */}
                            <PropertyPageHeader
                                onExport={handleCSVExport}
                                onAddProperty={() => setIsDrawerOpen(true)}
                                isExporting={isExporting}
                                hasExportData={properties.data.length > 0}
                                canCreate={hasAllPermissions(['properties.create', 'properties.store'])}
                            />
                        </div>

                        {/* Representative management popover */}
                        <RepresentativePopover
                            reps={representatives}
                            canCreate={hasPermission('properties.store')}
                            canEdit={hasPermission('properties.update')}
                            canDestroy={hasPermission('properties.destroy')}
                            onRepUpdated={handleRepresentativeUpdated}
                        />
                    </div>


                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            {/* Filters section */}
                            <PropertyFilters
                                filters={searchFilters}
                                onFilterChange={handleFilterChange}
                                onSearch={handleSearch}
                                onClear={handleClearFilters}
                            />
                        </CardHeader>
                        <CardContent>
                            {/* Properties table */}
                            <PropertyTable
                                properties={properties.data}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onShow={handleShow}
                                canEdit={hasAllPermissions(['properties.update', 'properties.edit'])}
                                canDelete={hasPermission('properties.destroy')}
                                canShow={hasPermission('properties.show')}
                                hasAnyActionPermission={hasAnyPermission(['properties.destroy', 'properties.update', 'properties.edit', 'properties.show'])}
                            />
                            
                            {/* Empty state when no properties found */}
                            {properties.data.length === 0 && <PropertyEmptyState />}
                            
                            {/* Pagination controls */}
                            {properties.data.length > 0 && (
                                <PropertyPagination
                                    paginatedData={properties}
                                    currentPerPage={currentPerPageSelection || 15}
                                    onPerPageChange={handlePerPageChange}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>


            {/* Create drawer - passes current filters and pagination info */}
            <PropertyCreateDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                cities={cities}
                availableProperties={availableProperties}
                representatives={representatives}
                currentFilters={searchFilters}
                currentPage={properties.current_page || 1}
                currentPerPage={currentPerPageSelection || 15}
            />


            {/* Edit drawer - passes current filters and pagination info */}
            {selectedProperty && (
                <PropertyEditDrawer
                    open={isEditDrawerOpen}
                    onOpenChange={setIsEditDrawerOpen}
                    property={selectedProperty}
                    availableProperties={availableProperties}
                    representatives={representatives}
                    onSuccess={handleEditDrawerSuccess}
                    currentFilters={searchFilters}
                    currentPage={properties.current_page || 1}
                    currentPerPage={currentPerPageSelection || 15}
                    cities={cities}
                />
            )}
        </AppLayout>
    );
}
