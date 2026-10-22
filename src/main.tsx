import {createRoot} from 'react-dom/client';
import './index.css';
const root=createRoot(document.getElementById('root')!);
const params=new URLSearchParams(window.location.search);
const ai=params.get('ai')==='1';
const workspace=params.get('workspace')==='1';
(ai?import('./AIWorkspace.tsx'):workspace?import('./App.tsx'):import('./Portal.tsx')).then(({default:Page})=>{
 root.render(<>{!ai&&<nav aria-label="Career tools" style={{display:'flex',gap:20,flexWrap:'wrap',padding:12,background:'#071d24',color:'#a7f3d0'}}><a href="/">GYCS home</a><a href="/?workspace=1">Crew Hub</a><a href="/?ai=1#ai-intake">AI-assisted intake</a><a href="/?ai=1#proposals">Proposed pathways</a></nav>}<Page/></>);
}).catch(()=>root.render(<main><h1>Unable to load Crew Hub</h1><p>Please reload or try again shortly.</p></main>));
