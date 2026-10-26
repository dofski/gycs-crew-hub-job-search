import {createRoot} from 'react-dom/client';
import './index.css';
import {applyThemeToDom, getSavedTheme} from './lib/theme.tsx';

applyThemeToDom(getSavedTheme());

const root=createRoot(document.getElementById('root')!);
const params=new URLSearchParams(window.location.search);
const ai=params.get('ai')==='1';
const workspace=params.get('workspace')==='1'||window.location.hash==='#location-sharing'||window.location.hash==='#live-coaching'||window.location.pathname.startsWith('/coach/');
const themePreview=!ai&&!workspace&&params.get('theme')==='optimus';
(ai?import('./AIWorkspace.tsx'):workspace?import('./App.tsx'):import('./Portal.tsx')).then(async ({default:Page})=>{
 if(themePreview){await import('./optimus-theme.css');document.body.classList.add('gy-optimus');}
 root.render(<>{themePreview&&<aside className="gy-theme-preview" aria-label="Theme preview">Design preview · Optimus-inspired GYCS <a href="/">Exit preview ↗</a></aside>}<Page/></>);
}).catch(()=>root.render(<main><h1>Unable to load Crew Hub</h1><p>Please reload or try again shortly.</p></main>));
