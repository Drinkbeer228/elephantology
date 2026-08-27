const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const targetStr = `              // Apply basic material just in case textures are missing
              model.traverse((child) => {
                  if (child.isMesh) {
                      child.material.side = THREE.DoubleSide;
                  }
              });`;

const newStr = `              // Apply texture
              const texLoader = new THREE.TextureLoader();
              const albedo = texLoader.load('/assets/3d_model/model/textures/default_albedo.jpg');
              albedo.colorSpace = THREE.SRGBColorSpace;
              
              model.traverse((child) => {
                  if (child.isMesh) {
                      if (child.material) {
                          child.material.map = albedo;
                          child.material.side = THREE.DoubleSide;
                          child.material.needsUpdate = true;
                      }
                  }
              });`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, newStr);
    fs.writeFileSync('index.html', code);
    console.log('patched 3D textures');
} else {
    console.log('could not find texture logic in index.html');
}
