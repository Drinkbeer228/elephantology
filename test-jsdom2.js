import { JSDOM, VirtualConsole } from 'jsdom';
const virtualConsole = new VirtualConsole();
virtualConsole.on("jsdomError", (error) => console.log("JSDOMERROR:", error));
virtualConsole.on("error", (error) => console.log("ERROR:", error));
virtualConsole.on("log", (msg) => console.log("LOG:", msg));

JSDOM.fromURL("http://localhost:3000/", {
  runScripts: "dangerously",
  resources: "usable",
  virtualConsole
}).then(dom => {
  setTimeout(() => {
    console.log("BODY HTML:", dom.window.document.body.innerHTML);
    process.exit(0);
  }, 2000);
});
