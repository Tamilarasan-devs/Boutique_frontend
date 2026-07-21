export interface ThemeConfig {
  name: string;
  primaryHex: string;
  primaryRgb: string;
  accentHex: string;
  accentRgb: string;
  accentHover: string;
  accentHover2: string;
  accentHover3: string;
  accentShade1: string;
  accentShade2: string;
  accentShade3: string;
}

export const THEMES: ThemeConfig[] = [
  {
    name: "Classic Beige & Navy",
    primaryHex: "#1b1c30",
    primaryRgb: "27,28,48",
    accentHex: "#e8dcc4",
    accentRgb: "232,220,196",
    accentHover: "#d9cdb4",
    accentHover2: "#8a8791",
    accentHover3: "#3d3f56",
    accentShade1: "#f4ede0",
    accentShade2: "#eae1ce",
    accentShade3: "#d9cdb4",
  },

  {
    name: "Arctic Blue",
    primaryHex: "#2563EB",
    primaryRgb: "37,99,235",
    accentHex: "#F8FAFC",
    accentRgb: "248,250,252",
    accentHover: "#3B82F6",
    accentHover2: "#1D4ED8",
    accentHover3: "#1E40AF",
    accentShade1: "#DBEAFE",
    accentShade2: "#BFDBFE",
    accentShade3: "#93C5FD",
  },

  {
    name: "Emerald Pro",
    primaryHex: "#16A34A",
    primaryRgb: "22,163,74",
    accentHex: "#F0FDF4",
    accentRgb: "240,253,244",
    accentHover: "#22C55E",
    accentHover2: "#15803D",
    accentHover3: "#166534",
    accentShade1: "#DCFCE7",
    accentShade2: "#BBF7D0",
    accentShade3: "#86EFAC",
  },

  {
    name: "Royal Violet",
    primaryHex: "#7C3AED",
    primaryRgb: "124,58,237",
    accentHex: "#FAF5FF",
    accentRgb: "250,245,255",
    accentHover: "#8B5CF6",
    accentHover2: "#6D28D9",
    accentHover3: "#5B21B6",
    accentShade1: "#E9D5FF",
    accentShade2: "#DDD6FE",
    accentShade3: "#C4B5FD",
  },

  // {
  //   name: "Sunset Orange",
  //   primaryHex: "#EA580C",
  //   primaryRgb: "234,88,12",
  //   accentHex: "#FFF7ED",
  //   accentRgb: "255,247,237",
  //   accentHover: "#F97316",
  //   accentHover2: "#C2410C",
  //   accentHover3: "#9A3412",
  //   accentShade1: "#FFEDD5",
  //   accentShade2: "#FED7AA",
  //   accentShade3: "#FDBA74",
  // },

  // {
  //   name: "Ruby",
  //   primaryHex: "#DC2626",
  //   primaryRgb: "220,38,38",
  //   accentHex: "#FEF2F2",
  //   accentRgb: "254,242,242",
  //   accentHover: "#EF4444",
  //   accentHover2: "#B91C1C",
  //   accentHover3: "#991B1B",
  //   accentShade1: "#FECACA",
  //   accentShade2: "#FCA5A5",
  //   accentShade3: "#F87171",
  // },

  {
    name: "Turquoise",
    primaryHex: "#0891B2",
    primaryRgb: "8,145,178",
    accentHex: "#ECFEFF",
    accentRgb: "236,254,255",
    accentHover: "#06B6D4",
    accentHover2: "#0E7490",
    accentHover3: "#155E75",
    accentShade1: "#CFFAFE",
    accentShade2: "#A5F3FC",
    accentShade3: "#67E8F9",
  },

  // {
  //   name: "Golden",
  //   primaryHex: "#D97706",
  //   primaryRgb: "217,119,6",
  //   accentHex: "#FFFBEB",
  //   accentRgb: "255,251,235",
  //   accentHover: "#F59E0B",
  //   accentHover2: "#B45309",
  //   accentHover3: "#92400E",
  //   accentShade1: "#FEF3C7",
  //   accentShade2: "#FDE68A",
  //   accentShade3: "#FCD34D",
  // },

  // {
  //   name: "Rose",
  //   primaryHex: "#E11D48",
  //   primaryRgb: "225,29,72",
  //   accentHex: "#FFF1F2",
  //   accentRgb: "255,241,242",
  //   accentHover: "#F43F5E",
  //   accentHover2: "#BE123C",
  //   accentHover3: "#9F1239",
  //   accentShade1: "#FFE4E6",
  //   accentShade2: "#FECDD3",
  //   accentShade3: "#FDA4AF",
  // },

  {
    name: "Indigo",
    primaryHex: "#4F46E5",
    primaryRgb: "79,70,229",
    accentHex: "#EEF2FF",
    accentRgb: "238,242,255",
    accentHover: "#6366F1",
    accentHover2: "#4338CA",
    accentHover3: "#3730A3",
    accentShade1: "#C7D2FE",
    accentShade2: "#A5B4FC",
    accentShade3: "#818CF8",
  },

  {
    name: "Slate",
    primaryHex: "#475569",
    primaryRgb: "71,85,105",
    accentHex: "#F8FAFC",
    accentRgb: "248,250,252",
    accentHover: "#64748B",
    accentHover2: "#334155",
    accentHover3: "#1E293B",
    accentShade1: "#E2E8F0",
    accentShade2: "#CBD5E1",
    accentShade3: "#94A3B8",
  },

  {
    name: "Mint",
    primaryHex: "#0F766E",
    primaryRgb: "15,118,110",
    accentHex: "#F0FDFA",
    accentRgb: "240,253,250",
    accentHover: "#14B8A6",
    accentHover2: "#0D9488",
    accentHover3: "#115E59",
    accentShade1: "#CCFBF1",
    accentShade2: "#99F6E4",
    accentShade3: "#5EEAD4",
  },

  {
    name: "Coffee",
    primaryHex: "#92400E",
    primaryRgb: "146,64,14",
    accentHex: "#FFF8F1",
    accentRgb: "255,248,241",
    accentHover: "#B45309",
    accentHover2: "#78350F",
    accentHover3: "#451A03",
    accentShade1: "#F3DEC5",
    accentShade2: "#E7C9A9",
    accentShade3: "#D6A76A",
  },
];

export const applyTheme = (theme: ThemeConfig) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--primary-hex', theme.primaryHex);
  root.style.setProperty('--primary-rgb', theme.primaryRgb);
  root.style.setProperty('--accent-hex', theme.accentHex);
  root.style.setProperty('--accent-rgb', theme.accentRgb);
  root.style.setProperty('--accent-hover', theme.accentHover);
  root.style.setProperty('--accent-hover-2', theme.accentHover2);
  root.style.setProperty('--accent-hover-3', theme.accentHover3);
  root.style.setProperty('--accent-shade-1', theme.accentShade1);
  root.style.setProperty('--accent-shade-2', theme.accentShade2);
  root.style.setProperty('--accent-shade-3', theme.accentShade3);
  localStorage.setItem('boutique_theme_name', theme.name);
};

export const initTheme = () => {
  if (typeof window === 'undefined') return;
  const savedName = localStorage.getItem('boutique_theme_name');
  const customSaved = localStorage.getItem('boutique_custom_themes');
  const customThemes = customSaved ? JSON.parse(customSaved) : [];
  const allThemes = [...THEMES, ...customThemes];
  const matched = allThemes.find(t => t.name === savedName) || allThemes[0];
  applyTheme(matched);
};
