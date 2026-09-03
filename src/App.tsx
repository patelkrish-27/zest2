import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  Layout, 
  Database, 
  Cpu,
  FileCode,
  ArrowRight,
  Settings,
  Lock,
  Trash2,
  Plus,
  LayoutTemplate
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// --- Types ---
type Phase = string; // Expanded to string to support dynamic custom pages

interface CustomPage {
  id: string;
  title: string;
}

interface CustomSection {
  id: string;
  pageId: string;
  title: string;
  description: string;
  options: string[];
  isMulti: boolean;
}

interface AppConfig {
  projectTypes: string[];
  frontendFrameworks: string[];
  uiLibraries: string[];
  features: string[];
  backendFrameworks: string[];
  databases: string[];
  customPages: CustomPage[];
  customSections: CustomSection[];
}

interface AppState {
  projectName: string;
  projectType: string;
  problemStatement: string;
  
  // Frontend
  frontendFramework: string;
  uiLibraries: string[];
  features: string[];
  
  // Backend
  backendFramework: string;
  database: string;
  dbTables: string;
  
  // Architecture
  pages: string;
  components: string;
  
  // AI Response
  aiResponse: string;

  // Dynamic Answers
  customAnswers: Record<string, string | string[]>;
}

const INITIAL_CONFIG: AppConfig = {
  projectTypes: ['Website', 'Web App', 'Mobile App', 'Desktop', 'API', 'Other'],
  frontendFrameworks: ['React', 'Next.js', 'Vue', 'Nuxt', 'Svelte', 'Vanilla JS'],
  uiLibraries: ['Tailwind CSS', 'CSS Modules', 'Styled Components', 'shadcn/ui', 'Radix UI', 'Chakra UI', 'Material UI'],
  features: [
    'Framer Motion (Animations)', 
    'Lucide (Icons)', 
    'Google Fonts (Typography)', 
    'Loading Skeletons',
    'Scroll Progress Bar',
    'Back to Top Button',
    'Dark/Light Theme Toggle'
  ],
  backendFrameworks: ['Node.js (Express)', 'NestJS', 'Python (FastAPI)', 'Go (FastAPI)', 'Ruby', 'Serverless/Edge'],
  databases: ['PostgreSQL', 'MySQL', 'MongoDB', 'Supabase', 'Firebase', 'Redis'],
  customPages: [],
  customSections: []
};

const INITIAL_STATE: AppState = {
  projectName: '',
  projectType: '',
  problemStatement: '',
  frontendFramework: '',
  uiLibraries: [],
  features: [],
  backendFramework: '',
  database: '',
  dbTables: '',
  pages: '',
  components: '',
  aiResponse: '',
  customAnswers: {}
};

// --- Components ---

function Input({ label, value, onChange, placeholder, required = false }: any) {
  return (
    <div className="flex flex-col gap-2 mb-6 w-full">
      <label className="text-text-secondary text-sm font-medium tracking-wide uppercase">
        {label} {required && <span className="text-text-muted">*</span>}
      </label>
      <input
        type="text"
        className="bg-surface-2 border border-border-default rounded-md px-4 py-3 text-text-primary focus:outline-none focus:border-text-secondary transition-colors"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder, required = false, rows = 4 }: any) {
  return (
    <div className="flex flex-col gap-2 mb-6">
      <label className="text-text-secondary text-sm font-medium tracking-wide uppercase">
        {label} {required && <span className="text-text-muted">*</span>}
      </label>
      <textarea
        className="bg-surface-2 border border-border-default rounded-md px-4 py-3 text-text-primary focus:outline-none focus:border-text-secondary transition-colors resize-y"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
}

function SelectCard({ label, selected, onClick }: { label: string, selected: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-4 rounded-md border text-left transition-all duration-200 ${
        selected 
          ? 'bg-text-primary text-background border-text-primary font-medium' 
          : 'bg-surface-2 border-border-default text-text-primary hover:border-text-secondary'
      }`}
    >
      {label}
    </button>
  );
}

function MultiSelectCard({ label, selected, onClick }: { label: string, selected: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 rounded-md border text-left flex items-center gap-3 transition-all duration-200 ${
        selected 
          ? 'bg-surface-3 border-text-secondary text-text-primary' 
          : 'bg-surface-1 border-border-default text-text-secondary hover:border-text-muted hover:text-text-primary'
      }`}
    >
      <div className={`w-4 h-4 min-w-[16px] border rounded flex items-center justify-center ${selected ? 'border-text-primary bg-text-primary text-background' : 'border-border-strong'}`}>
        {selected && <Check size={12} strokeWidth={4} />}
      </div>
      <span className="truncate">{label}</span>
    </button>
  );
}

