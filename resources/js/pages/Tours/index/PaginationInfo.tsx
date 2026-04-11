interface PaginationInfoProps {
    meta: {
        from?: number;
        to?: number;
        total?: number;
    };
}

export default function PaginationInfo({ meta }: PaginationInfoProps) {
    if (!meta) return null;

    return (
        <div className="mt-4 text-center text-sm text-muted-foreground">
            Showing {meta.from || 0} to {meta.to || 0} of {meta.total || 0} results
        </div>
    );
}
