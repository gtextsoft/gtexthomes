// Real Estate City Animation - Three.js (Optimized)
(function() {
  'use strict';

  if (typeof THREE === 'undefined' || typeof gsap === 'undefined') {
    console.error('Three.js or GSAP not loaded');
    return;
  }

  if (gsap.registerPlugin) {
    gsap.registerPlugin(ScrollTrigger);
  }

  const container = document.querySelector('.horizon-section');
  const canvas = document.getElementById('horizon-canvas');
  if (!container || !canvas) return;

  let scene, camera, renderer;
  let buildings = [];
  let cityLights = [];
  let ground = null;
  let animationId = null;
  let isVisible = true;
  let scrollTicking = false;
  let frameCount = 0;
  
  const smoothCameraPos = { x: 0, y: 50, z: 200 };
  let targetCameraX = 0;
  let targetCameraY = 50;
  let targetCameraZ = 200;
  let scrollProgress = 0;
  let isReady = false;

  // Shared geometries & materials (reused for performance)
  const shared = {
    edgeGeometry: null,
    ledgeGeometry: null,
    roofGeometry: null,
    windowGeometry: null,
    edgeMaterial: null,
    ledgeMaterial: null,
    roofMaterial: null,
    windowMaterialWhite: null,
    windowMaterialYellow: null
  };

  function initThree() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.0008);

    // Camera
    camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    camera.position.set(0, 50, 200);
    camera.lookAt(0, 30, 0);

    // Renderer (antialias off for faster render, powerPreference for GPU)
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance'
    });
    
    const containerRect = container.getBoundingClientRect();
    renderer.setSize(containerRect.width, containerRect.height);
    const dpr = Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2);
    renderer.setPixelRatio(dpr);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;

    // Create scene elements
    createCitySkyline();
    createCityLights();
    createGround();
    createAtmosphere();

    // Start animation
    animate();
    
    isReady = true;
    
    // Trigger GSAP animations
    initGSAPAnimations();
  }

  function initGSAPAnimations() {
    const contentRef = document.querySelector('.horizon-content');
    if (!contentRef) return;

    gsap.set(contentRef, {
      visibility: 'visible',
      opacity: 0
    });

    const eyebrow = contentRef.querySelector('.eyebrow');
    const heading = contentRef.querySelector('h1');
    const lead = contentRef.querySelector('.lead');

    if (eyebrow) {
      gsap.set(eyebrow, { opacity: 0, y: 30 });
    }
    if (heading) {
      gsap.set(heading, { opacity: 0, y: 50 });
    }
    if (lead) {
      gsap.set(lead, { opacity: 0, y: 30 });
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
        scrub: false,
        once: false
      }
    });

    tl.to(contentRef, {
      opacity: 1,
      duration: 0.6,
      ease: "power2.out"
    });

    if (eyebrow) {
      tl.to(eyebrow, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out"
      }, "-=0.4");
    }

    if (heading) {
      tl.to(heading, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power4.out"
      }, "-=0.6");
    }

    if (lead) {
      tl.to(lead, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out"
      }, "-=0.7");
    }
  }

  function createCitySkyline() {
    buildings = [];
    const buildingCount = 35;
    const spacing = 35;
    const startX = -(buildingCount * spacing) / 2;

    for (let i = 0; i < buildingCount; i++) {
      const width = 18 + Math.random() * 25;
      const depth = 18 + Math.random() * 25;
      const height = 40 + Math.random() * 140;
      const x = startX + i * spacing + (Math.random() - 0.5) * 15;
      const z = (Math.random() - 0.5) * 150;

      const buildingGroup = new THREE.Group();
      const geometry = new THREE.BoxGeometry(width, height, depth);
      
      const colorChoice = Math.random();
      let buildingColor;
      if (colorChoice < 0.7) buildingColor = 0xffffff;
      else if (colorChoice < 0.9) buildingColor = 0xf5f5f5;
      else buildingColor = 0xd70f26;

      const material = new THREE.MeshStandardMaterial({
        color: buildingColor,
        metalness: 0.4,
        roughness: 0.6,
        emissive: buildingColor,
        emissiveIntensity: 0.05
      });

      const building = new THREE.Mesh(geometry, material);
      building.position.y = height / 2;
      building.castShadow = true;
      building.receiveShadow = true;
      buildingGroup.add(building);

      // Roof (shared geometry scaled per-building)
      if (!shared.roofGeometry) {
        shared.roofGeometry = new THREE.BoxGeometry(1, 2, 1);
        shared.roofMaterial = new THREE.MeshStandardMaterial({
          color: 0x888888, metalness: 0.7, roughness: 0.2
        });
      }
      const roof = new THREE.Mesh(shared.roofGeometry, shared.roofMaterial);
      roof.scale.set(width + 1, 1, depth + 1);
      roof.position.y = height + 1;
      buildingGroup.add(roof);

      buildingGroup.position.set(x, 0, z);
      buildingGroup.userData = { width, height, depth, floors: Math.floor(height / 8), baseX: x, baseZ: z };
      scene.add(buildingGroup);
      buildings.push(buildingGroup);
    }
  }

  function createCityLights() {
    cityLights = [];
    if (!shared.windowGeometry) {
      shared.windowGeometry = new THREE.PlaneGeometry(3, 4);
      shared.windowMaterialWhite = new THREE.MeshBasicMaterial({
        color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.8,
        transparent: true, opacity: 0.9
      });
      shared.windowMaterialYellow = new THREE.MeshBasicMaterial({
        color: 0xffaa00, emissive: 0xffaa00, emissiveIntensity: 1.8,
        transparent: true, opacity: 0.9
      });
    }
    
    buildings.forEach((buildingGroup) => {
      const { width, height, depth, floors, baseX, baseZ } = buildingGroup.userData;
      const sides = [
        { axis: 'x', pos: width/2 - 0.1, rot: Math.PI/2, windows: Math.min(4, Math.floor(width / 6)) },
        { axis: 'x', pos: -width/2 + 0.1, rot: -Math.PI/2, windows: Math.min(4, Math.floor(width / 6)) },
        { axis: 'z', pos: depth/2 - 0.1, rot: 0, windows: Math.min(4, Math.floor(depth / 6)) },
        { axis: 'z', pos: -depth/2 + 0.1, rot: Math.PI, windows: Math.min(4, Math.floor(depth / 6)) }
      ];
      
      sides.forEach(side => {
        for (let floor = 1; floor < floors; floor += 2) {
          for (let w = 0; w < side.windows; w++) {
            if (Math.random() > 0.4) {
              const windowY = floor * 8 - height / 2 + 4;
              const windowX = side.axis === 'x' ? side.pos : (w / side.windows - 0.5) * depth;
              const windowZ = side.axis === 'x' ? (w / side.windows - 0.5) * width : side.pos;
              const mat = Math.random() > 0.75 ? shared.windowMaterialYellow : shared.windowMaterialWhite;
              const window = new THREE.Mesh(shared.windowGeometry, mat);
              window.position.set(baseX + windowX, windowY, baseZ + windowZ);
              window.rotation.y = side.rot;
              window.rotation.x = -Math.PI / 2;
              buildingGroup.add(window);
              cityLights.push(window);
            }
          }
        }
      });
    });
  }

  function createGround() {
    const groundGeometry = new THREE.PlaneGeometry(2000, 2000, 20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a, roughness: 0.8, metalness: 0.1
    });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const lineGeometry = new THREE.PlaneGeometry(2000, 0.5);
    const lineMaterial = new THREE.MeshBasicMaterial({
      color: 0x333333, transparent: true, opacity: 0.3
    });
    for (let i = -400; i <= 400; i += 80) {
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.1, i);
      scene.add(line);
    }
  }

  function createAtmosphere() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(50, 150, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 1000;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;
    directionalLight.shadow.bias = -0.0001;
    scene.add(directionalLight);
    
    // Enable shadow maps
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    buildings.forEach((building, i) => {
      if (i % 8 === 0) {
        const pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
        pointLight.position.set(
          building.position.x,
          building.userData.height * 0.8,
          building.position.z
        );
        scene.add(pointLight);
      }
    });
  }

  function animate() {
    animationId = requestAnimationFrame(animate);
    if (!isVisible) return;
    
    const time = Date.now() * 0.001;
    frameCount++;

    if (camera) {
      const smoothingFactor = 0.08;
      
      smoothCameraPos.x += (targetCameraX - smoothCameraPos.x) * smoothingFactor;
      smoothCameraPos.y += (targetCameraY - smoothCameraPos.y) * smoothingFactor;
      smoothCameraPos.z += (targetCameraZ - smoothCameraPos.z) * smoothingFactor;
      
      // Subtle floating movement for realism
      const floatX = Math.sin(time * 0.08) * 2;
      const floatY = Math.cos(time * 0.12) * 1.5;
      
      camera.position.x = smoothCameraPos.x + floatX;
      camera.position.y = smoothCameraPos.y + floatY;
      camera.position.z = smoothCameraPos.z;
      
      // Look at the calculated look-ahead point
      if (camera.userData.lookAtX !== undefined) {
        camera.lookAt(
          camera.userData.lookAtX,
          camera.userData.lookAtY,
          camera.userData.lookAtZ
        );
      } else {
        camera.lookAt(0, 30, 0);
      }
    }

    // Twinkle lights every 2nd frame (shared materials - only update a subset)
    if (frameCount % 2 === 0 && cityLights.length > 0) {
      const twinkle = Math.sin(time * 2) * 0.3 + 0.7;
      shared.windowMaterialWhite.opacity = twinkle * 0.8;
      shared.windowMaterialWhite.emissiveIntensity = twinkle * 1.5;
      shared.windowMaterialYellow.opacity = twinkle * 0.8;
      shared.windowMaterialYellow.emissiveIntensity = twinkle * 1.5;
    }

    if (frameCount % 4 === 0) {
      buildings.forEach((bg, i) => {
        const parallax = Math.sin(time * 0.03 + i * 0.1) * 0.3;
        bg.rotation.y = parallax * 0.005;
      });
    }

    renderer.render(scene, camera);
  }

  function handleScroll() {
    const scrollY = window.scrollY;
    if (!container) return;

    const sectionTop = container.offsetTop;
    const sectionHeight = container.offsetHeight;
    const windowHeight = window.innerHeight;
    
    const scrollIntoSection = scrollY - sectionTop + windowHeight;
    const progress = Math.max(0, Math.min(1, scrollIntoSection / sectionHeight));
    
    scrollProgress = progress;
    
    // Create a smooth tour path through the city
    // Path curves through the city like a virtual tour
    const pathProgress = progress;
    
    // Camera follows a curved path through the city
    // Start: looking at city from distance
    // Middle: moving through city streets
    // End: elevated view of the city
    
    if (pathProgress < 0.3) {
      // Phase 1: Approaching the city
      const phaseProgress = pathProgress / 0.3;
      targetCameraX = Math.sin(phaseProgress * Math.PI) * 40;
      targetCameraY = 60 - phaseProgress * 20;
      targetCameraZ = 250 - phaseProgress * 100;
    } else if (pathProgress < 0.7) {
      // Phase 2: Moving through the city (tour mode)
      const phaseProgress = (pathProgress - 0.3) / 0.4;
      const curveX = Math.sin(phaseProgress * Math.PI * 2) * 50;
      const curveZ = -50 + phaseProgress * 100;
      targetCameraX = curveX;
      targetCameraY = 40 + Math.sin(phaseProgress * Math.PI) * 15;
      targetCameraZ = 150 - curveZ;
    } else {
      // Phase 3: Elevated overview
      const phaseProgress = (pathProgress - 0.7) / 0.3;
      targetCameraX = Math.sin(phaseProgress * Math.PI) * 30;
      targetCameraY = 55 + phaseProgress * 30;
      targetCameraZ = 50 - phaseProgress * 50;
    }
    
    // Make camera look ahead in the direction of travel
    const lookAheadX = targetCameraX + Math.sin(pathProgress * Math.PI * 2) * 20;
    const lookAheadY = targetCameraY - 10;
    const lookAheadZ = targetCameraZ - 50;
    
    // Update camera look-at point smoothly
    if (camera) {
      const lookAtSmoothing = 0.1;
      camera.userData.lookAtX = (camera.userData.lookAtX || 0) + (lookAheadX - (camera.userData.lookAtX || 0)) * lookAtSmoothing;
      camera.userData.lookAtY = (camera.userData.lookAtY || 30) + (lookAheadY - (camera.userData.lookAtY || 30)) * lookAtSmoothing;
      camera.userData.lookAtZ = (camera.userData.lookAtZ || 0) + (lookAheadZ - (camera.userData.lookAtZ || 0)) * lookAtSmoothing;
    }
    
    // Parallax effect for buildings - creates depth
    buildings.forEach((building, i) => {
      const { baseX, baseZ } = building.userData;
      const parallaxFactor = (i / buildings.length - 0.5) * 0.3;
      const offsetX = Math.sin(pathProgress * Math.PI * 2) * parallaxFactor * 20;
      const offsetZ = pathProgress * parallaxFactor * 30;
      building.position.x = baseX + offsetX;
      building.position.z = baseZ + offsetZ;
    });
  }

  let resizeTimeout;
  function handleResize() {
    if (!container || !camera || !renderer) return;
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const rect = container.getBoundingClientRect();
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2));
      renderer.setSize(rect.width, rect.height);
    }, 100);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThree);
  } else {
    initThree();
  }

  function onScrollThrottled() {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(() => {
        handleScroll();
        scrollTicking = false;
      });
    }
  }

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        isVisible = e.isIntersecting;
      });
    },
    { rootMargin: '100px', threshold: 0 }
  );
  if (container) intersectionObserver.observe(container);

  window.addEventListener('scroll', onScrollThrottled, { passive: true });
  window.addEventListener('resize', handleResize);
  handleScroll();

  window.addEventListener('beforeunload', () => {
    if (animationId) cancelAnimationFrame(animationId);
    scene?.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
    [shared.windowGeometry, shared.edgeGeometry, shared.ledgeGeometry, shared.roofGeometry].forEach(g => g?.dispose());
    [shared.edgeMaterial, shared.ledgeMaterial, shared.roofMaterial, shared.windowMaterialWhite, shared.windowMaterialYellow].forEach(m => m?.dispose());
    renderer?.dispose();
  });
})();
