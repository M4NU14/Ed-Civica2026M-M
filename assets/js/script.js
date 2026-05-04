import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const districts = [
    {
        name: "Municipio Digitale",
        position: { x: -30, y: 0, z: -14 },
        size: { w: 7, h: 13, d: 7 },
        color: 0x3b82f6,
        link: "pages/municipio.html",
        description: "Identita digitale, accesso ai servizi della PA e uso corretto delle credenziali.",
        focus: ["SPID e CIE", "servizi pubblici online", "sicurezza delle credenziali"]
    },
    {
        name: "Centro Sicurezza Dati",
        position: { x: 18, y: 0, z: -14 },
        size: { w: 7, h: 14, d: 7 },
        color: 0xe25555,
        link: "pages/sicurezza.html",
        description: "Privacy, diritti del cittadino e protezione dei dati personali.",
        focus: ["GDPR", "cookie e tracciamento", "password e 2FA"]
    },
    {
        name: "Hub Cittadinanza Digitale",
        position: { x: -17, y: 0, z: 8 },
        size: { w: 8, h: 12, d: 8 },
        color: 0x7d63f2,
        link: "pages/social.html",
        description: "Social media, netiquette, reputazione online e contrasto alla disinformazione.",
        focus: ["netiquette", "reputazione online", "fake news"]
    },
    {
        name: "EcoTech Park",
        position: { x: 18, y: 0, z: 8 },
        size: { w: 9, h: 11, d: 9 },
        color: 0x2ea86b,
        link: "pages/sostenibilita.html",
        description: "Impatto ambientale della tecnologia, e-waste e smart city sostenibili.",
        focus: ["economia circolare", "green tech", "smart city"]
    },
    {
        name: "Torre Telecomunicazioni",
        position: { x: 0, y: 0, z: -26 },
        size: { w: 5, h: 18, d: 5 },
        color: 0xf0a23a,
        link: "pages/telecomunicazioni.html",
        description: "Onde elettromagnetiche, esposizione consapevole e lettura critica dei miti sul 5G.",
        focus: ["spettro elettromagnetico", "SAR", "principio di precauzione"]
    },
    {
        name: "Food Lab",
        position: { x: -9, y: 0, z: 21 },
        size: { w: 6, h: 9, d: 6 },
        color: 0xe17f3d,
        link: "pages/alimentazione.html",
        description: "Alimentazione sostenibile, etichette e scelte sane con meno sprechi.",
        focus: ["piramide sostenibile", "etichette", "anti-spreco"]
    },
    {
        name: "Game District",
        position: { x: 11, y: 0, z: 21 },
        size: { w: 7, h: 10, d: 7 },
        color: 0x19a38d,
        link: "pages/gioco.html",
        description: "Probabilita, distorsioni cognitive e prevenzione del gioco problematico.",
        focus: ["house edge", "bias cognitivi", "segnali di rischio"]
    }
];

let scene;
let camera;
let renderer;
let raycaster;
let cityRoot;
let hoverIndex = null;
let selectedIndex = 0;
let cityRadius = 34;

const mouse = new THREE.Vector2();
const clock = new THREE.Clock();
const hotspotGroups = [];
const hotspotMeshes = [];

const orbit = {
    theta: -0.8,
    phi: 1.02,
    radius: 92,
    desiredTheta: -0.8,
    desiredPhi: 1.02,
    desiredRadius: 92,
    target: new THREE.Vector3(0, 10, 0),
    dragging: false,
    moved: false,
    startX: 0,
    startY: 0,
    startTheta: 0,
    startPhi: 0
};

const state = {
    started: false,
    startTime: 0,
    demoTime: 3000
};

const ui = {};
const localServerUrl = "http://127.0.0.1:8080/";
const modelUrl = "assets/models/progetto_3d/lowpoly_city.glb";

function init() {
    cacheUI();

    if (window.location.protocol === "file:") {
        ui.loadingText.textContent = "Sto aprendo il progetto tramite server locale...";
        ui.statusPill.textContent = "Se il redirect non parte, usa avvia-citta.bat oppure apri " + localServerUrl;
    }

    setupScene();
    createLighting();
    createStage();
    createDistrictButtons();
    bindEvents();
    updateDetailPanel(selectedIndex);
    updateLoading(10, "Sto preparando la scena...");
    loadCityModel();
    animate();
}

