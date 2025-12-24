import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Home,
  Calendar,
  DollarSign,
  FileText,
  Shield,
  Clock,
  ChevronsLeftRight,
} from 'lucide-react';
import { Property, PropertyFilters } from '@/types/property';
import PropertyStatusBadge from './index/PropertyStatusBadge';
import PropertyDaysLeftBadge from './index/PropertyDaysLeftBadge';

interface Props {
  property: Property;
  previous_id?: number | null;
  next_id?: number | null;
  filters?: PropertyFilters;
}

export default function Show({ property, previous_id, next_id, filters }: Props) {
    const TZ = 'America/New_York';
  const buildShowRoute = (id: number) => {
    const params: Record<string, any> = { properties_info: id };
    if (filters) {
      if (filters.property_name) params.property_name = filters.property_name;
      if (filters.insurance_company_name) params.insurance_company_name = filters.insurance_company_name;
      if (filters.policy_number) params.policy_number = filters.policy_number;
      if (filters.status) params.status = filters.status;
    }
    return route('properties-info.show', params);
  };

  const buildIndexRoute = () => {
    const query: Record<string, any> = {};
    if (filters) {
      if (filters.property_name) query.property_name = filters.property_name;
      if (filters.insurance_company_name) query.insurance_company_name = filters.insurance_company_name;
      if (filters.policy_number) query.policy_number = filters.policy_number;
      if (filters.status) query.status = filters.status;
    }
    return route('properties-info.index', query);
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

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

  const InfoItem = ({ icon: Icon, label, value, className = '' }: {
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

  return (
    <AppLayout>
      <Head title={`Property Insurance #${property.id}`} />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Property Insurance Record #{property.id}</h1>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {property.property?.city?.city || 'N/A'} • {property.property?.property_name || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href={buildIndexRoute()}>
                  <Button variant="outline">Back to List</Button>
                </Link>
                <div className="flex gap-2">
                  <Button variant="outline" disabled={!previous_id} asChild>
                    {previous_id ? (
                      <Link href={buildShowRoute(previous_id)}>Previous</Link>
                    ) : (
                      <span>Previous</span>
                    )}
                  </Button>
                  <Button variant="outline" disabled={!next_id} asChild>
                    {next_id ? (
                      <Link href={buildShowRoute(next_id)}>Next</Link>
                    ) : (
                      <span>Next</span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Property & Insurance Overview */}
          <Card className="mb-6 border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <InfoItem icon={MapPin} label="City" value={property.property?.city?.city || 'N/A'} className="bg-blue-50/50" />
                <InfoItem icon={Home} label="Property" value={property.property?.property_name || 'N/A'} className="bg-green-50/50" />
                <InfoItem icon={Shield} label="Insurance Company" value={property.insurance_company_name || 'N/A'} className="bg-purple-50/50" />
                <InfoItem icon={FileText} label="Policy Number" value={property.policy_number || 'N/A'} className="bg-orange-50/50" />
              </div>
            </CardContent>
          </Card>

          {/* Highlights */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5" />
                Insurance Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-medium text-blue-800">Amount</p>
                  </div>
                  <p className="text-lg font-bold text-blue-900">{formatCurrency(property.amount)}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium text-green-800">Effective Date</p>
                  </div>
                  <p className="text-lg font-bold text-green-900">{formatDate(property.effective_date)}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm font-medium text-yellow-800">Expiration Date</p>
                  </div>
                  <p className="text-lg font-bold text-yellow-900">{formatDate(property.expiration_date)}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <ChevronsLeftRight className="h-4 w-4 text-gray-600" />
                    <p className="text-sm font-medium text-gray-800">Status</p>
                  </div>
                  <div className="text-lg font-bold">
                    <div className="flex items-center gap-2">
                      <PropertyStatusBadge status={property.status} />
                      <PropertyDaysLeftBadge daysLeft={property.days_left} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <InfoItem icon={Shield} label="Insurance Company" value={property.insurance_company_name || 'N/A'} />
                  <InfoItem icon={FileText} label="Policy Number" value={property.policy_number || 'N/A'} />
                  <InfoItem icon={DollarSign} label="Amount" value={formatCurrency(property.amount)} />
                </div>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5" />
                  Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <InfoItem icon={Calendar} label="Effective Date" value={formatDate(property.effective_date)} />
                  <InfoItem icon={Calendar} label="Expiration Date" value={formatDate(property.expiration_date)} />
                  <InfoItem icon={Clock} label="Days Left" value={<PropertyDaysLeftBadge daysLeft={property.days_left} />} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes Section */}
          {property.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{property.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer Section */}
          <Card className="mt-8 bg-gray-50">
            <CardContent className="pt-6">
              <Separator className="mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    Created: {new Date(property.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    Last Updated: {new Date(property.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}