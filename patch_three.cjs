const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const threeScript = `
  <script type="module">
      import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
      import { ColladaLoader } from 'https://unpkg.com/three@0.158.0/examples/jsm/loaders/ColladaLoader.js';
      import { OrbitControls } from 'https://unpkg.com/three@0.158.0/examples/jsm/controls/OrbitControls.js';

      window.init3DViewerIfPresent = function() {
          const container = document.getElementById('skull-3d-viewer');
          if (!container) return;
          
          if (container.querySelector('canvas')) return; // already loaded

          const loading = document.getElementById('viewer-loading');

          const scene = new THREE.Scene();
          scene.background = new THREE.Color(0x1e2230);
          
          const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
          camera.position.set(5, 5, 5);

          const renderer = new THREE.WebGLRenderer({ antialias: true });
          renderer.setSize(container.clientWidth, container.clientHeight);
          renderer.outputColorSpace = THREE.SRGBColorSpace;
          container.appendChild(renderer.domElement);

          const controls = new OrbitControls(camera, renderer.domElement);
          controls.enableDamping = true;
          controls.dampingFactor = 0.05;
          controls.autoRotate = true;
          controls.autoRotateSpeed = 1.0;

          const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
          scene.add(ambientLight);
          
          const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
          dirLight.position.set(10, 10, 10);
          scene.add(dirLight);
          
          const backLight = new THREE.DirectionalLight(0xffffff, 0.8);
          backLight.position.set(-10, 10, -10);
          scene.add(backLight);

          const loader = new ColladaLoader();
          loader.load('/assets/3d_model/model/model.dae', function (collada) {
              const model = collada.scene;
              
              // Apply basic material just in case textures are missing
              model.traverse((child) => {
                  if (child.isMesh) {
                      child.material.side = THREE.DoubleSide;
                  }
              });

              const box = new THREE.Box3().setFromObject(model);
              const center = box.getCenter(new THREE.Vector3());
              const size = box.getSize(new THREE.Vector3());
              
              const maxDim = Math.max(size.x, size.y, size.z);
              const scale = 5 / maxDim;
              model.scale.setScalar(scale);
              
              model.position.sub(center.multiplyScalar(scale));
              
              scene.add(model);
              
              if (loading) loading.style.display = 'none';

          }, undefined, function (error) {
              console.error('Error loading DAE:', error);
              if (loading) loading.innerText = 'Ошибка загрузки модели';
          });

          let animationId;
          function animate() {
              animationId = requestAnimationFrame(animate);
              // Stop rotating if user interacts
              if (controls.state !== -1) { 
                 controls.autoRotate = false;
              }
              controls.update();
              renderer.render(scene, camera);
          }
          animate();

          // Handle resize
          const resizeObserver = new ResizeObserver(() => {
              if(!container || !container.clientWidth) return;
              camera.aspect = container.clientWidth / container.clientHeight;
              camera.updateProjectionMatrix();
              renderer.setSize(container.clientWidth, container.clientHeight);
          });
          resizeObserver.observe(container);
          
          // Clean up if we re-render
          container.addEventListener('DOMNodeRemovedFromDocument', () => {
              cancelAnimationFrame(animationId);
              resizeObserver.disconnect();
              renderer.dispose();
          });
      };
      
      // If the page already has the viewer on load (unlikely but safe)
      window.init3DViewerIfPresent();
  </script>
</body>
</html>`;

if (code.includes('</body>')) {
    code = code.replace('</body>\n</html>', threeScript);
    fs.writeFileSync('index.html', code);
    console.log('Appended 3D viewer logic to index.html');
} else {
    console.log('Could not find body closing tag');
}
