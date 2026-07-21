import React, { useState } from 'react';
import { Palette, Trash2, Plus, Sparkles, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { THEMES, applyTheme, ThemeConfig } from '../../../utils/theme';

const SectionCard = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
    <div className="px-7 py-5 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-b from-white to-[#F8F8FB]/50">
      <div className="p-2 bg-[var(--primary-hex)]/5 rounded-xl border border-[var(--primary-hex)]/10">
        <Icon className="w-4 h-4 text-[var(--primary-hex)]" />
      </div>
      <h2 className="text-[15px] font-bold text-slate-800 tracking-tight">{title}</h2>
    </div>
    <div className="p-7">{children}</div>
  </div>
);

const ThemeSettings: React.FC = () => {
  const [currentThemeName, setCurrentThemeName] = useState(() => localStorage.getItem('boutique_theme_name') || THEMES[0].name);
  
  const [customThemes, setCustomThemes] = useState<ThemeConfig[]>(() => {
    const saved = localStorage.getItem('boutique_custom_themes');
    return saved ? JSON.parse(saved) : [];
  });

  const [customName, setCustomName] = useState('');
  const [primaryHex, setPrimaryHex] = useState('#1b1c30');
  const [accentHex, setAccentHex] = useState('#e8dcc4');
  const [editingThemeName, setEditingThemeName] = useState<string | null>(null);

  const hexToRgbStr = (hex: string): string => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : '0,0,0';
  };

  const handleSaveTheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      toast.error('Please enter a theme name');
      return;
    }
    const name = customName.trim();

    // Check duplicates on other themes
    const otherThemes = allThemes.filter(t => t.name !== (editingThemeName || ''));
    if (otherThemes.some(t => t.name.toLowerCase() === name.toLowerCase())) {
      toast.error('A theme with this name already exists');
      return;
    }

    const updatedTheme: ThemeConfig = {
      name,
      primaryHex,
      primaryRgb: hexToRgbStr(primaryHex),
      accentHex,
      accentRgb: hexToRgbStr(accentHex),
      accentHover: primaryHex,
      accentHover2: primaryHex,
      accentHover3: primaryHex,
      accentShade1: accentHex,
      accentShade2: accentHex,
      accentShade3: accentHex,
    };

    let updatedList: ThemeConfig[];
    if (editingThemeName) {
      updatedList = customThemes.map(t => t.name === editingThemeName ? updatedTheme : t);
      if (currentThemeName === editingThemeName) {
        setCurrentThemeName(name);
      }
      toast.success(`Theme "${name}" updated successfully!`);
    } else {
      updatedList = [...customThemes, updatedTheme];
      setCurrentThemeName(name);
      toast.success(`Custom theme "${name}" created and applied!`);
    }

    setCustomThemes(updatedList);
    localStorage.setItem('boutique_custom_themes', JSON.stringify(updatedList));
    applyTheme(updatedTheme);

    // Reset Form
    setCustomName('');
    setEditingThemeName(null);
  };

  const handleEditTheme = (theme: ThemeConfig, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingThemeName(theme.name);
    setCustomName(theme.name);
    setPrimaryHex(theme.primaryHex);
    setAccentHex(theme.accentHex);
  };

  const handleCancelEdit = () => {
    setEditingThemeName(null);
    setCustomName('');
    setPrimaryHex('#1b1c30');
    setAccentHex('#e8dcc4');
  };

  const handleDeleteTheme = (themeName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customThemes.filter(t => t.name !== themeName);
    setCustomThemes(updated);
    localStorage.setItem('boutique_custom_themes', JSON.stringify(updated));

    if (editingThemeName === themeName) {
      handleCancelEdit();
    }

    if (currentThemeName === themeName) {
      const fallback = THEMES[0];
      setCurrentThemeName(fallback.name);
      applyTheme(fallback);
      toast.success(`Theme reset to default: ${fallback.name}`);
    } else {
      toast.success(`Deleted theme "${themeName}"`);
    }
  };

  const allThemes = [...THEMES, ...customThemes];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800">
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="pb-8 border-b border-slate-200">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--primary-hex)] mb-2">System Settings</p>
          <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">App Theme & Appearance</h1>
          <p className="text-[13px] font-medium text-slate-500 mt-1.5 max-w-xl leading-relaxed">
            Personalize the workspace identity by selecting a curated color configuration or defining your own custom branding palette.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Theme Selector (Main Column) */}
          <div className="lg:col-span-2 space-y-6">
            <SectionCard icon={Palette} title="Workspace Color Themes">
              <div className="space-y-4">
                <p className="text-[12px] font-medium text-slate-500 leading-relaxed">
                  Select a theme for your Boutique workspace. Changing this updates sidebars, headings, active states, buttons, and badges instantly across all views.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allThemes.map((theme) => {
                    const isSelected = currentThemeName === theme.name;
                    const isCustom = customThemes.some(t => t.name === theme.name);
                    return (
                      <button
                        key={theme.name}
                        type="button"
                        onClick={() => {
                          setCurrentThemeName(theme.name);
                          applyTheme(theme);
                          toast.success(`Theme changed to ${theme.name}`);
                        }}
                        className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all text-left cursor-pointer group relative ${
                          isSelected
                            ? 'border-[var(--primary-hex)] bg-[var(--primary-hex)]/[0.04] shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex flex-col gap-1 pr-8">
                          <span className="text-[13px] font-bold text-slate-800 flex items-center gap-1.5">
                            {theme.name}
                            {isCustom && (
                              <span className="text-[9px] font-bold bg-[var(--primary-hex)]/10 text-[var(--primary-hex)] px-1.5 py-0.5 rounded-full uppercase">
                                Custom
                              </span>
                            )}
                          </span>
                          <div className="flex gap-1.5 mt-1">
                            <span className="w-5 h-5 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: theme.primaryHex }} title="Primary Color"></span>
                            <span className="w-5 h-5 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: theme.accentHex }} title="Accent Color"></span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-[var(--primary-hex)] animate-pulse shrink-0"></span>
                          )}
                          {isCustom && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => handleEditTheme(theme, e)}
                                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-[var(--primary-hex)] rounded-lg transition"
                                title="Edit Custom Theme"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteTheme(theme.name, e)}
                                className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition"
                                title="Delete Custom Theme"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Theme Creator / Editor (Side Column) */}
          <div className="space-y-6">
            <SectionCard icon={Sparkles} title={editingThemeName ? 'Edit Custom Theme' : 'Create Custom Theme'}>
              <form onSubmit={handleSaveTheme} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Theme Name
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Lavender Gold"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-hex)]/25 focus:border-[var(--primary-hex)]/50 bg-white text-slate-800 placeholder:text-slate-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-2 border border-slate-200 rounded-xl p-2 bg-white">
                      <input
                        type="color"
                        value={primaryHex}
                        onChange={(e) => setPrimaryHex(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
                      />
                      <span className="text-xs font-semibold uppercase text-slate-500 font-mono">
                        {primaryHex}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Accent Color
                    </label>
                    <div className="flex items-center gap-2 border border-slate-200 rounded-xl p-2 bg-white">
                      <input
                        type="color"
                        value={accentHex}
                        onChange={(e) => setAccentHex(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
                      />
                      <span className="text-xs font-semibold uppercase text-slate-500 font-mono">
                        {accentHex}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[var(--primary-hex)] hover:opacity-95 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98]"
                  >
                    {editingThemeName ? 'Update Theme' : 'Save & Apply Theme'}
                  </button>
                  {editingThemeName && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl text-sm font-bold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </SectionCard>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ThemeSettings;
