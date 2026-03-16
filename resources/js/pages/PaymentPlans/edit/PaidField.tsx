import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';

interface Props {
    paid: number;
    amount: number;
    error?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PaidField({ paid, amount, error, onChange }: Props) {
    return (
        <div className="rounded-lg border-l-4 border-l-teal-500 p-4">
            <div className="mb-2">
                <Label htmlFor="paid" className="text-base font-semibold">
                    Paid Amount
                </Label>
            </div>
            <Input
                id="paid"
                type="number"
                step="0.01"
                min="0"
                value={paid || ''}
                onChange={onChange}
                placeholder="0.00"
            />
            <p className="mt-1 text-xs text-muted-foreground">Can exceed amount (overpayment allowed)</p>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            {amount > 0 && paid > amount && (
                <p className="mt-1 text-xs text-amber-600">
                    Overpaid by: ${((paid || 0) - (amount || 0)).toFixed(2)}
                </p>
            )}
            {amount > 0 && paid <= amount && (
                <p className="mt-1 text-xs text-muted-foreground">
                    Remaining: ${((amount || 0) - (paid || 0)).toFixed(2)}
                </p>
            )}
        </div>
    );
}
