const fs = require('fs');
let html = fs.readFileSync('c:/Ankri Candle/frontend/index.html', 'utf-8');

html = html.replace('<path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"/>', '<path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="transparent"/>');

html = html.replace('<svg class="rotating-text-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">', '<svg class="rotating-text-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: 140px; height: 140px; animation: spin 10s linear infinite;">');

fs.writeFileSync('c:/Ankri Candle/frontend/index.html', html, 'utf-8');
console.log('Fixed HTML SVG');

let css = fs.readFileSync('c:/Ankri Candle/frontend/src/css/styles.css', 'utf-8');
if (!css.includes('@keyframes spin')) {
    css += `\n@keyframes spin { 100% { transform: rotate(360deg); } }\n.rotating-badge-wrapper { position: relative; display: flex; align-items: center; justify-content: center; width: 140px; height: 140px; }\n.center-star { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #D4AF37; width: 24px; height: 24px; }\n`;
}
fs.writeFileSync('c:/Ankri Candle/frontend/src/css/styles.css', css, 'utf-8');
console.log('Fixed CSS keyframes');
