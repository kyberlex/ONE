/**
 * 3D Sovereign Avatar Customizer & WebGL Character Studio (Agent SIM-2 & SIM-5)
 * Interactive 3D pioneer character viewer using Three.js and OrbitControls.
 * Renders diverse solarpunk hairstyles, skin tones, clothing silhouettes, and floating crown.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class Avatar3DViewer {
  constructor(containerEl, appearance = {}, options = {}) {
    this.container = containerEl;
    this.appearance = {
      gender: appearance.gender || 'F',
      hairStyle: appearance.hairStyle || 'ponytail',
      hairColor: appearance.hairColor || '#1e293b',
      skinTone: appearance.skinTone || '#fbb77a',
      color: appearance.color || '#fbbf24',
      isPlayer: appearance.isPlayer !== false
    };
    this.options = options;
    this.animFrameId = null;
    this.avatarGroup = null;
    this.crownMesh = null;
    this.clock = new THREE.Clock();

    this.onWindowResize = () => this.handleResize();
    window.addEventListener('resize', this.onWindowResize);

    this.initThree();
    this.buildAvatar();
  }

  initThree() {
    const isMini = Boolean(this.options.isMiniPhoto);
    const width = this.container.clientWidth || (isMini ? 64 : 280);
    const height = this.container.clientHeight || (isMini ? 64 : 280);

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(isMini ? 0x070c16 : 0x0a101d);

    // Camera
    this.camera = new THREE.PerspectiveCamera(isMini ? 45 : 40, width / height, 0.1, 100);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = !isMini;
    if (!isMini) {
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;

    if (isMini) {
      // Focus on upper chest and head portrait
      this.camera.position.set(0, 2.7, 2.6);
      this.controls.target.set(0, 2.45, 0);
      this.controls.enableZoom = false;
      this.controls.enablePan = false;
      this.controls.autoRotate = true;
      this.controls.autoRotateSpeed = 2.0;
    } else {
      this.camera.position.set(0, 2.4, 6.2);
      this.controls.target.set(0, 1.8, 0);
      this.controls.minDistance = 2.5;
      this.controls.maxDistance = 12;
      this.controls.maxPolarAngle = Math.PI / 2 + 0.15; // Don't go deep under floor
    }

    // Solarpunk Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xdcfce7, 0.85);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.6);
    keyLight.position.set(4, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.7);
    fillLight.position.set(-5, 3, -3);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x10b981, 0.6);
    rimLight.position.set(0, -3, -5);
    this.scene.add(rimLight);

    // Bioluminescent Solarpunk Hex Pedestal
    const baseGeo = new THREE.CylinderGeometry(1.8, 2.0, 0.2, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.6,
      metalness: 0.3
    });
    const pedestal = new THREE.Mesh(baseGeo, baseMat);
    pedestal.position.y = -0.1;
    pedestal.receiveShadow = true;
    this.scene.add(pedestal);

    // Glowing usufruct ring around pedestal
    const ringGeo = new THREE.RingGeometry(1.65, 1.78, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide
    });
    const glowRing = new THREE.Mesh(ringGeo, ringMat);
    glowRing.rotation.x = -Math.PI / 2;
    glowRing.position.y = 0.01;
    this.scene.add(glowRing);

    // Animation Loop
    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate);
      const elapsed = this.clock.getElapsedTime();

      this.controls.update();

      // Gentle breathing & floating idle animation
      if (this.avatarGroup) {
        this.avatarGroup.position.y = Math.sin(elapsed * 2.2) * (this.options.isMiniPhoto ? 0.015 : 0.035);

        // Auto-rotation if user is not actively interacting
        if (!this.controls.state || this.controls.state === -1) {
          this.avatarGroup.rotation.y += this.options.isMiniPhoto ? 0.012 : 0.005;
        }
      }

      // Floating golden crown rotation
      if (this.crownMesh) {
        this.crownMesh.rotation.y -= 0.015;
        this.crownMesh.position.y = 3.65 + Math.sin(elapsed * 3) * 0.05;
      }

      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  buildAvatar() {
    if (this.avatarGroup) {
      this.scene.remove(this.avatarGroup);
      this.avatarGroup.traverse(child => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else if (child.material) {
            child.material.dispose();
          }
        }
      });
      this.avatarGroup = null;
      this.crownMesh = null;
    }

    const { gender, hairStyle, hairColor, skinTone, color } = this.appearance;

    this.avatarGroup = new THREE.Group();

    // Reusable Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skinTone),
      roughness: 0.6,
      metalness: 0.05
    });

    const clothesMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color || '#fbbf24'),
      roughness: 0.5,
      metalness: 0.15
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hairColor),
      roughness: 0.7,
      metalness: 0.1
    });

    const darkPantsMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8
    });

    const shoesMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.9
    });

    // 1. Shoes & Feet
    const shoeGeo = new THREE.BoxGeometry(0.32, 0.18, 0.48);
    const leftShoe = new THREE.Mesh(shoeGeo, shoesMat);
    leftShoe.position.set(-0.24, 0.09, 0.06);
    leftShoe.castShadow = true;
    this.avatarGroup.add(leftShoe);

    const rightShoe = new THREE.Mesh(shoeGeo, shoesMat);
    rightShoe.position.set(0.24, 0.09, 0.06);
    rightShoe.castShadow = true;
    this.avatarGroup.add(rightShoe);

    // 2. Legs / Trousers
    const legGeo = new THREE.CylinderGeometry(0.14, 0.15, 0.8, 16);
    const leftLeg = new THREE.Mesh(legGeo, darkPantsMat);
    leftLeg.position.set(-0.24, 0.52, 0);
    leftLeg.castShadow = true;
    this.avatarGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, darkPantsMat);
    rightLeg.position.set(0.24, 0.52, 0);
    rightLeg.castShadow = true;
    this.avatarGroup.add(rightLeg);

    // 3. Torso / Clothes (Female flared tunic vs Male utilitarian workwear)
    if (gender === 'F') {
      // Upper torso
      const upperTorsoGeo = new THREE.BoxGeometry(0.72, 0.6, 0.44);
      const upperTorso = new THREE.Mesh(upperTorsoGeo, clothesMat);
      upperTorso.position.set(0, 1.48, 0);
      upperTorso.castShadow = true;
      this.avatarGroup.add(upperTorso);

      // Flared solarpunk tunic / smock skirt
      const tunicGeo = new THREE.CylinderGeometry(0.38, 0.55, 0.55, 16);
      const tunic = new THREE.Mesh(tunicGeo, clothesMat);
      tunic.position.set(0, 1.08, 0);
      tunic.castShadow = true;
      this.avatarGroup.add(tunic);
    } else {
      // Classic straight work shirt
      const torsoGeo = new THREE.BoxGeometry(0.82, 0.95, 0.48);
      const torso = new THREE.Mesh(torsoGeo, clothesMat);
      torso.position.set(0, 1.32, 0);
      torso.castShadow = true;
      this.avatarGroup.add(torso);

      // Utility belt
      const beltGeo = new THREE.BoxGeometry(0.85, 0.12, 0.51);
      const beltMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
      const belt = new THREE.Mesh(beltGeo, beltMat);
      belt.position.set(0, 0.92, 0);
      this.avatarGroup.add(belt);
    }

    // 4. Arms & Hands
    const armGeo = new THREE.BoxGeometry(0.18, 0.85, 0.2);
    const leftArm = new THREE.Mesh(armGeo, clothesMat);
    leftArm.position.set(-0.52, 1.35, 0);
    leftArm.castShadow = true;
    this.avatarGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, clothesMat);
    rightArm.position.set(0.52, 1.35, 0);
    rightArm.castShadow = true;
    this.avatarGroup.add(rightArm);

    // Hands
    const handGeo = new THREE.SphereGeometry(0.11, 12, 12);
    const leftHand = new THREE.Mesh(handGeo, skinMat);
    leftHand.position.set(-0.52, 0.88, 0);
    this.avatarGroup.add(leftHand);

    const rightHand = new THREE.Mesh(handGeo, skinMat);
    rightHand.position.set(0.52, 0.88, 0);
    this.avatarGroup.add(rightHand);

    // 5. Neck
    const neckGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.22, 16);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.set(0, 1.88, 0);
    this.avatarGroup.add(neck);

    // 6. Head
    const headGeo = new THREE.SphereGeometry(0.5, 24, 24);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.set(0, 2.45, 0);
    head.castShadow = true;
    this.avatarGroup.add(head);

    // Eyes (Expressive dark dots)
    const eyeGeo = new THREE.SphereGeometry(0.048, 12, 12);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.16, 2.48, 0.44);
    this.avatarGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.16, 2.48, 0.44);
    this.avatarGroup.add(rightEye);

    // Soft Cheek Blush
    const blushGeo = new THREE.CircleGeometry(0.07, 16);
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.35 });

    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.26, 2.38, 0.42);
    this.avatarGroup.add(leftBlush);

    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.26, 2.38, 0.42);
    this.avatarGroup.add(rightBlush);

    // 7. Hair Styles
    if (hairStyle === 'ponytail') {
      // Base dome
      const hairDomeGeo = new THREE.SphereGeometry(0.53, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.58);
      const hairDome = new THREE.Mesh(hairDomeGeo, hairMat);
      hairDome.position.set(0, 2.46, 0);
      this.avatarGroup.add(hairDome);

      // Hair tie knot on the back
      const tieGeo = new THREE.TorusGeometry(0.1, 0.04, 12, 16);
      const tieMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const tie = new THREE.Mesh(tieGeo, tieMat);
      tie.position.set(-0.05, 2.45, -0.52);
      this.avatarGroup.add(tie);

      // Ponytail tail cascading down
      const tailGeo = new THREE.CylinderGeometry(0.09, 0.14, 0.7, 12);
      const tail = new THREE.Mesh(tailGeo, hairMat);
      tail.position.set(-0.06, 2.1, -0.56);
      tail.rotation.x = -0.15;
      this.avatarGroup.add(tail);

    } else if (hairStyle === 'long') {
      // Base dome
      const hairDomeGeo = new THREE.SphereGeometry(0.53, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
      const hairDome = new THREE.Mesh(hairDomeGeo, hairMat);
      hairDome.position.set(0, 2.46, 0);
      this.avatarGroup.add(hairDome);

      // Left lock falling over shoulder
      const lockGeo = new THREE.CapsuleGeometry(0.1, 0.65, 8, 12);
      const leftLock = new THREE.Mesh(lockGeo, hairMat);
      leftLock.position.set(-0.46, 2.15, 0.15);
      this.avatarGroup.add(leftLock);

      // Right lock falling over shoulder
      const rightLock = new THREE.Mesh(lockGeo, hairMat);
      rightLock.position.set(0.46, 2.15, 0.15);
      this.avatarGroup.add(rightLock);

      // Back long hair
      const backHairGeo = new THREE.BoxGeometry(0.72, 0.8, 0.2);
      const backHair = new THREE.Mesh(backHairGeo, hairMat);
      backHair.position.set(0, 2.05, -0.42);
      this.avatarGroup.add(backHair);

    } else if (hairStyle === 'bob') {
      // Rounded sleek bob framing face
      const bobGeo = new THREE.SphereGeometry(0.55, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.72);
      const bob = new THREE.Mesh(bobGeo, hairMat);
      bob.position.set(0, 2.46, 0);
      this.avatarGroup.add(bob);

    } else if (hairStyle === 'bun' || hairStyle === 'chignon') {
      // Base dome
      const hairDomeGeo = new THREE.SphereGeometry(0.53, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
      const hairDome = new THREE.Mesh(hairDomeGeo, hairMat);
      hairDome.position.set(0, 2.46, 0);
      this.avatarGroup.add(hairDome);

      // High elegant top knot bun
      const bunGeo = new THREE.SphereGeometry(0.24, 16, 16);
      const bun = new THREE.Mesh(bunGeo, hairMat);
      bun.position.set(0, 3.02, -0.05);
      this.avatarGroup.add(bun);

    } else if (hairStyle === 'pigtails') {
      // Base dome
      const hairDomeGeo = new THREE.SphereGeometry(0.53, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
      const hairDome = new THREE.Mesh(hairDomeGeo, hairMat);
      hairDome.position.set(0, 2.46, 0);
      this.avatarGroup.add(hairDome);

      // Twin buns / pigtails
      const pigGeo = new THREE.SphereGeometry(0.18, 12, 12);
      const leftPig = new THREE.Mesh(pigGeo, hairMat);
      leftPig.position.set(-0.52, 2.65, -0.05);
      this.avatarGroup.add(leftPig);

      const rightPig = new THREE.Mesh(pigGeo, hairMat);
      rightPig.position.set(0.52, 2.65, -0.05);
      this.avatarGroup.add(rightPig);

    } else if (hairStyle === 'messy') {
      // Textured spiky top
      const hairDomeGeo = new THREE.SphereGeometry(0.54, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
      const hairDome = new THREE.Mesh(hairDomeGeo, hairMat);
      hairDome.position.set(0, 2.46, 0);
      this.avatarGroup.add(hairDome);

      // Tufts
      const tuftGeo = new THREE.ConeGeometry(0.14, 0.28, 6);
      const tuft1 = new THREE.Mesh(tuftGeo, hairMat);
      tuft1.position.set(-0.12, 3.02, 0.1);
      tuft1.rotation.z = 0.2;
      this.avatarGroup.add(tuft1);

      const tuft2 = new THREE.Mesh(tuftGeo, hairMat);
      tuft2.position.set(0.14, 3.04, 0.05);
      tuft2.rotation.z = -0.25;
      this.avatarGroup.add(tuft2);

    } else if (hairStyle === 'beard') {
      // Short hair cap
      const hairDomeGeo = new THREE.SphereGeometry(0.53, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.52);
      const hairDome = new THREE.Mesh(hairDomeGeo, hairMat);
      hairDome.position.set(0, 2.46, 0);
      this.avatarGroup.add(hairDome);

      // Trimmed beard around chin
      const beardGeo = new THREE.TorusGeometry(0.42, 0.09, 12, 20, Math.PI * 0.9);
      const beard = new THREE.Mesh(beardGeo, hairMat);
      beard.position.set(0, 2.32, 0.14);
      beard.rotation.x = Math.PI * 0.42;
      beard.rotation.z = Math.PI * 0.05;
      this.avatarGroup.add(beard);

    } else {
      // Classic short crop
      const hairDomeGeo = new THREE.SphereGeometry(0.53, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.52);
      const hairDome = new THREE.Mesh(hairDomeGeo, hairMat);
      hairDome.position.set(0, 2.46, 0);
      this.avatarGroup.add(hairDome);
    }

    // 8. Floating Radiant Sovereign Crown 👑
    if (this.appearance.isPlayer) {
      const crownGroup = new THREE.Group();

      const crownRingGeo = new THREE.CylinderGeometry(0.34, 0.38, 0.16, 5, 1, true);
      const crownMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        roughness: 0.25,
        metalness: 0.85,
        emissive: 0xd97706,
        emissiveIntensity: 0.25
      });
      const crownRing = new THREE.Mesh(crownRingGeo, crownMat);
      crownGroup.add(crownRing);

      // 5 Crown points
      const pointGeo = new THREE.ConeGeometry(0.08, 0.18, 4);
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const p = new THREE.Mesh(pointGeo, crownMat);
        p.position.set(Math.cos(angle) * 0.34, 0.16, Math.sin(angle) * 0.34);
        crownGroup.add(p);
      }

      // Small central emerald gem
      const gemGeo = new THREE.OctahedronGeometry(0.06);
      const gemMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const gem = new THREE.Mesh(gemGeo, gemMat);
      gem.position.set(0, 0.02, 0.38);
      crownGroup.add(gem);

      crownGroup.position.set(0, 3.65, 0);
      this.crownMesh = crownGroup;
      this.avatarGroup.add(crownGroup);
    }

    this.scene.add(this.avatarGroup);
  }

  updateAppearance(newAppearance) {
    this.appearance = { ...this.appearance, ...newAppearance };
    this.buildAvatar();
  }

  handleResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const isMini = Boolean(this.options.isMiniPhoto);
    const width = this.container.clientWidth || (isMini ? 64 : 280);
    const height = this.container.clientHeight || (isMini ? 64 : 280);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  destroy() {
    if (this.onWindowResize) {
      window.removeEventListener('resize', this.onWindowResize);
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.controls) {
      this.controls.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.avatarGroup) {
      this.scene.remove(this.avatarGroup);
    }
    this.container.innerHTML = '';
  }
}
