export type LandmarkId='lake'|'entrance'|'rock'|'mountain';
export type LandmarkPosition={id:LandmarkId;x:number;y:number;visible:boolean};
export const landmarks:Record<LandmarkId,{title:string;subtitle:string;quote?:string;paragraphs:string[];position:[number,number,number]}>={
 lake:{title:'星夜湖',subtitle:'湖与天空相接的地方',quote:'这里是星夜湖。',paragraphs:['星星映在平静的水面上，乘船望去，湖面仿佛与天空连在一起。','动画中也说到：“这里并没有特定的白天黑夜。” 这里的昼夜可以由老君控制，眼前是星夜时的湖景。'],position:[-10,.3,2]},
 entrance:{title:'水上入口',subtitle:'这趟行舟的起点',paragraphs:['右侧的水上建筑是船驶入这片空间的入口。','小船从建筑下方的通道进入星夜湖，再向借火岩与远处的老君山行去。'],position:[18,10,28]},
 rock:{title:'借火岩',subtitle:'留在山石里的相遇',quote:'雕的是老君与清凝仙子邂逅的情景。',paragraphs:['两边的石壁上，刻着清凝仙子与老君借火的形象。老君伸出烟杆，清凝为他借火，石刻把两人初遇的情景留在了湖上。','清凝后来成为老君的弟子。这里先呈现这次邂逅，后续故事可继续沿着《蓝溪镇》了解。'],position:[-17,29,-37]},
 mountain:{title:'老君山',subtitle:'老君就住在山顶',quote:'那就是老君山。',paragraphs:['从两侧借火岩之间望过去，中间那座山就是老君山。','山顶的小亭阁是老君居住的地方，也是这趟乘舟远望的目的地。'],position:[0,56,-178]}
};
export const landmarkOrder:LandmarkId[]=['entrance','lake','rock','mountain'];
/** The first segment stays on the entrance centreline until the hull is clear. */
export function boatRoute(p:number):[number,number] {
 const t=Math.max(0,Math.min(1,p));
 const turn=Math.max(0,Math.min(1,(t-.18)/.7));
 return [18*(1-turn*turn*(3-2*turn)),30-49*t];
}
