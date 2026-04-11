export default function EmptyState() {
    return (
        <div className="py-8 text-center text-muted-foreground">
            <p className="text-lg">No payments found matching your criteria.</p>
            <p className="text-sm">Try adjusting your filters or clearing them to see all payments.</p>
        </div>
    );
}
