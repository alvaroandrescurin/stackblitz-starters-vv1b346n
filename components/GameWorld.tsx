
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { KeyBindings } from '../index';

interface GameWorldProps {
    onGoHome: () => void;
    onExit: () => void;
    onOpenSettings: () => void;
    editorMode?: boolean;
    onToggleEditor?: () => void;
    mouseSensitivity?: number;
    keyBindings?: KeyBindings;
    t: (key: string) => string;
}

interface Particle {
    mesh: THREE.Mesh;
    life: number;
    velocity: THREE.Vector3;
}

interface SolidObject {
    id: string;
    type: 'tree' | 'bush' | 'rock';
    x: number;
    z: number;
    radius: number;
    mesh: THREE.Object3D;
}

interface Bird {
    mesh: THREE.Group;
    wingL: THREE.Mesh;
    wingR: THREE.Mesh;
    angle: number;
    radius: number;
    speed: number;
    y: number;
}

const GameWorld: React.FC<GameWorldProps> = ({ 
    onGoHome, 
    onExit, 
    onOpenSettings, 
    editorMode = false, 
    onToggleEditor, 
    mouseSensitivity = 1.0, 
    keyBindings,
    t 
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<THREE.Group>(new THREE.Group());
    const leftArmRef = useRef<THREE.Group>(null);
    const rightArmRef = useRef<THREE.Group>(null);
    const leftLegRef = useRef<THREE.Mesh>(null);
    const rightLegRef = useRef<THREE.Mesh>(null);
    
    const [isFading, setIsFading] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    
    const armActionTimeLeft = useRef(0);
    const armActionTimeRight = useRef(0);
    const isBreakingLeft = useRef(false);
    const isBreakingRight = useRef(false);
    const walkCycleTime = useRef(0);

    const menuLockoutRef = useRef(false);
    const showMenuRef = useRef(false);

    const moveState = useRef({
        forward: false,
        backward: false,
        left: false,
        right: false,
        jump: false
    });

    const physicsState = useRef({
        velocity: new THREE.Vector3(),
        onGround: true
    });

    const controlsRef = useRef<PointerLockControls | null>(null);
    const orbitRef = useRef<OrbitControls | null>(null);
    const particles = useRef<Particle[]>([]);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const solidsRef = useRef<SolidObject[]>([]);
    const cloudsRef = useRef<THREE.Group[]>([]);
    const birdsRef = useRef<Bird[]>([]);
    const firefliesRef = useRef<THREE.Points | null>(null);
    
    const raycaster = useRef(new THREE.Raycaster());
    const mouse = useRef(new THREE.Vector2());
    const selectedObject = useRef<SolidObject | null>(null);
    const isDragging = useRef(false);
    const groundPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
    const intersectionPoint = useRef(new THREE.Vector3());

    const safeLock = useCallback(() => {
        if (!controlsRef.current || controlsRef.current.isLocked || document.pointerLockElement || editorMode) return;
        try {
            controlsRef.current.lock();
        } catch (err) {}
    }, [editorMode]);

    const saveWorld = useCallback(() => {
        const data = solidsRef.current.map(s => ({
            id: s.id, type: s.type, x: s.mesh.position.x, z: s.mesh.position.z, radius: s.radius
        }));
        localStorage.setItem('umbrae_world_solids', JSON.stringify(data));
    }, []);

    // Helper for tree variety
    const spawnTree = useCallback((x: number, z: number, id: string = `tree-${Math.random()}`, variant: number = Math.floor(Math.random() * 3)) => {
        if (!sceneRef.current) return;
        const treeGroup = new THREE.Group();
        
        const trunkMat = new THREE.MeshStandardMaterial({ 
            color: 0x1a0f08, 
            roughness: 0.9,
            metalness: 0.05
        });
        const leafMat = new THREE.MeshStandardMaterial({ 
            color: 0x081a05, 
            roughness: 1.0, 
            transparent: true, 
            opacity: 0.95,
            side: THREE.DoubleSide
        });

        if (variant === 0) { // Pine-like
            const trunkH = 5 + Math.random() * 4;
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, trunkH, 8), trunkMat);
            trunk.position.y = trunkH / 2; trunk.castShadow = true; trunk.receiveShadow = true;
            treeGroup.add(trunk);
            for (let i = 0; i < 5; i++) {
                const foliage = new THREE.Mesh(new THREE.ConeGeometry(2.5 - i * 0.4, 3, 8), leafMat);
                foliage.position.y = trunkH * 0.4 + i * 1.6;
                foliage.castShadow = true; foliage.receiveShadow = true;
                treeGroup.add(foliage);
            }
        } else if (variant === 1) { // Oak-like
            const trunkH = 4 + Math.random() * 2;
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.1, trunkH, 8), trunkMat);
            trunk.position.y = trunkH / 2; trunk.castShadow = true; trunk.receiveShadow = true;
            treeGroup.add(trunk);
            const top = new THREE.Mesh(new THREE.IcosahedronGeometry(3.5, 1), leafMat);
            top.position.y = trunkH + 1.5; top.scale.y = 0.8;
            top.castShadow = true; top.receiveShadow = true;
            treeGroup.add(top);
        } else { // Dense/Twisted
            const trunkH = 3 + Math.random() * 3;
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, trunkH, 6), trunkMat);
            trunk.position.y = trunkH / 2; trunk.rotation.z = (Math.random()-0.5)*0.2;
            trunk.castShadow = true; trunk.receiveShadow = true;
            treeGroup.add(trunk);
            for(let i=0; i<8; i++) {
                const cluster = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), leafMat);
                cluster.position.set((Math.random()-0.5)*2, trunkH + Math.random()*2, (Math.random()-0.5)*2);
                cluster.castShadow = true; cluster.receiveShadow = true;
                treeGroup.add(cluster);
            }
        }

        treeGroup.position.set(x, 0, z);
        sceneRef.current.add(treeGroup);
        solidsRef.current.push({ id, type: 'tree', x, z, radius: 1.2, mesh: treeGroup });
    }, []);

    const spawnBush = useCallback((x: number, z: number, id: string = `bush-${Math.random()}`) => {
        if (!sceneRef.current) return;
        const r = 1.0 + Math.random() * 0.8;
        const bush = new THREE.Mesh(
            new THREE.SphereGeometry(r, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x0a1a0a, roughness: 1.0 })
        );
        bush.position.set(x, 0.4, z);
        bush.scale.y = 0.6;
        bush.castShadow = true; bush.receiveShadow = true;
        sceneRef.current.add(bush);
        solidsRef.current.push({ id, type: 'bush', x, z, radius: r * 0.9, mesh: bush });
    }, []);

    const spawnRock = useCallback((x: number, z: number, id: string = `rock-${Math.random()}`) => {
        if (!sceneRef.current) return;
        const r = 0.8 + Math.random() * 0.8;
        const rock = new THREE.Mesh(
            new THREE.DodecahedronGeometry(r),
            new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8, metalness: 0.1 })
        );
        rock.position.set(x, 0.3, z);
        rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        rock.castShadow = true; rock.receiveShadow = true;
        sceneRef.current.add(rock);
        solidsRef.current.push({ id, type: 'rock', x, z, radius: r * 1.1, mesh: rock });
    }, []);

    const checkCollisions = (pos: THREE.Vector3) => {
        const playerRadius = 0.6;
        solidsRef.current.forEach(solid => {
            const dx = pos.x - solid.x;
            const dz = pos.z - solid.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            const minDist = solid.radius + playerRadius;
            if (dist < minDist) {
                const angle = Math.atan2(dz, dx);
                pos.x = solid.x + Math.cos(angle) * minDist;
                pos.z = solid.z + Math.sin(angle) * minDist;
            }
        });
    };

    // Fix: Defined missing handleDeleteSelected function
    const handleDeleteSelected = useCallback(() => {
        if (selectedObject.current && sceneRef.current) {
            sceneRef.current.remove(selectedObject.current.mesh);
            solidsRef.current = solidsRef.current.filter(s => s.id !== selectedObject.current!.id);
            selectedObject.current = null;
            saveWorld();
        }
    }, [saveWorld]);

    // Fix: Defined missing handleSpawnRequest function
    const handleSpawnRequest = useCallback((type: 'tree' | 'bush' | 'rock') => {
        if (!playerRef.current) return;
        const forward = new THREE.Vector3(0, 0, -5).applyQuaternion(playerRef.current.quaternion);
        const spawnPos = playerRef.current.position.clone().add(forward);
        
        if (type === 'tree') spawnTree(spawnPos.x, spawnPos.z);
        else if (type === 'bush') spawnBush(spawnPos.x, spawnPos.z);
        else if (type === 'rock') spawnRock(spawnPos.x, spawnPos.z);
        
        saveWorld();
    }, [spawnTree, spawnBush, spawnRock, saveWorld]);

    useEffect(() => {
        const fadeTimeout = setTimeout(() => setIsFading(false), 100);
        return () => clearTimeout(fadeTimeout);
    }, []);

    useEffect(() => { showMenuRef.current = showMenu; }, [showMenu]);

    useEffect(() => {
        if (!containerRef.current) return;

        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color(0x050505);
        
        // Dark Mysterious Fog
        scene.fog = new THREE.FogExp2(0x333333, 0.015);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        containerRef.current.appendChild(renderer.domElement);

        // Lights
        const hemiLight = new THREE.HemisphereLight(0x443366, 0x050511, 0.4);
        scene.add(hemiLight);

        // Sunset Sun (Directional Light)
        const sunLight = new THREE.DirectionalLight(0xffcc88, 1.2);
        sunLight.position.set(-100, 80, -100);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 4096;
        sunLight.shadow.mapSize.height = 4096;
        sunLight.shadow.camera.left = -500;
        sunLight.shadow.camera.right = 500;
        sunLight.shadow.camera.top = 500;
        sunLight.shadow.camera.bottom = -500;
        sunLight.shadow.radius = 4; // Softer shadow edges
        sunLight.shadow.bias = -0.0001;
        scene.add(sunLight);

        // Ground: Humid Forest Soil
        const textureLoader = new THREE.TextureLoader();
        const groundRepeat = 10;
        
        // Carga de texturas (Simuladas con patrones si fallan las URLs, pero usaremos URLs de Three.js para mayor compatibilidad)
        const groundAlbedo = textureLoader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg');
        const groundNormal = textureLoader.load('https://threejs.org/examples/textures/terrain/grasslight-big-nm.jpg');
        
        [groundAlbedo, groundNormal].forEach(t => {
            t.wrapS = t.wrapT = THREE.RepeatWrapping;
            t.repeat.set(groundRepeat, groundRepeat);
        });

        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x2a1a00,
            map: groundAlbedo,
            normalMap: groundNormal,
            roughness: 0.8,
            metalness: 0.05,
        });

        const ground = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000), groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Dense Forest Generation (In groups)
        const savedSolidsData = localStorage.getItem('umbrae_world_solids');
        if (savedSolidsData) {
            JSON.parse(savedSolidsData).forEach((s: any) => {
                if (s.type === 'tree') spawnTree(s.x, s.z, s.id);
                else if (s.type === 'bush') spawnBush(s.x, s.z, s.id);
                else if (s.type === 'rock') spawnRock(s.x, s.z, s.id);
            });
        } else {
            // Generar clusters de árboles
            for (let i = 0; i < 25; i++) {
                const centerX = (Math.random()-0.5)*400;
                const centerZ = (Math.random()-0.5)*400;
                const clusterSize = 5 + Math.floor(Math.random()*8);
                for(let j=0; j<clusterSize; j++) {
                    const ox = (Math.random()-0.5)*30;
                    const oz = (Math.random()-0.5)*30;
                    spawnTree(centerX + ox, centerZ + oz);
                }
            }
            // Rocks and Bushes
            for(let i=0; i<100; i++) {
                spawnBush((Math.random()-0.5)*500, (Math.random()-0.5)*500);
                spawnRock((Math.random()-0.5)*500, (Math.random()-0.5)*500);
            }
            saveWorld();
        }

        // Sky Elements
        const starGeo = new THREE.BufferGeometry();
        const starCount = 5000;
        const starPositions = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount * 3; i++) starPositions[i] = (Math.random() - 0.5) * 4000;
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, transparent: true, opacity: 0.4 })));

        // Birds
        const birdMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 1.0 });
        for (let i = 0; i < 15; i++) {
            const birdGroup = new THREE.Group();
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.3), birdMat);
            birdGroup.add(body);
            const wingGeo = new THREE.PlaneGeometry(0.6, 0.3);
            const wingL = new THREE.Mesh(wingGeo, birdMat);
            wingL.position.x = -0.3; wingL.rotation.y = Math.PI/2;
            const wingR = new THREE.Mesh(wingGeo, birdMat);
            wingR.position.x = 0.3; wingR.rotation.y = Math.PI/2;
            birdGroup.add(wingL); birdGroup.add(wingR);
            scene.add(birdGroup);
            birdsRef.current.push({
                mesh: birdGroup, wingL, wingR,
                angle: Math.random() * Math.PI * 2,
                radius: 100 + Math.random() * 400,
                speed: 0.005 + Math.random() * 0.01,
                y: 50 + Math.random() * 100
            });
        }

        // Fireflies
        const fireflyCount = 200;
        const fireflyPos = new Float32Array(fireflyCount * 3);
        const fireflyPhase = new Float32Array(fireflyCount);
        for (let i = 0; i < fireflyCount; i++) {
            fireflyPos[i*3] = (Math.random()-0.5)*600; fireflyPos[i*3+1] = 1 + Math.random()*8; fireflyPos[i*3+2] = (Math.random()-0.5)*600;
            fireflyPhase[i] = Math.random()*Math.PI*2;
        }
        const fireflyGeo = new THREE.BufferGeometry();
        fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPos, 3));
        fireflyGeo.setAttribute('phase', new THREE.BufferAttribute(fireflyPhase, 1));
        const fireflies = new THREE.Points(fireflyGeo, new THREE.PointsMaterial({ color: 0xfdfd96, size: 0.6, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }));
        firefliesRef.current = fireflies;
        scene.add(fireflies);

        // Player Setup
        const playerGroup = playerRef.current;
        const charMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3, metalness: 0.7 });
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.4), charMat); torso.position.y = 1.2; torso.castShadow = true; torso.receiveShadow = true;
        playerGroup.add(torso);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), charMat); head.position.y = 1.75; head.castShadow = true; head.receiveShadow = true;
        playerGroup.add(head);
        const leftLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.6, 4, 8), charMat); leftLeg.position.set(-0.2, 0.4, 0); leftLeg.castShadow = true; leftLeg.receiveShadow = true;
        playerGroup.add(leftLeg);
        const rightLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.6, 4, 8), charMat); rightLeg.position.set(0.2, 0.4, 0); rightLeg.castShadow = true; rightLeg.receiveShadow = true;
        playerGroup.add(rightLeg);
        (leftLegRef as any).current = leftLeg; (rightLegRef as any).current = rightLeg;

        const leftArmPivot = new THREE.Group(); leftArmPivot.position.set(-0.45, 1.5, 0);
        const leftArmMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.7, 4, 8), charMat); leftArmMesh.position.y = -0.35; leftArmMesh.castShadow = true; leftArmMesh.receiveShadow = true;
        leftArmPivot.add(leftArmMesh); playerGroup.add(leftArmPivot); (leftArmRef as any).current = leftArmPivot;

        const rightArmPivot = new THREE.Group(); rightArmPivot.position.set(0.45, 1.5, 0);
        const rightArmMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.7, 4, 8), charMat); rightArmMesh.position.y = -0.35; rightArmMesh.castShadow = true; rightArmMesh.receiveShadow = true;
        rightArmPivot.add(rightArmMesh); playerGroup.add(rightArmPivot); (rightArmRef as any).current = rightArmPivot;
        scene.add(playerGroup);

        const pc = new PointerLockControls(camera, renderer.domElement);
        controlsRef.current = pc;
        const oc = new OrbitControls(camera, renderer.domElement);
        oc.enableDamping = true; oc.enabled = false; orbitRef.current = oc;

        const handleAction = (isLMB: boolean) => {
            if (isLMB) { 
                if (isBreakingRight.current) return;
                isBreakingRight.current = true; armActionTimeRight.current = 0;
            } else { 
                if (isBreakingLeft.current) return;
                isBreakingLeft.current = true; armActionTimeLeft.current = 0;
            }

            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(playerGroup.quaternion);
            const breakDist = 4.5;
            solidsRef.current = solidsRef.current.filter(solid => {
                const dx = solid.x - playerGroup.position.x;
                const dz = solid.z - playerGroup.position.z;
                const dist = Math.sqrt(dx*dx + dz*dz);
                if (dist < breakDist) {
                    const toObj = new THREE.Vector3(dx, 0, dz).normalize();
                    if (forward.dot(toObj) > 0.4) {
                        scene.remove(solid.mesh);
                        for (let i = 0; i < 15; i++) {
                            const pMesh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 4, 4), new THREE.MeshBasicMaterial({ color: 0x33ff66 }));
                            pMesh.position.set(solid.x, 2, solid.z); scene.add(pMesh);
                            particles.current.push({ mesh: pMesh, life: 1.8, velocity: new THREE.Vector3((Math.random()-0.5)*0.8, Math.random()*0.8, (Math.random()-0.5)*0.8) });
                        }
                        return false;
                    }
                }
                return true;
            });
            saveWorld();
        };

        const onMouseDown = (e: MouseEvent) => {
            if (showMenuRef.current) return;
            if (editorMode) {
                const rect = renderer.domElement.getBoundingClientRect();
                mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
                raycaster.current.setFromCamera(mouse.current, camera);
                const intersects = raycaster.current.intersectObjects(solidsRef.current.map(s => s.mesh), true);
                if (intersects.length > 0) {
                    let obj = intersects[0].object; while (obj.parent && obj.parent !== scene) obj = obj.parent;
                    const solid = solidsRef.current.find(s => s.mesh === obj);
                    if (solid) { selectedObject.current = solid; isDragging.current = true; orbitRef.current!.enabled = false; }
                }
                return;
            }
            if (pc.isLocked) {
                if (e.button === 0) handleAction(true); // LMB -> Right
                else if (e.button === 2) handleAction(false); // RMB -> Left
            } else if (!menuLockoutRef.current && e.button === 0) safeLock();
        };

        const onMouseMove = (e: MouseEvent) => {
            if (editorMode && isDragging.current && selectedObject.current) {
                const rect = renderer.domElement.getBoundingClientRect();
                mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
                raycaster.current.setFromCamera(mouse.current, camera);
                if (raycaster.current.ray.intersectPlane(groundPlane.current, intersectionPoint.current)) {
                    selectedObject.current.mesh.position.set(intersectionPoint.current.x, selectedObject.current.mesh.position.y, intersectionPoint.current.z);
                    selectedObject.current.x = intersectionPoint.current.x; selectedObject.current.z = intersectionPoint.current.z;
                }
            }
        };

        const onMouseUp = () => { if (isDragging.current) { isDragging.current = false; if (editorMode) orbitRef.current!.enabled = true; saveWorld(); } };

        renderer.domElement.addEventListener('mousedown', onMouseDown);
        renderer.domElement.addEventListener('mousemove', onMouseMove);
        renderer.domElement.addEventListener('mouseup', onMouseUp);
        renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());
        pc.addEventListener('unlock', () => { if (!menuLockoutRef.current && !showMenuRef.current) setShowMenu(true); });
        camera.position.set(0, 5, 10); camera.lookAt(0, 1, 0);

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Escape') {
                if (showMenuRef.current) { setShowMenu(false); safeLock(); menuLockoutRef.current = true; setTimeout(() => menuLockoutRef.current = false, 2000); }
                else if (!pc.isLocked && !menuLockoutRef.current) setShowMenu(true);
                return;
            }
            if (editorMode) { if (e.code === 'Delete' || e.code === 'Backspace') handleDeleteSelected(); return; }
            
            if (keyBindings) {
                if (e.code === keyBindings.forward) moveState.current.forward = true;
                if (e.code === keyBindings.backward) moveState.current.backward = true;
                if (e.code === keyBindings.left) moveState.current.left = true;
                if (e.code === keyBindings.right) moveState.current.right = true;
                if (e.code === keyBindings.jump) moveState.current.jump = true;
            }
        };

        const onKeyUp = (e: KeyboardEvent) => {
            if (keyBindings) {
                if (e.code === keyBindings.forward) moveState.current.forward = false;
                if (e.code === keyBindings.backward) moveState.current.backward = false;
                if (e.code === keyBindings.left) moveState.current.left = false;
                if (e.code === keyBindings.right) moveState.current.right = false;
                if (e.code === keyBindings.jump) moveState.current.jump = false;
            }
        };

        window.addEventListener('keydown', onKeyDown, true);
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        const clock = new THREE.Clock();
        const animate = () => {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            const time = clock.getElapsedTime();

            if (editorMode) orbitRef.current?.update();

            birdsRef.current.forEach(b => {
                b.angle += b.speed;
                b.mesh.position.set(Math.cos(b.angle)*b.radius, b.y + Math.sin(time*2)*2, Math.sin(b.angle)*b.radius);
                b.mesh.rotation.y = -b.angle + Math.PI/2;
                const flap = Math.sin(time * 15) * 0.8;
                b.wingL.rotation.z = flap; b.wingR.rotation.z = -flap;
            });

            if (firefliesRef.current) {
                const pos = firefliesRef.current.geometry.attributes.position as THREE.BufferAttribute;
                for (let i = 0; i < fireflyCount; i++) {
                    pos.setX(i, pos.getX(i) + Math.sin(time*0.5 + i)*0.03);
                    pos.setY(i, pos.getY(i) + Math.cos(time*0.3 + i)*0.02);
                    pos.setZ(i, pos.getZ(i) + Math.cos(time*0.5 + i)*0.03);
                }
                pos.needsUpdate = true;
            }

            if (!editorMode && pc.isLocked) {
                const speed = 90.0 * mouseSensitivity;
                physicsState.current.velocity.y -= 45.0 * delta;
                const worldDir = new THREE.Vector3(); camera.getWorldDirection(worldDir); worldDir.y = 0; worldDir.normalize();
                const sideDir = new THREE.Vector3().copy(worldDir).applyAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2);
                const moveDir = new THREE.Vector3();
                if (moveState.current.forward) moveDir.add(worldDir); if (moveState.current.backward) moveDir.sub(worldDir);
                if (moveState.current.left) moveDir.add(sideDir); if (moveState.current.right) moveDir.sub(sideDir);
                
                if (moveDir.length() > 0) {
                    moveDir.normalize();
                    physicsState.current.velocity.x += moveDir.x * speed * delta;
                    physicsState.current.velocity.z += moveDir.z * speed * delta;
                    playerGroup.rotation.y = Math.atan2(moveDir.x, moveDir.z);
                    walkCycleTime.current += delta * 12;
                    const legRot = Math.sin(walkCycleTime.current) * 0.6;
                    leftLegRef.current!.rotation.x = legRot; rightLegRef.current!.rotation.x = -legRot;
                } else {
                    leftLegRef.current!.rotation.x *= 0.8; rightLegRef.current!.rotation.x *= 0.8;
                }

                if (moveState.current.jump && physicsState.current.onGround) {
                    physicsState.current.velocity.y = 15.0;
                    physicsState.current.onGround = false;
                }

                const nextPos = playerGroup.position.clone();
                nextPos.x += physicsState.current.velocity.x * delta;
                nextPos.z += physicsState.current.velocity.z * delta;
                checkCollisions(nextPos);
                
                playerGroup.position.x = nextPos.x;
                playerGroup.position.z = nextPos.z;
                playerGroup.position.y += physicsState.current.velocity.y * delta;
                
                if (playerGroup.position.y < 0) { playerGroup.position.y = 0; physicsState.current.velocity.y = 0; physicsState.current.onGround = true; }
                
                const cameraOffset = new THREE.Vector3(0, 2.8, 8).applyQuaternion(camera.quaternion);
                camera.position.lerp(playerGroup.position.clone().add(cameraOffset), 0.08);
                physicsState.current.velocity.x *= 0.85; physicsState.current.velocity.z *= 0.85;

                if (isBreakingLeft.current && leftArmRef.current) {
                    armActionTimeLeft.current += delta * 9;
                    if (armActionTimeLeft.current > Math.PI) { isBreakingLeft.current = false; leftArmRef.current.rotation.x = 0; }
                    else { leftArmRef.current.rotation.x = -Math.sin(armActionTimeLeft.current) * 2.0; }
                }
                if (isBreakingRight.current && rightArmRef.current) {
                    armActionTimeRight.current += delta * 9;
                    if (armActionTimeRight.current > Math.PI) { isBreakingRight.current = false; rightArmRef.current.rotation.x = 0; }
                    else { rightArmRef.current.rotation.x = -Math.sin(armActionTimeRight.current) * 2.0; }
                }

                // Shadow camera tracking
                sunLight.shadow.camera.position.set(playerGroup.position.x + sunLight.position.x, playerGroup.position.y + sunLight.position.y, playerGroup.position.z + sunLight.position.z);
            }

            for (let i = particles.current.length - 1; i >= 0; i--) {
                const p = particles.current[i]; p.life -= delta;
                if (p.life <= 0) { scene.remove(p.mesh); particles.current.splice(i, 1); }
                else { p.mesh.position.add(p.velocity); p.mesh.scale.multiplyScalar(0.97); (p.mesh.material as THREE.MeshBasicMaterial).opacity = p.life; }
            }

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            window.removeEventListener('keydown', onKeyDown, true);
            window.removeEventListener('keyup', onKeyUp);
            renderer.dispose();
        };
    }, [spawnTree, spawnBush, spawnRock, saveWorld, editorMode, mouseSensitivity, keyBindings, handleDeleteSelected]); 

    useEffect(() => {
        if (orbitRef.current) orbitRef.current.enabled = editorMode;
        if (controlsRef.current && editorMode) controlsRef.current.unlock();
    }, [editorMode]);

    return (
        <div className={`game-container ${isFading ? 'fading' : 'faded-in'}`}>
            <div ref={containerRef} className="game-canvas-wrapper" />
            
            {editorMode && (
                <div className="editor-sidebar">
                    <h3>{t('objects')}</h3>
                    <div className="editor-object-list">
                        <button className="editor-obj-item" onClick={() => handleSpawnRequest('tree')}>{t('add')} Árbol</button>
                        <button className="editor-obj-item" onClick={() => handleSpawnRequest('bush')}>{t('add')} Arbusto</button>
                        <button className="editor-obj-item" onClick={() => handleSpawnRequest('rock')}>{t('add')} Roca</button>
                    </div>
                    <div style={{height: '1px', background: 'rgba(255,255,255,0.1)'}} />
                    <button className="editor-obj-item" style={{color: '#ff6b6b'}} onClick={handleDeleteSelected}>{t('delete')}</button>
                    <button className="editor-obj-item" style={{color: '#4ade80'}} onClick={saveWorld}>{t('saveWorld')}</button>
                    <button className="editor-obj-item" style={{color: '#60a5fa', fontWeight: 'bold'}} onClick={onToggleEditor}>{t('play')}</button>
                    
                    <div className="editor-controls-info">
                        LMB: Drag<br/>RMB: Orbit<br/>Del: Remove
                    </div>
                </div>
            )}

            {!showMenu && !editorMode && (
                <div className="game-ui-overlay">
                    <p className="game-hint">CLICK IZQ: Mano Der • CLICK DER: Mano Izq • WASD: Caminar • ESC: Menú</p>
                </div>
            )}

            {showMenu && (
                <div className="game-menu-overlay">
                    <button className="menu-close-x" onClick={() => setShowMenu(false)} title="Close Menu">&times;</button>
                    <div className="game-menu-stack-minimal">
                        <div className="menu-actions">
                            <button className="menu-action-btn-float primary" onClick={() => setShowMenu(false)}>{t('continue')}</button>
                            <button className="menu-action-btn-float" onClick={onOpenSettings}>{t('settings')}</button>
                            <button className="menu-action-btn-float" onClick={onGoHome}>{t('home')}</button>
                            <button className="menu-action-btn-float danger" onClick={onExit}>{t('exit')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameWorld;
