const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The React root now lives inside main, so we need to move the mount point in main.tsx
// Actually, I already replaced main with <main id="react-main-root">
// Let's modify main.tsx to mount App into react-main-root, and keep Modals in react-root

let mainTsx = fs.readFileSync('src/main.tsx', 'utf8');
mainTsx = mainTsx.replace(
  "const rootElement = document.getElementById('react-root');",
  `const rootElement = document.getElementById('react-root');
const mainRootElement = document.getElementById('react-main-root');

if (mainRootElement) {
  // We mount the App directly into the main container
  ReactDOM.createRoot(mainRootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}`
);
mainTsx = mainTsx.replace("      <App />\n", "");

fs.writeFileSync('src/main.tsx', mainTsx);
