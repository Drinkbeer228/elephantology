const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", (err) => {
  console.error("JSDOM Error:", err.message, err.stack);
});
virtualConsole.on("jsdomError", (err) => {
  console.error("JSDOM JS Error:", err.message, err.detail);
});

const dom = new JSDOM(html, { runScripts: "dangerously", virtualConsole, url: "http://localhost:3000/" });
console.log("JSDOM initialized.");
