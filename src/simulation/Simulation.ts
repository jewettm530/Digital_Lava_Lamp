export const MAX_BLOBS = 16;
export interface Blob {
  x:number; y:number; radius:number; vx:number; vy:number;
  heat:number; seed:number; phase:number; stretch:number;
  drift:number; mobility:number; turn:number;
  age:number; cooldown:number; wobble:number; wobbleVelocity:number; transitioning?:boolean; reservoir?:boolean; anchorX?:number;
}
const random=(lo:number,hi:number)=>lo+Math.random()*(hi-lo);
const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
/** y=0 is the bottom, y=1 the top, x=0..aspect. */
export class Simulation {
  readonly blobs:Blob[]=[];
  aspect=1;
  elapsed=0;
  private accumulator=0;
  
  private transitions: Array<{kind:'merge'|'split'; a:Blob; b:Blob; time:number; duration:number; startAx:number;startAy:number;startBx:number;startBy:number; startRadiusA:number;startRadiusB:number;targetRadiusA:number;targetRadiusB:number; dx:number;dy:number}> = [];
  constructor(aspect:number){this.resize(aspect,true);}
  private makeBlob(x:number,y:number,radius:number,heat:number):Blob {
    return {x,y,radius,heat,seed:random(0,1000),phase:random(0,6.283),stretch:1,
      vx:random(-.013,.013),vy:random(-.009,.009),drift:random(.7,1.75),
      mobility:random(.72,1.55),turn:random(0,6.283),age:0,wobble:0,wobbleVelocity:0,cooldown:random(2,6)};
  }
  resize(aspect:number,initial=false):void {
    const previous=this.aspect;this.aspect=Math.max(.3,aspect);
    if(!initial){for(const b of this.blobs){b.x=clamp(b.x*this.aspect/previous,0,this.aspect);b.vx*=this.aspect/previous;}return;}
    // The bottom wax is simulated, not drawn as two permanent shader circles.
    // Reservoirs wander and deform, take in falling blobs and sometimes release wax.
    for(const fraction of [.27,.74]){
      const b=this.makeBlob(this.aspect*fraction,random(.145,.165),random(.17,.19),.25);
      b.reservoir=true;b.anchorX=fraction;b.cooldown=2;
      this.blobs.push(b);
    }
    const count=Math.min(MAX_BLOBS-2,Math.max(9,Math.round(9+this.aspect*2.2)));
    for(let i=this.blobs.length;i<count;i++){
      const r=i<4?random(.09,.125):random(.062,.11);
      const x=random(0,this.aspect), y=i<4?random(.82,.98):random(.12,.87);
      this.blobs.push(this.makeBlob(x,y,r,i<4?random(-1,-.55):random(-1,1)));
    }
  }
  update(dt:number,speed:number):void {
    // Slightly slower than Phase 13 at all speed settings (1x remains the default).
    this.accumulator+=Math.min(dt,.08)*speed*.82;
    let steps=0;
    while(this.accumulator>=1/60&&steps<15){this.advance(1/60);this.accumulator-=1/60;steps++;}
    if(steps===15)this.accumulator=0;
  }
  // Changing topology in a single frame makes the wax "pop". Instead,
  // animate the participating radii so the rendered silhouette changes continuously.
  private beginMerge(a:Blob,b:Blob):void {
    const ma=a.radius*a.radius,mb=b.radius*b.radius,total=ma+mb;
    const target=Math.sqrt(total);
    const x=(a.x*ma+b.x*mb)/total,y=(a.y*ma+b.y*mb)/total;
    a.vx=(a.vx*ma+b.vx*mb)/total;a.vy=(a.vy*ma+b.vy*mb)/total;
    a.heat=(a.heat*ma+b.heat*mb)/total;
    // Keep the existing reservoir as the surviving blob and retain its bottom tether.
    if(b.reservoir && !a.reservoir){
      a.reservoir=true;a.anchorX=b.anchorX;
    }
    // A small elastic impulse follows actual contact, instead of a position jump.
    a.wobbleVelocity += 0.36;
    b.wobbleVelocity -= 0.19;
    a.transitioning=true;b.transitioning=true;
    this.transitions.push({kind:'merge',a,b,time:0,duration:random(2.5,4.2),
      startAx:a.x,startAy:a.y,startBx:b.x,startBy:b.y,
      startRadiusA:a.radius,startRadiusB:b.radius,targetRadiusA:target,targetRadiusB:0,
      dx:x,dy:y});
  }
  private beginSplit(a:Blob):void {
    const fraction=random(.25,.39),r=a.radius;
    const angle=random(-1.25,1.25);
    const dx=Math.sin(angle),dy=(a.heat>=0?1:-1)*Math.cos(angle);
    const b=this.makeBlob(a.x,a.y,.00001,a.heat);
    b.vx=a.vx;b.vy=a.vy;b.cooldown=12;a.cooldown=12;
    a.wobbleVelocity -= 0.25;
    b.wobbleVelocity += 0.32;
    a.transitioning=true;b.transitioning=true;
    this.blobs.push(b);
    this.transitions.push({kind:'split',a,b,time:0,duration:random(3.4,5.2),
      startAx:a.x,startAy:a.y,startBx:b.x,startBy:b.y,
      startRadiusA:r,startRadiusB:0,targetRadiusA:r*Math.sqrt(1-fraction),
      targetRadiusB:r*Math.sqrt(fraction),dx,dy});
  }
  private updateTransitions(dt:number):void {
    for(let i=this.transitions.length-1;i>=0;i--){
      const t=this.transitions[i];t.time+=dt;
      const f=clamp(t.time/t.duration,0,1);
      const e=f*f*(3-2*f); // zero velocity at both endpoints
      // Interpolate wax AREA, not radius: r² is the conserved 2D wax quantity.
      // This prevents gradual loss/gain during merge and split transitions.
      const totalArea=t.startRadiusA*t.startRadiusA+t.startRadiusB*t.startRadiusB;
      if(t.kind==='merge'){
        const bArea=t.startRadiusB*t.startRadiusB*(1-e);
        t.b.radius=Math.sqrt(Math.max(0,bArea));
        t.a.radius=Math.sqrt(Math.max(0,totalArea-bArea));
      } else {
        const bArea=t.targetRadiusB*t.targetRadiusB*e;
        t.b.radius=Math.sqrt(Math.max(0,bArea));
        t.a.radius=Math.sqrt(Math.max(0,totalArea-bArea));
      }
      if(t.kind==='merge'){
        // Relative positions converge gradually, rather than snapping to a center.
        const dx=(t.b.x-t.a.x),dy=(t.b.y-t.a.y);
        t.a.x+=dx*.20*dt*e;t.a.y+=dy*.20*dt*e;
        t.b.x-=dx*.42*dt*e;t.b.y-=dy*.42*dt*e;
        t.b.vx+=(t.a.vx-t.b.vx)*dt*1.3;
        t.b.vy+=(t.a.vy-t.b.vy)*dt*1.3;
      } else {
        // Separation grows over several seconds, allowing a visible neck to form.
        const separation=(t.startRadiusA * 1.30) * e;
        const targetX=t.a.x+t.dx*separation,targetY=t.a.y+t.dy*separation;
        t.b.x+=(targetX-t.b.x)*Math.min(1,dt*1.4);
        t.b.y+=(targetY-t.b.y)*Math.min(1,dt*1.4);
        t.b.vx=t.a.vx+t.dx*.008*e;t.b.vy=t.a.vy+t.dy*.008*e;
      }
      if(f>=1){
        t.a.transitioning=false;t.b.transitioning=false;
        t.a.cooldown=random(9,15);t.a.age=0;
        if(t.kind==='merge'){
          const index=this.blobs.indexOf(t.b);if(index>=0)this.blobs.splice(index,1);
        } else {t.b.cooldown=random(9,15);t.b.age=0;}
        this.transitions.splice(i,1);
      }
    }
  }
  private advance(dt:number):void {
    this.elapsed+=dt;
    const forces=this.blobs.map(()=>({x:0,y:0}));
    for(let i=0;i<this.blobs.length;i++){
      const a=this.blobs[i];
      for(let j=i+1;j<this.blobs.length;j++){
        const b=this.blobs[j],dx=b.x-a.x,dy=b.y-a.y;
        const dist=Math.max(.0001,Math.hypot(dx,dy)),size=a.radius+b.radius;
        // Gentle near-field interaction; actual coalescence is handled below.
        let strength=0;
        if(dist<size*1.75&&dist>size*.8)strength=.004*(1-(dist-size*.8)/(size*.95));
        else if(dist<size*.45)strength=-.004*(1-dist/(size*.45));
        forces[i].x+=dx/dist*strength;forces[i].y+=dy/dist*strength;
        forces[j].x-=dx/dist*strength;forces[j].y-=dy/dist*strength;
      }
    }
    for(let i=0;i<this.blobs.length;i++){
      const b=this.blobs[i];b.age+=dt;b.cooldown=Math.max(0,b.cooldown-dt);
      const bottom=1-clamp((b.y-.03)/.30,0,1),top=clamp((b.y-.67)/.30,0,1);
      b.heat=clamp(b.heat+(.36*bottom-.37*top-.012+.028*Math.sin(this.elapsed*.14+b.seed))*dt*b.mobility,-1.25,1.25);
      // Each blob samples a different slow, swirling current. Nearby blobs
      // receive different lateral impulses, allowing paths to cross.
      // Broad, slowly changing currents curve rising and sinking paths without
      // making the motion predominantly horizontal.
      const swirl=.015*Math.sin(b.y*5.8+this.elapsed*.21+b.seed)
        +.009*Math.sin(this.elapsed*(.22+b.drift*.11)+b.phase)
        +.005*Math.cos(b.x*4.2-this.elapsed*.26+b.turn);
      let targetVy=.025*b.heat*b.mobility-.002;
      let targetVx=swirl*b.drift*.93 + forces[i].x*.95;
      // While heating/cooling near a turning point, retain gentle vertical
      // movement so an isolated blob never cruises sideways indefinitely.
      if(!b.reservoir && Math.abs(targetVy)<.008){
        const verticalSign=(b.vy < -.003 || (b.vy<.003 && b.heat<0)) ? -1 : 1;
        targetVy=verticalSign*.008;
      }
      if(b.reservoir){
        // A soft spring keeps some wax at the bottom, without making it static.
        // Broad wandering and surface bobbing keep it alive and changing shape.
        const anchor=(b.anchorX??.5)*this.aspect;
        const wandering=.10*Math.sin(this.elapsed*.13+b.seed)+.040*Math.sin(this.elapsed*.27+b.phase);
        targetVx+=.16*(anchor+wandering-b.x);
        targetVy+=.26*(.145+.020*Math.sin(this.elapsed*.19+b.turn)-b.y);
        b.heat=Math.min(b.heat,.3);
      }
      b.vx+=(targetVx-b.vx*.30)*dt;
      b.vy+=(targetVy+forces[i].y-b.vy*.35)*dt;
      b.vx=clamp(b.vx,-.050,.050);b.vy=clamp(b.vy,-.060,.060);
      // Glass-contact forces act before integration. The wax visibly
      // compresses against the wall, then rebounds through velocity damping.
      // Centers move continuously; no abrupt reflection or teleportation.
      const wallX=Math.min(b.radius*.94, this.aspect*.46);
      const wallY=Math.min(b.radius*.94, .46);
      const left=b.x-wallX, right=this.aspect-wallX-b.x;
      const bottomGap=b.y-wallY, topGap=1-wallY-b.y;
      const wallRange=Math.max(.012,b.radius*.34);
      const wallK=1.75, wallD=.42;
      if(left<wallRange){
        b.vx+=(wallK*(wallRange-left)-wallD*Math.min(b.vx,0))*dt;
        b.wobbleVelocity+=Math.min(.15,dt*(wallRange-left)*3.0);
      }
      if(right<wallRange){
        b.vx-=(wallK*(wallRange-right)+wallD*Math.max(b.vx,0))*dt;
        b.wobbleVelocity+=Math.min(.15,dt*(wallRange-right)*3.0);
      }
      if(bottomGap<wallRange){
        b.vy+=(wallK*(wallRange-bottomGap)-wallD*Math.min(b.vy,0))*dt;
        b.heat=Math.max(b.heat,.30);
        b.wobbleVelocity+=Math.min(.17,dt*(wallRange-bottomGap)*3.4);
      }
      if(topGap<wallRange){
        b.vy-=(wallK*(wallRange-topGap)+wallD*Math.max(b.vy,0))*dt;
        b.heat=Math.min(b.heat,-.30);
        b.wobbleVelocity+=Math.min(.17,dt*(wallRange-topGap)*3.4);
      }
      b.x+=b.vx*dt;b.y+=b.vy*dt;
      // Safety bounds handle exceptionally large incoming velocities. Normal
      // collisions should be resolved by the soft wall spring above.
      if(b.x<wallX){b.x=wallX;b.vx=Math.max(0,b.vx)*.35;}
      if(b.x>this.aspect-wallX){b.x=this.aspect-wallX;b.vx=Math.min(0,b.vx)*.35;}
      if(b.y<wallY){b.y=wallY;b.vy=Math.max(0,b.vy)*.35;}
      if(b.y>1-wallY){b.y=1-wallY;b.vy=Math.min(0,b.vy)*.35;}
      // Underdamped, area-preserving elastic deformation. Each blob has a
      // slightly different natural rhythm; no impulses alter blob position.
      const speedMagnitude=Math.hypot(b.vx,b.vy);
      const slowFlow=.040*Math.sin(this.elapsed*(.38+.07*b.mobility)+b.phase)
                    +.022*Math.sin(this.elapsed*.61+b.seed);
      const targetStretch=1+Math.min(.48,speedMagnitude*8.8)+slowFlow;
      const springForce=5.6*(targetStretch-b.stretch) - 0.75*b.wobbleVelocity;
      b.wobbleVelocity=clamp(b.wobbleVelocity+springForce*dt,-.90,.90);
      b.stretch=clamp(b.stretch+b.wobbleVelocity*dt,.70,1.78);
    }
    this.updateTransitions(dt);
    // Transitioning blobs cannot start another merge/split until complete.
    for(let i=0;i<this.blobs.length;i++){
      const a=this.blobs[i];
      if(a.cooldown>0||a.transitioning)continue;
      for(let j=i+1;j<this.blobs.length;j++){
        const b=this.blobs[j];if(b.cooldown>0||b.transitioning)continue;
        const d=Math.hypot(a.x-b.x,a.y-b.y);
        // Reservoirs participate in the same gradual merger transition.
        // Allow them to absorb falling wax rather than overlap a fixed drawing.
        const limit=(a.reservoir||b.reservoir)?.34:.245;
        if(d<(a.radius+b.radius)*.79 && Math.hypot(a.radius,b.radius)<limit){
          this.beginMerge(a,b);break;
        }
      }
    }
    if(this.blobs.length<MAX_BLOBS){
      for(const b of [...this.blobs]){
        if(!b.transitioning && b.cooldown===0 && b.age>(b.reservoir?9:13) &&
           b.radius>(b.reservoir?.125:.16) &&
           (b.reservoir||Math.abs(b.heat)>.5||b.radius>.215)){
          this.beginSplit(b);
          // Wax released from a reservoir heats up and rises; its parent stays mobile.
          if(b.reservoir){
            const released=this.transitions[this.transitions.length-1].b;
            released.heat=random(.75,1.1);
            released.vy=.020;
            released.y+=.010;
          }
          break;
        }
      }
    }
    // Mass is conserved: no standalone wax is spawned at the bottom.
    // New visible lobes must emerge through beginSplit() from existing masses.

  }
  uniforms():Float32Array {
    const values=new Float32Array(MAX_BLOBS*4);
    for(let i=0;i<this.blobs.length;i++){
      const b=this.blobs[i];
      // Elliptical deformation is area-preserving: rx * ry = radius².
      let stretch=b.stretch*(1+.050*Math.sin(this.elapsed*.33+b.phase) + .020*Math.sin(this.elapsed*.71+b.seed));
      // Press gently against the glass edges: flatten normal to the wall and
      // expand tangentially while keeping area roughly constant.
      const leftPress=clamp(1-b.x/(b.radius*1.35),0,1);
      const rightPress=clamp(1-(this.aspect-b.x)/(b.radius*1.35),0,1);
      const bottomPress=clamp(1-b.y/(b.radius*1.35),0,1);
      const topPress=clamp(1-(1-b.y)/(b.radius*1.35),0,1);
      const horizontalPress=Math.max(leftPress,rightPress);
      const verticalPress=Math.max(bottomPress,topPress);
      let rx=b.radius/Math.sqrt(stretch), ry=b.radius*Math.sqrt(stretch);
      if(horizontalPress>0){
        const squash=1+0.48*horizontalPress;
        rx/=squash; ry*=squash;
      }
      if(verticalPress>0){
        const squash=1+0.48*verticalPress;
        ry/=squash; rx*=squash;
      }
      values.set([b.x,b.y,rx,ry],i*4);
    }
    return values;
  }
}
