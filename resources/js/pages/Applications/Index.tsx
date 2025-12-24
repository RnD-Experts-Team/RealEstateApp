import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { Application, ApplicationFilters, PaginatedApplications, Attachment } from '@/types/application';
import { PageProps } from '@/types/auth';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ApplicationCreateDrawer from './ApplicationCreateDrawer';
import ApplicationEditDrawer from './ApplicationEditDrawer';
import ApplicationsTable from './index/ApplicationsTable';
import EmptyState from './index/EmptyState';
import FilterBar from './index/FilterBar';
import FlashMessages from './index/FlashMessages';
import PageHeader from './index/PageHeader';
import Pagination from './index/Pagination';

interface CityData {
    id: number;
    name: string;
}

interface PropertyData {
    id: number;
    name: string;
    city_id: number;
}

interface UnitData {
    id: number;
    name: string;
    property_id: number;
}

interface Props extends PageProps {
    applications: PaginatedApplications;
    filters: ApplicationFilters;
    cities: CityData[];
    properties: Record<string, PropertyData[]>;
    units: Record<string, UnitData[]>;
    filterCities: string[];
    filterProperties: string[];
    filterUnits: string[];
}

// CSV Export utility function
const exportToCSV = (data: Application[], filename: string = 'applications.csv') => {
    try {
        const formatString = (value: string | null | undefined) => {
            if (value === null || value === undefined) return '';
            return String(value).replace(/"/g, '""');
        };

        const formatDateOnly = (value?: string | null): string => {
            if (!value) return '';
            const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
            if (!m) return '';
            return value.substring(0, 10);
        };

        const formatAttachments = (attachments?: Attachment[]): string => {
            if (!attachments || attachments.length === 0) return '';
            return attachments.map((a) => a.name).join('; ');
        };

        const headers = [
            'ID',
            'City',
            'Property',
            'Unit',
            'Name',
            'Co-signer',
            'Status',
            'Applicant Applied From',
            'Date',
            'Stage in Progress',
            'Notes',
            'Attachments Count',
            'Attachment Names',
        ];

        const csvData = [
            headers.join(','),
            ...data
                .map((application) => {
                    try {
                        return [
                            application.id || '',
                            `"${formatString(application.city)}"`,
                            `"${formatString(application.property)}"`,
                            `"${formatString(application.unit_name)}"`,
                            `"${formatString(application.name)}"`,
                            `"${formatString(application.co_signer)}"`,
                            `"${formatString(application.status)}"`,
                            `"${formatString(application.applicant_applied_from)}"`,
                            `"${formatDateOnly(application.date)}"`,
                            `"${formatString(application.stage_in_progress)}"`,
                            `"${formatString(application.notes)}"`,
                            application.attachments?.length || 0,
                            `"${formatAttachments(application.attachments)}"`,
                        ].join(',');
                    } catch (rowError) {
                        console.error('Error processing application row:', application, rowError);
                        return '';
                    }
                })
                .filter((row) => row !== ''),
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

        return true;
    } catch (error) {
        console.error('CSV Export Error:', error);
        throw error;
    }
};

export default function Index({
    applications,
    filters,
    cities,
    properties,
    units,
    filterCities,
    filterProperties,
    filterUnits,
}: Props) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const { flash } = usePage().props;
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    const [searchFilters, setSearchFilters] = useState({
        city: '',
        property: '',
        unit: '',
        name: '',
        applicant_applied_from: '',
        is_hidden: false,
    });

    const initialPerPage = (filters as any)?.per_page
        ? String((filters as any).per_page)
        : String(applications?.per_page ?? 15);

    const [perPage, setPerPage] = useState<string>(
        initialPerPage === String(applications?.total ?? '') ? 'all' : initialPerPage
    );

    useEffect(() => {
        const f = (filters || {}) as any;
        setSearchFilters({
            city: (f.city as string) || '',
            property: (f.property as string) || '',
            unit: (f.unit as string) || '',
            name: (f.name as string) || '',
            applicant_applied_from: (f.applicant_applied_from as string) || '',
            is_hidden: Boolean(f.is_hidden) || false,
        });
    }, [filters]);

    // ✅ build preserve payload exactly like Payments (and matching your controller inputs)
    const buildPreservePayload = () => ({
        filter_city: searchFilters.city || '',
        filter_property: searchFilters.property || '',
        filter_unit: searchFilters.unit || '',
        filter_name: searchFilters.name || '',
        filter_applicant_applied_from: searchFilters.applicant_applied_from || '',
        filter_is_hidden: searchFilters.is_hidden ? 'true' : '',
        per_page: perPage,
        page: applications.current_page,
    });

    const handleSearch = (nextFilters: {
        city: string;
        property: string;
        unit: string;
        name: string;
        applicant_applied_from: string;
        is_hidden: boolean;
    }) => {
        setSearchFilters(nextFilters);

        const params: any = { ...nextFilters, per_page: perPage, page: 1 };
        if (!nextFilters.is_hidden) delete params.is_hidden; // only send when true

        router.get(route('applications.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        const cleared = {
            city: '',
            property: '',
            unit: '',
            name: '',
            applicant_applied_from: '',
            is_hidden: false,
        };
        setSearchFilters(cleared);
        setPerPage('15');
        router.get(route('applications.index'), { per_page: '15', page: 1 }, { preserveState: false });
    };

    const handleDelete = (application: Application) => {
        if (confirm('Are you sure you want to delete this application?')) {
            router.delete(route('applications.destroy', application.id), {
                data: buildPreservePayload(),
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    // ✅ NEW: hide/unhide like Payments
    const handleHide = (application: Application) => {
        if (confirm('Are you sure you want to hide this application?')) {
            router.patch(route('applications.hide', application.id), buildPreservePayload(), {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const handleUnhide = (application: Application) => {
        if (confirm('Are you sure you want to unhide this application?')) {
            router.patch(route('applications.unhide', application.id), buildPreservePayload(), {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const handleCSVExport = () => {
        if (!applications || !applications.data || applications.data.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);

        try {
            const filename = `applications-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(applications.data, filename);
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsExporting(false);
        }
    };

    const handleDrawerSuccess = () => setIsDrawerOpen(false);

    const handleEditDrawerSuccess = () => {
        setIsEditDrawerOpen(false);
        setSelectedApplication(null);
    };

    const handleEditClick = (application: Application) => {
        setSelectedApplication(application);
        setIsEditDrawerOpen(true);
    };

    // Prepare filter dropdown data (only names, no duplication)
    const citiesForFilters: CityData[] = (filterCities || []).map((name, idx) => ({ id: idx + 1, name }));
    const propertiesForFilters: Record<string, PropertyData[]> = {
        '0': (filterProperties || []).map((name, idx) => ({ id: idx + 1, name, city_id: 0 })),
    };
    const unitsForFilters: Record<string, UnitData[]> = {
        '0': (filterUnits || []).map((name, idx) => ({ id: idx + 1, name, property_id: 0 })),
    };

    const hasCreatePermission = hasAllPermissions(['applications.create', 'applications.store']);
    const hasViewPermission = hasPermission('applications.show');
    const hasEditPermission = hasAnyPermission(['applications.edit', 'applications.update']);
    const hasDeletePermission = hasPermission('applications.destroy');

    // ✅ if you have permissions like payments.hide, use that.
    // If not, you can tie it to applications.update (or whatever you use).
    const hasHidePermission = hasAnyPermission(['applications.hide', 'applications.update']);
    const hasAnyActionPermission = hasAnyPermission([
        'applications.show',
        'applications.edit',
        'applications.update',
        'applications.destroy',
        'applications.hide',
    ]);

    return (
        <AppLayout>
            <Head title="Applications" />
            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <FlashMessages success={(flash as any)?.success} error={(flash as any)?.error} />

                    <PageHeader
                        onExport={handleCSVExport}
                        onAddNew={() => setIsDrawerOpen(true)}
                        isExporting={isExporting}
                        hasExportData={!!(applications?.data && applications.data.length > 0)}
                        hasCreatePermission={hasCreatePermission}
                    />

                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            <FilterBar
                                cities={citiesForFilters}
                                properties={propertiesForFilters}
                                units={unitsForFilters}
                                initialFilters={searchFilters}
                                onSearch={handleSearch}
                                onClear={handleClearFilters}
                            />
                        </CardHeader>

                        <CardContent>
                            {applications.data.length > 0 ? (
                                <>
                                    <ApplicationsTable
                                        applications={applications.data}
                                        onEdit={handleEditClick}
                                        onDelete={handleDelete}
                                        onHide={handleHide}
                                        onUnhide={handleUnhide}
                                        hasViewPermission={hasViewPermission}
                                        hasEditPermission={hasEditPermission}
                                        hasDeletePermission={hasDeletePermission}
                                        hasHidePermission={hasHidePermission}
                                        hasAnyActionPermission={hasAnyActionPermission}
                                        filters={searchFilters}
                                    />

                                    <Pagination
                                        links={applications.links}
                                        meta={{
                                            current_page: applications.current_page,
                                            last_page: applications.last_page,
                                            per_page: applications.per_page,
                                            total: applications.total,
                                            from: applications.from,
                                            to: applications.to,
                                        }}
                                        filters={searchFilters}
                                        perPage={perPage}
                                        onPerPageChange={setPerPage}
                                    />
                                </>
                            ) : (
                                <EmptyState />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <ApplicationCreateDrawer
                cities={cities}
                properties={properties}
                units={units}
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                onSuccess={handleDrawerSuccess}
                currentFilters={searchFilters}
                perPage={perPage}
                page={applications.current_page}
            />

            {selectedApplication && (
                <ApplicationEditDrawer
                    application={selectedApplication}
                    cities={cities}
                    properties={properties}
                    units={units}
                    open={isEditDrawerOpen}
                    onOpenChange={setIsEditDrawerOpen}
                    onSuccess={handleEditDrawerSuccess}
                    currentFilters={searchFilters}
                    perPage={perPage}
                    page={applications.current_page}
                />
            )}
        </AppLayout>
    );
}
