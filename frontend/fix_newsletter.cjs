const fs = require('fs');

let content = fs.readFileSync('c:/Ankri Candle/frontend/index.html', 'utf-8');
const targetRegexHtml = /<form class="newsletter-form-premium" id="newsletter-form">[\s\S]*?<\/form>/;
const replacementHtml = `<form class="newsletter-form-premium" id="newsletter-form">
  <div class="premium-input-group glass-input">
    <input type="email" placeholder="Your email address..." required style="padding-left: 20px;">
    <button type="submit" aria-label="Subscribe" class="premium-submit-btn">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    </button>
  </div>
</form>`;

if (targetRegexHtml.test(content)) {
    content = content.replace(targetRegexHtml, replacementHtml);
    fs.writeFileSync('c:/Ankri Candle/frontend/index.html', content, 'utf-8');
    console.log('Replaced HTML');
} else {
    console.log('HTML NOT replaced');
}

let styles = fs.readFileSync('c:/Ankri Candle/frontend/src/css/styles.css', 'utf-8');
const targetRegexStylesBtn = /\.premium-submit-btn \{[\s\S]*?\}\n/g;
const replacementStylesBtn = `.premium-submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--gold-primary, #D4AF37);
  color: #fff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
  flex-shrink: 0;
}
`;

const targetRegexStylesHover = /\.premium-submit-btn:hover \{[\s\S]*?\}\n/g;
const replacementStylesHover = `.premium-submit-btn:hover {
  background: var(--gold-light, #E6C24A);
  transform: rotate(-10deg) scale(1.05);
  box-shadow: 0 6px 16px rgba(212, 175, 55, 0.4);
}
`;

const targetRegexStylesIcon = /\.premium-submit-btn i \{[\s\S]*?\}\n/g;
const targetRegexStylesIconHover = /\.premium-submit-btn:hover i \{[\s\S]*?\}\n/g;

styles = styles.replace(targetRegexStylesBtn, replacementStylesBtn)
    .replace(targetRegexStylesHover, replacementStylesHover)
    .replace(targetRegexStylesIcon, '')
    .replace(targetRegexStylesIconHover, '');

const inputIconWrapperRegex = /\.input-icon-wrapper \{[\s\S]*?\.input-icon-wrapper i \{[\s\S]*?\}\n/g;
styles = styles.replace(inputIconWrapperRegex, `.input-icon-wrapper { display: none; }\n`);

const premiumInputGroupInputGroupRegex = /\.premium-input-group \{[\s\S]*?overflow: hidden;\r?\n\}/;
const newPremiumInputGroup = `.premium-input-group {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-glass, #ffffff);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 50px;
  padding: 6px 6px 6px 16px;
  box-shadow: 0 8px 24px rgba(19, 34, 28, 0.05), inset 0 2px 6px rgba(255, 255, 255, 0.6);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
}`;
styles = styles.replace(premiumInputGroupInputGroupRegex, newPremiumInputGroup);

fs.writeFileSync('c:/Ankri Candle/frontend/src/css/styles.css', styles, 'utf-8');
console.log('Replaced CSS');
