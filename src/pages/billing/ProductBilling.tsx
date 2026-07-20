import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, User, Box, FileText, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { productApi, Product } from '../../api/productApi';
import { customerApi } from '../../api/customerApi';
import { billingApi } from '../../api/billingApi';
import { posBillingApi } from '../../api/posBillingApi';
import { toast } from 'sonner';

interface CartItem {
  product: Product;
  quantity: number;
}

const ProductBilling: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInvoice, setSuccessInvoice] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
    // Focus search on mount for barcode scanners
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const fetchData = async () => {
    try {
      const [prods, custData] = await Promise.all([
        productApi.getProducts(),
        customerApi.getCustomers()
      ]);
      setProducts(prods);
      setCustomers(Array.isArray(custData) ? custData : custData.customers || []);
    } catch (error) {
      toast.error('Failed to fetch data');
    }
  };

  // Check for barcode exact match whenever search term changes
  useEffect(() => {
    if (searchTerm.length >= 4) {
      const exactMatch = products.find(p => p.barcode === searchTerm);
      if (exactMatch) {
        addToCart(exactMatch);
        setSearchTerm('');
      }
    }
  }, [searchTerm, products]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(term) || 
      (p.barcode && p.barcode.toLowerCase().includes(term))
    );
  }, [products, searchTerm]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(`${product.name} added`);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0);
  const total = subtotal; // Can add tax logic later

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    if (!customerName) {
      toast.error('Please enter or select a customer name');
      return;
    }

    setIsSubmitting(true);
    try {
      const items = cart.map(item => ({
        description: item.product.name,
        quantity: item.quantity,
        price: parseFloat(item.product.price),
        amount: parseFloat(item.product.price) * item.quantity
      }));

      const today = new Date().toISOString().split('T')[0];
      
      const result = await posBillingApi.createPosBill({
        customer_name: customerName,
        customer_phone: customerPhone,
        bill_date: today,
        total_amount: total,
        status: 'Paid',
        items: items
      });

      toast.success('Bill created successfully!');
      setSuccessInvoice(result.bill.bill_number);
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create bill');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successInvoice) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[70vh] bg-slate-50/50 p-6">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200/60 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Payment Successful</h2>
          <p className="text-slate-500 mb-6">Invoice <span className="font-bold text-slate-800">#{successInvoice}</span> has been generated.</p>
          
          <button 
            onClick={() => setSuccessInvoice(null)}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-all active:scale-[0.98]"
          >
            Start New Bill
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50 p-4 md:p-6 min-h-screen">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">POS Billing</h1>
          <p className="text-sm text-slate-500 mt-1">Scan barcodes or search products to create a bill.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
        
        {/* Left Column: Product Selection */}
        <div className="lg:col-span-2 space-y-6 flex flex-col h-[calc(100vh-140px)]">
          {/* Search/Scan Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                ref={searchInputRef}
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Scan Barcode or Search Product by Name..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:bg-white text-slate-800 font-medium transition-all outline-none"
                autoFocus
              />
            </div>
            <div className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl text-sm flex items-center gap-2">
              <Box className="w-4 h-4" /> {products.length} Products
            </div>
          </div>

          {/* Product Grid */}
          <div className="bg-white border border-slate-200/60 shadow-sm rounded-2xl p-6 flex-1 overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Available Products</h3>
            
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 text-slate-500 flex flex-col items-center">
                <Box className="w-12 h-12 text-slate-300 mb-3" />
                <p>No products found matching "{searchTerm}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                  <div 
                    key={product.id} 
                    onClick={() => addToCart(product)}
                    className="border border-slate-200 hover:border-blue-500 hover:shadow-md cursor-pointer rounded-2xl p-4 transition-all group bg-white relative overflow-hidden"
                  >
                    <div className="aspect-square bg-slate-50 rounded-xl mb-3 flex items-center justify-center relative">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                      )}
                      <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm truncate" title={product.name}>{product.name}</h4>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-bold text-blue-600">₹{parseFloat(product.price).toFixed(2)}</span>
                      {product.stock_quantity > 0 ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">{product.stock_quantity} left</span>
                      ) : (
                        <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">Out of stock</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Cart / Bill */}
        <div className="lg:col-span-1 bg-white border border-slate-200/60 shadow-sm rounded-3xl overflow-hidden flex flex-col h-[calc(100vh-140px)]">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" /> Current Bill
            </h2>
            {cart.length > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {cart.length} item{cart.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-5">
            {cart.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center">
                <ShoppingCart className="w-12 h-12 text-slate-200 mb-3" />
                <p className="text-slate-500 font-medium">Cart is empty</p>
                <p className="text-xs text-slate-400 mt-1">Scan products to add them to the bill</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.product.id} className="flex justify-between items-center pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className="font-bold text-slate-800 text-sm truncate">{item.product.name}</h4>
                      <div className="text-xs text-slate-500 mt-0.5">₹{parseFloat(item.product.price).toFixed(2)} / unit</div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                        <button onClick={() => updateQuantity(item.product.id, -1)} className="px-2 py-1.5 hover:bg-slate-200 text-slate-600 transition-colors">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 font-semibold text-sm w-8 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, 1)} className="px-2 py-1.5 hover:bg-slate-200 text-slate-600 transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <div className="text-right w-16">
                        <span className="font-bold text-slate-900 text-sm">₹{(parseFloat(item.product.price) * item.quantity).toFixed(0)}</span>
                      </div>
                      
                      <button onClick={() => removeFromCart(item.product.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 bg-slate-50/80 border-t border-slate-100 space-y-5">
            {/* Customer Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Customer Details
              </label>
              <div className="space-y-3">
                <input 
                  type="text" 
                  list="customers-list"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    const cust = customers.find(c => c.name === e.target.value);
                    if (cust && cust.phone) setCustomerPhone(cust.phone);
                  }}
                  placeholder="Customer Name..." 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                />
                <input 
                  type="tel" 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Customer Phone (Optional)..." 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                />
              </div>
              <datalist id="customers-list">
                {customers.map(c => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-200 border-dashed">
              <div className="flex justify-between text-sm font-medium text-slate-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-slate-600">
                <span>Discount</span>
                <span>₹0.00</span>
              </div>
              <div className="flex justify-between items-center text-lg font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-blue-600 text-2xl">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              disabled={isSubmitting || cart.length === 0}
              onClick={handleCheckout}
              className="w-full py-4 bg-slate-900 hover:bg-black disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all transform active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <><CreditCard className="w-5 h-5" /> Complete Payment (₹{total.toFixed(2)})</>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductBilling;
