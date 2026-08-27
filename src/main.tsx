import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'leaflet/dist/leaflet.css';
import { createIcons, Activity, ArrowLeft, ArrowRight, Bone, BookOpen, Brain, 
  ChevronDown, ChevronRight, ChevronUp, Database, FileDown, 
  Folder, Globe, Layers, LineChart, MapPin, Radio, Scan, 
  Search, Sparkles, Stethoscope, TreeDeciduous, FileText, Link, List,
 Bookmark, Copy, Check, Share2, Clock, Quote, GraduationCap, Award,
 RotateCcw, HelpCircle, CheckCircle2, XCircle, Type, Palette } from 'lucide';

// Ensure icons are created for any non-react parts if they still exist
(window as any).lucide = {
  createIcons: (options: any = {}) => {
    createIcons({
      ...options,
      icons: {
        Activity, ArrowLeft, ArrowRight, Bone, BookOpen, Brain, 
        ChevronDown, ChevronRight, ChevronUp, Database, FileDown, 
        Folder, Globe, Layers, LineChart, MapPin, Radio, Scan, 
        Search, Sparkles, Stethoscope, TreeDeciduous, FileText, Link, List,
        Bookmark, Copy, Check, Share2, Clock, Quote, GraduationCap, Award,
        RotateCcw, HelpCircle, CheckCircle2, XCircle, Type, Palette
      }
    });
  }
};

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}
