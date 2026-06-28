import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, RotateCcw } from 'lucide-react';

interface Props {
    existingUrl?: string | null;
    onChange: (dataUrl: string | null) => void;
}

/**
 * Lightweight draw-to-sign pad (mouse + touch), no external dependency.
 * Emits a PNG data URL on every stroke end, or null when cleared.
 */
const SignaturePad: React.FC<Props> = ({ existingUrl, onChange }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawing = useRef(false);
    const hasDrawn = useRef(false);
    const [redrawing, setRedrawing] = useState(!existingUrl);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !redrawing) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        // Scale for crisp lines.
        const ratio = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * ratio;
        canvas.height = rect.height * ratio;
        ctx.scale(ratio, ratio);
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#111827';
    }, [redrawing]);

    const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
        drawing.current = true;
        const ctx = canvasRef.current!.getContext('2d')!;
        const { x, y } = pos(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        canvasRef.current!.setPointerCapture(e.pointerId);
    };

    const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!drawing.current) return;
        const ctx = canvasRef.current!.getContext('2d')!;
        const { x, y } = pos(e);
        ctx.lineTo(x, y);
        ctx.stroke();
        hasDrawn.current = true;
    };

    const end = () => {
        if (!drawing.current) return;
        drawing.current = false;
        if (hasDrawn.current) {
            onChange(canvasRef.current!.toDataURL('image/png'));
        }
    };

    const clear = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d')!;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        hasDrawn.current = false;
        onChange(null);
    };

    if (!redrawing && existingUrl) {
        return (
            <div className="space-y-2">
                <img src={existingUrl} alt="Signature" className="h-32 w-full rounded-md border bg-white object-contain" />
                <Button type="button" variant="outline" size="sm" onClick={() => { setRedrawing(true); onChange(null); }}>
                    <RotateCcw className="mr-2 h-4 w-4" /> Replace signature
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <canvas
                ref={canvasRef}
                onPointerDown={start}
                onPointerMove={move}
                onPointerUp={end}
                onPointerLeave={end}
                className="h-32 w-full touch-none rounded-md border bg-white"
            />
            <Button type="button" variant="outline" size="sm" onClick={clear}>
                <Eraser className="mr-2 h-4 w-4" /> Clear
            </Button>
        </div>
    );
};

export default SignaturePad;
