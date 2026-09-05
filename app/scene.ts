import * as T from 'three';
import { buildNightWorld } from './night-world';
import { addCompanions } from './companions';
import { boatRoute, landmarks, landmarkOrder, type LandmarkPosition } from './exploration';

export type LanxiController = {
  toggle: () => void; pause: () => void; reset: () => void; seek: (p: number) => void;
  view: (mode: string) => void; dispose: () => void;
};

export async function createLanxi(host: HTMLDivElement, report: (p: number, playing: boolean, markers?:LandmarkPosition[]) => void): Promise<LanxiController> {
  const scene = new T.Scene();
  scene.background = new T.Color('#0c365b');
  scene.fog = new T.FogExp2('#0c365b', 0.0015);
  const camera = new T.PerspectiveCamera(50, 1, .1, 650);
  const renderer = new T.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.NoToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = false;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);
  const ambient = new T.HemisphereLight('#b4d5ed', '#304873', 1.3);
  scene.add(ambient);
  const sun = new T.DirectionalLight('#a2c6e4', 1.0);
  sun.position.set(-35, 65, 30); sun.castShadow = true;
  sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera, {left:-55,right:55,top:60,bottom:-60,near:1,far:200});
  sun.shadow.bias = -.001; scene.add(sun);
  const fill = new T.DirectionalLight('#4775a3', .3); fill.position.set(40, 20, -50); scene.add(fill);

  const ramp=new T.DataTexture(new Uint8Array([80,155,220,255]),4,1,T.RedFormat);ramp.needsUpdate=true;ramp.minFilter=T.NearestFilter;ramp.magFilter=T.NearestFilter;
  const material = (color:string) => new T.MeshToonMaterial({color,gradientMap:ramp});
  const wood=material('#253854'),lightWood=material('#3b5379'),edgeWood=material('#152740');
  const hair=material('#172d4a'),skin=material('#8cbac4'),black=material('#060e19');
  const sphere = new T.SphereGeometry(1,32,24), box = new T.BoxGeometry(1,1,1);
  const mesh = (geo: T.BufferGeometry, mat: T.Material, parent: T.Object3D, x=0,y=0,z=0,sx=1,sy=sx,sz=sx) => {
    const m = new T.Mesh(geo,mat); m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m;
  };
  const ball = (parent:T.Object3D,mat:T.Material,x:number,y:number,z:number,sx:number,sy=sx,sz=sx) => mesh(sphere,mat,parent,x,y,z,sx,sy,sz);
  const rod = (parent:T.Object3D, mat:T.Material, a:number[], b:number[], radius:number, radius2=radius, segments=8) => {
    const p = new T.Vector3(...a),q = new T.Vector3(...b),dir=q.clone().sub(p);
    const m = new T.Mesh(new T.CylinderGeometry(radius2,radius,dir.length(),segments),mat);
    m.position.copy(p.add(q).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());parent.add(m);return m;
  };
  const curve = (parent:T.Object3D,mat:T.Material,points:number[][],r:number) => {
    const c = new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
    return mesh(new T.TubeGeometry(c,24,r,6,false),mat,parent);
  };

  const world=await buildNightWorld(scene,renderer);

  const boat=new T.Group();scene.add(boat);
  // Watertight tapered wooden hull, bow pointing along negative Z.
  const hullVertices:number[]=[],hullIndices:number[]=[];
  const outline=[[-.2,-3.5],[-1,-2.4],[-1.3,-.8],[-1.2,1.6],[-.75,2.8],[.75,2.8],[1.2,1.6],[1.3,-.8],[1,-2.4],[.2,-3.5]];
  for(let r=0;r<2;r++)for(const [x,z] of outline)hullVertices.push(x*(r?.72:1),r?.05:.7,z*(r?.91:1));
  for(let i=0;i<10;i++){const j=(i+1)%10;hullIndices.push(i,j,i+10,j,j+10,i+10);}
  const hullGeo=new T.BufferGeometry();hullGeo.setAttribute('position',new T.Float32BufferAttribute(hullVertices,3));hullGeo.setIndex(hullIndices);hullGeo.computeVertexNormals();
  const hullMat=wood.clone();hullMat.side=T.DoubleSide;mesh(hullGeo,hullMat,boat);
  for(let i=0;i<15;i++) {
    const z=-2.9+i*.37;const w=z<-.8?1.9+(z+.8)*.43:z>1.5?2.05-(z-1.5)*.65:2.1;
    mesh(box,i%3?lightWood:wood,boat,0,.27,z,w,.12,.35);
  }
  for(let i=0;i<10;i++){const a=outline[i],b=outline[(i+1)%10];rod(boat,edgeWood,[a[0],.71,a[1]],[b[0],.71,b[1]],.065);}
  for(const z of [-1.1,1.4])mesh(box,lightWood,boat,0,.68,z,2.15,.15,.35);
  const companions=addCompanions(boat);
  const oar = new T.Group();oar.position.set(.8,1.2,1.8);boat.add(oar);
  rod(oar,wood,[0,0,0],[2.2,-1.1,1.2],.045);
  const blade=mesh(box,lightWood,oar,2.12,-1.07,1.16,.4,.07,.72);blade.rotation.y=-.6;
  boat.traverse(o=>{if(o instanceof T.Mesh){o.castShadow=true;o.receiveShadow=true;}});

  // Thin, moving wake ribbons and scattered lake glints.
  const rippleMat=new T.MeshBasicMaterial({color:'#739eb7',transparent:true,opacity:.23,depthWrite:false,side:T.DoubleSide});
  const wakes:T.Mesh[]=[];
  for(let i=0;i<9;i++) {
    const m=mesh(new T.RingGeometry(.92,1,48),rippleMat.clone(),scene);m.rotation.x=-Math.PI/2;wakes.push(m);
  }
  let progress=0,playing=false,mode='journey',time=0,disposed=false;
  let yaw=0,pitch=0,zoom=1,drag=false,lastX=0,lastY=0;
  let dirtyUntil=performance.now()+1600;
  const invalidate=()=>{dirtyUntil=performance.now()+1600;};
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas=renderer.domElement;
  const onDown=(e:PointerEvent)=>{drag=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);};
  const onMove=(e:PointerEvent)=>{if(!drag)return;invalidate();yaw=T.MathUtils.clamp(yaw-(e.clientX-lastX)*.003,-.65,.65);pitch=T.MathUtils.clamp(pitch+(e.clientY-lastY)*.003,-.22,.45);lastX=e.clientX;lastY=e.clientY;};
  const onUp=()=>{drag=false;};
  const onWheel=(e:WheelEvent)=>{e.preventDefault();invalidate();zoom=T.MathUtils.clamp(zoom+e.deltaY*.0006,.65,1.6);};
  canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointermove',onMove);canvas.addEventListener('pointerup',onUp);canvas.addEventListener('pointercancel',onUp);canvas.addEventListener('wheel',onWheel,{passive:false});
  const resize=()=>{invalidate();const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);};
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  const target=new T.Vector3(),desired=new T.Vector3(),offset=new T.Vector3();
  const center=new T.Vector3();let last=performance.now(),nextReport=0;
  function render(now:number) {
    if(disposed)return;
    // Hold the paused scene still; wake only for navigation or camera settling.
    if(document.hidden||(!playing&&now>dirtyUntil)){last=now;return;}
    if(now-last<1000/30)return;
    const dt=Math.min((now-last)/1000,.05);last=now;
    if(!document.hidden) {
      if(playing&&!reduced)time+=dt;
      if(playing){progress=Math.min(100,progress+dt*100/85);if(progress>=100){playing=false;report(progress,playing);}}
      const p=progress/100;
      const [x,z]=boatRoute(p);
      const [nx,nz]=boatRoute(Math.min(1,p+.002));const [px,pz]=boatRoute(Math.max(0,p-.002));
      const heading=Math.atan2(-(nx-px),-(nz-pz));
      boat.position.set(x,.06+Math.sin(time*1.1)*.025,z);boat.rotation.set(Math.sin(time*.8)*.007,heading,Math.sin(time*.9)*.012);
      const rowing=T.MathUtils.smoothstep(p,.18,.26);
      oar.rotation.z=(1-rowing)*1.9+rowing*(playing?Math.sin(time*1.6)*.16:0);oar.rotation.y=playing?Math.sin(time*1.6)*.2:0;companions.update(time);
      world.update(time);
      wakes.forEach((m,i)=>{const a=(time*.12+i/9)%1;m.position.set(x,.025,z+2.4+a*8);m.scale.set(1+a*3,.33+a*.7,1);(m.material as T.MeshBasicMaterial).opacity=(1-a)*.2*(playing?1:.4);});
      if(mode==='companions') {
        center.set(x,1.85,z-.25);offset.set(3.8,1.3,-7.5);offset.applyAxisAngle(new T.Vector3(0,1,0),heading+yaw);offset.multiplyScalar(zoom);desired.copy(center).add(offset);desired.y=Math.max(2.2,desired.y+pitch*5);target.copy(center);camera.fov=42;camera.updateProjectionMatrix();
      } else if(mode==='boat') {
        center.set(x,2.7,z+2.7);offset.set(Math.sin(yaw)*35,5+Math.sin(pitch)*25,-Math.cos(yaw)*35);target.copy(center).add(offset);desired.copy(center);camera.fov=50*zoom;camera.updateProjectionMatrix();
      } else {
        camera.fov=50;camera.updateProjectionMatrix();
        if(mode==='wide'){center.set(0,15,-53);offset.set(6,2,114);}else{center.set(x*.2,11+p*2,-53);offset.set(3.5-x*.1,-7.3-p*2,106-p*49);}
        const radius=offset.length()*zoom;let az=Math.atan2(offset.x,offset.z)+yaw;let el=Math.asin(offset.y/offset.length())+pitch;
        el=T.MathUtils.clamp(el,-.28,.55);offset.set(radius*Math.cos(el)*Math.sin(az),radius*Math.sin(el),radius*Math.cos(el)*Math.cos(az));
        desired.copy(center).add(offset);desired.y=Math.max(2.4,desired.y);target.copy(center);
      }
      if(camera.position.lengthSq()===0){camera.position.copy(desired);}else camera.position.lerp(desired,1-Math.exp(-dt*5));
      camera.lookAt(target);renderer.render(scene,camera);
      if(now>nextReport){
        const markers=landmarkOrder.map(id=>{const q=new T.Vector3(...landmarks[id].position).project(camera);return {id,x:(q.x+1)*50,y:(1-q.y)*50,visible:q.z>-1&&q.z<1&&Math.abs(q.x)<.9&&q.y<.76&&q.y>-.42&&mode!=='companions'};});
        report(progress,playing,markers);nextReport=now+200;
      }
    }
  }
  renderer.setAnimationLoop(render);
  const contextLost=(e:Event)=>{e.preventDefault();playing=false;report(progress,false);};
  canvas.addEventListener('webglcontextlost',contextLost);
  return {
    toggle(){invalidate();if(progress>=100)progress=0;playing=!playing;report(progress,playing);},
    pause(){invalidate();playing=false;report(progress,false);},
    reset(){invalidate();progress=0;playing=false;mode='journey';yaw=0;pitch=0;zoom=1;report(progress,playing);},
    seek(p){invalidate();progress=T.MathUtils.clamp(p,0,100);if(progress>=100)playing=false;report(progress,playing);},
    view(v){invalidate();mode=v;yaw=0;pitch=0;zoom=1;},
    dispose(){disposed=true;renderer.setAnimationLoop(null);world.dispose();companions.dispose();ramp.dispose();observer.disconnect();canvas.removeEventListener('pointerdown',onDown);canvas.removeEventListener('pointermove',onMove);canvas.removeEventListener('pointerup',onUp);canvas.removeEventListener('pointercancel',onUp);canvas.removeEventListener('wheel',onWheel);canvas.removeEventListener('webglcontextlost',contextLost);
      const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();
      scene.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Line||o instanceof T.Points){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});
      geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();canvas.remove();
    },
  };
}
