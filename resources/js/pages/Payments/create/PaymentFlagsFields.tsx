import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';


interface PaymentFlagsFieldsProps {
    remind: boolean;
    addedToLedger: boolean;
    onRemindChange: (value: boolean) => void;
    onAddedToLedgerChange: (value: boolean) => void;
}


// Shared by the create and edit drawers
export function PaymentFlagsFields({ remind, addedToLedger, onRemindChange, onAddedToLedgerChange }: PaymentFlagsFieldsProps) {
    return (
        <div className="space-y-3 rounded-lg border-l-4 border-l-amber-500 p-4">
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="remind"
                    checked={remind}
                    onCheckedChange={(checked) => onRemindChange(checked === true)}
                />
                <Label htmlFor="remind" className="text-base font-semibold cursor-pointer">
                    Remind
                </Label>
                <span className="text-sm text-muted-foreground">(tenant needs a reminder to pay)</span>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="added_to_ledger"
                    checked={addedToLedger}
                    onCheckedChange={(checked) => onAddedToLedgerChange(checked === true)}
                />
                <Label htmlFor="added_to_ledger" className="text-base font-semibold cursor-pointer">
                    Added to Ledger
                </Label>
            </div>
        </div>
    );
}
