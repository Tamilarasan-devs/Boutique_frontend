import { toast } from 'sonner';
import React, { useState } from 'react';
import { Upload as UploadIcon, X, CheckCircle, Image } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  status: 'uploading' | 'done' | 'error';
}

const Upload: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [designName, setDesignName] = useState('');
  const [category, setCategory] = useState('Bridal');
  const [style, setStyle] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  const addFiles = (newFiles: File[]) => {
    const uploaded: UploadedFile[] = newFiles.map((f, i) => ({
      id: `${Date.now()}-${i}`,
      name: f.name,
      size: `${(f.size / 1024).toFixed(1)} KB`,
      status: 'done'
    }));
    setFiles(prev => [...prev, ...uploaded]);
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!designName || files.length === 0) return;
    toast.success(`Design "${designName}" uploaded with ${files.length} file(s)!`);
    setDesignName('');
    setStyle('');
    setFiles([]);
  };

  return (
    <div className="flex flex-col h-full space-y-5 p-6 bg-slate-50/50">
      <div className="pb-4 border-b border-slate-100">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Upload Design</h1>
        <p className="text-sm text-slate-500 mt-1">Add new garment designs, reference sketches, and embroidery patterns to your library.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Upload Area */}
        <div className="lg:col-span-3 space-y-5">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition cursor-pointer ${isDragging ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200 bg-white hover:border-blue-300'}`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-blue-50 rounded-2xl">
                <UploadIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Drag and drop files here</p>
                <p className="text-xs text-slate-400 mt-1">or click to browse — PNG, JPG, PDF up to 10MB</p>
              </div>
              <label className="mt-3 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition shadow-sm">
                Choose Files
                <input type="file" multiple accept="image/*,.pdf" onChange={handleFileInput} className="hidden" />
              </label>
            </div>
          </div>

          {/* Uploaded Files */}
          {files.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Uploaded Files ({files.length})</h3>
              <div className="space-y-2">
                {files.map(file => (
                  <div key={file.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg border border-slate-100">
                        <Image className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{file.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <button onClick={() => removeFile(file.id)} className="p-1 hover:bg-slate-200 rounded-lg transition">
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Details Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Design Details</h3>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Design Name *</label>
            <input type="text" value={designName} onChange={(e) => setDesignName(e.target.value)} required placeholder="e.g. Royal Zardosi Lehenga" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Bridal</option>
              <option>Ethnic</option>
              <option>Menswear</option>
              <option>Sarees</option>
              <option>Fusion</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Style / Technique</label>
            <input type="text" value={style} onChange={(e) => setStyle(e.target.value)} placeholder="e.g. Zardosi, Thread Work" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <button type="submit" disabled={files.length === 0} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition mt-2 shadow-sm">
            Upload to Library
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
