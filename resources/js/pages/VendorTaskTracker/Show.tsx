import React from 'react';
// import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { VendorTaskTracker } from '@/types/vendor-task-tracker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
// import { usePermissions } from '@/hooks/usePermissions';
import {
  Calendar,
  MapPin,
  User,
  Home,
  Clock,
  Wrench,
  FileText,
  AlertTriangle,
  Building,
  CheckCircle,
} from 'lucide-react';

interface Props {
  task: VendorTaskTracker;
  filters: {
    search?: string;
    city?: string;
    property?: string;
    unit_name?: string;
    vendor_name?: string;
    status?: string;
    per_page?: string;
    page?: number;
  };
  prevId?: number | null;
  nextId?: number | null;
}

export default function Show({ task, filters, prevId, nextId }: Props) {
  // const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  const TZ = 'America/New_York';

  const getUrgentBadge = (urgent: 'Yes' | 'No') => {
    return (
      <Badge
        variant={urgent === 'Yes' ? 'destructive' : 'secondary'}
        className={`text-xs ${
          urgent === 'Yes'
            ? 'bg-red-100 text-red-800 border-red-200'
            : 'bg-gray-100 text-gray-600 border-gray-200'
        }`}
      >
        {urgent}
      </Badge>
    );
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline" className="text-xs">No Status</Badge>;

    let variant: 'default' | 'secondary' | 'outline' | 'destructive' = 'outline';
    let className = 'text-xs';

    const statusLower = status.toLowerCase();
    if (statusLower.includes('completed')) {
      variant = 'default';
      className += ' bg-green-100 text-green-800 border-green-200';
    } else if (statusLower.includes('progress')) {
      variant = 'secondary';
      className += ' bg-blue-100 text-blue-800 border-blue-200';
    } else if (statusLower.includes('pending')) {
      variant = 'secondary';
      className += ' bg-yellow-100 text-yellow-800 border-yellow-200';
    } else if (statusLower.includes('hold')) {
      variant = 'destructive';
      className += ' bg-orange-100 text-orange-800 border-orange-200';
    }

    return <Badge variant={variant} className={className}>{status}</Badge>;
  };

  /**
   * Fixes 1-day-off issue for values like:
   * "2025-09-10T00:00:00.000000Z"
   * "2025-12-22T00:00:00.000000Z"
   *
   * We treat these as date-only values by extracting YYYY-MM-DD
   * and then constructing a local date safely (at noon).
   */
  const formatDate = (date: string | null) => {
    if (!date) return 'Not Set';

    const raw = String(date).trim();

    // If it starts with YYYY-MM-DD (covers ISO strings too)
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
      const ymd = raw.slice(0, 10);
      const [y, m, d] = ymd.split('-').map(Number);

      // local noon avoids DST edge cases and prevents UTC rollbacks
      const localSafe = new Date(y, m - 1, d, 12, 0, 0);

      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: TZ,
      }).format(localSafe);
    }

    // Fallback
    const dt = new Date(raw);
    if (Number.isNaN(dt.getTime())) return 'Invalid Date';

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: TZ,
    }).format(dt);
  };

  const formatDateTime = (dateTime: string | null) => {
    if (!dateTime) return 'Not Set';
    const dt = new Date(String(dateTime).trim());
    if (Number.isNaN(dt.getTime())) return 'Invalid Date';

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: TZ,
    }).format(dt);
  };

  const InfoItem = ({
    icon: Icon,
    label,
    value,
    className = '',
  }: {
    icon: any;
    label: string;
    value: React.ReactNode;
    className?: string;
  }) => (
    <div className={`flex items-start gap-3 p-3 rounded-lg bg-gray-50/50 ${className}`}>
      <Icon className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <div className="text-sm font-semibold text-gray-900 mt-1">{value}</div>
      </div>
    </div>
  );

  const buildQuery = (obj: Record<string, any>) => {
    const params: Record<string, string> = {};
    Object.entries(obj).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') params[k] = String(v);
    });
    const queryString = new URLSearchParams(params).toString();
    return queryString ? `?${queryString}` : '';
  };

  const qs = buildQuery(filters || {});

  return (
    <AppLayout>
      <Head title={`Vendor Task Details #${task.id}`} />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Vendor Task #{task.id}</h1>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {task.city || 'N/A'} • {task.property_name || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                {/* {hasAllPermissions(['vendor-task-tracker.edit','vendor-task-tracker.update']) && (
                  <Link href={route('vendor-task-tracker.edit', task.id)}>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Edit Task
                    </Button>
                  </Link>
                )} */}
                {prevId ? (
                  <Link href={route('vendor-task-tracker.show', prevId) + qs}>
                    <Button variant="outline">Previous</Button>
                  </Link>
                ) : (
                  <Button variant="outline" disabled>
                    Previous
                  </Button>
                )}
                {nextId ? (
                  <Link href={route('vendor-task-tracker.show', nextId) + qs}>
                    <Button variant="outline">Next</Button>
                  </Link>
                ) : (
                  <Button variant="outline" disabled>
                    Next
                  </Button>
                )}
                <Link href={route('vendor-task-tracker.index') + qs}>
                  <Button variant="outline">Back to List</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Property Hierarchy Card */}
          <Card className="mb-6 border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <InfoItem
                  icon={MapPin}
                  label="City"
                  value={task.city || 'N/A'}
                  className="bg-blue-50/50"
                />
                <InfoItem
                  icon={Building}
                  label="Property"
                  value={task.property_name || 'N/A'}
                  className="bg-green-50/50"
                />
                <InfoItem
                  icon={Home}
                  label="Unit"
                  value={task.unit_name || 'N/A'}
                  className="bg-purple-50/50"
                />
                <InfoItem
                  icon={User}
                  label="Vendor"
                  value={task.vendor_name || 'N/A'}
                  className="bg-orange-50/50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Important Dates Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Task Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-medium text-blue-800">Task Submission</p>
                  </div>
                  <p className="text-lg font-bold text-blue-900">
                    {formatDate(task.task_submission_date)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm font-medium text-yellow-800">Scheduled Visit</p>
                  </div>
                  <p className="text-lg font-bold text-yellow-900">
                    {formatDate(task.any_scheduled_visits || '')}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium text-green-800">Task End Date</p>
                  </div>
                  <p className="text-lg font-bold text-green-900">
                    {formatDate(task.task_ending_date || '')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Task Status Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5" />
                  Task Status &amp; Priority
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <InfoItem icon={AlertTriangle} label="Urgent" value={getUrgentBadge(task.urgent)} />
                  <InfoItem icon={CheckCircle} label="Status" value={getStatusBadge(task.status || '')} />
                </div>
              </CardContent>
            </Card>

            {/* Task Assignment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wrench className="h-5 w-5" />
                  Assignment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <InfoItem icon={User} label="Assigned Vendor" value={task.vendor_name || 'N/A'} />
                  <InfoItem icon={Home} label="Target Unit" value={task.unit_name || 'N/A'} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Information Section */}
          <div className="space-y-6">
            {/* Assigned Tasks Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Assigned Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{task.assigned_tasks}</p>
                </div>
              </CardContent>
            </Card>

            {/* Notes Section */}
            {task.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    Additional Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{task.notes}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Footer Section */}
          <Card className="mt-8 bg-gray-50">
            <CardContent className="pt-6">
              <Separator className="mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Created: {formatDateTime(task.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Last Updated: {formatDateTime(task.updated_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
