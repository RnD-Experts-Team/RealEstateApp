<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        * { font-family: DejaVu Sans, sans-serif; }
        body { color: #1f2937; font-size: 12px; }
        h1 { font-size: 20px; margin: 0 0 4px; }
        h2 { font-size: 14px; margin: 18px 0 6px; border-bottom: 1px solid #d1d5db; padding-bottom: 3px; }
        h3 { font-size: 12px; margin: 10px 0 4px; color: #374151; }
        .muted { color: #6b7280; }
        .meta { margin-bottom: 6px; }
        .badge { display: inline-block; padding: 1px 8px; border-radius: 8px; font-size: 10px; }
        .yes { background: #fee2e2; color: #991b1b; }
        .no { background: #dcfce7; color: #166534; }
        .note { background: #f9fafb; border-left: 3px solid #9ca3af; padding: 5px 8px; margin: 4px 0; }
        .item { margin: 6px 0 6px 10px; }
        .imgs img { width: 130px; height: 90px; object-fit: cover; border: 1px solid #e5e7eb; margin: 3px; }
        .file { font-size: 10px; color: #374151; margin: 2px 0; }
        .ack { margin-top: 12px; padding: 8px; background: #f3f4f6; border: 1px solid #e5e7eb; }
        .sig img { width: 220px; height: 90px; object-fit: contain; border: 1px solid #e5e7eb; background: #fff; }
    </style>
</head>
<body>
    @php
        $form = $data['form'];
        $isMoveIn = $form['form_type'] === 'move_in';
        $renderAttachments = function ($attachments) {
            $images = collect($attachments)->filter(fn ($a) => !empty($a['data_uri']));
            $others = collect($attachments)->filter(fn ($a) => empty($a['data_uri']));
            $html = '';
            if ($images->count()) {
                $html .= '<div class="imgs">';
                foreach ($images as $img) { $html .= '<img src="' . $img['data_uri'] . '" />'; }
                $html .= '</div>';
            }
            foreach ($others as $o) { $html .= '<div class="file">📎 ' . e($o['file_name']) . '</div>'; }
            return $html;
        };
    @endphp

    <h1>{{ $isMoveIn ? 'Move-In' : 'Move-Out' }} Inspection Form</h1>
    <div class="meta muted">{{ $form['property_address'] }}</div>
    @if($form['tenant_name'])<div class="meta">Tenant: <strong>{{ $form['tenant_name'] }}</strong></div>@endif
    <div class="meta">Status: {{ ucfirst($form['status']) }}@if($form['submitted_at']) — submitted {{ $form['submitted_at'] }}@endif</div>

    @foreach($data['sections'] as $section)
        <h2>{{ $section['name'] }}</h2>

        @if($section['type'] === 'fixed')
            <div>
                <span>{{ $section['question'] }}</span>
                @if($section['has_problems'] === true)
                    <span class="badge yes">Yes</span>
                @elseif($section['has_problems'] === false)
                    <span class="badge no">No</span>
                @else
                    <span class="muted">— not answered</span>
                @endif
            </div>
            @if($section['has_problems'] === true)
                @if(!empty($section['note']))<div class="note">{{ $section['note'] }}</div>@endif
                {!! $renderAttachments($section['attachments'] ?? []) !!}
                @foreach($section['items'] ?? [] as $item)
                    <div class="item">
                        <h3>{{ $item['name'] }}</h3>
                        @if(!empty($item['note']))<div class="note">{{ $item['note'] }}</div>@endif
                        {!! $renderAttachments($item['attachments'] ?? []) !!}
                    </div>
                @endforeach
            @endif
        @else
            @forelse($section['instances'] ?? [] as $instance)
                <h3>{{ $instance['instance_label'] }}</h3>
                <div>
                    <span>{{ $section['question'] }}</span>
                    @if($instance['has_problems'] === true)
                        <span class="badge yes">Yes</span>
                    @elseif($instance['has_problems'] === false)
                        <span class="badge no">No</span>
                    @else
                        <span class="muted">— not answered</span>
                    @endif
                </div>
                @if($instance['has_problems'] === true)
                    @if(!empty($instance['note']))<div class="note">{{ $instance['note'] }}</div>@endif
                    {!! $renderAttachments($instance['attachments'] ?? []) !!}
                    @foreach($instance['items'] ?? [] as $item)
                        <div class="item">
                            <h3>{{ $item['name'] }}</h3>
                            @if(!empty($item['note']))<div class="note">{{ $item['note'] }}</div>@endif
                            {!! $renderAttachments($item['attachments'] ?? []) !!}
                        </div>
                    @endforeach
                @endif
            @empty
                <div class="muted">None reported.</div>
            @endforelse
        @endif
    @endforeach

    <h2>Final Details</h2>
    @if(!empty($form['other_comments']))
        <h3>{{ $data['settings']['other_comments_label'] ?? 'Other comments' }}</h3>
        <div class="note">{{ $form['other_comments'] }}</div>
    @endif

    @if(count($data['general_attachments']))
        <h3>Other attachments</h3>
        {!! $renderAttachments($data['general_attachments']) !!}
    @endif

    @if(count($data['video_attachments']))
        <h3>Walkthrough video</h3>
        @foreach($data['video_attachments'] as $v)<div class="file">🎥 {{ $v['file_name'] }}</div>@endforeach
    @endif

    @if(!empty($data['signature_data_uri']))
        <div class="sig"><h3>Signature</h3><img src="{{ $data['signature_data_uri'] }}" /></div>
    @endif

    <div class="ack">
        {{ $form['acknowledged'] ? '☑' : '☐' }} {{ $form['acknowledgment_text'] ?? ($data['settings']['acknowledgment_text'] ?? '') }}
    </div>
</body>
</html>
