import React, { useState, useEffect, useRef } from 'react';
import { PackageSearch, UploadCloud, Plus, X, Image as ImageIcon, Loader2, Tag, Edit, Trash2, Barcode } from 'lucide-react';
import { productApi, Product } from '../../api/productApi';
import { fetchWithAuth } from '../../api/client';
import { API_BASE_URL } from '@/constants';
import { toast } from 'sonner';

const ProductUpload: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [barcode, setBarcode] = useState(() => Math.random().toString().slice(2, 14));
  
  // Image Upload State
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productApi.getProducts();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const files = Array.from(e.target.files);
    const validFiles: File[] = [];
    const validPreviews: string[] = [];
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Image ${file.name} is larger than 5MB`);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setImageFiles(prev => [...prev, ...validFiles]);
      
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      toast.error('Product name and price are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedImageUrls: string[] = [];

      // 1. Upload Images if provided
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const formData = new FormData();
          formData.append('image', file);
          formData.append('folder', 'boutique_crm_products');

          const uploadRes = await fetchWithAuth(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData,
          });

          if (!uploadRes.ok) {
            toast.error(`Failed to upload ${file.name}`);
            continue;
          }

          const uploadData = await uploadRes.json();
          uploadedImageUrls.push(uploadData.image_url);
        }
      }

      // 2. Create Product
      await productApi.createProduct({
        name,
        description,
        price,
        stock_quantity: parseInt(stockQuantity) || 0,
        category,
        barcode,
        image_url: uploadedImageUrls[0] || null, // Keep for backward compatibility
        image_urls: uploadedImageUrls
      });

      toast.success('Product added successfully!');
      
      // Reset Form
      setName('');
      setDescription('');
      setPrice('');
      setStockQuantity('');
      setCategory('');
      setBarcode(Math.random().toString().slice(2, 14));
      setImageFiles([]);
      setImagePreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productApi.deleteProduct(id);
      toast.success('Product deleted');
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 p-6 bg-slate-50/50 overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Product Management</h1>
        <p className="text-sm text-slate-500 mt-1">Upload new products and manage your catalog.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="xl:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" /> Add New Product
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Image Upload Area */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Product Images</label>
              
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200">
                      <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => removeImage(idx)} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transform hover:scale-110 transition-transform shadow-sm">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {idx === 0 && (
                        <div className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                          PRIMARY
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div 
                className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-all duration-200 border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30`}
              >
                <label className="flex flex-col items-center justify-center p-6 cursor-pointer w-full text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Add Image(s)</span>
                  <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" multiple className="hidden" />
                </label>
              </div>
            </div>

            {/* Product Details */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name <span className="text-red-500">*</span></label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Summer Floral Dress" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price (₹) <span className="text-red-500">*</span></label>
                <input required type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stock Quantity</label>
                <input type="number" min="0" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} placeholder="0" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
              <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Dresses, Tops, Accessories" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Barcode</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Barcode className="w-5 h-5 text-slate-400" />
                </div>
                <input type="text" value={barcode} onChange={e => setBarcode(e.target.value)} placeholder="Product barcode" className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of the product..." rows={3} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none" />
            </div>

            <button disabled={isSubmitting} type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all transform hover:scale-[1.01] active:scale-[0.98]">
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Saving Product...</>
              ) : (
                <><PackageSearch className="w-5 h-5" /> Save Product</>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: List */}
        <div className="xl:col-span-2">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
                  <div className="h-48 bg-slate-200 w-full" />
                  <div className="p-4 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="h-5 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                      </div>
                      <div className="h-6 bg-slate-200 rounded w-16" />
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-5 bg-slate-200 rounded-full w-20" />
                      <div className="h-8 w-8 bg-slate-200 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center h-full flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <PackageSearch className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Your Catalog is Empty</h3>
              <p className="text-slate-500 mt-2 max-w-sm mx-auto">Upload your first product using the form on the left to start building your online catalog.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col">
                  {/* Product Image Area */}
                  <div className="h-48 bg-slate-100 relative overflow-hidden flex-shrink-0 group/images">
                    {product.image_urls && product.image_urls.length > 0 ? (
                      <>
                        <img src={product.image_urls[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {product.image_urls.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur shadow-sm">
                            +{product.image_urls.length - 1} more
                          </div>
                        )}
                      </>
                    ) : product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                        <span className="text-xs font-medium uppercase tracking-wider opacity-70">No Image</span>
                      </div>
                    )}
                    
                    {/* Category Badge */}
                    {product.category && (
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {product.category}
                      </div>
                    )}

                    {/* Delete Action Overlay */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDelete(product.id)} className="w-8 h-8 bg-white/90 backdrop-blur text-red-500 rounded-full flex items-center justify-center shadow-sm hover:bg-red-500 hover:text-white transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{product.description || <span className="italic opacity-60">No description provided.</span>}</p>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-blue-600 font-black text-xl">₹{parseFloat(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                      <div className="text-right">
                        <div className={`text-xs font-bold px-2 py-1 rounded-md inline-block ${product.stock_quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {product.stock_quantity > 0 ? `${product.stock_quantity} IN STOCK` : 'OUT OF STOCK'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductUpload;
