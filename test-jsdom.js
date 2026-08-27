import { JSDOM, VirtualConsole } from 'jsdom';
import fs from 'fs';

const virtualConsole = new VirtualConsole();
virtualConsole.on("error", (error) => {
  console.log("JSDOM ERROR:", error);
});
virtualConsole.on("jsdomError", (error) => {
  console.log("JSDOM JSDOMERROR:", error);
});
virtualConsole.on("log", (msg) => {
  console.log("JSDOM LOG:", msg);
});

JSDOM.fromURL("http://localhost:3000/", {
  runScripts: "dangerously",
  resources: "usable",
  virtualConsole
}).then(dom => {
  setTimeout(() => {
    console.log("Rendered HTML:", dom.window.document.getElementById('root').innerHTML);
    process.exit(0);
  }, 2000);
}).catch(e => console.error(e));
