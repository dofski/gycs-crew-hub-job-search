import {createRoot} from 'react-dom/client';
import './index.css';
const root=createRoot(document.getElementById('root')!);
const params=new URLSearchParams(window.location.search);
const ai=params.get('ai')==='1';
const workspace=params.get('workspace')==='1'||window.location.hash==='#location-sharing'||window.location.hash==='#live-coaching'||window.location.pathname.startsWith('/coach/');
const themePreview=!ai&&!workspace&&params.get('theme')==='optimus';
(ai?import('./AIWorkspace.tsx'):workspace?import('./App.tsx'):import('./Portal.tsx')).then(async ({default:Page})=>{
 if(themePreview){await import('./optimus-theme.css');document.body.classList.add('gy-optimus');}
 root.render(<>{themePreview&&<aside className="gy-theme-preview" aria-label="Theme preview">Design preview · Optimus-inspired GYCS <a href="/">Exit preview ↗</a></aside>}{!ai&&<nav aria-label="Career tools" style={{display:'flex',gap:20,flexWrap:'wrap',alignItems:'center',padding:12,background:'#071d24',color:'#a7f3d0'}}>{workspace&&<a href="/" aria-label="Green Yacht Crew Solutions home"><img src="/logo-mark.svg" alt="Green Yacht Crew Solutions" width={28} height={28} style={{display:'block'}}/></a>}<a href={themePreview?'/?theme=optimus':'/'}>GYCS home</a><a href="/?workspace=1">Crew Hub</a><a href="/?workspace=1#live-coaching">Live coaching</a><a href="/?workspace=1#location-sharing">Location sharing</a><a href="/?ai=1#ai-intake">AI-assisted intake</a><a href="/?ai=1#proposals">Proposed pathways</a><a href="https://searchengine.chaddewet.com" target="_blank" rel="noopener noreferrer">M/Y Eye Map ↗</a></nav>}<Page/></>);
}).catch(()=>root.render(<main><h1>Unable to load Crew Hub</h1><p>Please reload or try again shortly.</p></main>));
