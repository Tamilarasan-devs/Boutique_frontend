import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  ChevronRight, 
  X, 
  FileText, 
  Layers, 
  Sparkles,
  Settings,
  Grid,
  CheckCircle,
  AlertCircle,
  User
} from 'lucide-react';
import { useToast } from '../../../context';
import { measurementTemplateApi } from '../../../api/measurementTemplateApi';

interface MeasurementField {
  name: string;
  type: 'length' | 'girth' | 'width' | 'other';
  required: boolean;
}

interface Template {
  id: string;
  customer_id?: number | null;
  customer_name?: string;
  name: string;
  category: 'Men' | 'Women' | 'Unisex' | 'Kids';
  garmentType: string;
  garment_type?: string;
  fields: MeasurementField[];
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
}

const INITIAL_TEMPLATES: Template[] = [
  {
    id: 'tpl-1',
    name: 'Men\'s Standard Three-Piece Suit',
    category: 'Men',
    garmentType: 'Suit',
    fields: [
      { name: 'Jacket Length', type: 'length', required: true },
      { name: 'Shoulder Width', type: 'width', required: true },
      { name: 'Chest Girth', type: 'girth', required: true },
      { name: 'Waist Girth', type: 'girth', required: true },
      { name: 'Sleeve Length', type: 'length', required: true },
      { name: 'Trouser Outseam', type: 'length', required: true },
      { name: 'Trouser Waist', type: 'girth', required: true },
      { name: 'Thigh Girth', type: 'girth', required: false },
    ],
    createdAt: '2026-05-10',
    updatedAt: '2026-06-25',
  },
  {
    id: 'tpl-2',
    name: 'Women\'s Designer Kurti / Kurta',
    category: 'Women',
    garmentType: 'Kurta',
    fields: [
      { name: 'Kurti Length', type: 'length', required: true },
      { name: 'Shoulder Width', type: 'width', required: true },
      { name: 'Bust Girth', type: 'girth', required: true },
      { name: 'Waist Girth', type: 'girth', required: true },
      { name: 'Hip Girth', type: 'girth', required: true },
      { name: 'Armhole', type: 'girth', required: false },
      { name: 'Front Neck Depth', type: 'length', required: false },
      { name: 'Back Neck Depth', type: 'length', required: false },
    ],
    createdAt: '2026-05-15',
    updatedAt: '2026-06-28',
  },
  {
    id: 'tpl-3',
    name: 'Bridal Lehenga Choli',
    category: 'Women',
    garmentType: 'Lehenga',
    fields: [
      { name: 'Blouse Length', type: 'length', required: true },
      { name: 'Bust Girth', type: 'girth', required: true },
      { name: 'Underbust Girth', type: 'girth', required: true },
      { name: 'Lehenga Waist', type: 'girth', required: true },
      { name: 'Lehenga Length', type: 'length', required: true },
      { name: 'Hip Girth', type: 'girth', required: true },
      { name: 'Sleeve Circumference', type: 'girth', required: false },
    ],
    createdAt: '2026-06-01',
    updatedAt: '2026-06-01',
  },
  {
    id: 'tpl-4',
    name: 'Men\'s Casual/Formal Shirt',
    category: 'Men',
    garmentType: 'Shirt',
    fields: [
      { name: 'Collar Size', type: 'girth', required: true },
      { name: 'Chest Size', type: 'girth', required: true },
      { name: 'Sleeve Length', type: 'length', required: true },
      { name: 'Shirt Length', type: 'length', required: true },
      { name: 'Shoulder To Shoulder', type: 'width', required: true },
      { name: 'Cuff Girth', type: 'girth', required: false },
    ],
    createdAt: '2026-04-20',
    updatedAt: '2026-06-12',
  }
];

