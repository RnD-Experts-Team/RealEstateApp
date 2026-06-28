<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        * { font-family: DejaVu Sans, sans-serif; }
        body { color: #1f2937; font-size: 12px; line-height: 1.5; }
        h1 { font-size: 20px; margin: 0 0 2px; }
        h2 { font-size: 14px; margin: 16px 0 4px; }
        .muted { color: #6b7280; }
        .meta { margin-bottom: 10px; }
        .clause { margin-bottom: 14px; }
        .clause h2 { border-bottom: 1px solid #e5e7eb; padding-bottom: 2px; }
        .sigs { margin-top: 30px; width: 100%; }
        .sig { display: inline-block; width: 45%; vertical-align: top; }
        .sig img { width: 200px; height: 70px; object-fit: contain; border-bottom: 1px solid #374151; }
        .sig .line { border-bottom: 1px solid #374151; height: 70px; width: 200px; }
        .sig .cap { font-size: 11px; color: #374151; margin-top: 4px; }
    </style>
</head>
<body>
    <h1>{{ $data['type_name'] }}</h1>
    @if($data['reference'])<div class="meta muted">{{ $data['reference'] }}</div>@endif

    @foreach($data['clauses'] as $clause)
        <div class="clause">
            <h2>{{ $clause['title'] }}</h2>
            <div>{!! $clause['html'] !!}</div>
        </div>
    @endforeach

    <div class="sigs">
        <div class="sig">
            @if($data['owner_signature_data_uri'])
                <img src="{{ $data['owner_signature_data_uri'] }}" />
            @else
                <div class="line"></div>
            @endif
            <div class="cap">
                Owner{{ $data['owner_name'] ? ': ' . $data['owner_name'] : '' }}
                @if($data['owner_signed_at']) — {{ $data['owner_signed_at'] }} @endif
            </div>
        </div>
        <div class="sig">
            @if($data['agent_signature_data_uri'])
                <img src="{{ $data['agent_signature_data_uri'] }}" />
            @else
                <div class="line"></div>
            @endif
            <div class="cap">
                Agent
                @if($data['agent_signed_at']) — {{ $data['agent_signed_at'] }} @endif
            </div>
        </div>
    </div>
</body>
</html>
