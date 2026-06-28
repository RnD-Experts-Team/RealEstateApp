<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        * { font-family: DejaVu Sans, sans-serif; }
        body { color: #1f2937; font-size: 12px; }
        h1 { font-size: 20px; margin: 0 0 4px; }
        h2 { font-size: 14px; margin: 16px 0 4px; border-bottom: 1px solid #d1d5db; padding-bottom: 3px; }
        h3 { font-size: 12px; margin: 8px 0 4px; color: #374151; }
        .muted { color: #6b7280; }
        .meta { margin-bottom: 6px; }
        .badge { display: inline-block; padding: 1px 8px; border-radius: 8px; font-size: 10px; background: #e5e7eb; }
        .yes { background: #dcfce7; color: #166534; }
        .no { background: #fee2e2; color: #991b1b; }
        .note { background: #f9fafb; border-left: 3px solid #9ca3af; padding: 5px 8px; margin: 4px 0; }
        .imgs img { width: 130px; height: 90px; object-fit: cover; border: 1px solid #e5e7eb; margin: 3px; }
        .file { font-size: 10px; color: #374151; margin: 2px 0; }
        .inst { border: 1px solid #e5e7eb; padding: 6px; margin: 5px 0; }
        .sig img { width: 220px; height: 90px; object-fit: contain; border: 1px solid #e5e7eb; background: #fff; }
    </style>
</head>
<body>
    @php
        $form = $data['form'];
        $isWalk = $form['form_kind'] === 'walkthrough';

        $renderValue = function ($type, $f) {
            $html = '';
            if ($type === 'yes_no') {
                if (($f['value_bool'] ?? null) === true) $html = '<span class="badge yes">Yes</span>';
                elseif (($f['value_bool'] ?? null) === false) $html = '<span class="badge no">No</span>';
                else $html = '<span class="muted">Not answered</span>';
            } elseif ($type === 'long_text') {
                $html = ($f['value_text'] ?? '') !== '' ? '<div class="note">' . e($f['value_text']) . '</div>' : '<span class="muted">—</span>';
            } elseif ($type === 'multi_choice') {
                $opts = $f['value_options'] ?? [];
                $html = count($opts) ? implode(' ', array_map(fn ($o) => '<span class="badge">' . e($o) . '</span>', $opts)) : '<span class="muted">None selected</span>';
            } elseif ($type === 'attachments') {
                $atts = $f['attachments'] ?? [];
                $images = collect($atts)->filter(fn ($a) => !empty($a['data_uri']));
                $others = collect($atts)->filter(fn ($a) => empty($a['data_uri']));
                if ($images->count()) {
                    $html .= '<div class="imgs">';
                    foreach ($images as $img) { $html .= '<img src="' . $img['data_uri'] . '" />'; }
                    $html .= '</div>';
                }
                foreach ($others as $o) { $html .= '<div class="file">📎 ' . e($o['file_name']) . '</div>'; }
                if (! count($atts)) { $html = '<span class="muted">No files</span>'; }
            }
            return $html;
        };
    @endphp

    <h1>{{ $isWalk ? 'Walkthrough' : 'Safety Inspection' }} Form</h1>
    <div class="meta muted">{{ $form['property_address'] }}</div>
    @if($form['representative_name'])<div class="meta">Representative: <strong>{{ $form['representative_name'] }}</strong></div>@endif
    <div class="meta">Status: {{ ucfirst($form['status']) }}@if($form['submitted_at']) — submitted {{ $form['submitted_at'] }}@endif</div>

    @foreach($data['fields'] as $field)
        <h2>{{ $field['title'] }}</h2>
        @if($field['type'] !== 'repeatable_group')
            {!! $renderValue($field['type'], $field) !!}
        @else
            @forelse($field['instances'] ?? [] as $instance)
                <div class="inst">
                    <h3>{{ $instance['instance_label'] }}</h3>
                    {!! $renderValue($field['inner_type'] ?? 'long_text', $instance) !!}
                </div>
            @empty
                <div class="muted">None added.</div>
            @endforelse
        @endif
    @endforeach

    @if(!empty($data['signature_data_uri']))
        <h2>Signature</h2>
        <div class="sig"><img src="{{ $data['signature_data_uri'] }}" /></div>
    @endif
</body>
</html>
