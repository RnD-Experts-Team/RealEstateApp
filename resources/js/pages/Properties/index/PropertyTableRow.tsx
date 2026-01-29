// resources/js/Pages/Properties/index/PropertyTableRow.tsx
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Property } from '@/types/property';
import PropertyStatusBadge from './PropertyStatusBadge';
import PropertyDaysLeftBadge from './PropertyDaysLeftBadge';

interface PropertyTableRowProps {
    property: Property;
    onEdit: (property: Property) => void;
    onDelete: (property: Property) => void;
    onShow: (property: Property) => void;
    canEdit: boolean;
    canDelete: boolean;
    canShow: boolean;
    hasAnyActionPermission: boolean;
}

/**
 * Table row component for a single property
 * Displays property data and action buttons based on permissions
 */
export default function PropertyTableRow({
    property,
    onEdit,
    onDelete,
    onShow,
    canEdit,
    canDelete,
    canShow,
    hasAnyActionPermission,
}: PropertyTableRowProps) {
    /**
     * Calculate days left until expiration
     * Returns negative number if expired
     */
    const calculateDaysLeft = (expirationDate: string): number => {
        const today = new Date();
        const expDate = new Date(expirationDate);
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    /**
     * Truncate text and append dots after a max length
     * Shows "N/A" when empty or undefined
     */
    const truncateText = (text?: string, max: number = 20): string => {
        if (!text) return 'N/A';
        const trimmed = text.trim();
        if (trimmed.length === 0) return 'N/A';
        return trimmed.length > max ? `${trimmed.slice(0, max)}...` : trimmed;
    };

    return (
        <tr className="hover:bg-muted/50 border-border border-b transition-colors">
            {/* City - first sticky column */}
            <td className="text-center text-foreground border border-border bg-muted sticky left-0 z-10 min-w-[120px] p-2 align-middle whitespace-nowrap">
                {property.property?.city?.city || 'N/A'}
            </td>
            {/* Property Name - second sticky column for horizontal scrolling */}
            <td className="font-medium text-center text-foreground border border-border bg-muted sticky left-[120px] z-10 min-w-[160px] p-2 align-middle whitespace-nowrap">
                {property.property?.property_name || 'N/A'}
            </td>
            
            {/* Insurance Company Name */}
            <td className="text-center text-foreground border border-border p-2 align-middle whitespace-nowrap">
                {property.insurance_company_name || 'N/A'}
            </td>
            
            {/* Amount - formatted currency */}
            <td className="text-center text-foreground border border-border p-2 align-middle whitespace-nowrap">
                {property.formatted_amount || 'N/A'}
            </td>
            
            {/* Effective Date */}
            <td className="text-center text-foreground border border-border p-2 align-middle whitespace-nowrap">
                {property.effective_date || 'N/A'}
            </td>
            
            {/* Policy Number */}
            <td className="text-center text-foreground border border-border p-2 align-middle whitespace-nowrap">
                {property.policy_number || 'N/A'}
            </td>
            
            {/* Expiration Date */}
            <td className="text-center text-foreground border border-border p-2 align-middle whitespace-nowrap">
                {property.expiration_date || 'N/A'}
            </td>
            
            {/* Days Left - colored badge based on urgency */}
            <td className="text-center border border-border p-2 align-middle whitespace-nowrap">
                <PropertyDaysLeftBadge daysLeft={calculateDaysLeft(property.expiration_date)} />
            </td>
            
            {/* Notes - optional text */}
            <td className="text-left text-foreground border border-border max-w-[240px] break-words p-2 align-middle whitespace-nowrap">
                {truncateText(property.notes)}
            </td>
            
            {/* Status - Active/Expired badge */}
            <td className="text-center border border-border p-2 align-middle whitespace-nowrap">
                <PropertyStatusBadge status={property.status} />
            </td>
            
            {/* Action Buttons - only shown if user has any permission */}
            {hasAnyActionPermission && (
                <td className="text-center border border-border p-2 align-middle whitespace-nowrap">
                    <div className="flex gap-1 justify-center">
                        {/* Show/View button */}
                        {canShow && (
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => onShow(property)}
                                title="View details"
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        )}
                        
                        {/* Edit button */}
                        {canEdit && (
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => onEdit(property)}
                                title="Edit property"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        )}
                        
                        {/* Delete button */}
                        {canDelete && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDelete(property)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                                title="Delete property"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </td>
            )}
        </tr>
    );
}
