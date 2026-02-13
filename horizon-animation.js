// Real Estate City Animation - Three.js
(function() {
  'use strict';

  // Check if Three.js and GSAP are loaded
  if (typeof THREE === 'undefined' || typeof gsap === 'undefined') {
    console.error('Three.js or GSAP not loaded');
    return;
  }

  // Register GSAP ScrollTrigger plugin
  if (gsap.registerPlugin) {
    gsap.registerPlugin(ScrollTrigger);
  }

  const container = document.querySelector('.horizon-section');
  const canvas = document.getElementById('horizon-canvas');
  
  if (!container || !canvas) {
    return;
  }

  // Three.js setup
  let scene, camera, renderer;
  let buildings = [];
  let cityLights = [];
  let ground = null;
  let animationId = null;
  
  const smoothCameraPos = { x: 0, y: 50, z: 200 };
  let targetCameraX = 0;
  let targetCameraY = 50;
  let targetCameraZ = 200;
  
  let scrollProgress = 0;
  let isReady = false;

  // Initialize Three.js
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

    // Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    
    const containerRect = container.getBoundingClientRect();
    renderer.setSize(containerRect.width, containerRect.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
    const buildingCount = 50;
    const spacing = 30;
    const startX = -(buildingCount * spacing) / 2;

    for (let i = 0; i < buildingCount; i++) {
      const width = 18 + Math.random() * 25;
      const depth = 18 + Math.random() * 25;
      const height = 40 + Math.random() * 140;
      const x = startX + i * spacing + (Math.random() - 0.5) * 15;
      const z = (Math.random() - 0.5) * 150;

      // Create building group for better 3D structure
      const buildingGroup = new THREE.Group();
      
      // Main building body
      const geometry = new THREE.BoxGeometry(width, height, depth);
      
      // Building color - mix of white, light gray, and accent red
      const colorChoice = Math.random();
      let buildingColor;
      if (colorChoice < 0.7) {
        buildingColor = new THREE.Color(0xffffff);
      } else if (colorChoice < 0.9) {
        buildingColor = new THREE.Color(0xf5f5f5);
      } else {
        buildingColor = new THREE.Color(0xd70f26); // Accent red
      }

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

      // Add architectural details for 3D depth
      // Add corner edges/columns
      const edgeWidth = 0.8;
      const edgeGeometry = new THREE.BoxGeometry(edgeWidth, height, edgeWidth);
      const edgeMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        metalness: 0.5,
        roughness: 0.4
      });

      // Four corners
      const corners = [
        { x: width/2 - edgeWidth/2, z: depth/2 - edgeWidth/2 },
        { x: -width/2 + edgeWidth/2, z: depth/2 - edgeWidth/2 },
        { x: width/2 - edgeWidth/2, z: -depth/2 + edgeWidth/2 },
        { x: -width/2 + edgeWidth/2, z: -depth/2 + edgeWidth/2 }
      ];

      corners.forEach(corner => {
        const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
        edge.position.set(corner.x, height / 2, corner.z);
        edge.castShadow = true;
        buildingGroup.add(edge);
      });

      // Add horizontal bands/ledges every few floors
      const floorHeight = 8;
      const floors = Math.floor(height / floorHeight);
      for (let f = 1; f < floors; f += 3) {
        const ledgeGeometry = new THREE.BoxGeometry(width + 0.5, 0.3, depth + 0.5);
        const ledgeMaterial = new THREE.MeshStandardMaterial({
          color: 0xaaaaaa,
          metalness: 0.6,
          roughness: 0.3
        });
        const ledge = new THREE.Mesh(ledgeGeometry, ledgeMaterial);
        ledge.position.y = f * floorHeight;
        buildingGroup.add(ledge);
      }

      // Add roof details
      const roofGeometry = new THREE.BoxGeometry(width + 1, 2, depth + 1);
      const roofMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.7,
        roughness: 0.2
      });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.y = height + 1;
      buildingGroup.add(roof);

      buildingGroup.position.set(x, 0, z);
      
      // Store building data for lights
      buildingGroup.userData = {
        width,
        height,
        depth,
        floors: Math.floor(height / 8),
        baseX: x,
        baseZ: z
      };

      scene.add(buildingGroup);
      buildings.push(buildingGroup);
    }
  }

  function createCityLights() {
    cityLights = [];
    
    buildings.forEach((buildingGroup, i) => {
      const { width, height, depth, floors, baseX, baseZ } = buildingGroup.userData;
      
      // Create windows on all four sides
      const sides = [
        { axis: 'x', pos: width/2 - 0.1, rot: Math.PI/2, windows: Math.floor(width / 5) },
        { axis: 'x', pos: -width/2 + 0.1, rot: -Math.PI/2, windows: Math.floor(width / 5) },
        { axis: 'z', pos: depth/2 - 0.1, rot: 0, windows: Math.floor(depth / 5) },
        { axis: 'z', pos: -depth/2 + 0.1, rot: Math.PI, windows: Math.floor(depth / 5) }
      ];
      
      sides.forEach(side => {
        for (let floor = 1; floor < floors; floor++) {
          for (let w = 0; w < side.windows; w++) {
            if (Math.random() > 0.25) { // 75% chance of lit window
              const windowY = floor * 8 - height / 2 + 4;
              let windowX, windowZ;
              
              if (side.axis === 'x') {
                windowX = side.pos;
                windowZ = (w / side.windows - 0.5) * width;
              } else {
                windowX = (w / side.windows - 0.5) * depth;
                windowZ = side.pos;
              }

              const lightGeometry = new THREE.PlaneGeometry(3, 4);
              const lightColor = Math.random() > 0.75 
                ? new THREE.Color(0xffaa00) // Warm yellow
                : new THREE.Color(0xffffff); // White
              
              const lightMaterial = new THREE.MeshBasicMaterial({
                color: lightColor,
                emissive: lightColor,
                emissiveIntensity: 1.8,
                transparent: true,
                opacity: 0.9
              });

              const window = new THREE.Mesh(lightGeometry, lightMaterial);
              window.position.set(
                baseX + windowX,
                windowY,
                baseZ + windowZ
              );
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
    const groundGeometry = new THREE.PlaneGeometry(2000, 2000, 50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.8,
      metalness: 0.1
    });

    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Add road lines
    for (let i = -500; i < 500; i += 50) {
      const lineGeometry = new THREE.PlaneGeometry(2000, 0.5);
      const lineMaterial = new THREE.MeshBasicMaterial({
        color: 0x333333,
        transparent: true,
        opacity: 0.3
      });
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

    // Directional light (sun/moon) - enhanced for better 3D shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(50, 150, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
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

    // Point lights for building glow
    buildings.forEach((building, i) => {
      if (i % 5 === 0) {
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
    
    const time = Date.now() * 0.001;

    // Smooth camera movement with tour-like feel
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

    // Animate city lights (twinkling effect)
    cityLights.forEach((light, i) => {
      const twinkle = Math.sin(time * 2 + i * 0.1) * 0.3 + 0.7;
      light.material.opacity = twinkle * 0.8;
      light.material.emissiveIntensity = twinkle * 1.5;
    });

    // Subtle building rotation for 3D depth perception
    buildings.forEach((buildingGroup, i) => {
      const parallax = Math.sin(time * 0.03 + i * 0.1) * 0.3;
      buildingGroup.rotation.y = parallax * 0.005;
    });

    renderer.render(scene, camera);
  }

  // Scroll handling - Tour-like camera movement
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

  // Handle resize
  function handleResize() {
    if (!container || !camera || !renderer) return;
    
    const containerRect = container.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThree);
  } else {
    initThree();
  }

  window.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', handleResize);
  handleScroll();

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    
    buildings.forEach(building => {
      building.geometry.dispose();
      building.material.dispose();
    });

    cityLights.forEach(light => {
      light.geometry.dispose();
      light.material.dispose();
    });

    if (ground) {
      ground.geometry.dispose();
      ground.material.dispose();
    }

    if (renderer) {
      renderer.dispose();
    }
  });
})();
