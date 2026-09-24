import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

export function SignaturePad({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value) return;
    const image = new Image(); image.onload = () => canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height); image.src = value;
  }, []);
  const point = (event: React.PointerEvent<HTMLCanvasElement>) => { const r=event.currentTarget.getBoundingClientRect(); return {x:(event.clientX-r.left)*event.currentTarget.width/r.width,y:(event.clientY-r.top)*event.currentTarget.height/r.height}; };
  const start=(e:React.PointerEvent<HTMLCanvasElement>)=>{drawing.current=true;e.currentTarget.setPointerCapture(e.pointerId);const p=point(e);const c=e.currentTarget.getContext('2d');c?.beginPath();c?.moveTo(p.x,p.y)};
  const move=(e:React.PointerEvent<HTMLCanvasElement>)=>{if(!drawing.current)return;const p=point(e);const c=e.currentTarget.getContext('2d');if(c){c.strokeStyle='#061D49';c.lineWidth=2;c.lineCap='round';c.lineTo(p.x,p.y);c.stroke();}};
  const end=()=>{drawing.current=false;if(canvasRef.current)onChange(canvasRef.current.toDataURL('image/png'));};
  const clear=()=>{const c=canvasRef.current;c?.getContext('2d')?.clearRect(0,0,c.width,c.height);onChange('');};
  return <div className="space-y-2"><canvas ref={canvasRef} width={600} height={180} className="w-full h-32 rounded-md border bg-white touch-none" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}/><Button type="button" size="sm" variant="outline" onClick={clear}>Effacer la signature</Button></div>;
}
