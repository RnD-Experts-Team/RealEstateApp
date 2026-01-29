// resources/js/Pages/Properties/index/PropertyTable.tsx
import { Property } from '@/types/property';
import PropertyTableRow from './PropertyTableRow';

interface PropertyTableProps {
    properties: Property[];
    onEdit: (property: Property) => void;
    onDelete: (property: Property) => void;
    onShow: (property: Property) => void;
    canEdit: boolean;
    canDelete: boolean;
    canShow: boolean;
    hasAnyActionPermission: boolean;
}

/**
 * Table component for displaying property list
 * Renders table header and rows with action buttons
 */
export default function PropertyTable({
    properties,
    onEdit,
    onDelete,
    onShow,
    canEdit,
    canDelete,
    canShow,
    hasAnyActionPermission,
}: PropertyTableProps) {
    return (
        <div className="relative max-h-[600px] overflow-auto border border-border rounded-md">
            <table className="w-full caption-bottom text-sm border-collapse">
                <thead style={{ position: 'sticky', top: 0, zIndex: 20 }} className="[&_tr]:border-b bg-background">
                    <tr className="border-border bg-muted">
                        {/* Sticky City column at the start - also sticky vertically */}
                        <th className="text-foreground border border-border bg-muted sticky left-0 z-30 min-w-[120px] h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                            City
                        </th>
                        {/* Property Name becomes the second sticky column - also sticky vertically */}
                        <th className="text-foreground border border-border bg-muted sticky left-[120px] z-30 min-w-[160px] h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                            Property Name
                        </th>
                        <th className="text-foreground border border-border bg-muted h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                            Insurance Company
                        </th>
                        <th className="text-foreground border border-border bg-muted h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                            Amount
                        </th>
                        <th className="text-foreground border border-border bg-muted h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                            Effective Date
                        </th>
                        <th className="text-foreground border border-border bg-muted h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                            Policy Number
                        </th>
                        <th className="text-foreground border border-border bg-muted h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                            Expiration Date
                        </th>
                        <th className="text-foreground border border-border bg-muted h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                            Days Left
                        </th>
                        <th className="text-foreground border border-border bg-muted h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                            Notes
                        </th>
                        <th className="text-foreground border border-border bg-muted h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                            Status
                        </th>
                        {/* Only show Actions column if user has any action permission */}
                        {hasAnyActionPermission && (
                            <th className="text-foreground border border-border bg-muted h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                    {properties.map((property) => (
                        <PropertyTableRow
                            key={property.id}
                            property={property}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onShow={onShow}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            canShow={canShow}
                            hasAnyActionPermission={hasAnyActionPermission}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
