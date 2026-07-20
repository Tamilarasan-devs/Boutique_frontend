import React, { useState, useEffect, useRef } from 'react';
import Pagination from '@/components/ui/Pagination';
import { PackageSearch, Search, Edit2, Trash2, Loader2, Image as ImageIcon, Tag, X } from 'lucide-react';
import { productApi, Product } from '../../api/productApi';
import { fetchWithAuth } from '../../api/client';
import { API_BASE_URL } from '@/constants';
import { toast } from 'sonner';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;
  
  // Edit State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form fields
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrls, setEditImageUrls] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredProducts(
        products.filter(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productApi.deleteProduct(id);
      toast.success('Product deleted successfully');
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditPrice(product.price.toString());
    setEditStock(product.stock_quantity.toString());
    setEditCategory(product.category || '');
    setEditDescription(product.description || '');
    
    const urls = product.image_urls && product.image_urls.length > 0 
      ? [...product.image_urls]
      : (product.image_url ? [product.image_url] : []);
    setEditImageUrls(urls);
    setNewImageFiles([]);
    setNewImagePreviews([]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    const validFiles: File[] = [];
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Image ${file.name} is larger than 5MB`);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setNewImageFiles(prev => [...prev, ...validFiles]);
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    if (!editName || !editPrice) {
      toast.error('Name and Price are required.');
      return;
    }

    setIsSaving(true);
    try {
      let finalImageUrls = [...editImageUrls];

      // Upload new images
      if (newImageFiles.length > 0) {
        for (const file of newImageFiles) {
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
          finalImageUrls.push(uploadData.image_url);
        }
      }

      const updatedProduct = await productApi.updateProduct(editingProduct.id, {
        name: editName,
        price: editPrice,
        stock_quantity: parseInt(editStock) || 0,
        category: editCategory,
        description: editDescription,
        image_url: finalImageUrls[0] || null,
        image_urls: finalImageUrls
      });
      
      setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      toast.success('Product updated successfully!');
      setEditingProduct(null);
    } catch (error) {
      toast.error('Failed to update product');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Product List</h1>
          <p className="text-sm text-slate-500 mt-1">Manage, edit, and organize your product catalog.</p>
        </div>
        
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 flex flex-col overflow-auto">
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-slate-200 flex-shrink-0" />
                          <div className="space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-32" />
                            <div className="h-3 bg-slate-200 rounded w-48" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded w-20" /></td>
                      <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded w-16" /></td>
                      <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-md w-24" /></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <div className="h-8 w-8 bg-slate-200 rounded-lg" />
                          <div className="h-8 w-8 bg-slate-200 rounded-lg" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center max-w-lg mx-auto mt-10">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <PackageSearch className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No Products Found</h3>
            <p className="text-slate-500 mt-2">
              {searchTerm ? 'Try adjusting your search terms.' : "You haven't uploaded any products yet."}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedProducts.map((product) => {
                    const firstImage = product.image_urls?.[0] || product.image_url;
                    return (
                      <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 flex-shrink-0">
                              {firstImage ? (
                                <img src={firstImage} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{product.name}</div>
                              <div className="text-xs text-slate-500 w-48 truncate">{product.description || 'No description'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {product.category ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                              <Tag className="w-3 h-3" /> {product.category}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900">
                            ₹{parseFloat(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold ${
                            product.stock_quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {product.stock_quantity > 0 ? `${product.stock_quantity} IN STOCK` : 'OUT OF STOCK'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditClick(product)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 0 && (
              <div className="mt-auto border-t border-slate-200 p-4 mb-4">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800">Edit Product</h3>
              <button 
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Images */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Images</label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mb-2">
                  {/* Existing Images */}
                  {editImageUrls.map((url, idx) => (
                    <div key={`exist-${idx}`} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <img src={url} alt={`Existing ${idx}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => setEditImageUrls(prev => prev.filter((_, i) => i !== idx))} className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transform hover:scale-110 transition-transform">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {idx === 0 && <div className="absolute top-1 left-1 bg-slate-900/60 text-white text-[9px] font-bold px-1 py-0.5 rounded backdrop-blur">PRIMARY</div>}
                    </div>
                  ))}
                  
                  {/* New Previews */}
                  {newImagePreviews.map((preview, idx) => (
                    <div key={`new-${idx}`} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-blue-200 bg-slate-50">
                      <img src={preview} alt={`New ${idx}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => removeNewImage(idx)} className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transform hover:scale-110 transition-transform">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="absolute top-1 left-1 bg-blue-600 text-white text-[9px] font-bold px-1 py-0.5 rounded shadow-sm">NEW</div>
                    </div>
                  ))}

                  {/* Add Button */}
                  <label className="flex flex-col items-center justify-center cursor-pointer aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 transition-colors">
                    <ImageIcon className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-[10px] font-semibold text-slate-500">Add Image</span>
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" multiple className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name <span className="text-red-500">*</span></label>
                <input required type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price (₹) <span className="text-red-500">*</span></label>
                  <input required type="number" min="0" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stock Quantity</label>
                  <input type="number" min="0" value={editStock} onChange={e => setEditStock(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                <input type="text" value={editCategory} onChange={e => setEditCategory(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={3} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" />
              </div>
              
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-70"
                >
                  {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
