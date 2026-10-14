const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('docs/index.html','utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);new vm.Script(fs.readFileSync('docs/playtest.js','utf8'));
const part=(a,b)=>script.slice(script.indexOf(a),script.indexOf(b));
const core=part('const cnt=','const $=')+part('const rnd=','function owlSVG')+part('const HYP=','$(\'chal\').onclick')+part('function validSave','async function load');
vm.runInNewContext(core+`
for(let id=0;id<RULES.length;id++)for(let i=0;i<25;i++){
 const seen=new Set();for(const w of [true,false,true,false,true,false]){const q=genWith(RULES[id].f,w,seen);assert(q);seen.add(key(q));}
 const ch=makeChallenge(id,seen);assert.equal(ch.length,6);assert.equal(new Set(ch.map(x=>key(x.q))).size,6);
 const positives=ch.filter(x=>x.ok).length;assert(positives>=2&&positives<=4);
 ch.forEach(x=>{assert(!seen.has(key(x.q)));assert.equal(x.ok,RULES[id].f(x.q));});
}
const base={version:1,solved:[],logs:{},tests:{},att:{},peek:{},hint:{},stars:{},muted:false};
assert(validSave(base));
for(const s of [null,{}, {...base,version:2},{...base,solved:[0,0]},{...base,logs:{0:[{q:[{s:9,c:0}],ok:true}]}},{...base,tests:{0:-1}},{...base,stars:{0:4}}])assert(!validSave(s));
`,{assert,key:q=>q.map(t=>t.s*3+t.c).join('')});
console.log('PASS: syntax; 400 challenge samples across 16 rules; save schema fixtures.');
