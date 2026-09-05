'use client';
import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Expand, Move, Waves, Compass, MessageCircle, X, ChevronRight } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { landmarks, landmarkOrder, type LandmarkId, type LandmarkPosition } from './exploration';
import { createLanxi, type LanxiController } from './scene';
export default function Home() {
  const surface = useRef<HTMLDivElement>(null);
  const controller = useRef<LanxiController | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [view, setView] = useState('journey');
  const [selected,setSelected]=useState<LandmarkId|null>(null);
  const [markers,setMarkers]=useState<LandmarkPosition[]>([]);
  const introduce=(id:LandmarkId)=>{controller.current?.pause();setSelected(id);};
  useEffect(() => {
    if (!surface.current) return;
    let cancelled=false;
    let active:LanxiController|null=null;
    setReady(false);setError('');
    createLanxi(surface.current,(p,moving,spots)=>{if(!cancelled){setProgress(p);setPlaying(moving);if(spots)setMarkers(spots);}})
      .then(instance=>{if(cancelled){instance.dispose();return;}active=instance;controller.current=instance;setReady(true);})
      .catch(e=>{console.error(e);if(!cancelled)setError('场景未能加载。请刷新重试；如果仍然失败，请在 Edge 或 Chrome 中开启图形加速。');});
    return ()=>{cancelled=true;active?.dispose();controller.current=null;};
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName === 'BODY') {
        e.preventDefault(); controller.current?.toggle();
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);
  const stage = progress < 25 ? '星夜湖' : progress < 72 ? '驶向借火岩' : '借火岩前';
  return (
    <Dialog open={selected!==null} onOpenChange={open=>{if(!open)setSelected(null);}}>
    <main className="experience">
      <div ref={surface} className="world" role="img" aria-label="蓝溪镇三维湖景：阿根、小白与小黑乘坐木船，星空倒映在湖面，前方两侧巨岩上刻着老君与清凝借火的形象" />
      <div className="vignette" />
      <header className="topbar">
        <div className="identity"><span className="seal">溪</span><div><p className="eyebrow">罗小黑 · 湖上漫游</p><h1>蓝溪镇</h1></div><span className="title-divider"/><span className="place">借火岩</span></div>
        <div className="top-actions"><span className="edition">同人场景 / 星夜湖</span><button className="icon-button" aria-label="全屏体验" title="全屏体验" onClick={() => { if (document.fullscreenElement) void document.exitFullscreen(); else void document.documentElement.requestFullscreen().catch(() => {}); }}><Expand size={18}/></button></div>
      </header>
      <nav className="place-guide" aria-label="地点介绍">
        <p><MessageCircle size={15}/> 点击地名，了解这里</p>
        <div>{landmarkOrder.map(id=><DialogTrigger key={id} render={<button className="guide-chip" disabled={!ready}/>} onClick={()=>introduce(id)}>{landmarks[id].title}</DialogTrigger>)}</div>
      </nav>
      <div className="scene-markers">{ready&&markers.filter(m=>m.visible).map(m=><DialogTrigger key={m.id} render={<button className="scene-marker" data-landmark={m.id} style={{left:m.x+'%',top:m.y+'%'}}/>} onClick={()=>introduce(m.id)}><span className="marker-dot"/><span>{landmarks[m.id].title}</span><MessageCircle size={13}/></DialogTrigger>)}</div>
      <div className="location"><Compass size={17}/><span>{stage}</span><span className="location-dot"/><span>阿根 · 小白 · 小黑</span></div>
      {!ready && <div className="loading" role="status">{error || '正在点亮星夜湖…'}{error && <button onClick={() => location.reload()}>重新打开</button>}</div>}
      <footer className="bottom-area">
        <div className="interaction-hint"><Move size={15}/><span>拖动画面环顾 · 滚轮拉近</span></div>
        <div className="control-panel">
          <div className="transport"><button className="sail-button" disabled={!ready} onClick={() => controller.current?.toggle()}>{playing ? <Pause size={19} fill="currentColor"/> : <Play size={19} fill="currentColor"/>}<span>{playing ? '停舟赏景' : progress >= 100 ? '再游一次' : progress > 0 ? '继续行舟' : '启程入画'}</span></button><button className="icon-button reset" disabled={!ready} aria-label="回到起点" title="回到起点" onClick={() => { controller.current?.reset(); setView('journey'); }}><RotateCcw size={18}/></button></div>
          <div className="journey-track"><div className="track-labels"><span>星夜湖</span><span className="track-middle"><Waves size={13}/> {Math.round(progress)}%</span><span>借火岩</span></div><Slider aria-label="行船进度" disabled={!ready} value={[progress]} min={0} max={100} step={0.1} onValueChange={v => controller.current?.seek(Array.isArray(v) ? v[0] : v)} /></div>
          <Tabs value={view} onValueChange={v => { setView(String(v)); controller.current?.view(String(v)); }}><TabsList className="view-tabs" aria-label="观看角度"><TabsTrigger value="journey">随舟</TabsTrigger><TabsTrigger value="boat">船上</TabsTrigger><TabsTrigger value="wide">全景</TabsTrigger><TabsTrigger value="companions">同舟</TabsTrigger></TabsList></Tabs>
        </div>
        <div className="footnote"><span>星夜湖 · 乘舟与探访</span><a href="https://www.bilibili.com/bangumi/play/ep32364" target="_blank" rel="noreferrer">动画参考 ↗</a></div>
      </footer>
    </main>
    <DialogContent className="story-dialog" showCloseButton={false}>
      <DialogClose className="story-close" aria-label="关闭介绍"><X size={19}/></DialogClose>
      {selected&&<>
        <div className="story-kicker">蓝溪镇 · 地点介绍</div>
        <DialogTitle className="story-title">{landmarks[selected].title}</DialogTitle>
        <DialogDescription className="story-subtitle">{landmarks[selected].subtitle}</DialogDescription>
        {landmarks[selected].quote&&<blockquote className="story-quote"><small>动画原句</small>“{landmarks[selected].quote}”</blockquote>}
        <div className="story-body"><small>场景介绍</small>{landmarks[selected].paragraphs.map(p=><p key={p}>{p}</p>)}</div>
        <div className="story-bottom"><a href="https://www.bilibili.com/bangumi/play/ep32364?t=240" target="_blank" rel="noreferrer">TV 片段 ↗</a><DialogClose className="story-return">收起介绍，继续赏景 <ChevronRight size={16}/></DialogClose></div>
      </>}
    </DialogContent>
    </Dialog>
  );
}
