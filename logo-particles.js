import * as THREE from 'three';

export class LogoParticles {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        this.particles = null;
        this.particleCount = 5000;
        this.animationProgress = 0;
        this.isFinished = false;

        this.init();
        this.animate();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    init() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const targetPositions = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);
        const sizes = new Float32Array(this.particleCount);

        for (let i = 0; i < this.particleCount; i++) {
            // Initial positions: Randomly distributed in a large sphere
            const r = 20 + Math.random() * 10;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            // Target positions: Atomic Logo (Orbits and Nucleus)
            const target = this.getLogoPosition(i);
            targetPositions[i * 3] = target.x;
            targetPositions[i * 3 + 1] = target.y;
            targetPositions[i * 3 + 2] = target.z;

            // Colors: Premium gradients (White to Light Blue/Silver)
            const color = new THREE.Color();
            if (i < this.particleCount * 0.1) {
                // Nucleus: Glowing Core (White/Yellowish)
                color.setHSL(0.1, 0.5, 0.8 + Math.random() * 0.2);
            } else {
                // Orbits: Silver/Cyan
                color.setHSL(0.5, 0.3, 0.7 + Math.random() * 0.3);
            }
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            sizes[i] = 1.0 + Math.random() * 2.0;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('targetPosition', new THREE.BufferAttribute(targetPositions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uProgress: { value: 0 },
                uPixelRatio: { value: window.devicePixelRatio }
            },
            vertexShader: `
                attribute vec3 targetPosition;
                attribute vec3 color;
                attribute float size;
                varying vec3 vColor;
                uniform float uProgress;
                uniform float uTime;
                
                void main() {
                    vColor = color;
                    // Exponential easing for energy gathering feel
                    float p = pow(uProgress, 2.0);
                    vec3 pos = mix(position, targetPosition, p);
                    
                    // Add some noise/turbulence during movement
                    if (uProgress > 0.1 && uProgress < 0.9) {
                        pos.x += sin(uTime * 5.0 + position.y) * (1.0 - uProgress) * 0.2;
                        pos.y += cos(uTime * 5.0 + position.x) * (1.0 - uProgress) * 0.2;
                    }

                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                void main() {
                    float r = distance(gl_PointCoord, vec2(0.5));
                    if (r > 0.5) discard;
                    float strength = 1.0 - (r * 2.0);
                    gl_FragColor = vec4(vColor, strength);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    getLogoPosition(index) {
        const nucleusCount = Math.floor(this.particleCount * 0.1);
        const particlesPerOrbit = Math.floor((this.particleCount - nucleusCount) / 3);

        if (index < nucleusCount) {
            // Nucleus: Sphere in the center
            const r = Math.random() * 0.4;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            return {
                x: r * Math.sin(phi) * Math.cos(theta),
                y: r * Math.sin(phi) * Math.sin(theta),
                z: r * Math.cos(phi)
            };
        } else {
            // Orbits: 3 rotated ellipses
            const orbitIndex = Math.floor((index - nucleusCount) / particlesPerOrbit);
            const t = Math.random() * Math.PI * 2;
            const a = 2.5; // major axis
            const b = 1.0; // minor axis
            
            let x = a * Math.cos(t);
            let y = b * Math.sin(t);
            let z = 0;

            // Rotation for each orbit
            if (orbitIndex === 0) {
                // XY plane, tilted
                const tempX = x;
                x = tempX * Math.cos(Math.PI / 4) - y * Math.sin(Math.PI / 4);
                y = tempX * Math.sin(Math.PI / 4) + y * Math.cos(Math.PI / 4);
            } else if (orbitIndex === 1) {
                // XZ plane, tilted
                const tempX = x;
                x = tempX * Math.cos(-Math.PI / 4);
                z = tempX * Math.sin(-Math.PI / 4);
            } else {
                // YZ plane, tilted
                const tempY = y;
                y = tempY * Math.cos(Math.PI / 2);
                z = tempY * Math.sin(Math.PI / 2);
                // add slight tilt
                const tempX = x;
                x = tempX * Math.cos(0.3);
                z = z + tempX * Math.sin(0.3);
            }

            return { x, y, z };
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.particles) {
            this.particles.material.uniforms.uTime.value += 0.016;
            
            if (this.animationProgress < 1.0) {
                this.animationProgress += 0.005; // Adjust speed
                this.particles.material.uniforms.uProgress.value = this.animationProgress;
            } else if (!this.isFinished) {
                this.isFinished = true;
                this.onFinish();
            }

            // Subtle rotation of the whole logo once formed
            if (this.isFinished) {
                this.particles.rotation.y += 0.002;
                this.particles.rotation.z += 0.001;
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    onFinish() {
        const event = new CustomEvent('logo-animation-finished');
        window.dispatchEvent(event);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.particles.material.uniforms.uPixelRatio.value = window.devicePixelRatio;
    }
}
