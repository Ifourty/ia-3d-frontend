import * as THREE from 'three'

// ShaderMaterial Toon avec texture
export const createToonMaterial = (texture) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: texture },
      uLightDir: { value: new THREE.Vector3(0.5, 1.0, 0.3).normalize() }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec2 vUv;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      uniform vec3 uLightDir;

      void main() {
        vec4 texColor = texture2D(uTexture, vUv);

        // Calcul de lumière pour effet toon
        float light = dot(vNormal, normalize(uLightDir));
        light = smoothstep(0.2, 0.6, light); // plus ou moins net

        gl_FragColor = vec4(texColor.rgb * light, texColor.a);
      }
    `,
    side: THREE.FrontSide
  })
}
