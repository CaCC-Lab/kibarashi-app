import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import './styles/animations.css';
import { reportWebVitals } from './utils/reportWebVitals';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);

// Web Vitalsのパフォーマンス計測
if (import.meta.env.DEV) {
  reportWebVitals(console.log);
}