function cacheUI() {
    ui.titleScreen = document.getElementById("title-screen");
    ui.startBtn = document.getElementById("start-btn");
    ui.districtList = document.getElementById("district-list");
    ui.cityHud = document.getElementById("city-hud");
    ui.buildingName = document.getElementById("building-name");
    ui.buildingDescription = document.getElementById("building-description");
    ui.buildingTags = document.getElementById("building-tags");
    ui.openLink = document.getElementById("open-link");
    ui.closeInfo = document.getElementById("close-info");
    ui.loadingScreen = document.getElementById("loading-screen");
    ui.loadingProgress = document.getElementById("loading-progress");
    ui.loadingText = document.getElementById("loading-text");
    ui.statusPill = document.getElementById("status-pill");
}

function setupScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe7eef3);
    scene.fog = new THREE.Fog(0xe7eef3, 78, 170);

    camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 500);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById("canvas-container").appendChild(renderer.domElement);

    raycaster = new THREE.Raycaster();
    raycaster.params.Mesh.threshold = 0.2;
    renderer.domElement.style.cursor = "grab";
}

function createLighting() {
    const hemiLight = new THREE.HemisphereLight(0xf8fbff, 0x42526d, 1.15);
    scene.add(hemiLight);

    const sun = new THREE.DirectionalLight(0xffffff, 1.1);
    sun.position.set(28, 42, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.left = -70;
    sun.shadow.camera.right = 70;
    sun.shadow.camera.top = 70;
    sun.shadow.camera.bottom = -70;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 140;
    scene.add(sun);

    const fill = new THREE.PointLight(0x8bb7ff, 0.75, 140);
    fill.position.set(-30, 18, -24);
    scene.add(fill);

    const rim = new THREE.PointLight(0xffd7a1, 0.45, 120);
    rim.position.set(30, 16, 28);
    scene.add(rim);
}

function createStage() {
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x203149,
        roughness: 0.88,
        metalness: 0.12
    });
    const topMaterial = new THREE.MeshStandardMaterial({
        color: 0x31455f,
        roughness: 0.86,
        metalness: 0.1
    });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(44, 48, 8, 64), baseMaterial);
    base.position.y = -5.2;
    base.receiveShadow = true;
    scene.add(base);

    const top = new THREE.Mesh(new THREE.CylinderGeometry(40, 43, 2.4, 64), topMaterial);
    top.position.y = -0.8;
    top.receiveShadow = true;
    scene.add(top);

    const shadow = new THREE.Mesh(
        new THREE.CircleGeometry(38, 64),
        new THREE.MeshBasicMaterial({ color: 0x122033, transparent: true, opacity: 0.24 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.04;
    scene.add(shadow);

    for (let index = 0; index < 3; index += 1) {
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(24 + index * 6, 24.35 + index * 6, 80),
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                opacity: 0.11 - index * 0.025,
                transparent: true,
                side: THREE.DoubleSide,
                depthWrite: false
            })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.08 + index * 0.02;
        scene.add(ring);
    }
}

function createDistrictButtons() {
    districts.forEach((district, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "district-chip";
        button.textContent = district.name;
        button.addEventListener("click", () => selectDistrict(index));
        ui.districtList.appendChild(button);
    });
    syncDistrictButtons();
}

function bindEvents() {
    ui.startBtn.addEventListener("click", startExperience);
    ui.closeInfo.addEventListener("click", closeInfoPanel);
    ui.openLink.addEventListener("click", () => {
        window.location.href = districts[selectedIndex].link;
    });

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerleave", () => setHover(null));
    renderer.domElement.addEventListener("click", onSceneClick);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("resize", onResize);
}

function loadCityModel() {
    updateLoading(18, "Sto caricando il modello 3D dalla cartella progetto_3d...");

    const loader = new GLTFLoader();
    loader.load(
        modelUrl,
        (gltf) => {
            cityRoot = new THREE.Group();
            const model = gltf.scene;
            prepareModel(model);
            fitModelToStage(model);
            cityRoot.add(model);
            scene.add(cityRoot);

            createHotspots();
            updateLoading(100, "Citta pronta.");
            hideLoadingSoon();
            ui.statusPill.textContent = "Trascina per ruotare, usa la rotella per lo zoom.";
        },
        (event) => {
            if (!event.total) {
                updateLoading(56, "Sto trasferendo il modello 3D...");
                return;
            }
            const progress = Math.min(96, Math.round((event.loaded / event.total) * 100));
            updateLoading(progress, "Caricamento del modello 3D in corso...");
        },
        (error) => {
            console.error("Errore caricamento modello:", error);
            ui.loadingProgress.style.width = "100%";
            ui.loadingText.textContent = "Errore nel caricamento del modello 3D.";
            ui.statusPill.textContent = "Il modello non si e caricato. Apri il progetto da " + localServerUrl + " oppure usa avvia-citta.bat.";
        }
    );
}