const Templates: React.FC = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Modals state
  const [viewingTemplate, setViewingTemplate] = useState<Template | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // Form State for creating/editing
  const [formCustomerId, setFormCustomerId] = useState<string>('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'Men' | 'Women' | 'Unisex' | 'Kids'>('Women');
  const [formGarmentType, setFormGarmentType] = useState('Suit');
  const [formFields, setFormFields] = useState<MeasurementField[]>([
    { name: 'Length', type: 'length', required: true },
    { name: 'Waist', type: 'girth', required: true }
  ]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<'length' | 'girth' | 'width' | 'other'>('length');
  const [newFieldRequired, setNewFieldRequired] = useState(true);

  // Filtering logic
  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.garmentType.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    fetchTemplates();
    fetchCustomers();
  }, []);

  const fetchTemplates = async () => {
    try {
      const data = await measurementTemplateApi.getTemplates();
      setTemplates(data);
    } catch (err) {
      toast('Failed to load style profiles', 'error');
    }
  };

  const fetchCustomers = async () => {
    try {
      // Import customerApi dynamically or just fetch it here if not imported
      const { customerApi } = await import('../../../api/customerApi');
      const data = await customerApi.getCustomers();
      setCustomers(data);
    } catch (err) {
      // toast('Failed to load customers', 'error');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await measurementTemplateApi.deleteTemplate(id);
        setTemplates(prev => prev.filter(t => t.id !== id));
        toast('Template deleted successfully', 'success');
      } catch (err) {
        toast('Failed to delete template', 'error');
      }
    }
  };

  const handleAddField = () => {
    if (!newFieldName.trim()) {
      toast('Field name cannot be empty', 'error');
      return;
    }
    if (formFields.some(f => f.name.toLowerCase() === newFieldName.trim().toLowerCase())) {
      toast('Field name already exists', 'error');
      return;
    }
    setFormFields(prev => [...prev, {
      name: newFieldName.trim(),
      type: newFieldType,
      required: newFieldRequired
    }]);
    setNewFieldName('');
  };

  const handleRemoveField = (index: number) => {
    setFormFields(prev => prev.filter((_, i) => i !== index));
  };

  const openCreateModal = () => {
    setFormCustomerId('');
    setFormName('');
    setFormCategory('Women');
    setFormGarmentType('Suit');
    setFormFields([
      { name: 'Length', type: 'length', required: true },
      { name: 'Waist', type: 'girth', required: true }
    ]);
    setEditingTemplate(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (template: Template, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTemplate(template);
    setFormCustomerId(template.customer_id ? String(template.customer_id) : '');
    setFormName(template.name);
    setFormCategory(template.category);
    setFormGarmentType(template.garmentType);
    setFormFields([...template.fields]);
    setIsCreateModalOpen(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formGarmentType.trim()) {
      toast('Please fill out all required fields', 'error');
      return;
    }
    if (formFields.length === 0) {
      toast('A template must have at least one measurement field', 'error');
      return;
    }

    try {
      if (editingTemplate) {
        // Edit
        const updated = await measurementTemplateApi.updateTemplate(editingTemplate.id, {
          customerId: formCustomerId ? parseInt(formCustomerId, 10) : null,
          name: formName.trim(),
          category: formCategory,
          garmentType: formGarmentType.trim(),
          fields: formFields
        });
        // Attach customer name manually for immediate UI update
        const cust = customers.find(c => String(c.id) === formCustomerId);
        if (cust) updated.customer_name = cust.name;

        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? updated : t));
        toast('Style profile updated successfully', 'success');
      } else {
        // Create
        const created = await measurementTemplateApi.createTemplate({
          customerId: formCustomerId ? parseInt(formCustomerId, 10) : null,
          name: formName.trim(),
          category: formCategory,
          garmentType: formGarmentType.trim(),
          fields: formFields
        });
        // Attach customer name manually for immediate UI update
        const cust = customers.find(c => String(c.id) === formCustomerId);
        if (cust) created.customer_name = cust.name;

        setTemplates(prev => [created, ...prev]);
        toast('Style profile created successfully', 'success');
      }
      setIsCreateModalOpen(false);
    } catch (err) {
      toast('Failed to save style profile', 'error');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 p-4 sm:p-6 min-w-0 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-850 flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600" />
            Style Profiles
          </h1>
          <nav className="text-sm text-slate-500 mt-1">
            <span>Home</span> <span className="mx-2">/</span> <span>Measurements</span> <span className="mx-2">/</span> <span className="font-semibold text-blue-600">Style Profiles</span>
          </nav>
        </div>

        {/* Toolbar & Action Buttons */}
        <div className="flex space-x-3 self-start sm:self-auto">
          <button 
            onClick={() => toast('Profiles data exported successfully', 'info')}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-sm font-semibold text-slate-700 rounded-lg shadow-sm transition-colors"
          >
            Export
          </button>
          <button 
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Create Profile
          </button>
        </div>
      </div>

      {/* Filter Area & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center bg-slate-100/80 px-3 py-2 rounded-lg w-full sm:w-80 border border-slate-200 transition-all focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search profiles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-sm w-full text-slate-700 placeholder-slate-400"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {['All', 'Men', 'Women', 'Kids', 'Unisex'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                categoryFilter === cat 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table/Card Area */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div 
              key={template.id} 
              onClick={() => setViewingTemplate(template)}
              className="bg-white rounded-xl shadow-sm border border-slate-150 p-5 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    template.category === 'Men' ? 'bg-blue-50 text-blue-700' :
                    template.category === 'Women' ? 'bg-pink-50 text-pink-700' :
                    template.category === 'Kids' ? 'bg-green-50 text-green-700' : 'bg-purple-50 text-purple-700'
                  }`}>
                    {template.category || 'Unspecified'} • {template.garment_type || template.garmentType}
                  </span>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => openEditModal(template, e)}
                      className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-md transition-all"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(template.id, e)}
                      className="p-1 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-md transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors text-lg mb-2">
                  {template.name}
                </h3>

                {template.customer_name && (
                  <div className="text-sm font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md inline-block mb-3">
                    <User className="w-3.5 h-3.5 inline mr-1" />
                    For: {template.customer_name}
                  </div>
                )}

                <p className="text-xs text-slate-400 mb-4">
                  Last updated on {new Date(template.updated_at || template.updatedAt).toLocaleDateString()}
                </p>

                <div className="border-t border-slate-100 pt-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Measurement Fields ({template.fields.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {template.fields.slice(0, 5).map((f, i) => (
                      <span key={i} className="text-xs bg-slate-50 border border-slate-100 text-slate-650 px-2 py-0.5 rounded-md">
                        {f.name} {f.required && <span className="text-red-500">*</span>}
                      </span>
                    ))}
                    {template.fields.length > 5 && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-semibold">
                        +{template.fields.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between text-xs font-semibold text-blue-600 pt-2 border-t border-slate-50">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" /> Quick Preview
                </span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-500 mb-4 animate-pulse">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No style profiles found</h3>
            <p className="mt-2 text-sm text-slate-550 leading-relaxed">
              We couldn't find any profiles matching your search criteria. Try modifying your search or create a new profile.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button 
                onClick={() => { setSearch(''); setCategoryFilter('All'); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
              >
                Clear Search
              </button>
              <button 
                onClick={openCreateModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
              >
                Create New
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        onClick={openCreateModal}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 z-40 group"
        title="Add New Profile"
      >
        <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
      </button>

      {/* ────────────────── VIEW MODAL ────────────────── */}
      {viewingTemplate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[999]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white flex justify-between items-center">
              <div>
                <span className="text-xs uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md font-semibold">
                  {viewingTemplate.category} • {viewingTemplate.garment_type || viewingTemplate.garmentType}
                </span>
                <h3 className="text-xl font-bold mt-1.5">{viewingTemplate.name}</h3>
              </div>
              <button 
                onClick={() => setViewingTemplate(null)}
                className="p-1 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-500" />
                Measurement Parameter Guide
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {viewingTemplate.fields.map((field, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm">
                    <span className="font-semibold text-slate-700">
                      {field.name} {field.required && <span className="text-red-500">*</span>}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md font-medium capitalize">
                      {field.type}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-xs text-slate-400 mt-4 italic flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-slate-300" /> Note: * indicates required fields for tailors.
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex justify-end gap-2">
              <button
                onClick={() => setViewingTemplate(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-150 text-slate-700 font-semibold rounded-lg text-sm transition-colors"
              >
                Close
              </button>
              <button
                onClick={(e) => { setViewingTemplate(null); openEditModal(viewingTemplate, e); }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm shadow-sm transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── CREATE / EDIT MODAL ────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[999]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                {editingTemplate ? 'Edit Style Profile' : 'Create Custom Style Profile'}
              </h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-1">
                    Assign to Customer (Optional)
                  </label>
                  <select
                    value={formCustomerId}
                    onChange={(e) => setFormCustomerId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">No customer (Generic Profile)</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-1">
                      Profile Name *
                    </label>
                    <input 
                      type="text" 
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Premium Sherwani Men"
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-1">
                      Garment Type *
                    </label>
                    <input 
                      type="text" 
                      required
                      value={formGarmentType}
                      onChange={(e) => setFormGarmentType(e.target.value)}
                      placeholder="e.g. Sherwani, Suit, Lehenga"
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-1">
                    Target Category
                  </label>
                  <div className="flex gap-2">
                    {['Men', 'Women', 'Kids', 'Unisex'].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormCategory(cat as any)}
                        className={`flex-1 py-2 text-xs font-semibold border rounded-lg transition-all ${
                          formCategory === cat 
                            ? 'bg-blue-50 border-blue-400 text-blue-700' 
                            : 'border-slate-200 text-slate-650 hover:bg-slate-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Fields & Parameters List ({formFields.length})
                  </h4>

                  {/* Add parameter inline tool */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input 
                        type="text" 
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        placeholder="Add new measurement e.g. Cuff Girth"
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-250 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        value={newFieldType}
                        onChange={(e) => setNewFieldType(e.target.value as any)}
                        className="px-2.5 py-1.5 bg-white border border-slate-250 rounded-lg text-sm"
                      >
                        <option value="length">Length</option>
                        <option value="girth">Girth</option>
                        <option value="width">Width</option>
                        <option value="other">Other</option>
                      </select>
                      <button 
                        type="button"
                        onClick={handleAddField}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> Add
                      </button>
                    </div>
                    
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={newFieldRequired}
                        onChange={(e) => setNewFieldRequired(e.target.checked)}
                        className="rounded border-slate-350 text-blue-600 focus:ring-blue-500"
                      />
                      Require tailor to fill this parameter
                    </label>
                  </div>

                  {/* Added fields render list */}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {formFields.map((field, idx) => (
                      <div key={idx} className="flex justify-between items-center px-3 py-2 bg-slate-50 border border-slate-150 rounded-lg text-sm group">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-xs font-mono">{idx + 1}.</span>
                          <span className="font-semibold text-slate-700">
                            {field.name} {field.required && <span className="text-red-500">*</span>}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-600 rounded-sm font-semibold uppercase">
                            {field.type}
                          </span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleRemoveField(idx)}
                          className="p-1 hover:bg-red-550/10 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-250 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm shadow-sm transition-colors"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
