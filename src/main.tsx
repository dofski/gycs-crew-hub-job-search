import {createRoot} from 'react-dom/client';
import './index.css';
const root = createRoot(document.getElementById('root')!);
const workspace = new URLSearchParams(window.location.search).get('workspace') === '1';
(workspace ? import('./App.tsx') : import('./Portal.tsx')).then(({default: Page}) => {
  root.render(<>{workspace && <a href="/" style={{display:'block',padding:12,background:'#071d24',color:'#a7f3d0'}}>← GYCS home and onboarding</a>}<Page /></>);
}).catch(() => root.render(<main><h1>Unable to load Crew Hub</h1><p>Please reload the page or try again shortly.</p></main>));
