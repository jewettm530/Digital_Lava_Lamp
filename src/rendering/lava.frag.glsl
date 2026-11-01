#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform float uAspect;
uniform float uTime;
uniform int uCount;
uniform vec4 uBlobs[20];
uniform vec3 uTop;
uniform vec3 uBottom;
uniform vec3 uLava;

float field(vec2 p) {
  float f=0.0;
  for(int i=0;i<20;i++) {
    if(i>=uCount) break;
    vec4 b=uBlobs[i];
    vec2 d=p-b.xy;
    // Low-frequency deformation in place of rigid circular motion.
    d.x += 0.012*sin(d.y*12.0+uTime*0.36+b.w)*sin(d.y*5.0+b.w);
    d.y += 0.010*cos(d.x*10.0-uTime*0.27+b.w);
    f += (b.z*b.z) / (dot(d,d)+b.z*b.z*0.13);
  }
  // A few pooled wax contours at the floor, rejoining the moving blobs.
  for(int j=0;j<3;j++) {
    float x=uAspect*(float(j)+0.5)/3.0;
    vec2 d=p-vec2(x,-0.058+0.01*sin(float(j)*2.0+uTime*0.16));
    float r=0.115;
    f += (r*r)/(dot(d,d)+r*r*0.14);
  }
  return f;
}
float luminance(vec3 c){ return dot(c,vec3(0.2126,0.7152,0.0722)); }
void main(){
  vec2 p=vec2(vUv.x*uAspect,vUv.y);
  // A smooth, uninterrupted vertical gradient.
  vec3 bg=mix(uBottom,uTop,smoothstep(0.0,1.0,vUv.y));
  bg *= 0.85 + 0.10*pow(1.0-abs(vUv.y-0.5)*2.0,2.0);
  float f=field(p);
  float iso=0.90;
  float edgeWidth=max(fwidth(f)*1.5,0.018);
  float alpha=smoothstep(iso-edgeWidth,iso+edgeWidth,f);
  // Gradient of the scalar field acts as a rounded pseudo-3D surface normal.
  float eps=0.0035;
  vec2 grad=vec2(field(p+vec2(eps,0.0))-field(p-vec2(eps,0.0)),
                 field(p+vec2(0.0,eps))-field(p-vec2(0.0,eps)))/(eps*2.0);
  vec3 normal=normalize(vec3(-grad*0.065,1.0));
  vec3 lightDir=normalize(vec3(-0.45,0.65,0.80));
  float diffuse=clamp(dot(normal,lightDir),0.0,1.0);
  float rim=pow(1.0-max(0.0,normal.z),2.0);
  float softHighlight=pow(max(0.0,dot(reflect(-lightDir,normal),vec3(0.,0.,1.))),12.0);
  // Brightness is selected relative to nearby background, retaining the chosen hue.
  vec3 chosen=mix(uLava,vec3(1.0),0.30);
  float bgL=luminance(bg);
  float chosenL=luminance(chosen);
  float brighten=smoothstep(-0.06,0.27,bgL-chosenL);
  chosen=mix(chosen,mix(uLava,vec3(1.0),0.76),brighten*0.8);
  // Light environments benefit from a distinct soft darker contour.
  float contour=(1.0-smoothstep(0.88,1.18,f))*0.24*clamp(bgL*1.8,0.0,1.0);
  float inner=clamp((f-iso)*0.32,0.0,1.0);
  vec3 color=chosen*(0.68 + 0.29*diffuse + 0.09*inner);
  color += vec3(1.0,0.91,1.0)*(0.12*softHighlight+0.075*rim);
  color=mix(color,bg,0.16*(1.0-inner)); // subtle wax translucency
  color *= 1.0-contour;
  outColor=vec4(mix(bg,clamp(color,0.0,1.0),alpha),1.0);
}
