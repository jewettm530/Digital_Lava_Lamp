import vertexSrc from './lava.vert.glsl?raw';
import fragmentSrc from './lava.frag.glsl?raw';
import { rgb, COLORS, type Settings } from '../settings';
import type { Simulation } from '../simulation/Simulation';

function compile(gl: WebGL2RenderingContext, type: number, code: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw Error('Cannot allocate GPU shader');
  gl.shaderSource(shader, code); gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(shader) || 'Shader error');
  return shader;
}
function makeProgram(gl: WebGL2RenderingContext): WebGLProgram {
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSrc);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSrc);
  const program = gl.createProgram(); if (!program) throw Error('Cannot allocate graphics program');
  gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
  gl.deleteShader(vertex); gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program) || 'GPU linking error');
  return program;
}
export class Renderer {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private loc: Record<string, WebGLUniformLocation | null> = {};
  private vao: WebGLVertexArrayObject | null;
  constructor(private canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) throw Error('WebGL2 is not supported by this browser/device.');
    this.gl=gl; this.program=makeProgram(gl); this.vao=gl.createVertexArray();
    for (const name of ['uAspect','uTime','uCount','uBlobs','uTop','uBottom','uLava'])
      this.loc[name]=gl.getUniformLocation(this.program,name==='uBlobs'?'uBlobs[0]':name);
  }
  resize(): number {
    const rect=this.canvas.getBoundingClientRect();
    const dpr=Math.min(window.devicePixelRatio||1,1.5);
    // Limit pixel count on phones to reduce heat and energy consumption.
    const scale=Math.min(1,Math.sqrt(1_550_000/(rect.width*rect.height*dpr*dpr)));
    const width=Math.max(1,Math.round(rect.width*dpr*scale));
    const height=Math.max(1,Math.round(rect.height*dpr*scale));
    if(this.canvas.width!==width||this.canvas.height!==height) {this.canvas.width=width;this.canvas.height=height;}
    this.gl.viewport(0,0,width,height);
    return rect.width/Math.max(1,rect.height);
  }
  render(sim: Simulation, settings: Settings): void {
    const gl=this.gl;
    gl.useProgram(this.program);gl.bindVertexArray(this.vao);
    gl.uniform1f(this.loc.uAspect,sim.aspect);gl.uniform1f(this.loc.uTime,sim.elapsed);
    gl.uniform1i(this.loc.uCount,sim.blobs.length);
    gl.uniform4fv(this.loc.uBlobs,sim.uniforms());
    gl.uniform3fv(this.loc.uTop,rgb(COLORS[settings.top]));
    gl.uniform3fv(this.loc.uBottom,rgb(COLORS[settings.bottom]));
    gl.uniform3fv(this.loc.uLava,rgb(COLORS[settings.lava]));
    gl.drawArrays(gl.TRIANGLES,0,3);
  }
}
