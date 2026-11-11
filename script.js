const $=s=>document.querySelector(s);
const DAY=864e5;
const today=()=>{const d=new Date();d.setHours(0,0,0,0);return d};
const fmt=d=>d.toLocaleDateString("en-GB").replace(/\//g,"-");
const iso=d=>new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
const plus=n=>new Date(today().getTime()+n*DAY);
let products=[
 ["Milk","B1025",1,"Aisle 3",50],["Bread","B2011",3,"Aisle 2",40],["Juice","J1008",7,"Aisle 5",30],
 ["Yogurt","Y3005",0,"Aisle 4",20],["Cheese","C4002",16,"Aisle 1",25],["Butter","B5007",21,"Aisle 2",15],
 ["Apple Juice","AJ100",11,"Aisle 5",35],["Eggs","E7001",2,"Aisle 4",60],["Cream","CR220",5,"Aisle 3",18],["Rice","R9000",120,"Aisle 1",80]
].map(a=>({name:a[0],batch:a[1],exp:plus(a[2]),aisle:a[3],qty:a[4]}));
const left=p=>Math.round((p.exp-today())/DAY);
function st(p){const d=left(p);
 if(d<=0)return["Expires Today","red"];if(d==1)return["Expires Tomorrow","red"];
 if(d<=3)return["Expires in "+d+" Days","org"];if(d<=7)return["Expires in "+d+" Days","yel"];return["Safe","grn"]}
const pill=p=>{const[t,c]=st(p);return `<span class="pill ${c}">${t}</span>`};
const sorted=()=>[...products].sort((a,b)=>a.exp-b.exp);
const prob=p=>{const d=left(p);return d<=0?5:d==1?15:Math.min(95,Math.round(d*9+55-(d<4?30:0)))};
const rec=p=>{const d=left(p),pr=prob(p);return d<=0?["Remove / Heavy Discount","red"]:pr<40?["Apply 30% Discount","org"]:["Keep on Shelf","grn"]};
const disc=p=>{const d=left(p);return d<=0?60:d==1?50:d<=3?30:d<=7?10:0};
const toast=m=>{const t=$("#toast");t.textContent=m;t.style.display="block";setTimeout(()=>t.style.display="none",2200)};

function login(){ if($("#u").value==="admin"&&$("#p").value==="1234"){$("#login").style.display="none";$("#app").style.display="block";go("dash")}else $("#lerr").textContent="Wrong username or password (try admin / 1234)" }
function logout(){$("#app").style.display="none";$("#login").style.display="flex"}
document.querySelector("nav").addEventListener("click",e=>{const v=e.target.dataset.v;if(v)go(v)});
function go(v){
 document.querySelectorAll("nav a").forEach(a=>a.classList.toggle("on",a.dataset.v===v));
 document.querySelector("nav").classList.remove("open");
 $("#view").innerHTML=V[v]();window.scrollTo(0,0);if(A[v])A[v]();
}
const nav=(v,t)=>`<button class="${t}" onclick="go('${v}')">`;

const V={
dash(){
 const d=products.map(left),n=x=>d.filter(x).length;
 const t=products.length,w7=n(x=>x<=7),w3=n(x=>x<=3),w0=n(x=>x<=0),safe=t-w7;
 const a=w0,b=n(x=>x>0&&x<=3),c=n(x=>x>3&&x<=7);
 const p1=a/t*100,p2=p1+b/t*100,p3=p2+c/t*100;
 const recent=sorted().filter(p=>left(p)<=3).slice(0,3).map(p=>`<div class="al"><span>⚠️</span><div><b>${p.name} (${p.batch}) - ${st(p)[0]}</b><small>${p.aisle}</small></div></div>`).join("");
 return `<div class="top"><h1 style="margin:0">DASHBOARD</h1><small>${new Date().toLocaleString()} 🔔</small></div>
 <div class="grid4"><div class="stat s1"><small>Total Products</small><strong>${t}</strong></div><div class="stat s2"><small>Expiring in 7 Days</small><strong>${w7}</strong></div><div class="stat s3"><small>Expiring in 3 Days</small><strong>${w3}</strong></div><div class="stat s4"><small>Expiring Today</small><strong>${w0}</strong></div></div>
 <div class="two"><div class="card"><h3>EXPIRY OVERVIEW</h3><div class="pie" style="background:conic-gradient(var(--red) 0 ${p1}%,var(--org) ${p1}% ${p2}%,var(--yel) ${p2}% ${p3}%,var(--grn) ${p3}% 100%)"></div>
 <div class="leg" style="margin-top:12px"><div><i class="dot" style="background:var(--red)"></i>Expiring Today (${a})</div><div><i class="dot" style="background:var(--org)"></i>Expiring in 3 Days (${b})</div><div><i class="dot" style="background:var(--yel)"></i>Expiring in 7 Days (${c})</div><div><i class="dot" style="background:var(--grn)"></i>Safe (${safe})</div></div></div>
 <div class="card"><h3>RECENT ALERTS</h3>${recent||"No urgent alerts. Nothing expires in the next 3 days."}</div></div>
 <div class="btns">${nav("ai","b-pur")}AI PREDICTION</button>${nav("heat","b-grn")}HEAT MAP</button>${nav("disc","b-org")}DISCOUNT RECOMMENDATION</button>${nav("alert","b-red")}VIEW ALERTS</button></div>`},
add(){return `<h1>ADD NEW PRODUCT</h1><div class="form">
 <label for="n">Product Name</label><input id="n"><label for="b">Batch Number</label><input id="b">
 <label for="e">Expiry Date</label><input id="e" type="date"><label for="a">Shelf Location</label><input id="a" placeholder="Aisle 3">
 <label for="q">Quantity</label><input id="q" type="number" min="1"></div>
 <div class="btns"><button class="b-grn" onclick="saveP()">SAVE</button><button class="b-yel" onclick="clr()">CLEAR</button>${nav("list","b-gry")}BACK</button></div>`},
list(){return `<h1>ALL PRODUCTS</h1><div class="bar"><input id="s" placeholder="Search product..." oninput="rows()" style="max-width:300px"></div>
 <div class="tw"><table><thead><tr><th>ID</th><th>Product Name</th><th>Batch</th><th>Expiry Date</th><th>Shelf</th><th>Qty</th><th>Days Left</th><th>Status</th></tr></thead><tbody id="tb"></tbody></table></div>`},
alert(){const p=sorted()[0];if(!p)return "<h1>No products</h1>";const[t]=st(p);
 return `<div class="alert"><div><h2>⚠️ EXPIRY ALERT</h2>
 <p><span>Product Name</span>: ${p.name}</p><p><span>Batch Number</span>: ${p.batch}</p><p><span>Shelf Location</span>: ${p.aisle}</p><p><span>Expiry Date</span>: ${fmt(p.exp)}</p><p><span>Days Left</span>: ${left(p)} Day(s)</p><p><span>Status</span>: <b style="color:var(--red)">${t}</b></p>
 <p><b>Recommended Action:</b> ${disc(p)?"Apply "+disc(p)+"% discount":"None"}</p>
 <div class="btns"><button class="b-red" onclick="rmFirst()">REMOVE STOCK</button>${nav("disc","b-org")}APPLY DISCOUNT</button></div></div><div class="bottle">🥛</div></div>`},
ai(){return `<h1>AI SELLING PREDICTION</h1><div class="tw"><table><thead><tr><th>Product Name</th><th>Batch</th><th>Days Left</th><th>Probability of Selling Before Expiry</th><th>Recommendation</th></tr></thead><tbody>${
 sorted().slice(0,8).map(p=>{const r=rec(p),pr=prob(p);return `<tr><td>${p.name}</td><td>${p.batch}</td><td>${left(p)}</td><td><b style="color:var(--${pr<40?"red":"grn"})">${pr}%</b></td><td><b style="color:var(--${r[1]})">${r[0]}</b></td></tr>`}).join("")}</tbody></table></div>`},
heat(){const ai=[...new Set(products.map(p=>p.aisle))].sort();
 return `<h1>EXPIRY HEAT MAP (BY AISLE)</h1>`+ai.map(a=>{const ps=products.filter(p=>p.aisle===a);
  const risk=Math.round(ps.reduce((s,p)=>s+Math.max(0,100-left(p)*10),0)/ps.length);
  const [l,c]=risk>=50?["High Risk","red"]:risk>=25?["Medium Risk","org"]:["Low Risk","grn"];
  return `<div class="hrow"><b>${a}</b><div class="hbar"><i class="${c}" style="width:${Math.max(risk,8)}%"></i></div><span style="width:90px;font-size:13px">${l}</span></div>`}).join("")+
 `<div class="leg" style="display:flex;gap:18px;margin-top:20px"><div><i class="dot" style="background:var(--grn)"></i>Low Risk</div><div><i class="dot" style="background:var(--org)"></i>Medium Risk</div><div><i class="dot" style="background:var(--red)"></i>High Risk</div></div>`},
disc(){const l=sorted().filter(p=>disc(p)>0);return `<h1>DISCOUNT RECOMMENDATION</h1><div class="tw"><table><thead><tr><th>Product Name</th><th>Batch</th><th>Days Left</th><th>Suggested Discount</th></tr></thead><tbody>${
 l.map(p=>`<tr><td>${p.name}</td><td>${p.batch}</td><td>${left(p)}</td><td><b style="color:var(--red)">${disc(p)}%</b></td></tr>`).join("")||"<tr><td colspan=4>No discounts needed.</td></tr>"}</tbody></table></div>`},
rep(){return `<h1>EXPIRY REPORT</h1><div class="bar noprint">From <input type="date" id="f" value="${iso(today())}"> To <input type="date" id="t" value="${iso(plus(30))}"><button class="b-blue" onclick="report()">GENERATE REPORT</button></div>
 <div id="rb"></div><div class="btns"><button class="b-red" onclick="print()">EXPORT PDF</button><button class="b-grn" onclick="csv()">EXPORT EXCEL</button><button class="b-blue" onclick="print()">PRINT</button></div>`}
};
const A={list(){rows()},rep(){report()}};

function rows(){const q=($("#s")?.value||"").toLowerCase();
 $("#tb").innerHTML=sorted().filter(p=>p.name.toLowerCase().includes(q)).map(p=>`<tr><td>${products.indexOf(p)+1}</td><td>${p.name}</td><td>${p.batch}</td><td>${fmt(p.exp)}</td><td>${p.aisle}</td><td>${p.qty}</td><td>${left(p)}</td><td>${pill(p)}</td></tr>`).join("")}
function saveP(){const n=$("#n").value.trim(),b=$("#b").value.trim(),e=$("#e").value,a=$("#a").value.trim(),q=+$("#q").value;
 if(!n||!b||!e||!a||!q){toast("Please fill in every field");return}
 products.push({name:n,batch:b,exp:new Date(e+"T00:00:00"),aisle:a,qty:q});toast("Product saved");go("list")}
function clr(){["n","b","e","a","q"].forEach(i=>$("#"+i).value="")}
function rmFirst(){const p=sorted()[0];products=products.filter(x=>x!==p);toast(p.name+" removed from stock");go("alert")}
let inRange=[];
function report(){const f=new Date($("#f").value+"T00:00:00"),t=new Date($("#t").value+"T00:00:00");
 inRange=sorted().filter(p=>p.exp>=f&&p.exp<=t);
 const exp=products.filter(p=>left(p)<=0).length,risk=products.filter(p=>left(p)>0&&left(p)<=7).length;
 $("#rb").innerHTML=`<div class="rep"><div class="stat s1"><small>Total Products</small><strong>${products.length}</strong></div><div class="stat s4"><small>Expired Products</small><strong>${exp}</strong></div><div class="stat s3"><small>Products at Risk</small><strong>${risk}</strong></div></div>
 <div class="tw"><table><thead><tr><th>Product</th><th>Batch</th><th>Expiry</th><th>Qty</th></tr></thead><tbody>${inRange.map(p=>`<tr><td>${p.name}</td><td>${p.batch}</td><td>${fmt(p.exp)}</td><td>${p.qty}</td></tr>`).join("")||"<tr><td colspan=4>No products expire in this range.</td></tr>"}</tbody></table></div>`}
function csv(){const r=["Product,Batch,Expiry,Shelf,Qty",...inRange.map(p=>[p.name,p.batch,fmt(p.exp),p.aisle,p.qty].join(","))].join("\n");
 const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(r);a.download="expiry_report.csv";a.click()}
