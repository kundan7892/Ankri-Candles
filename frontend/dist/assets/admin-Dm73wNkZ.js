import"./styles-kGPDpGPG.js";function k(){const f=document.getElementById("admin-login-box"),w=document.getElementById("admin-dashboard-box"),b=document.getElementById("admin-login-form"),A=document.getElementById("login-error-msg"),v=document.getElementById("toggle-pass-visibility"),h=document.getElementById("admin-pass"),$=document.getElementById("btn-admin-logout"),_=document.getElementById("btn-clear-logs"),p=document.getElementById("logs-table-body"),g=document.getElementById("bookings-table-body"),y=document.getElementById("payments-table-body"),i=document.getElementById("dashboard-title"),I=document.getElementById("toast-notification"),x=document.getElementById("toast-message");let a="inquiries",u=null,c=JSON.parse(sessionStorage.getItem("geocodeCache")||"{}");T();function T(){E(),P(),window.lucide&&window.lucide.createIcons()}function E(){sessionStorage.getItem("superadmin_authenticated")==="true"?(f&&f.classList.add("hidden"),w&&w.classList.remove("hidden"),S()):(f&&f.classList.remove("hidden"),w&&w.classList.add("hidden"))}function l(e){!x||!I||(x.textContent=e,I.classList.add("active"),setTimeout(()=>{I.classList.remove("active")},3e3))}b&&b.addEventListener("submit",async e=>{e.preventDefault();const t=document.getElementById("admin-user").value.trim(),n=h.value.trim();try{const o=await fetch((typeof window.API_BASE_URL=="string"?window.API_BASE_URL:"http://localhost:5000")+"/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:t,password:n})}),s=await o.json();o.ok&&s.success?(sessionStorage.setItem("superadmin_authenticated","true"),A.textContent="",b.reset(),E(),l("Authenticated successfully. Welcome, Super Admin!")):(A.textContent=s.message||"Invalid credentials. Please try again.","vibrate"in navigator&&navigator.vibrate([60,60]))}catch(o){console.error(o),A.textContent="Server connection error. Please run local server first."}}),v&&h&&v.addEventListener("click",()=>{const e=h.getAttribute("type")==="password"?"text":"password";h.setAttribute("type",e);const t=v.querySelector("i");t&&(e==="password"?t.setAttribute("data-lucide","eye"):t.setAttribute("data-lucide","eye-off"),window.lucide&&window.lucide.createIcons())});function P(){const e=document.querySelectorAll("[data-tab]");e.forEach(t=>{t.addEventListener("click",async()=>{e.forEach(s=>s.classList.remove("active")),t.classList.add("active"),a=t.getAttribute("data-tab"),document.querySelectorAll(".tab-panel").forEach(s=>s.classList.add("hidden"));const o=document.getElementById(`tab-${a}-content`);o&&o.classList.remove("hidden"),i&&(a==="inquiries"&&(i.textContent="Bulk Inquiries Database"),a==="bookings"&&(i.textContent="Order Bookings Database"),a==="payments"&&(i.textContent="Payment Transaction Records"),a==="whatsapp"&&(i.textContent="WhatsApp Sent Reminders Log"),a==="wheel-rewards"&&(i.textContent="Wheel Spin Rewards Log"),a==="locations"&&(i.textContent="Delivery Locations Dashboard")),await S()})})}async function S(){a==="inquiries"?await M():a==="bookings"?await R():a==="payments"?await C():a==="whatsapp"?await q():a==="wheel-rewards"?await U():a==="locations"&&await H()}async function M(){if(!p)return;p.innerHTML='<tr><td colspan="5" style="text-align: center;">Loading inquiries...</td></tr>';let e=[];try{const t=await fetch((typeof window.API_BASE_URL=="string"?window.API_BASE_URL:"http://localhost:5000")+"/api/inquiries");t.ok&&(e=await t.json())}catch(t){console.error(t)}if(e.length===0){p.innerHTML=`
        <tr>
          <td colspan="5" style="text-align: center; padding: 4rem 1.25rem; color: var(--text-secondary);">
            <div style="font-size: 2.2rem; margin-bottom: 0.5rem; text-align: center;">📁</div>
            No inquiries received yet. Submit a test inquiry from the storefront to see logs here.
          </td>
        </tr>
      `;return}p.innerHTML="",e.forEach(t=>{const n=document.createElement("tr"),o=t.type==="bulk"?"bulk":"gifting",s=t.type==="bulk"?"Bulk Modal":"Gifting Form",m=new Date(t.timestamp).toLocaleString();let r="",d="",B="";t.type==="bulk"?(r=`
          <strong>${t.name}</strong><br>
          <span style="font-size:0.75rem; color:var(--text-secondary);">${t.email}</span><br>
          <span style="font-size:0.75rem; color:var(--text-secondary);">${t.phone}</span>
        `,d=`
          <strong>Qty:</strong> ${t.qty}<br>
          <strong>Subj:</strong> ${t.subject}
        `,B=`<div class="message-cell">${t.message||""}</div>`):(r=`
          <strong>${t.name}</strong><br>
          <span style="font-size:0.75rem; color:var(--text-secondary);">${t.email}</span>
        `,d=`
          <strong>Company:</strong> ${t.org||"N/A"}<br>
          <strong>Est. Qty:</strong> ${t.qty||"N/A"} units
        `,B=`<div class="message-cell">${t.details||""}</div>`),n.innerHTML=`
        <td><span class="inquiry-badge ${o}">${s}</span></td>
        <td style="white-space: nowrap;">${m}</td>
        <td>${r}</td>
        <td>${d}</td>
        <td>${B}</td>
      `,p.appendChild(n)})}async function R(){if(!g)return;g.innerHTML='<tr><td colspan="5" style="text-align: center;">Loading bookings...</td></tr>';let e=[];try{const t=await fetch((typeof window.API_BASE_URL=="string"?window.API_BASE_URL:"http://localhost:5000")+"/api/bookings");t.ok&&(e=await t.json())}catch(t){console.error(t)}if(e.length===0){g.innerHTML=`
        <tr>
          <td colspan="5" style="text-align: center; padding: 4rem 1.25rem; color: var(--text-secondary);">
            <div style="font-size: 2.2rem; margin-bottom: 0.5rem; text-align: center;">🛍️</div>
            No candle orders booked yet. Place an order from the shop cart.
          </td>
        </tr>
      `;return}g.innerHTML="",e.forEach(t=>{const n=document.createElement("tr"),o=new Date(t.timestamp).toLocaleString(),s=`
        <strong>${t.customerInfo.name}</strong><br>
        <span style="font-size:0.75rem; color:var(--text-secondary);">${t.customerInfo.email}</span><br>
        <span style="font-size:0.75rem; color:var(--text-secondary);">${t.customerInfo.phone}</span><br>
        <span style="font-size:0.75rem; color:var(--text-danger);">${t.customerInfo.address}</span>
      `,m=t.items.map(r=>r.isCustom?`• Custom: <strong>${r.name}</strong> (${r.description}) x${r.quantity}`:`• Signature: <strong>${r.name}</strong> (${r.description||"Standard"}) x${r.quantity}`).join("<br>");n.innerHTML=`
        <td style="font-weight: bold; color: var(--gold-primary);">${t.orderId}</td>
        <td style="white-space: nowrap;">${o}</td>
        <td>${s}</td>
        <td style="font-size: 0.8rem; line-height: 1.4;">${m}</td>
        <td style="font-weight: bold;">₹${t.total}</td>
      `,g.appendChild(n)})}async function C(){if(!y)return;y.innerHTML='<tr><td colspan="6" style="text-align: center;">Loading payments...</td></tr>';let e=[];try{const t=await fetch((typeof window.API_BASE_URL=="string"?window.API_BASE_URL:"http://localhost:5000")+"/api/payments");t.ok&&(e=await t.json())}catch(t){console.error(t)}if(e.length===0){y.innerHTML=`
        <tr>
          <td colspan="6" style="text-align: center; padding: 4rem 1.25rem; color: var(--text-secondary);">
            <div style="font-size: 2.2rem; margin-bottom: 0.5rem; text-align: center;">💳</div>
            No payment records found yet.
          </td>
        </tr>
      `;return}y.innerHTML="",e.forEach(t=>{const n=document.createElement("tr"),o=new Date(t.timestamp).toLocaleString(),s=t.status==="Success"?"bulk":"gifting";n.innerHTML=`
        <td style="font-weight: bold;">${t.transactionId}</td>
        <td style="color: var(--gold-primary); font-weight: bold;">${t.orderId}</td>
        <td style="white-space: nowrap;">${o}</td>
        <td style="font-weight: bold;">₹${t.amount}</td>
        <td>${t.paymentMethod}</td>
        <td><span class="inquiry-badge ${s}">${t.status}</span></td>
      `,y.appendChild(n)})}async function q(){const e=document.getElementById("whatsapp-table-body");if(!e)return;e.innerHTML='<tr><td colspan="5" style="text-align: center;">Loading WhatsApp logs...</td></tr>';let t=[];try{const n=await fetch((typeof window.API_BASE_URL=="string"?window.API_BASE_URL:"http://localhost:5000")+"/api/whatsapp-logs");n.ok&&(t=await n.json())}catch(n){console.error(n)}if(t.length===0){e.innerHTML=`
        <tr>
          <td colspan="5" style="text-align: center; padding: 4rem 1.25rem; color: var(--text-secondary);">
            <div style="font-size: 2.2rem; margin-bottom: 0.5rem; text-align: center;">📩</div>
            No WhatsApp reminder logs sent yet.
          </td>
        </tr>
      `;return}e.innerHTML="",t.forEach(n=>{const o=document.createElement("tr"),s=new Date(n.timestamp).toLocaleString();o.innerHTML=`
        <td style="font-weight: bold;">${n.customerName||"Valued Customer"}</td>
        <td>${n.phone}</td>
        <td style="font-size: 0.8rem; line-height: 1.4;">${n.message}</td>
        <td style="white-space: nowrap;">${s}</td>
        <td><span class="inquiry-badge bulk">${n.status}</span></td>
      `,e.appendChild(o)})}async function U(){const e=document.getElementById("wheel-rewards-table-body");if(!e)return;e.innerHTML='<tr><td colspan="4" style="text-align: center;">Loading spin rewards...</td></tr>';let t=[];try{const n=await fetch((typeof window.API_BASE_URL=="string"?window.API_BASE_URL:"http://localhost:5000")+"/api/spin-rewards");n.ok&&(t=await n.json())}catch(n){console.error(n)}if(t.length===0){e.innerHTML=`
        <tr>
          <td colspan="4" style="text-align: center; padding: 4rem 1.25rem; color: var(--text-secondary);">
            <div style="font-size: 2.2rem; margin-bottom: 0.5rem; text-align: center;">🎁</div>
            No spin rewards won yet.
          </td>
        </tr>
      `;return}e.innerHTML="",t.forEach(n=>{const o=document.createElement("tr"),s=new Date(n.timestamp).toLocaleString();o.innerHTML=`
        <td style="font-weight: bold; color: var(--gold-primary);">${n.phone}</td>
        <td>${n.country}</td>
        <td><span class="inquiry-badge bulk" style="background: var(--gold-primary) !important; color: #0A0E0C !important; font-weight: bold;">${n.reward}</span></td>
        <td style="white-space: nowrap;">${s}</td>
      `,e.appendChild(o)})}async function H(){u||(u=L.map("admin-map").setView([12.9716,77.5946],11),L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",{attribution:"&copy; OpenStreetMap &copy; CARTO"}).addTo(u)),setTimeout(()=>{u.invalidateSize()},150);let e=[];try{const t=await fetch((typeof window.API_BASE_URL=="string"?window.API_BASE_URL:"http://localhost:5000")+"/api/bookings");t.ok&&(e=await t.json())}catch(t){console.error("Failed to fetch bookings for map",t);return}if(e.length!==0){window.mapMarkersLayer?window.mapMarkersLayer.clearLayers():window.mapMarkersLayer=L.layerGroup().addTo(u);for(const t of e){let n=t.customerInfo.address;if(!n)continue;let o=null;if(c[n])o=c[n];else try{const s=encodeURIComponent(n),r=await(await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${s}&limit=1`)).json();r&&r.length>0?(o=[parseFloat(r[0].lat),parseFloat(r[0].lon)],c[n]=o,sessionStorage.setItem("geocodeCache",JSON.stringify(c))):(c[n]="not_found",sessionStorage.setItem("geocodeCache",JSON.stringify(c))),await new Promise(d=>setTimeout(d,1100))}catch{console.error("Geocoding failed for",n)}if(o&&o!=="not_found"){const s=o[0]+(Math.random()-.5)*.04,m=o[1]+(Math.random()-.5)*.04,r=L.divIcon({className:"map-dot-marker",iconSize:[24,24],iconAnchor:[12,12],popupAnchor:[0,-12],html:""}),d=`
            <div style="text-align: left; font-family: var(--font-sans); color: var(--text-primary); padding: 5px;">
              <strong style="margin-bottom:4px; display:block; color: var(--gold-primary);">${t.orderId}</strong>
              <div style="font-size: 0.85rem; line-height: 1.4;">
                <strong>${t.customerInfo.name}</strong><br>
                ${n}
              </div>
            </div>
         `;L.marker([s,m],{icon:r}).addTo(window.mapMarkersLayer).bindPopup(d)}}}}$&&$.addEventListener("click",()=>{sessionStorage.removeItem("superadmin_authenticated"),E(),l("Logged out of Admin Session.")}),_&&_.addEventListener("click",async()=>{let e="",t="";if(a==="inquiries")e=(typeof window.API_BASE_URL=="string"?window.API_BASE_URL:"http://localhost:5000")+"/api/inquiries",t="inquiry logs";else if(a==="bookings")e=(typeof window.API_BASE_URL=="string"?window.API_BASE_URL:"http://localhost:5000")+"/api/bookings",t="order bookings";else if(a==="payments")e=(typeof window.API_BASE_URL=="string"?window.API_BASE_URL:"http://localhost:5000")+"/api/payments",t="payment transaction details";else if(a==="whatsapp")e=(typeof window.API_BASE_URL=="string"?window.API_BASE_URL:"http://localhost:5000")+"/api/whatsapp-logs",t="WhatsApp reminder logs";else if(a==="wheel-rewards")e=(typeof window.API_BASE_URL=="string"?window.API_BASE_URL:"http://localhost:5000")+"/api/spin-rewards",t="spin wheel rewards";else if(a==="locations"){l("Cannot clear bookings directly from the Map View.");return}if(confirm(`Are you sure you want to delete all local ${t}? This cannot be undone.`))try{(await fetch(e,{method:"DELETE"})).ok?(await S(),l(`${t} database cleared.`)):l("Error clearing logs from database.")}catch(n){console.error(n),l("Failed to clear database logs.")}})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",k):k();