// --- Main App ---

export default function App() {
  const [phase, setPhase] = useState<Phase>('landing');
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [config, setConfig] = useState<AppConfig>(INITIAL_CONFIG);
  
  const [copied, setCopied] = useState(false);
  const [parsedFiles, setParsedFiles] = useState<{name: string, content: string}[]>([]);
  
  // Admin auth & state
  const [isAdmin, setIsAdmin] = useState(false);
  const [newOptions, setNewOptions] = useState<Record<string, string>>({});
  
  // New Custom Section Form State
  const [newSecTitle, setNewSecTitle] = useState('');
  const [newSecDesc, setNewSecDesc] = useState('');
  const [newSecPage, setNewSecPage] = useState('frontend');
  const [newSecCustomPageName, setNewSecCustomPageName] = useState('');
  const [newSecType, setNewSecType] = useState<'single' | 'multi'>('single');

  // --- Logic Helpers ---
  const updateState = (key: keyof AppState, value: any) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: 'features' | 'uiLibraries', item: string) => {
    setState(prev => {
      const arr = prev[key];
      if (arr.includes(item)) {
        return { ...prev, [key]: arr.filter(i => i !== item) };
      }
      return { ...prev, [key]: [...arr, item] };
    });
  };

  const setCustomSingle = (sectionId: string, value: string) => {
    setState(prev => ({
      ...prev,
      customAnswers: {
        ...prev.customAnswers,
        [sectionId]: value
      }
    }));
  };

  const toggleCustomMulti = (sectionId: string, value: string) => {
    setState(prev => {
      const current = prev.customAnswers[sectionId];
      const arr = Array.isArray(current) ? current : [];
      if (arr.includes(value)) {
        return { ...prev, customAnswers: { ...prev.customAnswers, [sectionId]: arr.filter(i => i !== value) } };
      }
      return { ...prev, customAnswers: { ...prev.customAnswers, [sectionId]: [...arr, value] } };
    });
  };

  // --- Wizard Flow Management ---
  const wizardFlow = [
    'project',
    'frontend',
    'backend',
    'architecture',
    ...config.customPages.map(p => p.id),
    'prompt',
    'response',
    'blueprint'
  ];

  const currentIndex = wizardFlow.indexOf(phase);
  const prevPhase = currentIndex > 0 ? wizardFlow[currentIndex - 1] : null;
  const nextPhase = currentIndex > -1 && currentIndex < wizardFlow.length - 1 ? wizardFlow[currentIndex + 1] : null;

  // --- Prompt Generation ---
  const generatePrompt = () => {
    let customPrompts = '';
    config.customSections.forEach(section => {
      const answer = state.customAnswers[section.id];
      if (answer && (typeof answer === 'string' || answer.length > 0)) {
        const answerStr = Array.isArray(answer) ? answer.join(', ') : answer;
        customPrompts += `${section.title}: ${answerStr}\n`;
      }
    });

    return `You are an expert software architect. Based on the following project blueprint, please generate comprehensive documentation and architecture markdown files. 

# PROJECT OVERVIEW
Name: ${state.projectName || 'Untitled'}
Type: ${state.projectType || 'Not specified'}
Problem Statement: ${state.problemStatement || 'Not specified'}

# FRONTEND
Framework: ${state.frontendFramework || 'Not specified'}
UI Libraries: ${state.uiLibraries.join(', ') || 'Not specified'}
Features: ${state.features.join(', ') || 'None specified'}

# BACKEND
Framework: ${state.backendFramework || 'Not specified'}
Database: ${state.database || 'Not specified'}

# ARCHITECTURE DETAILS
Pages/Routes:
${state.pages || 'Not specified'}

Components:
${state.components || 'Not specified'}

Database Tables:
${state.dbTables || 'Not specified'}

${customPrompts ? `# ADDITIONAL REQUIREMENTS\n${customPrompts}\n` : ''}---
Please provide your response strictly as a series of markdown files. Use the following format exactly for each file:

--- FILE: FILENAME.md ---
(File content here)
--- END FILE ---

Required files to generate:
1. PROJECT_CONTEXT.md
2. PRODUCT_REQUIREMENTS.md
3. FRONTEND_ARCHITECTURE.md
4. BACKEND_ARCHITECTURE.md
5. DATABASE.md
6. DEVELOPMENT_RULES.md
`;
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatePrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const processResponse = () => {
    if (!state.aiResponse.trim()) return;
    
    const fileRegex = /---\s*FILE:\s*([a-zA-Z0-9_.-]+)\s*---([\s\S]*?)---\s*END FILE\s*---/g;
    const files: {name: string, content: string}[] = [];
    
    let match;
    while ((match = fileRegex.exec(state.aiResponse)) !== null) {
      files.push({
        name: match[1].trim(),
        content: match[2].trim()
      });
    }
    
    if (files.length === 0) {
      files.push({
        name: 'AI_OUTPUT_RAW.md',
        content: state.aiResponse
      });
    }
    
    setParsedFiles(files);
    setPhase('blueprint');
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    const folder = zip.folder(`${state.projectName.toLowerCase().replace(/\s+/g, '-')}-blueprint`) || zip;
    
    parsedFiles.forEach(file => {
      folder.file(file.name, file.content);
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${state.projectName.toLowerCase().replace(/\s+/g, '-') || 'project'}-blueprint.zip`);
  };

  // --- Admin Logic ---
  const handleAdminAuth = () => {
    const pwd = prompt('Enter admin password (hint: "admin"):');
    if (pwd === 'admin') {
      setIsAdmin(true);
      setPhase('admin');
    } else if (pwd !== null) {
      alert('Incorrect password');
    }
  };

  const removeConfigOption = (category: keyof AppConfig, item: string) => {
    setConfig(prev => ({
      ...prev,
      [category]: (prev[category] as string[]).filter(val => val !== item)
    }));
  };

  const addConfigOption = (category: keyof AppConfig) => {
    const val = newOptions[category];
    if (val && val.trim()) {
      setConfig(prev => ({
        ...prev,
        [category]: [...(prev[category] as string[]), val.trim()]
      }));
      setNewOptions(prev => ({ ...prev, [category]: '' }));
    }
  };

  const addCustomSectionOption = (sectionId: string) => {
    const val = newOptions[sectionId];
    if (val && val.trim()) {
      setConfig(prev => ({
        ...prev,
        customSections: prev.customSections.map(s => 
          s.id === sectionId ? { ...s, options: [...s.options, val.trim()] } : s
        )
      }));
      setNewOptions(prev => ({ ...prev, [sectionId]: '' }));
    }
  };

  const removeCustomSectionOption = (sectionId: string, item: string) => {
    setConfig(prev => ({
      ...prev,
      customSections: prev.customSections.map(s => 
        s.id === sectionId ? { ...s, options: s.options.filter(o => o !== item) } : s
      )
    }));
  };

  const deleteCustomSection = (sectionId: string) => {
    setConfig(prev => {
      const updatedSections = prev.customSections.filter(s => s.id !== sectionId);
      
      // Auto-cleanup orphaned custom pages
      const activeCustomPageIds = new Set(updatedSections.map(s => s.pageId));
      const updatedPages = prev.customPages.filter(p => activeCustomPageIds.has(p.id));

      return {
        ...prev,
        customSections: updatedSections,
        customPages: updatedPages
      };
    });
  };

  const handleCreateCustomSection = () => {
    if (!newSecTitle.trim()) return;
    
    let targetPageId = newSecPage;
    
    if (newSecPage === 'NEW_PAGE') {
      if (!newSecCustomPageName.trim()) return alert("Please provide a name for the new page.");
      targetPageId = 'page_' + Date.now();
      setConfig(prev => ({
        ...prev,
        customPages: [...prev.customPages, { id: targetPageId, title: newSecCustomPageName.trim() }]
      }));
    }
    
    const newSection: CustomSection = {
      id: 'sec_' + Date.now(),
      pageId: targetPageId,
      title: newSecTitle.trim(),
      description: newSecDesc.trim(),
      isMulti: newSecType === 'multi',
      options: []
    };
    
    setConfig(prev => ({
      ...prev,
      customSections: [...prev.customSections, newSection]
    }));
    
    setNewSecTitle('');
    setNewSecDesc('');
    setNewSecPage('frontend');
    setNewSecCustomPageName('');
    setNewSecType('single');
  };

  // --- Render Helpers ---
  const renderSidebar = () => {
    const navItems: { id: Phase; label: string; icon: any }[] = [
      { id: 'project', label: '01. Project', icon: Layout },
      { id: 'frontend', label: '02. Frontend', icon: Layout },
      { id: 'backend', label: '03. Backend', icon: Database },
      { id: 'architecture', label: '04. Architecture', icon: Cpu },
      // Inject Custom Pages
      ...config.customPages.map((p, idx) => ({
        id: p.id, label: `0${5 + idx}. ${p.title}`, icon: LayoutTemplate
      })),
      { id: 'prompt', label: `0${5 + config.customPages.length}. AI Prompt`, icon: Terminal },
      { id: 'response', label: `0${6 + config.customPages.length}. Response`, icon: Terminal },
      { id: 'blueprint', label: `0${7 + config.customPages.length}. Blueprint`, icon: FileCode },
    ];

    if (isAdmin) {
      navItems.push({ id: 'admin', label: 'Admin Config', icon: Settings });
    }

    return (
      <aside className="w-64 border-r border-border-default bg-surface-1 flex flex-col h-screen fixed left-0 top-0 overflow-y-auto">
        <div 
          className="p-6 border-b border-border-subtle cursor-pointer hover:bg-surface-2 transition-colors"
          onClick={() => setPhase('landing')}
        >
          <h1 className="font-mono font-bold tracking-tight text-xl">BLUEPRINT</h1>
          <p className="text-text-muted text-xs mt-1">PLANNING LAYER</p>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = phase === item.id;
            return (
              <div 
                key={item.id}
                onClick={() => setPhase(item.id)}
                className={`cursor-pointer flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive 
                    ? 'bg-surface-3 text-text-primary font-medium' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                }`}
              >
                <item.icon size={16} className={isActive ? 'text-text-primary' : 'text-text-muted'} />
                <span className="truncate">{item.label}</span>
              </div>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border-subtle">
          {!isAdmin && (
            <button 
              onClick={handleAdminAuth} 
              className="flex items-center gap-2 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              <Lock size={12} /> Admin Login
            </button>
          )}
          {isAdmin && (
            <button 
              onClick={() => setIsAdmin(false)} 
              className="flex items-center gap-2 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              <Lock size={12} /> Logout Admin
            </button>
          )}
        </div>
      </aside>
    );
  };

  const renderWizardNav = () => (
    <div className="flex justify-between mt-12 pt-6 border-t border-border-subtle">
      {prevPhase ? (
        <button 
          onClick={() => setPhase(prevPhase)}
          className="text-text-secondary px-4 py-3 font-medium flex items-center gap-2 hover:text-text-primary"
        >
          <ChevronLeft size={18} /> Back
        </button>
      ) : <div/>}
      
      {nextPhase ? (
        <button 
          onClick={() => setPhase(nextPhase)}
          className="bg-text-primary text-background px-6 py-3 rounded-md font-medium flex items-center gap-2 hover:opacity-90"
        >
          Next Phase <ChevronRight size={18} />
        </button>
      ) : <div/>}
    </div>
  );

  const renderCustomSectionsForPage = (pageId: string) => {
    const sections = config.customSections.filter(s => s.pageId === pageId);
    if (sections.length === 0) return null;
    
    return sections.map(sec => (
      <div key={sec.id} className="mb-8 pt-4 border-t border-border-subtle/50">
        <label className="text-text-secondary text-sm font-medium tracking-wide uppercase mb-1 block">{sec.title}</label>
        {sec.description && <p className="text-text-muted text-sm mb-4">{sec.description}</p>}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {sec.options.map(opt => (
             sec.isMulti ? (
               <MultiSelectCard 
                  key={opt} label={opt} 
                  selected={(state.customAnswers[sec.id] || []).includes(opt)} 
                  onClick={() => toggleCustomMulti(sec.id, opt)} 
               />
             ) : (
               <SelectCard 
                  key={opt} label={opt} 
                  selected={state.customAnswers[sec.id] === opt} 
                  onClick={() => setCustomSingle(sec.id, opt)} 
               />
             )
          ))}
          {sec.options.length === 0 && (
            <div className="col-span-2 text-text-muted text-sm italic py-2">
              No options available. An admin can add options in the Admin Config.
            </div>
          )}
        </div>
      </div>
    ));
  };

  const renderAdmin = () => {
    const standardCategories: { key: keyof AppConfig, title: string, desc: string }[] = [
      { key: 'projectTypes', title: 'Project Types', desc: 'Options available in Project Definition' },
      { key: 'frontendFrameworks', title: 'Frontend Frameworks', desc: 'Options available in Frontend Stack' },
      { key: 'uiLibraries', title: 'UI Libraries', desc: 'Styling & UI libraries in Frontend Stack' },
      { key: 'features', title: 'Features & Polish', desc: 'Additional features in Frontend Stack' },
      { key: 'backendFrameworks', title: 'Backend Frameworks', desc: 'Runtime/Frameworks in Backend' },
      { key: 'databases', title: 'Databases', desc: 'Database options in Backend' }
    ];

    return (
      <div className="max-w-4xl animate-in pb-20">
        <h2 className="text-3xl font-bold mb-2 tracking-tight">Admin Dashboard</h2>
        <p className="text-text-secondary mb-10 border-b border-border-default pb-8">Create new sections, dynamically insert pages, and configure available options globally.</p>
        
        {/* CREATE NEW CUSTOM SECTION */}
        <div className="bg-surface-1 border border-border-strong rounded-md p-6 mb-12 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Plus size={20} className="text-text-primary" />
            <h3 className="text-xl font-bold text-text-primary">Create Custom Section</h3>
          </div>
          <p className="text-sm text-text-secondary mb-6">Add a brand new dynamic question block. You can inject it into existing pages or create an entirely new step in the workflow.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Input 
              label="Section Title" 
              value={newSecTitle} 
              onChange={(e: any) => setNewSecTitle(e.target.value)} 
              placeholder="e.g. Types of Theme" 
            />
            <Input 
              label="Section Description" 
              value={newSecDesc} 
              onChange={(e: any) => setNewSecDesc(e.target.value)} 
              placeholder="e.g. Select the overall aesthetic." 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col gap-2">
              <label className="text-text-secondary text-sm font-medium tracking-wide uppercase">Placement / Page</label>
              <select 
                className="bg-surface-2 border border-border-default rounded-md px-4 py-3 text-text-primary focus:outline-none focus:border-text-secondary transition-colors"
                value={newSecPage}
                onChange={(e) => setNewSecPage(e.target.value)}
              >
                <option value="project">01. Project</option>
                <option value="frontend">02. Frontend</option>
                <option value="backend">03. Backend</option>
                <option value="architecture">04. Architecture</option>
                {config.customPages.map(p => (
                  <option key={p.id} value={p.id}>Custom: {p.title}</option>
                ))}
                <option value="NEW_PAGE">➕ Create New Page...</option>
              </select>
            </div>
            
            {newSecPage === 'NEW_PAGE' && (
              <Input 
                label="New Page Title" 
                value={newSecCustomPageName} 
                onChange={(e: any) => setNewSecCustomPageName(e.target.value)} 
                placeholder="e.g. Theming & Design" 
              />
            )}

            <div className="flex flex-col gap-2">
              <label className="text-text-secondary text-sm font-medium tracking-wide uppercase">Selection Type</label>
              <select 
                className="bg-surface-2 border border-border-default rounded-md px-4 py-3 text-text-primary focus:outline-none focus:border-text-secondary transition-colors"
                value={newSecType}
                onChange={(e: any) => setNewSecType(e.target.value)}
              >
                <option value="single">Single Choice (Radio behavior)</option>
                <option value="multi">Multiple Choice (Checkbox behavior)</option>
              </select>
            </div>
          </div>
          
          <button 
            onClick={handleCreateCustomSection}
            disabled={!newSecTitle.trim() || (newSecPage === 'NEW_PAGE' && !newSecCustomPageName.trim())}
            className="bg-text-primary text-background px-6 py-3 rounded-md font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
          >
            Create Section <Check size={18} />
          </button>
        </div>

        <h3 className="text-2xl font-bold mb-6 tracking-tight border-b border-border-default pb-4">Manage Options</h3>
        <div className="flex flex-col gap-8">
          
          {/* CUSTOM SECTIONS (Dynamically Created) */}
          {config.customSections.map(sec => {
            const pageName = sec.pageId.startsWith('page_') 
              ? config.customPages.find(p => p.id === sec.pageId)?.title 
              : sec.pageId.charAt(0).toUpperCase() + sec.pageId.slice(1);

            return (
              <div key={sec.id} className="bg-surface-1 border border-border-strong rounded-md p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium text-text-primary">{sec.title}</h3>
                    <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">Custom ({sec.isMulti ? 'Multi' : 'Single'})</span>
                    <span className="text-xs text-text-muted bg-surface-3 px-2 py-1 rounded">Page: {pageName}</span>
                  </div>
                  <button 
                    onClick={() => deleteCustomSection(sec.id)}
                    className="text-text-muted hover:text-red-400 transition-colors p-1"
                    title="Delete section completely"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-sm text-text-secondary mb-6">{sec.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {sec.options.map(opt => (
                    <div key={opt} className="bg-surface-2 border border-border-strong rounded px-3 py-1.5 flex items-center gap-2 text-sm">
                      {opt}
                      <button 
                        onClick={() => removeCustomSectionOption(sec.id, opt)}
                        className="text-text-muted hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {sec.options.length === 0 && <span className="text-sm text-text-muted italic">No options added yet.</span>}
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newOptions[sec.id] || ''}
                    onChange={(e) => setNewOptions(prev => ({ ...prev, [sec.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomSectionOption(sec.id)}
                    placeholder="Add new option..."
                    className="bg-surface-2 border border-border-default rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-text-secondary w-64 transition-colors"
                  />
                  <button 
                    onClick={() => addCustomSectionOption(sec.id)}
                    className="bg-surface-3 hover:bg-border-strong text-text-primary px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-colors"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>
            );
          })}

          {/* STANDARD SECTIONS */}
          {standardCategories.map(cat => (
            <div key={cat.key} className="bg-surface-1 border border-border-default rounded-md p-6">
              <h3 className="text-lg font-medium text-text-primary mb-1">{cat.title}</h3>
              <p className="text-sm text-text-secondary mb-6">{cat.desc}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {(config[cat.key] as string[]).map(opt => (
                  <div key={opt} className="bg-surface-2 border border-border-strong rounded px-3 py-1.5 flex items-center gap-2 text-sm">
                    {opt}
                    <button 
                      onClick={() => removeConfigOption(cat.key, opt)}
                      className="text-text-muted hover:text-red-400 transition-colors"
                      title="Remove option"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newOptions[cat.key] || ''}
                  onChange={(e) => setNewOptions(prev => ({ ...prev, [cat.key]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && addConfigOption(cat.key)}
                  placeholder="Add new option..."
                  className="bg-surface-2 border border-border-default rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-text-secondary w-64 transition-colors"
                />
                <button 
                  onClick={() => addConfigOption(cat.key)}
                  className="bg-surface-3 hover:bg-border-strong text-text-primary px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-colors"
                >
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLanding = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center animate-in">
      <div className="font-mono text-sm text-text-muted mb-8 tracking-[0.2em] uppercase">System Ready</div>
      <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 max-w-4xl">
        THE PLANNING LAYER<br/>BETWEEN IDEA & CODE.
      </h1>
      <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-12">
        Blueprint is a structured project-planning tool designed for rapid software development. 
        Define your architecture properly before you start writing code.
      </p>
      <button 
        onClick={() => setPhase('project')}
        className="bg-text-primary text-background px-8 py-4 rounded-md font-medium flex items-center gap-2 hover:bg-white transition-colors"
      >
        Start Planning
        <ArrowRight size={20} />
      </button>
    </div>
  );

  const renderContent = () => {
    switch (phase) {
      case 'project':
        return (
          <div className="max-w-3xl animate-in pb-20">
            <h2 className="text-3xl font-bold mb-2 tracking-tight">Project Definition</h2>
            <p className="text-text-secondary mb-10 border-b border-border-default pb-8">Establish the core identity and purpose of your system.</p>
            
            <Input 
              label="Project Name" 
              placeholder="e.g. Acme Dashboard" 
              value={state.projectName} 
              onChange={(e: any) => updateState('projectName', e.target.value)} 
              required
            />
            
            <div className="mb-6">
              <label className="text-text-secondary text-sm font-medium tracking-wide uppercase mb-3 block">Project Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {config.projectTypes.map(type => (
                  <SelectCard 
                    key={type} 
                    label={type} 
                    selected={state.projectType === type} 
                    onClick={() => updateState('projectType', type)} 
                  />
                ))}
              </div>
            </div>

            <Textarea 
              label="Problem Statement" 
              placeholder="What specific problem does this project solve?" 
              value={state.problemStatement} 
              onChange={(e: any) => updateState('problemStatement', e.target.value)}
              rows={5}
              required
            />
            
            {renderCustomSectionsForPage('project')}
            {renderWizardNav()}
          </div>
        );

      case 'frontend':
        return (
          <div className="max-w-3xl animate-in pb-20">
            <h2 className="text-3xl font-bold mb-2 tracking-tight">Frontend Stack</h2>
            <p className="text-text-secondary mb-10 border-b border-border-default pb-8">Define the client-side architecture and tools.</p>
            
            <div className="mb-8">
              <label className="text-text-secondary text-sm font-medium tracking-wide uppercase mb-3 block">Framework</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {config.frontendFrameworks.map(fw => (
                  <SelectCard 
                    key={fw} 
                    label={fw} 
                    selected={state.frontendFramework === fw} 
                    onClick={() => updateState('frontendFramework', fw)} 
                  />
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="text-text-secondary text-sm font-medium tracking-wide uppercase mb-3 block">Styling / UI Library</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {config.uiLibraries.map(lib => (
                  <MultiSelectCard 
                    key={lib} 
                    label={lib} 
                    selected={state.uiLibraries.includes(lib)} 
                    onClick={() => toggleArrayItem('uiLibraries', lib)} 
                  />
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="text-text-secondary text-sm font-medium tracking-wide uppercase mb-3 block">Additional Features & Polish</label>
              <div className="grid grid-cols-2 gap-3">
                {config.features.map(feat => (
                  <MultiSelectCard 
                    key={feat} 
                    label={feat} 
                    selected={state.features.includes(feat)} 
                    onClick={() => toggleArrayItem('features', feat)} 
                  />
                ))}
              </div>
            </div>

            {renderCustomSectionsForPage('frontend')}
            {renderWizardNav()}
          </div>
        );

      case 'backend':
        return (
          <div className="max-w-3xl animate-in pb-20">
            <h2 className="text-3xl font-bold mb-2 tracking-tight">Backend & Data</h2>
            <p className="text-text-secondary mb-10 border-b border-border-default pb-8">Configure server infrastructure and data persistence.</p>
            
            <div className="mb-8">
              <label className="text-text-secondary text-sm font-medium tracking-wide uppercase mb-3 block">Runtime / Framework</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {config.backendFrameworks.map(fw => (
                  <SelectCard 
                    key={fw} 
                    label={fw} 
                    selected={state.backendFramework === fw} 
                    onClick={() => updateState('backendFramework', fw)} 
                  />
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="text-text-secondary text-sm font-medium tracking-wide uppercase mb-3 block">Database</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {config.databases.map(db => (
                  <SelectCard 
                    key={db} 
                    label={db} 
                    selected={state.database === db} 
                    onClick={() => updateState('database', db)} 
                  />
                ))}
              </div>
            </div>

            <Textarea 
              label="Database Tables & Entities (Draft)" 
              placeholder="e.g. Users, Posts, Comments, Analytics..." 
              value={state.dbTables} 
              onChange={(e: any) => updateState('dbTables', e.target.value)}
              rows={4}
            />

            {renderCustomSectionsForPage('backend')}
            {renderWizardNav()}
          </div>
        );

      case 'architecture':
        return (
          <div className="max-w-3xl animate-in pb-20">
            <h2 className="text-3xl font-bold mb-2 tracking-tight">System Architecture</h2>
            <p className="text-text-secondary mb-10 border-b border-border-default pb-8">Map out the structural components of the application.</p>
            
            <Textarea 
              label="Pages & Routes" 
              placeholder="e.g. / (Landing), /dashboard (Main App), /settings" 
              value={state.pages} 
              onChange={(e: any) => updateState('pages', e.target.value)}
              rows={4}
            />

            <Textarea 
              label="Key Components" 
              placeholder="e.g. Navbar, Sidebar, DataTable, UserProfileCard" 
              value={state.components} 
              onChange={(e: any) => updateState('components', e.target.value)}
              rows={4}
            />

            {renderCustomSectionsForPage('architecture')}
            {renderWizardNav()}
          </div>
        );

      case 'prompt':
        const generatedPrompt = generatePrompt();
        return (
          <div className="max-w-4xl animate-in pb-20">
            <h2 className="text-3xl font-bold mb-2 tracking-tight">AI Implementation Prompt</h2>
            <p className="text-text-secondary mb-10 border-b border-border-default pb-8">Copy this prompt and paste it into ChatGPT, Claude, or your preferred AI to generate your project documentation.</p>
            
            <div className="relative bg-surface-1 border border-border-default rounded-md">
              <div className="flex justify-between items-center px-4 py-2 border-b border-border-subtle bg-surface-2 rounded-t-md">
                <div className="font-mono text-xs text-text-muted flex items-center gap-2">
                  <Terminal size={14} /> master_prompt.txt
                </div>
                <button 
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-2 text-xs font-medium bg-surface-3 hover:bg-border-default text-text-primary px-3 py-1.5 rounded transition-colors"
                >
                  {copied ? <><Check size={14} className="text-green-500"/> Copied</> : <><Copy size={14} /> Copy Prompt</>}
                </button>
              </div>
              <pre className="p-4 text-sm text-text-secondary font-mono overflow-x-auto whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                {generatedPrompt}
              </pre>
            </div>

            {renderWizardNav()}
          </div>
        );

      case 'response':
        return (
          <div className="max-w-4xl animate-in pb-20">
            <h2 className="text-3xl font-bold mb-2 tracking-tight">Process AI Response</h2>
            <p className="text-text-secondary mb-10 border-b border-border-default pb-8">Paste the raw markdown response generated by the AI here to parse your blueprint files.</p>
            
            <Textarea 
              label="Paste AI Response" 
              placeholder="--- FILE: PROJECT_CONTEXT.md ---\n..." 
              value={state.aiResponse} 
              onChange={(e: any) => updateState('aiResponse', e.target.value)}
              rows={15}
            />

            <div className="flex justify-between mt-12 pt-6 border-t border-border-subtle">
              <button 
                onClick={() => setPhase('prompt')}
                className="text-text-secondary px-4 py-3 font-medium flex items-center gap-2 hover:text-text-primary"
              >
                <ChevronLeft size={18} /> Back
              </button>
              <button 
                onClick={processResponse}
                disabled={!state.aiResponse.trim()}
                className="bg-text-primary text-background px-6 py-3 rounded-md font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Parse Blueprint <Check size={18} />
              </button>
            </div>
          </div>
        );

      case 'blueprint':
        return (
          <div className="max-w-5xl animate-in pb-20">
            <div className="flex justify-between items-end mb-10 border-b border-border-default pb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2 tracking-tight">Project Blueprint</h2>
                <p className="text-text-secondary">Your architecture is ready. Review your documents and download the project initiator.</p>
              </div>
              <button 
                onClick={downloadZip}
                className="bg-text-primary text-background px-6 py-3 rounded-md font-medium flex items-center gap-2 hover:opacity-90"
              >
                <Download size={18} /> Download ZIP
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* File List */}
              <div className="lg:col-span-1 border border-border-default rounded-md bg-surface-1 overflow-hidden flex flex-col max-h-[600px]">
                <div className="px-4 py-3 border-b border-border-subtle bg-surface-2 font-mono text-xs text-text-muted">
                  FILES ({parsedFiles.length})
                </div>
                <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
                  {parsedFiles.map((f, i) => (
                    <div key={i} className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-3 rounded cursor-pointer flex items-center gap-2">
                      <FileCode size={14} />
                      <span className="truncate">{f.name}</span>
                    </div>
                  ))}
                  {parsedFiles.length === 0 && (
                    <div className="p-4 text-sm text-text-muted italic">No files parsed.</div>
                  )}
                </div>
              </div>
              
              {/* Markdown Preview */}
              <div className="lg:col-span-3 border border-border-default rounded-md bg-surface-1 overflow-hidden flex flex-col max-h-[600px]">
                <div className="px-4 py-3 border-b border-border-subtle bg-surface-2 font-mono text-xs text-text-muted flex justify-between">
                  <span>PREVIEW</span>
                  {parsedFiles.length > 0 && <span>{parsedFiles[0].name}</span>}
                </div>
                <div className="flex-1 p-6 overflow-y-auto">
                  {parsedFiles.length > 0 ? (
                    <pre className="text-sm font-mono text-text-primary whitespace-pre-wrap">
                      {parsedFiles[0].content}
                    </pre>
                  ) : (
                    <div className="h-full flex items-center justify-center text-text-muted">
                      Select a file to preview
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-start mt-12 pt-6 border-t border-border-subtle">
              <button 
                onClick={() => setPhase('response')}
                className="text-text-secondary px-4 py-3 font-medium flex items-center gap-2 hover:text-text-primary"
              >
                <ChevronLeft size={18} /> Back to Response
              </button>
            </div>
          </div>
        );
        
      case 'admin':
        return renderAdmin();
        
      default:
        // Handle fully dynamic custom pages
        const customPage = config.customPages.find(p => p.id === phase);
        if (customPage) {
          return (
            <div className="max-w-3xl animate-in pb-20">
              <h2 className="text-3xl font-bold mb-2 tracking-tight">{customPage.title}</h2>
              <p className="text-text-secondary mb-10 border-b border-border-default pb-8">Provide custom details for this stage.</p>
              
              {renderCustomSectionsForPage(customPage.id)}
              {renderWizardNav()}
            </div>
          );
        }
        return null;
    }
  };

  if (phase === 'landing') {
    return renderLanding();
  }

  return (
    <div className="min-h-screen bg-background text-text-primary flex">
      {renderSidebar()}
      <main className="flex-1 ml-64 p-12 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}
