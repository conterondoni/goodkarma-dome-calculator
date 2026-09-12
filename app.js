const form = document.querySelector('#dome-form');
const summary = document.querySelector('#summary');
const struts = document.querySelector('#struts');
const material = document.querySelector('#material');
const description = document.querySelector('#model-description');

const fmt = (n, digits = 0) => new Intl.NumberFormat('it-IT', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
const length = n => `${fmt(n, 1)} mm`;

// Normalized icosahedron. Edges are recursively split and projected to the sphere.
// It is intentionally a geometry estimator, not a GoodKarma joint/CAM calculator.
function baseIcosahedron() {
  const p = (1 + Math.sqrt(5)) / 2;
  const v = [[-1,p,0],[1,p,0],[-1,-p,0],[1,-p,0],[0,-1,p],[0,1,p],[0,-1,-p],[0,1,-p],[p,0,-1],[p,0,1],[-p,0,-1],[-p,0,1]];
  const f = [[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
  return { v: v.map(normalize), f };
}
function normalize(a){ const l=Math.hypot(...a); return a.map(x=>x/l); }
function add(a,b){return [a[0]+b[0],a[1]+b[1],a[2]+b[2]];}
function subdivide(mesh, frequency){
  const v=[], f=[], cache=new Map();
  // Barycentric split: each original face becomes frequency² faces (F2=4, F3=9).
  // Normalized coordinates let adjacent icosahedron faces share the exact same vertices.
  const vertex = point => {
    const n=normalize(point), key=n.map(x=>x.toFixed(10)).join('/');
    if(cache.has(key)) return cache.get(key); cache.set(key,v.length); v.push(n); return v.length-1;
  };
  mesh.f.forEach(([ai,bi,ci])=>{
    const a=mesh.v[ai],b=mesh.v[bi],c=mesh.v[ci], local=new Map();
    const get=(i,j)=>{const k=`${i}/${j}`;if(local.has(k))return local.get(k);const w=frequency-i-j;const p=[0,1,2].map(q=>(a[q]*w+b[q]*i+c[q]*j)/frequency);const index=vertex(p);local.set(k,index);return index;};
    for(let i=0;i<frequency;i++) for(let j=0;j<frequency-i;j++){
      f.push([get(i,j),get(i+1,j),get(i,j+1)]);
      if(i+j<frequency-1) f.push([get(i+1,j),get(i+1,j+1),get(i,j+1)]);
    }
  });
  return {v,f};
}
function geometry(frequency, diameter){
  const mesh=subdivide(baseIcosahedron(), frequency);
  const r=diameter*1000/2, edges=new Map();
  // Faces with centroid above the equatorial plane make a repeatable, explicitly approximate hemispheric layout.
  const faces=mesh.f.filter(face=>face.reduce((z,i)=>z+mesh.v[i][2],0)/3 >= -1e-9);
  faces.forEach(face=>[[face[0],face[1]],[face[1],face[2]],[face[2],face[0]]].forEach(([a,b])=>edges.set(a<b?`${a}/${b}`:`${b}/${a}`,[a,b])));
  const groups=[];
  [...edges.values()].forEach(([a,b])=>{const d=Math.hypot(mesh.v[a][0]-mesh.v[b][0],mesh.v[a][1]-mesh.v[b][1],mesh.v[a][2]-mesh.v[b][2])*r;let g=groups.find(x=>Math.abs(x.value-d)<.02);if(!g){g={value:d,count:0};groups.push(g)}g.count++});
  return {groups:groups.sort((a,b)=>a.value-b.value), faces:faces.length, edges:edges.size};
}
function calculate(e){
  if(e)e.preventDefault();
  const diameter=Number(document.querySelector('#diameter').value), frequency=Number(document.querySelector('input[name=frequency]:checked').value), width=Number(document.querySelector('#width').value), thickness=Number(document.querySelector('#thickness').value), section=document.querySelector('input[name=section]:checked').value;
  const data=geometry(frequency,diameter), total=data.groups.reduce((s,g)=>s+g.value*g.count,0);
  summary.innerHTML=[['Ø '+fmt(diameter,1)+' m','diametro'],['F'+frequency,'frequenza'],[fmt(data.edges),'montanti stimati'],[fmt(total/1000,1)+' m','legno netto']].map(([a,b])=>`<div class="metric"><b>${a}</b><span>${b}</span></div>`).join('');
  material.innerHTML=`<dt>Sezione selezionata</dt><dd>${fmt(width)} × ${fmt(thickness)} mm</dd><dt>Lavorazione prevista</dt><dd>${section}</dd><dt>Margine di taglio indicato</dt><dd>30 mm / pezzo</dd><dt>Legno con margine</dt><dd>${fmt((total+data.edges*30)/1000,1)} m</dd>`;
  description.textContent=`Semisfera triangolata F${frequency}: ${data.faces} facce e ${data.edges} montanti nel modello preliminare.`;
  struts.innerHTML=data.groups.map((g,i)=>`<tr><td>${String.fromCharCode(65+i)}</td><td>${g.count}</td><td>${length(g.value)}</td><td>${length(g.value+30)}</td><td>Quota geometrica, da adattare al nodo</td></tr>`).join('');
  document.querySelector('#results').scrollIntoView({behavior:'smooth',block:'start'});
}
form.addEventListener('submit',calculate); document.querySelector('#print').addEventListener('click',()=>window.print()); calculate();