function prepareModel(model) {
    model.traverse((child) => {
        if (!child.isMesh) {
            return;
        }

        child.castShadow = true;
        child.receiveShadow = true;

        const convertMaterial = (mat) => {
            if (!mat) return new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.8, metalness: 0.1 });

            // If already a proper MeshStandardMaterial, just tweak it
            if (mat.isMeshStandardMaterial && mat.type === "MeshStandardMaterial") {
                mat.roughness = Math.min(mat.roughness ?? 0.8, 0.88);
                mat.metalness = Math.min(mat.metalness ?? 0.15, 0.18);
                return mat;
            }

            // Convert any other material (including broken pbrSpecularGlossiness) to MeshStandardMaterial
            const newMat = new THREE.MeshStandardMaterial({
                color: mat.color ? mat.color.clone() : new THREE.Color(0xaaaaaa),
                map: mat.map || null,
                normalMap: mat.normalMap || null,
                roughness: 0.78,
                metalness: 0.1,
                transparent: mat.transparent || false,
                opacity: mat.opacity !== undefined ? mat.opacity : 1,
                side: mat.side !== undefined ? mat.side : THREE.FrontSide,
                alphaTest: mat.alphaTest || 0,
                name: mat.name || ""
            });

            if (mat.emissive) newMat.emissive = mat.emissive.clone();
            if (mat.emissiveMap) newMat.emissiveMap = mat.emissiveMap;
            if (mat.aoMap) newMat.aoMap = mat.aoMap;

            mat.dispose();
            return newMat;
        };

        if (Array.isArray(child.material)) {
            child.material = child.material.map(convertMaterial);
        } else {
            child.material = convertMaterial(child.material);
        }
    });
}

function fitModelToStage(model) {
    const originalBox = new THREE.Box3().setFromObject(model);
    const originalCenter = originalBox.getCenter(new THREE.Vector3());
    const originalSize = originalBox.getSize(new THREE.Vector3());
    const maxDimension = Math.max(originalSize.x, originalSize.y, originalSize.z) || 1;
    const targetSpan = 58;

    model.position.sub(originalCenter);
    model.scale.setScalar(targetSpan / maxDimension);

    const fittedBox = new THREE.Box3().setFromObject(model);
    const fittedSize = fittedBox.getSize(new THREE.Vector3());

    model.position.y -= fittedBox.min.y;

    cityRadius = Math.max(fittedSize.x, fittedSize.z) * 0.5;
    orbit.target.y = Math.max(8, fittedSize.y * 0.28);
    orbit.desiredRadius = Math.max(74, Math.min(118, cityRadius * 2.4));
    orbit.radius = orbit.desiredRadius;
}

function createHotspots() {
    if (hotspotGroups.length > 0) {
        return;
    }

    districts.forEach((district, index) => {
        const group = new THREE.Group();
        const baseY = Math.max(3.4, district.size.h * 0.28 + 2.4);

        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(1.6, 0.12, 12, 36),
            new THREE.MeshBasicMaterial({
                color: district.color,
                transparent: true,
                opacity: 0.75,
                depthWrite: false
            })
        );
        ring.rotation.x = Math.PI / 2;

        const beam = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 2.4, 10, 1, true),
            new THREE.MeshBasicMaterial({
                color: district.color,
                transparent: true,
                opacity: 0.3,
                depthWrite: false
            })
        );
        beam.position.y = 1.2;

        const orb = new THREE.Mesh(
            new THREE.SphereGeometry(0.46, 20, 20),
            new THREE.MeshStandardMaterial({
                color: district.color,
                emissive: district.color,
                emissiveIntensity: 0.3,
                roughness: 0.24,
                metalness: 0.2
            })
        );
        orb.position.y = 2.45;

        const hitArea = new THREE.Mesh(
            new THREE.SphereGeometry(2.2, 18, 18),
            new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 0
            })
        );
        hitArea.position.y = 1.4;
        hitArea.userData.index = index;

        group.add(ring, beam, orb, hitArea);
        group.position.set(district.position.x, baseY, district.position.z);
        group.userData.baseY = baseY;

        hotspotGroups.push(group);
        hotspotMeshes.push(hitArea);
        scene.add(group);
    });
}

function updateLoading(percent, text) {
    ui.loadingProgress.style.width = percent + "%";
    ui.loadingText.textContent = text;
}

function hideLoadingSoon() {
    window.setTimeout(() => {
        ui.loadingScreen.classList.add("is-hidden");
    }, 360);
}

function startExperience() {
    state.started = true;
    state.startTime = performance.now();
    ui.titleScreen.classList.remove("active");
    selectDistrict(0);
}

