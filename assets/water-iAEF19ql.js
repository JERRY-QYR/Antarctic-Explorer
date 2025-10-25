import{UniformsLib as z}from"./three.module-CiAp3VeG.js";import{M as X,V as i,C as S,F as J,P as K,a as _,b as N,c as O,W as Q,U as F,S as Y,d as Z,T as $,R as ee}from"./three.core-Dw2eIrsX.js";class re extends X{constructor(C,e={}){super(C),this.isWater=!0;const l=this,d=e.textureWidth!==void 0?e.textureWidth:512,p=e.textureHeight!==void 0?e.textureHeight:512,L=e.clipBias!==void 0?e.clipBias:0,T=e.alpha!==void 0?e.alpha:1,R=e.time!==void 0?e.time:0,U=e.waterNormals!==void 0?e.waterNormals:null,j=e.sunDirection!==void 0?e.sunDirection:new i(.70707,.70707,0),k=new S(e.sunColor!==void 0?e.sunColor:16777215),V=new S(e.waterColor!==void 0?e.waterColor:8355711),D=e.eye!==void 0?e.eye:new i(0,0,0),A=e.distortionScale!==void 0?e.distortionScale:20,B=e.side!==void 0?e.side:J,E=e.fog!==void 0?e.fog:!1,c=new K,s=new i,u=new i,M=new i,f=new _,g=new i(0,0,-1),n=new N,v=new i,w=new i,x=new N,h=new _,t=new O,P=new Q(d,p),y={name:"MirrorShader",uniforms:F.merge([z.fog,z.lights,{normalSampler:{value:null},mirrorSampler:{value:null},alpha:{value:1},time:{value:0},size:{value:1},distortionScale:{value:20},textureMatrix:{value:new _},sunColor:{value:new S(8355711)},sunDirection:{value:new i(.70707,.70707,0)},eye:{value:new i},waterColor:{value:new S(5592405)}}]),vertexShader:`
				uniform mat4 textureMatrix;
				uniform float time;

				varying vec4 mirrorCoord;
				varying vec4 worldPosition;

				#include <common>
				#include <fog_pars_vertex>
				#include <shadowmap_pars_vertex>
				#include <logdepthbuf_pars_vertex>

				void main() {
					mirrorCoord = modelMatrix * vec4( position, 1.0 );
					worldPosition = mirrorCoord.xyzw;
					mirrorCoord = textureMatrix * mirrorCoord;
					vec4 mvPosition =  modelViewMatrix * vec4( position, 1.0 );
					gl_Position = projectionMatrix * mvPosition;

				#include <beginnormal_vertex>
				#include <defaultnormal_vertex>
				#include <logdepthbuf_vertex>
				#include <fog_vertex>
				#include <shadowmap_vertex>
			}`,fragmentShader:`
				uniform sampler2D mirrorSampler;
				uniform float alpha;
				uniform float time;
				uniform float size;
				uniform float distortionScale;
				uniform sampler2D normalSampler;
				uniform vec3 sunColor;
				uniform vec3 sunDirection;
				uniform vec3 eye;
				uniform vec3 waterColor;

				varying vec4 mirrorCoord;
				varying vec4 worldPosition;

				vec4 getNoise( vec2 uv ) {
					vec2 uv0 = ( uv / 103.0 ) + vec2(time / 17.0, time / 29.0);
					vec2 uv1 = uv / 107.0-vec2( time / -19.0, time / 31.0 );
					vec2 uv2 = uv / vec2( 8907.0, 9803.0 ) + vec2( time / 101.0, time / 97.0 );
					vec2 uv3 = uv / vec2( 1091.0, 1027.0 ) - vec2( time / 109.0, time / -113.0 );
					vec4 noise = texture2D( normalSampler, uv0 ) +
						texture2D( normalSampler, uv1 ) +
						texture2D( normalSampler, uv2 ) +
						texture2D( normalSampler, uv3 );
					return noise * 0.5 - 1.0;
				}

				void sunLight( const vec3 surfaceNormal, const vec3 eyeDirection, float shiny, float spec, float diffuse, inout vec3 diffuseColor, inout vec3 specularColor ) {
					vec3 reflection = normalize( reflect( -sunDirection, surfaceNormal ) );
					float direction = max( 0.0, dot( eyeDirection, reflection ) );
					specularColor += pow( direction, shiny ) * sunColor * spec;
					diffuseColor += max( dot( sunDirection, surfaceNormal ), 0.0 ) * sunColor * diffuse;
				}

				#include <common>
				#include <packing>
				#include <bsdfs>
				#include <fog_pars_fragment>
				#include <logdepthbuf_pars_fragment>
				#include <lights_pars_begin>
				#include <shadowmap_pars_fragment>
				#include <shadowmask_pars_fragment>

				void main() {

					#include <logdepthbuf_fragment>
					vec4 noise = getNoise( worldPosition.xz * size );
					vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );

					vec3 diffuseLight = vec3(0.0);
					vec3 specularLight = vec3(0.0);

					vec3 worldToEye = eye-worldPosition.xyz;
					vec3 eyeDirection = normalize( worldToEye );
					sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );

					float distance = length(worldToEye);

					vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale;
					vec3 reflectionSample = vec3( texture2D( mirrorSampler, mirrorCoord.xy / mirrorCoord.w + distortion ) );

					float theta = max( dot( eyeDirection, surfaceNormal ), 0.0 );
					float rf0 = 0.3;
					float reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 );
					vec3 scatter = max( 0.0, dot( surfaceNormal, eyeDirection ) ) * waterColor;
					vec3 albedo = mix( ( sunColor * diffuseLight * 0.3 + scatter ) * getShadowMask(), ( vec3( 0.1 ) + reflectionSample * 0.9 + reflectionSample * specularLight ), reflectance);
					vec3 outgoingLight = albedo;
					gl_FragColor = vec4( outgoingLight, alpha );

					#include <tonemapping_fragment>
					#include <colorspace_fragment>
					#include <fog_fragment>	
				}`},o=new Y({name:y.name,uniforms:F.clone(y.uniforms),vertexShader:y.vertexShader,fragmentShader:y.fragmentShader,lights:!0,side:B,fog:E});o.uniforms.mirrorSampler.value=P.texture,o.uniforms.textureMatrix.value=h,o.uniforms.alpha.value=T,o.uniforms.time.value=R,o.uniforms.normalSampler.value=U,o.uniforms.sunColor.value=k,o.uniforms.waterColor.value=V,o.uniforms.sunDirection.value=j,o.uniforms.distortionScale.value=A,o.uniforms.eye.value=D,l.material=o,l.onBeforeRender=function(r,H,m){if(u.setFromMatrixPosition(l.matrixWorld),M.setFromMatrixPosition(m.matrixWorld),f.extractRotation(l.matrixWorld),s.set(0,0,1),s.applyMatrix4(f),v.subVectors(u,M),v.dot(s)>0)return;v.reflect(s).negate(),v.add(u),f.extractRotation(m.matrixWorld),g.set(0,0,-1),g.applyMatrix4(f),g.add(M),w.subVectors(u,g),w.reflect(s).negate(),w.add(u),t.position.copy(v),t.up.set(0,1,0),t.up.applyMatrix4(f),t.up.reflect(s),t.lookAt(w),t.far=m.far,t.updateMatrixWorld(),t.projectionMatrix.copy(m.projectionMatrix),h.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),h.multiply(t.projectionMatrix),h.multiply(t.matrixWorldInverse),c.setFromNormalAndCoplanarPoint(s,u),c.applyMatrix4(t.matrixWorldInverse),n.set(c.normal.x,c.normal.y,c.normal.z,c.constant);const a=t.projectionMatrix;x.x=(Math.sign(n.x)+a.elements[8])/a.elements[0],x.y=(Math.sign(n.y)+a.elements[9])/a.elements[5],x.z=-1,x.w=(1+a.elements[10])/a.elements[14],n.multiplyScalar(2/n.dot(x)),a.elements[2]=n.x,a.elements[6]=n.y,a.elements[10]=n.z+1-L,a.elements[14]=n.w,D.setFromMatrixPosition(m.matrixWorld);const G=r.getRenderTarget(),I=r.xr.enabled,q=r.shadowMap.autoUpdate;l.visible=!1,r.xr.enabled=!1,r.shadowMap.autoUpdate=!1,r.setRenderTarget(P),r.state.buffers.depth.setMask(!0),r.autoClear===!1&&r.clear(),r.render(H,t),l.visible=!0,r.xr.enabled=I,r.shadowMap.autoUpdate=q,r.setRenderTarget(G);const W=m.viewport;W!==void 0&&r.state.viewport(W)}}}function ae(b,C,e){const l=new Z(1500,3e3),d=new re(l,{textureWidth:512,textureHeight:512,waterNormals:new $(e).load("/imgs/waternormals.jpg",function(p){p.wrapS=p.wrapT=ee}),sunDirection:C.position.clone().normalize(),sunColor:12316415,waterColor:16777215,distortionScale:2,fog:!1,reflectivity:.7});return d.rotation.x=-Math.PI/2,b.add(d),console.log("✅ 南极风格水面已创建"),d}export{ae as createWater};
