import * as T from 'three';

/** Bespoke rounded character silhouettes, with layered eyes, hair locks and clothing. */
export function addCompanions(boat:T.Group) {
 const ink=new T.MeshBasicMaterial({color:'#071426'});
 const ramp=new T.DataTexture(new Uint8Array([95,170,235,255]),4,1,T.RedFormat);ramp.needsUpdate=true;ramp.minFilter=T.NearestFilter;ramp.magFilter=T.NearestFilter;
 const mat=(c:string)=>new T.MeshToonMaterial({color:c,gradientMap:ramp});
 const skin=mat('#9ec5ce'),hair=mat('#1d3454'),shirt=mat('#a9cbd2'),blue=mat('#7398b9'),dark=mat('#233653'),catBlack=mat('#09101b'),eyeWhite=new T.MeshBasicMaterial({color:'#c4e0d9'});
 const sphere=new T.SphereGeometry(1,32,24);
 const mesh=(g:T.BufferGeometry,m:T.Material,p:T.Object3D)=>{const o=new T.Mesh(g,m);p.add(o);return o;};
 const ball=(p:T.Object3D,m:T.Material,x:number,y:number,z:number,sx:number,sy=sx,sz=sx)=>{const o=mesh(sphere,m,p);o.position.set(x,y,z);o.scale.set(sx,sy,sz);return o;};
 const line=(p:T.Object3D,points:number[][],r=.015,m:T.Material=ink)=>mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),24,r,6,false),m,p);
 const limb=(p:T.Object3D,a:number[],b:number[],radius:number,m:T.Material=skin)=>{
   const v=new T.Vector3(...a),w=new T.Vector3(...b),d=w.clone().sub(v);
   const o=mesh(new T.CylinderGeometry(radius,radius,d.length(),12),m,p);o.position.copy(v.add(w).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());ball(p,m,...b as [number,number,number],radius);return o;
 };
 // Outline is part of the silhouette mesh, not a screen-facing character card.
 const shape=(p:T.Object3D,points:number[][],m:T.Material,depth:number,z:number,bevel=.04)=>{
   const s=new T.Shape();s.moveTo(points[0][0],points[0][1]);
   const curve=new T.SplineCurve(points.map(q=>new T.Vector2(...q)));
   for(const q of curve.getPoints(points.length*5))s.lineTo(q.x,q.y);s.closePath();
   const g=new T.ExtrudeGeometry(s,{depth,steps:1,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:3,curveSegments:24});
   const o=mesh(g,m,p);o.position.z=z;
   const outline=mesh(g,ink,p);outline.position.z=z;outline.scale.set(1.024,1.018,.98);outline.material=new T.MeshBasicMaterial({color:'#071426',side:T.BackSide});return o;
 };
 function human(agen:boolean) {
   const g=new T.Group();boat.add(g);g.position.set(agen?.35:-.18,.58,agen?1.35:-.75);g.rotation.y=agen?-.24:.1;
   const head=new T.Group();g.add(head);head.position.y=1.38;
   const contour=agen?[[-.43,.45],[-.61,.24],[-.59,-.19],[-.43,-.42],[0,-.49],[.43,-.42],[.59,-.19],[.61,.24],[.43,.45],[0,.53],[-.43,.45]]:[[-.34,.52],[-.54,.3],[-.57,-.06],[-.42,-.4],[-.09,-.47],[.29,-.42],[.51,-.23],[.54,.22],[.33,.51],[0,.57],[-.34,.52]];
   shape(head,contour,skin,.36,-.28,.07);
   ball(head,hair,0,.2,.17,.63,.53,.36);
   for(const x of [-.56,.56])ball(head,skin,x,-.08,-.03,.1,.16,.09);
   if(agen) {
     shape(head,[[-.6,.12],[-.68,.35],[-.58,.58],[-.41,.66],[-.27,.59],[-.12,.72],[.09,.65],[.27,.67],[.5,.55],[.61,.32],[.53,.08],[.41,.28],[.27,.2],[.17,.38],[.02,.28],[-.1,.39],[-.28,.21],[-.38,.33],[-.51,.11],[-.6,.12]],hair,.29,-.36,.018);
     for(const x of [-.25,.25]) {
       ball(head,ink,x,-.02,-.386,.25,.295,.045);ball(head,eyeWhite,x,-.02,-.423,.222,.267,.025);ball(head,ink,x-.012,-.015,-.451,.043,.065,.012);
     }
     line(head,[[-.09,-.34,-.376],[.04,-.38,-.38],[.17,-.32,-.37]],.022);
   } else {
     shape(head,[[-.58,-.21],[-.65,.13],[-.59,.47],[-.38,.68],[0,.73],[.33,.65],[.55,.43],[.58,.04],[.46,-.35],[.31,-.41],[.35,-.05],[.27,.21],[.04,.46],[-.09,.39],[-.27,.23],[-.3,-.08],[-.4,-.37],[-.53,-.31],[-.58,-.21]],hair,.32,-.37,.028);
     // Central hair whorl and the short pointed ends of the bob.
     line(head,[[.02,.67,-.05],[-.06,.9,-.07],[.02,1.03,-.07],[.02,.79,-.08]],.065,hair);
     for(const side of [-1,1])shape(head,[[side*.35,-.24],[side*.55,-.22],[side*.55,-.49],[side*.42,-.39],[side*.28,-.43],[side*.35,-.24]],hair,.24,-.01,.014);
     for(const x of [-.21,.21]) {
       ball(head,ink,x,-.045,-.39,.108,.198,.023);ball(head,blue,x-.012,.008,-.407,.069,.133,.012);ball(head,ink,x,-.015,-.422,.059,.136,.013);
       line(head,[[x-.11,.24,-.382],[x,.28,-.402],[x+.095,.23,-.382]],.022);
     }
     line(head,[[-.08,-.32,-.38],[.02,-.315,-.392],[.11,-.335,-.38]],.012);
   }
   limb(g,[0,.91,0],[0,1.02,0],.13);
   shape(g,[[-.27,.96],[-.37,.82],[-.36,.42],[.34,.42],[.36,.82],[.25,.96],[0,.86],[-.27,.96]],agen?shirt:blue,.31,-.17,.035);
   if(agen) {
     // A'Gen's sleeveless shirt: narrow shoulder straps and a rounded neckline.
     line(g,[[-.18,.98,-.22],[-.13,.82,-.22],[.13,.82,-.22],[.18,.98,-.22]],.026,dark);
   } else {
     shape(g,[[-.29,.89],[-.29,.74],[.29,.74],[.29,.89],[.14,.84],[0,.75],[-.14,.84],[-.29,.89]],shirt,.025,-.245,.008);
     ball(g,blue,-.37,.83,0,.15,.18,.18);ball(g,blue,.37,.83,0,.15,.18,.18);
   }
   ball(g,dark,0,.4,0,.35,.17,.23);
   for(const x of [-.21,.21]) {
     limb(g,[x,.36,-.06],[x,.28,-.48],.12,dark);limb(g,[x,.28,-.48],[x,.02,-.5],.085,skin);ball(g,agen?dark:shirt,x,-.03,-.59,.125,.085,.2);
   }
   limb(g,[-.34,.83,0],[-.47,.55,-.24],.075);limb(g,[-.47,.55,-.24],[-.31,.5,-.38],.074);
   limb(g,[.34,.83,0],[.49,.55,-.16],.075);limb(g,[.49,.55,-.16],[.32,.49,-.4],.074);
   g.scale.setScalar(agen?1:.94);return g;
 }
 const agen=human(true),xiaobai=human(false);
 const cat=new T.Group();boat.add(cat);cat.position.set(-.24,.5,-2.18);cat.rotation.y=.12;
 ball(cat,catBlack,0,.27,.11,.3,.32,.31);
 const head=new T.Group();cat.add(head);head.position.y=.69;
 shape(head,[[-.39,-.12],[-.44,.16],[-.5,.48],[-.2,.33],[0,.3],[.2,.33],[.5,.48],[.44,.16],[.39,-.12],[.2,-.23],[-.2,-.23],[-.39,-.12]],catBlack,.34,-.2,.035);
 for(const x of [-.2,.2]) {
   ball(head,eyeWhite,x,.055,-.244,.142,.16,.02);ball(head,ink,x+.012,.055,-.264,.072,.111,.015);
 }
 line(head,[[-.045,-.125,-.246],[0,-.15,-.25],[.045,-.125,-.246]],.011);
 for(const x of [-.18,.18])ball(cat,catBlack,x,.06,-.14,.12,.1,.19);
 const tail=line(cat,[[0,.23,.27],[.39,.2,.57],[.57,.43,.65],[.52,.73,.53],[.34,.78,.47]],.073,catBlack);
 return {update(t:number){tail.rotation.z=Math.sin(t*.8)*.055;xiaobai.rotation.z=Math.sin(t*.6)*.008;agen.rotation.z=Math.sin(t*.6+.7)*.006;},dispose(){ramp.dispose();}};
}
