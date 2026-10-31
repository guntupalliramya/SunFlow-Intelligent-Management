import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Plus,
  AlertTriangle,
  Layers,
  Search,
  Filter,
  DollarSign,
  TrendingDown,
  Edit2,
  X,
  CheckCircle,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { Product, ProductCategory, SolarPackage } from '../../types/solar';
import { useSolar } from '../../context/SolarContext';

interface InventoryViewProps {
  onNavigateToSerial?: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onNavigateToSerial }) => {
  const { products, packages, addProduct, updateProduct, updatePackageBOM } = useSolar();

  const [activeTab, setActiveTab] = useState<'products' | 'bom'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // New Product Modal
  const [isNewProdModalOpen, setIsNewProdModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State for Product
  const [prodForm, setProdForm] = useState({
    name: '',
    sku: '',
    category: 'Solar Panels' as ProductCategory,
    unitPrice: 12000,
    purchaseCost: 9000,
    stockQuantity: 20,
    minStockAlert: 5,
    warrantyYears: 25,
    applicableSystemTypes: ['On-Grid', 'Off-Grid', 'Hybrid'] as ('On-Grid' | 'Off-Grid' | 'Hybrid')[],
    requiresSerialTracking: true,
    supplierName: 'Adani Solar',
    description: '',
  });

  // Selected Package for BOM viewing/editing
  const [selectedBomPackage, setSelectedBomPackage] = useState<SolarPackage>(packages[0]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.supplierName && p.supplierName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  const lowStockCount = useMemo(() => {
    return products.filter(
      (p) => p.category !== 'Installation Services' && p.stockQuantity <= p.minStockAlert
    ).length;
  }, [products]);

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name.trim() || !prodForm.sku.trim()) return;

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        ...prodForm,
      });
    } else {
      addProduct({
        ...prodForm,
      });
    }

    setIsNewProdModalOpen(false);
    setEditingProduct(null);
  };

  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdForm({
      name: prod.name,
      sku: prod.sku,
      category: prod.category,
      unitPrice: prod.unitPrice,
      purchaseCost: prod.purchaseCost,
      stockQuantity: prod.stockQuantity,
      minStockAlert: prod.minStockAlert,
      warrantyYears: prod.warrantyYears,
      applicableSystemTypes: prod.applicableSystemTypes,
      requiresSerialTracking: prod.requiresSerialTracking,
      supplierName: prod.supplierName || '',
      description: prod.description || '',
    });
    setIsNewProdModalOpen(true);
  };

  const handleBomQtyChange = (productId: string, newQty: number) => {
    if (newQty < 1) return;
    const updatedComponents = selectedBomPackage.components.map((c) =>
      c.productId === productId ? { ...c, quantity: newQty } : c
    );
    const updatedPkg = { ...selectedBomPackage, components: updatedComponents };
    setSelectedBomPackage(updatedPkg);
    updatePackageBOM(updatedPkg);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Inventory & BOM Configuration</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stock quantities, safety alerts, purchase costs, and configurable Solar Bill of Materials (BOM).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToSerial && (
            <button
              onClick={onNavigateToSerial}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Truck className="w-4 h-4 text-emerald-600" />
              Serial Dispatch Registry →
            </button>
          )}

          <button
            onClick={() => {
              setEditingProduct(null);
              setProdForm({
                name: '',
                sku: '',
                category: 'Solar Panels',
                unitPrice: 12000,
                purchaseCost: 9000,
                stockQuantity: 20,
                minStockAlert: 5,
                warrantyYears: 25,
                applicableSystemTypes: ['On-Grid', 'Off-Grid', 'Hybrid'],
                requiresSerialTracking: true,
                supplierName: '',
                description: '',
              });
              setIsNewProdModalOpen(true);
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New SKU
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'products'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Boxes className="w-4 h-4" />
          Product Catalog & Stock Register ({products.length})
          {lowStockCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
              {lowStockCount} Low
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('bom')}
          className={`px-4 py-2.5 font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'bom'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Configurable Solar Packages & BOM ({packages.length})
        </button>
      </div>

      {activeTab === 'products' ? (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by SKU, product name, supplier..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-medium text-slate-600 whitespace-nowrap">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Categories</option>
                <option value="Solar Panels">Solar Panels</option>
                <option value="Inverters">Inverters</option>
                <option value="Batteries">Batteries</option>
                <option value="Charge Controllers">Charge Controllers</option>
                <option value="Mounting Structures">Mounting Structures</option>
                <option value="Wiring & Connectors">Wiring & Connectors</option>
                <option value="Safety Switches">Safety Switches</option>
                <option value="Earthing Components">Earthing Components</option>
                <option value="Installation Services">Installation Services</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">Product Name & SKU</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4 text-center">Stock Level</th>
                    <th className="py-3 px-4 text-right">Purchase Cost</th>
                    <th className="py-3 px-4 text-right">Selling Price</th>
                    <th className="py-3 px-4">Warranty</th>
                    <th className="py-3 px-4">Serial Req?</th>
                    <th className="py-3 px-4 text-right">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((prod) => {
                    const isLowStock =
                      prod.category !== 'Installation Services' &&
                      prod.stockQuantity <= prod.minStockAlert;

                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{prod.name}</div>
                          <div className="font-mono text-[11px] text-slate-500">{prod.sku}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {prod.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {prod.supplierName || 'SunPower Depot'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {prod.category === 'Installation Services' ? (
                            <span className="text-slate-400 font-medium">Service (On-Demand)</span>
                          ) : (
                            <div className="inline-flex items-center gap-1.5">
                              <span
                                className={`font-mono font-bold text-sm ${
                                  isLowStock ? 'text-amber-600' : 'text-slate-900'
                                }`}
                              >
                                {prod.stockQuantity}
                              </span>
                              {isLowStock && (
                                <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                  <AlertTriangle className="w-3 h-3 text-amber-500 mr-0.5" />
                                  Low Stock
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-600">
                          ₹{prod.purchaseCost.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-700">
                          ₹{prod.unitPrice.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-semibold">
                          {prod.warrantyYears} Years
                        </td>
                        <td className="py-3 px-4">
                          {prod.requiresSerialTracking ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              Yes (Serial)
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">No</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => openEditProduct(prod)}
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Package BOM Configuration View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Package Selector List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-2">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
              Select Solar Package (1 kW – 5 kW)
            </h3>
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => setSelectedBomPackage(pkg)}
                className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedBomPackage.id === pkg.id
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900 text-xs">{pkg.capacityKw} kW {pkg.systemType}</span>
                  <span className="font-bold text-emerald-700 text-xs">₹{pkg.basePrice.toLocaleString()}</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">{pkg.name}</div>
              </button>
            ))}
          </div>

          {/* BOM Component Editor */}
          <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedBomPackage.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedBomPackage.description}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                {selectedBomPackage.systemType} Architecture
              </span>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3">Component / Sub-system</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3 text-center">BOM Quantity</th>
                    <th className="py-2.5 px-3">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedBomPackage.components.map((comp) => (
                    <tr key={comp.productId} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{comp.productName}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{comp.sku}</td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5 border border-slate-200 rounded px-2 py-0.5 bg-slate-50">
                          <button
                            type="button"
                            onClick={() => handleBomQtyChange(comp.productId, comp.quantity - 1)}
                            className="text-slate-500 hover:text-slate-900 font-bold px-1"
                          >
                            -
                          </button>
                          <span className="font-bold text-slate-900 w-6 text-center">{comp.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleBomQtyChange(comp.productId, comp.quantity + 1)}
                            className="text-slate-500 hover:text-slate-900 font-bold px-1"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{comp.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
              💡 <strong>Engineering Note:</strong> When a sales quotation selects this {selectedBomPackage.capacityKw} kW {selectedBomPackage.systemType} package, these exact quantities are automatically populated into the customer proposal and inventory reservation ledger.
            </div>
          </div>
        </div>
      )}

      {/* Product Add/Edit Modal */}
      {isNewProdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full my-8 overflow-hidden border border-slate-200 text-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-sm">
                  {editingProduct ? 'Edit Solar SKU Record' : 'Register New Solar Product SKU'}
                </h3>
              </div>
              <button
                onClick={() => setIsNewProdModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    placeholder="e.g. Adani 540W Mono PERC Bifacial"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={prodForm.sku}
                    onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value })}
                    placeholder="e.g. SP-MONO-540W"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={prodForm.category}
                    onChange={(e) =>
                      setProdForm({ ...prodForm, category: e.target.value as ProductCategory })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Solar Panels">Solar Panels</option>
                    <option value="Inverters">Inverters</option>
                    <option value="Batteries">Batteries</option>
                    <option value="Charge Controllers">Charge Controllers</option>
                    <option value="Mounting Structures">Mounting Structures</option>
                    <option value="Wiring & Connectors">Wiring & Connectors</option>
                    <option value="Safety Switches">Safety Switches</option>
                    <option value="Earthing Components">Earthing Components</option>
                    <option value="Installation Services">Installation Services</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Purchase Cost (Cost to Company ₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={prodForm.purchaseCost}
                    onChange={(e) =>
                      setProdForm({ ...prodForm, purchaseCost: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Customer Unit Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={prodForm.unitPrice}
                    onChange={(e) =>
                      setProdForm({ ...prodForm, unitPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-800"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min={0}
                    value={prodForm.stockQuantity}
                    onChange={(e) =>
                      setProdForm({ ...prodForm, stockQuantity: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Low Stock Alert Threshold
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={prodForm.minStockAlert}
                    onChange={(e) =>
                      setProdForm({ ...prodForm, minStockAlert: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Warranty Duration (Years)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={prodForm.warrantyYears}
                    onChange={(e) =>
                      setProdForm({ ...prodForm, warrantyYears: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">Supplier Name</label>
                  <input
                    type="text"
                    value={prodForm.supplierName}
                    onChange={(e) => setProdForm({ ...prodForm, supplierName: e.target.value })}
                    placeholder="e.g. Adani / Growatt"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="reqSerial"
                    checked={prodForm.requiresSerialTracking}
                    onChange={(e) =>
                      setProdForm({ ...prodForm, requiresSerialTracking: e.target.checked })
                    }
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <label htmlFor="reqSerial" className="font-semibold text-slate-800 cursor-pointer">
                    Requires unique Serial Number Barcode Tracking (Inverters, Batteries, Panels)
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewProdModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Save Product Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