function selectDistrict(index) {
    selectedIndex = index;
    syncDistrictButtons();
    updateDetailPanel(index);
    ui.cityHud.classList.add("active");

    const district = districts[index];
    orbit.desiredTheta = Math.atan2(district.position.x, district.position.z) + 0.78;
    orbit.desiredPhi = 1.02;
    orbit.desiredRadius = Math.max(72, Math.min(116, cityRadius * 2.35));
}

function updateDetailPanel(index) {
    const district = districts[index];
    ui.buildingName.textContent = district.name;
    ui.buildingDescription.textContent = district.description;
    ui.openLink.textContent = "Apri " + district.name;
    ui.buildingTags.innerHTML = "";

    district.focus.forEach((item) => {
        const chip = document.createElement("span");
        chip.textContent = item;
        ui.buildingTags.appendChild(chip);
    });
}

function closeInfoPanel() {
    ui.cityHud.classList.remove("active");
}

function syncDistrictButtons() {
    const buttons = ui.districtList.querySelectorAll(".district-chip");
    buttons.forEach((button, index) => {
        button.classList.toggle("is-active", index === selectedIndex);
    });
}

function onPointerDown(event) {
    orbit.dragging = true;
    orbit.moved = false;
    orbit.startX = event.clientX;
    orbit.startY = event.clientY;
    orbit.startTheta = orbit.desiredTheta;
    orbit.startPhi = orbit.desiredPhi;
    document.body.classList.add("is-grabbing");
}

function onPointerMove(event) {
    setMouseFromEvent(event);

    if (orbit.dragging) {
        const deltaX = event.clientX - orbit.startX;
        const deltaY = event.clientY - orbit.startY;
        orbit.moved = orbit.moved || Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3;
        orbit.desiredTheta = orbit.startTheta - deltaX * 0.0085;
        orbit.desiredPhi = clamp(orbit.startPhi + deltaY * 0.0052, 0.45, 1.38);
        setHover(null);
        return;
    }

    const intersects = raycastHotspots();
    if (intersects.length > 0) {
        setHover(intersects[0].object.userData.index);
    } else {
        setHover(null);
    }
}

function onPointerUp() {
    orbit.dragging = false;
    document.body.classList.remove("is-grabbing");
}

function onSceneClick(event) {
    if (orbit.moved) {
        return;
    }

    setMouseFromEvent(event);
    const intersects = raycastHotspots();
    if (intersects.length > 0) {
        selectDistrict(intersects[0].object.userData.index);
    }
}

function onWheel(event) {
    event.preventDefault();
    orbit.desiredRadius = clamp(orbit.desiredRadius + event.deltaY * 0.025, 58, 132);
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function raycastHotspots() {
    raycaster.setFromCamera(mouse, camera);
    return raycaster.intersectObjects(hotspotMeshes, false);
}

function setMouseFromEvent(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function setHover(index) {
    hoverIndex = index;
    renderer.domElement.style.cursor = index === null ? (orbit.dragging ? "grabbing" : "grab") : "pointer";
}

function animate() {
    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    // Movimento iniziale leggero per i primi 3 secondi
    if (state.started) {
        const timeSinceStart = performance.now() - state.startTime;
        if (timeSinceStart < state.demoTime && !orbit.dragging && !ui.cityHud.classList.contains("active")) {
            orbit.desiredTheta += 0.0006;
        }
    }

    orbit.theta = THREE.MathUtils.lerp(orbit.theta, orbit.desiredTheta, orbit.dragging ? 0.2 : 0.06);
    orbit.phi = THREE.MathUtils.lerp(orbit.phi, orbit.desiredPhi, 0.08);
    orbit.radius = THREE.MathUtils.lerp(orbit.radius, orbit.desiredRadius, 0.08);

    const spherical = new THREE.Spherical(orbit.radius, orbit.phi, orbit.theta);
    camera.position.setFromSpherical(spherical).add(orbit.target);
    camera.lookAt(orbit.target);

    hotspotGroups.forEach((group, index) => {
        const active = index === selectedIndex;
        const hovered = index === hoverIndex;
        const targetScale = hovered ? 1.24 : active ? 1.1 : 1;

        group.position.y = group.userData.baseY + Math.sin(elapsed * 2.2 + index) * 0.28 + (active ? 0.24 : 0);
        group.rotation.y += 0.008;

        group.scale.x += (targetScale - group.scale.x) * 0.14;
        group.scale.y += (targetScale - group.scale.y) * 0.14;
        group.scale.z += (targetScale - group.scale.z) * 0.14;
    });

    if (cityRoot) {
        cityRoot.rotation.y = Math.sin(elapsed * 0.12) * 0.02;
    }

    renderer.render(scene, camera);
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

window.addEventListener("load", init);
