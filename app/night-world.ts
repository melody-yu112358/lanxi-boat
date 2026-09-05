import * as T from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

/** Night lake scenery; curved relief surfaces close into volumetric mountain masses. */
export async function buildNightWorld(scene:T.Scene, renderer:T.WebGLRenderer) {
  let seed=1138;
  const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  const flat=(color:string)=>new T.MeshBasicMaterial({color});
  const rockMat=flat('#071d49'),lineMat=flat('#294e71');
  const add=(g:T.BufferGeometry,m:T.Material,p:T.Object3D,x=0,y=0,z=0)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);p.add(o);return o;};
  const cube=(p:T.Object3D,m:T.Material,x:number,y:number,z:number,w:number,h:number,d:number)=>add(new T.BoxGeometry(w,h,d),m,p,x,y,z);
  const stroke=(p:T.Object3D,points:number[][],r=.04)=>add(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(q=>new T.Vector3(...q))),32,r,5,false),lineMat,p);

  // Large simple silhouettes preserve the TV background's quiet, graphic shapes.
  function ridge(points:number[][],z:number,depth:number,color:string) {
    const s=new T.Shape();s.moveTo(points[0][0],-.15);
    for(const [x,y] of points)s.lineTo(x,y);
    s.lineTo(points[points.length-1][0],-.15);s.closePath();
    const g=new T.ExtrudeGeometry(s,{depth,bevelEnabled:false});add(g,flat(color),scene,0,0,z);
  }
  ridge([[-280,5],[-230,14],[-196,8],[-176,23],[-149,30],[-118,22],[-105,31],[-94,25],[-78,30],[-60,23],[-43,15],[-32,8],[-24,13],[-15,22],[-10,34],[-4,40],[0,54],[4,49],[10,44],[14,28],[22,14],[34,6],[48,10],[66,23],[74,28],[82,26],[102,33],[124,18],[155,24],[192,9],[240,13],[290,3]],-190,14,'#092f54');
  ridge([[-170,0],[-154,10],[-128,17],[-116,15],[-103,21],[-92,16],[-71,18],[-55,7],[-37,3]],-134,8,'#0a2a50');
  ridge([[38,1],[54,9],[75,14],[95,9],[108,16],[123,19],[143,7],[167,2]],-130,8,'#0a2a50');
  ridge([[-190,0],[-146,2],[-111,8],[-88,13],[-71,23],[-68,37],[-72,45],[-77,51],[-82,40],[-89,38],[-95,26],[-119,20],[-151,11]],-62,10,'#0a244c');
  ridge([[79,0],[88,8],[105,16],[120,21],[139,16],[156,8],[176,0]],-82,12,'#09254a');

  // The central peak is a full, tapering mountain, with a summit for the home.
  {
    const pos:number[]=[],indices:number[]=[];const rings=36,sides=64;
    for(let j=0;j<=rings;j++)for(let i=0;i<sides;i++) {
      const t=j/rings,a=i/sides*Math.PI*2;
      const r=1.2+24*Math.pow(1-t,1.35)*(1+.12*Math.sin(a*5+t*8)+.07*Math.sin(a*9-t*6));
      pos.push(Math.cos(a)*r+Math.sin(t*Math.PI)*1.8,t*54, -178+Math.sin(a)*r*.8);
    }
    for(let j=0;j<rings;j++)for(let i=0;i<sides;i++){const a=j*sides+i,b=j*sides+(i+1)%sides;indices.push(a,b,a+sides,b,b+sides,a+sides);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(indices);g.computeVertexNormals();
    add(g,new T.MeshStandardMaterial({color:'#0b3158',emissive:'#061a38',roughness:1}),scene);
    add(new T.CylinderGeometry(1.25,1.4,.15,16),rockMat,scene,0,54,-178);
  }

  function roof(p:T.Object3D,y:number,w:number,d:number) {
    const pos:number[]=[],idx:number[]=[];const n=16;
    for(let j=0;j<=n;j++)for(let i=0;i<=n;i++) {
      const u=i/n*2-1,v=j/n*2-1;
      pos.push(u*w,y+1.55*(1-Math.abs(u))+.55*Math.pow(Math.abs(u),8)+.5*Math.pow(Math.abs(v),6),v*d);
    }
    for(let j=0;j<n;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i,b=a+1,c=a+n+1;idx.push(a,c,b,b,c,c+1);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
    const m=new T.MeshBasicMaterial({color:'#0c2050',side:T.DoubleSide});add(g,m,p);
    for(const v of [-1,1])stroke(p,Array.from({length:9},(_,i)=>{const u=i/4-1;return [u*w,y+1.55*(1-Math.abs(u))+.55*Math.pow(Math.abs(u),8)+.5,v*d];}),.035);
  }
  function pavilion(x:number,y:number,z:number,scale:number,gate=false) {
    const p=new T.Group();p.position.set(x,y,z);p.scale.setScalar(scale);scene.add(p);
    if(gate) {
      // Two real piers and a lintel: the boat passes through an open channel.
      for(const side of [-1,1]) {
        cube(p,rockMat,side*2.5,3.8,0,1.25,7.6,4.1);
        cube(p,lineMat,side*2.5,.14,0,1.5,.28,4.5);
        cube(p,lineMat,side*3.1,3.9,2.08,.06,7,.06);
      }
      cube(p,rockMat,0,6.9,0,6.2,1.6,4.1);
      cube(p,lineMat,0,7.65,0,6.7,.23,4.5);
      const upper=new T.Group();upper.scale.set(1.55,1,1.45);p.add(upper);
      cube(upper,rockMat,0,9,0,3.3,2.7,2.8);
      for(const x of [-1.3,-.6,.6,1.3])cube(upper,lineMat,x,9,1.42,.07,2.3,.03);
      cube(upper,flat('#112e54'),0,8.9,1.42,.9,1.6,.03);
      roof(upper,10.2,2.3,1.9);
      return p;
    }
    const base=gate?7.7:0;
    cube(p,rockMat,0,base+1.35,0,3.3,2.7,2.8);
    for(const x of [-1.3,-.6,.6,1.3])cube(p,lineMat,x,base+1.3,1.42,.07,2.3,.03);
    cube(p,flat('#112e54'),0,base+1.2,1.42,.9,1.6,.03);
    roof(p,base+2.5,2.3,1.9);
    if(!gate){cube(p,rockMat,0,4.5,0,2.4,1.8,2);roof(p,5.2,1.8,1.5);}
    return p;
  }
  pavilion(18,0,28,1,true);pavilion(0,54,-178,.72);

  const starPositions:number[]=[],sizes:number[]=[],phases:number[]=[];
  for(let i=0;i<2300;i++) {
    const a=rand()*Math.PI*2,v=.012+rand()*.97,r=330;
    const h=Math.sqrt(1-v*v);starPositions.push(Math.cos(a)*h*r,v*r,Math.sin(a)*h*r);sizes.push(.7+Math.pow(rand(),3)*2.5);phases.push(rand()*Math.PI*2);
  }
  const starGeo=new T.BufferGeometry();starGeo.setAttribute('position',new T.Float32BufferAttribute(starPositions,3));starGeo.setAttribute('aSize',new T.Float32BufferAttribute(sizes,1));starGeo.setAttribute('aPhase',new T.Float32BufferAttribute(phases,1));
  const starMat=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uTime:{value:0},uPixelRatio:{value:renderer.getPixelRatio()}},
    vertexShader:`attribute float aSize;attribute float aPhase;varying float vPhase;uniform float uPixelRatio;void main(){vPhase=aPhase;gl_PointSize=(aSize+2.)*uPixelRatio;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform float uTime;varying float vPhase;void main(){float d=length(gl_PointCoord-.5);float core=1.-smoothstep(.1,.24,d);float halo=(1.-smoothstep(.08,.5,d))*.22;float a=(core+halo)*(.82+.12*sin(uTime*.6+vPhase));gl_FragColor=vec4(.88,.91,.73,a);}`
  });scene.add(new T.Points(starGeo,starMat));

  // A real planar reflection, with a tiny ripple displacement rather than bright foam.
  const waterShader={
    uniforms:{color:{value:new T.Color(0x7f7f7f)},tDiffuse:{value:null},textureMatrix:{value:new T.Matrix4()},uTime:{value:0},uLake:{value:new T.Color('#0b3357')}},
    vertexShader:`uniform mat4 textureMatrix;varying vec4 vUv;varying vec3 vWorld;void main(){vUv=textureMatrix*vec4(position,1.);vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform sampler2D tDiffuse;uniform float uTime;uniform vec3 uLake;varying vec4 vUv;varying vec3 vWorld;
    void main(){vec2 uv=vUv.xy/vUv.w;float wave=sin(vWorld.z*.42+uTime*.35+sin(vWorld.x*.16))*sin(vWorld.x*.3-uTime*.2);uv.x+=wave*.00055;uv.y+=sin(vWorld.z*.9+uTime*.25)*.00016;vec3 reflected=texture2D(tDiffuse,uv).rgb;vec3 c=mix(uLake,reflected,.78);gl_FragColor=vec4(c,1.);
    #include <colorspace_fragment>
    }`
  };
  const water=new Reflector(new T.PlaneGeometry(950,950),{textureWidth:Math.min(1024,Math.ceil(window.innerWidth*renderer.getPixelRatio())),textureHeight:Math.min(640,Math.ceil(window.innerHeight*renderer.getPixelRatio())),clipBias:.003,multisample:0,shader:waterShader});
  water.rotation.x=-Math.PI/2;water.position.y=-.05;scene.add(water);

  const texture=await new T.TextureLoader().loadAsync('/assets/jiehuo-relief.png');
  texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const img=texture.image as HTMLImageElement;
  const sample=document.createElement('canvas');sample.width=256;sample.height=192;
  const ctx=sample.getContext('2d',{willReadFrequently:true});if(!ctx)throw new Error('Unable to read relief silhouette');
  ctx.drawImage(img,0,0,sample.width,sample.height);
  const pixels=ctx.getImageData(0,0,sample.width,sample.height).data;
  const nx=256,ny=192,width=84,height=56;
  const solid=(x:number,y:number)=>{if(x<0||x>=nx||y<0||y>=ny)return false;const i=(y*nx+x)*4;return pixels[i]<145 && pixels[i+2]>pixels[i]+12;};
  const frontPos:number[]=[],frontUV:number[]=[],backPos:number[]=[],sidePos:number[]=[];
  // Each rock has a rounded footprint, a shoulder and several broad ridges.
  // The illustration is draped over this surface instead of a flat extrusion.
  const point=(x:number,y:number,back=false):number[]=>{
    const xx=(x/nx-.5)*width, yy=(1-y/ny)*height;
    const cx=xx<0?-21:22, u=(xx-cx)/22, v=yy/height;
    const shoulder=Math.sqrt(Math.max(0,1-u*u))*(.6+.4*Math.sin(v*Math.PI));
    const ridge=Math.sin(xx*.21+yy*.055)*1.3+Math.sin(yy*.19-xx*.06)*.85;
    const ix=Math.max(0,Math.min(nx-1,Math.round(x))),iy=Math.max(0,Math.min(ny-1,Math.round(y)));
    const ink=pixels[(iy*nx+ix)*4+2];
    const carving=ink<180?(ink-45)*.013:0;
    const front=2+shoulder*10+ridge+carving;
    const pipe=Math.abs(xx)<7&&yy>28&&yy<40;
    const zz=back?(pipe?front-1.2:-11-shoulder*13+ridge):front;
    return [xx,yy,zz];
  };
  const vertex=(x:number,y:number)=>{frontPos.push(...point(x,y));backPos.push(...point(x,y,true));frontUV.push(x/nx,1-y/ny);};
  const edge=(x1:number,y1:number,x2:number,y2:number)=>{
    const a=point(x1,y1),b=point(x2,y2),aa=point(x1,y1,true),bb=point(x2,y2,true);
    // Rounded shoulders between carved front and the mountain's rear slopes.
    const mix=(p:number[],q:number[],t:number)=>p.map((v,i)=>v+(q[i]-v)*t+(i===0?Math.sign(v)*Math.sin(t*Math.PI)*1.4:0));
    for(let k=0;k<6;k++) {
      const a0=mix(a,aa,k/6),b0=mix(b,bb,k/6),a1=mix(a,aa,(k+1)/6),b1=mix(b,bb,(k+1)/6);
      sidePos.push(...a0,...a1,...b0,...b0,...a1,...b1);
    }
  };
  for(let y=0;y<ny;y++)for(let x=0;x<nx;x++)if(solid(x,y)) {
    vertex(x,y);vertex(x,y+1);vertex(x+1,y);vertex(x+1,y);vertex(x,y+1);vertex(x+1,y+1);
    if(!solid(x-1,y))edge(x,y+1,x,y);
    if(!solid(x+1,y))edge(x+1,y,x+1,y+1);
    if(!solid(x,y-1))edge(x,y,x+1,y);
    if(!solid(x,y+1))edge(x+1,y+1,x,y+1);
  }
  const relief=new T.Group();relief.position.set(0,-1.6,-53);scene.add(relief);
  const raw=new T.BufferGeometry();raw.setAttribute('position',new T.Float32BufferAttribute(frontPos,3));raw.setAttribute('uv',new T.Float32BufferAttribute(frontUV,2));
  const frontGeo=mergeVertices(raw);raw.dispose();frontGeo.computeVertexNormals();
  const carvedMaterial=new T.MeshStandardMaterial({map:texture,emissiveMap:texture,emissive:'#ffffff',emissiveIntensity:.3,roughness:1,side:T.DoubleSide});
  carvedMaterial.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nif(min(diffuseColor.r,min(diffuseColor.g,diffuseColor.b))>.19) discard;');};
  add(frontGeo,carvedMaterial,relief);
  const sideRaw=new T.BufferGeometry();sideRaw.setAttribute('position',new T.Float32BufferAttribute(sidePos,3));
  const sides=mergeVertices(sideRaw);sideRaw.dispose();sides.computeVertexNormals();
  const rockSurface=new T.MeshStandardMaterial({color:'#163263',emissive:'#040e25',roughness:1,side:T.DoubleSide});
  add(sides,rockSurface,relief);
  const backRaw=new T.BufferGeometry();backRaw.setAttribute('position',new T.Float32BufferAttribute(backPos,3));
  const backGeo=mergeVertices(backRaw);backRaw.dispose();backGeo.computeVertexNormals();add(backGeo,rockSurface,relief);
  return {
    update(t:number){starMat.uniforms.uTime.value=t;(water.material as T.ShaderMaterial).uniforms.uTime.value=t;},
    dispose(){water.dispose();texture.dispose();}
  };
}
