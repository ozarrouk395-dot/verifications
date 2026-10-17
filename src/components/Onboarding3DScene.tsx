import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Scene3DProps {
  currentSlide: number;
}

export const Onboarding3DScene: React.FC<Scene3DProps> = ({ currentSlide }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupsRef = useRef<THREE.Group[]>([]);
  const animFrameId = useRef<number | null>(null);
  const targetRotations = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    // Check if prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isReduced = mediaQuery.matches;

    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 280;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.5);
    cameraRef.current = camera;

    // 3. Renderer with high performance & fallback
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: window.devicePixelRatio < 2,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(width, height);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;
    } catch (e) {
      console.warn('WebGL not supported, falling back to CSS', e);
      return;
    }

    // 4. Lighting Rig (Warm/Cool Studio Contrast)
    const keyLight = new THREE.DirectionalLight(0x34d399, 3.2); // Mint neon key light
    keyLight.position.set(3, 4, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8b5cf6, 2.5); // Purple fill light
    fillLight.position.set(-3, -2, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfbbf24, 2.0); // Amber rim
    rimLight.position.set(0, -4, -3);
    scene.add(rimLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // 5. Build 4 Procedural 3D Models for the 4 Slides
    const groups: THREE.Group[] = [];

    // --- MODEL 0: 3D Price Tag / Credit Card (Slide 1: اعرف السعر الرسمي) ---
    const tagGroup = new THREE.Group();
    // Card base
    const cardGeo = new THREE.BoxGeometry(2.4, 1.4, 0.12);
    const cardMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      metalness: 0.6,
      roughness: 0.2,
      wireframe: false,
    });
    const cardMesh = new THREE.Mesh(cardGeo, cardMat);
    tagGroup.add(cardMesh);

    // Golden Chip & Price Badge
    const chipGeo = new THREE.BoxGeometry(0.5, 0.4, 0.14);
    const chipMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.1,
    });
    const chip = new THREE.Mesh(chipGeo, chipMat);
    chip.position.set(-0.7, 0.2, 0.03);
    tagGroup.add(chip);

    // Price Bar
    const barGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 16);
    const barMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.8, roughness: 0.2 });
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0.3, -0.2, 0.08);
    tagGroup.add(bar);

    scene.add(tagGroup);
    groups.push(tagGroup);

    // --- MODEL 1: 3D Magnifier & Shield (Slide 2: تحقّق من الأصالة) ---
    const verifyGroup = new THREE.Group();
    // Lens Ring
    const ringGeo = new THREE.TorusGeometry(0.9, 0.12, 16, 48);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.85, roughness: 0.15 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    verifyGroup.add(ring);

    // Glass Lens
    const lensGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.05, 32);
    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0x6ee7b7,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.9,
      ior: 1.5,
    });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.rotation.x = Math.PI / 2;
    verifyGroup.add(lens);

    // Handle
    const handleGeo = new THREE.CylinderGeometry(0.09, 0.12, 1.2, 16);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.3 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(0.8, -0.9, 0);
    handle.rotation.z = -Math.PI / 4;
    verifyGroup.add(handle);

    scene.add(verifyGroup);
    groups.push(verifyGroup);

    // --- MODEL 2: 3D Geo Pin / Beacon (Slide 3: قدّم بلاغاتك) ---
    const pinGroup = new THREE.Group();
    // Pin Sphere Head
    const pinHeadGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const pinHeadMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, metalness: 0.4, roughness: 0.2 });
    const pinHead = new THREE.Mesh(pinHeadGeo, pinHeadMat);
    pinHead.position.set(0, 0.5, 0);
    pinGroup.add(pinHead);

    // Pin Cone Tip
    const pinConeGeo = new THREE.ConeGeometry(0.7, 1.3, 32);
    const pinCone = new THREE.Mesh(pinConeGeo, pinHeadMat);
    pinCone.rotation.x = Math.PI;
    pinCone.position.set(0, -0.3, 0);
    pinGroup.add(pinCone);

    // Core Indicator
    const coreGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(0, 0.5, 0.45);
    pinGroup.add(core);

    scene.add(pinGroup);
    groups.push(pinGroup);

    // --- MODEL 3: 3D AI Brain Spark / Chat Bubbles (Slide 4: مساعد ذكي) ---
    const aiGroup = new THREE.Group();
    // Main Icosahedron Core
    const icoGeo = new THREE.IcosahedronGeometry(0.9, 1);
    const icoMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      metalness: 0.8,
      roughness: 0.2,
      wireframe: true,
    });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    aiGroup.add(ico);

    // Inner Glowing Core
    const innerGeo = new THREE.SphereGeometry(0.5, 24, 24);
    const innerMat = new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.1, metalness: 0.5 });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    aiGroup.add(inner);

    // Orbit Ring
    const orbitGeo = new THREE.TorusGeometry(1.4, 0.04, 16, 64);
    const orbitMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.1 });
    const orbit = new THREE.Mesh(orbitGeo, orbitMat);
    orbit.rotation.x = Math.PI / 3;
    aiGroup.add(orbit);

    scene.add(aiGroup);
    groups.push(aiGroup);

    groupsRef.current = groups;

    // 6. Floating Particles Atmosphere
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 8;
      positions[i + 1] = (Math.random() - 0.5) * 6;
      positions[i + 2] = (Math.random() - 0.5) * 4;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.08,
      transparent: true,
      opacity: 0.55,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 7. Interactive Mouse / Touch Parallax
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotations.current = { x: y * 0.4, y: x * 0.6 };
    };

    container.addEventListener('pointermove', handlePointerMove);

    // 8. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smoothly rotate particles
      if (!isReduced) {
        particles.rotation.y = elapsed * 0.04;
      }

      // Smooth switch visibility and position between the 4 slides
      groups.forEach((grp, idx) => {
        const isCurrent = idx === currentSlide;
        const targetScale = isCurrent ? 1 : 0.001;
        const targetX = (idx - currentSlide) * 5;

        grp.scale.setScalar(THREE.MathUtils.damp(grp.scale.x, targetScale, 8, delta));
        grp.position.x = THREE.MathUtils.damp(grp.position.x, targetX, 7, delta);

        if (isCurrent && !isReduced) {
          // Organic idle floating & interactive tilt
          grp.position.y = Math.sin(elapsed * 2.2) * 0.12;
          grp.rotation.y = THREE.MathUtils.damp(grp.rotation.y, elapsed * 0.5 + targetRotations.current.y, 4, delta);
          grp.rotation.x = THREE.MathUtils.damp(grp.rotation.x, Math.cos(elapsed * 1.5) * 0.08 + targetRotations.current.x, 4, delta);
        }
      });

      renderer.render(scene, camera);
      animFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup when unmounted
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      container.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);

      // Dispose Three.js objects
      cardGeo.dispose();
      cardMat.dispose();
      chipGeo.dispose();
      chipMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      lensGeo.dispose();
      lensMat.dispose();
      pinHeadGeo.dispose();
      pinConeGeo.dispose();
      icoGeo.dispose();
      icoMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (rendererRef.current.domElement && container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-64 sm:h-72 relative flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing"
      aria-label="عرض ثلاثي الأبعاد تفاعلي"
    />
  );
};
