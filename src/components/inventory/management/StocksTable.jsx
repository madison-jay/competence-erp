"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash, faPlus, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import apiService from "@/app/lib/apiService";
import StockEntryModal from "./StockEntryModal";
import ViewStockModal from "./ViewStockModal";
import EditStockModal from "./EditStockModal";
import DeleteStockModal from "./DeleteStockModal";
import toast from 'react-hot-toast';
import { createClient } from "@/app/lib/supabase/client";

export default function StocksTable({ onDataChange }) {
    const [items, setItems] = useState([]);
    const [products, setProducts] = useState({});
    const [components, setComponents] = useState({});
    const [batches, setBatches] = useState({});
    const [locations, setLocations] = useState({});
    const [suppliers, setSuppliers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState({});
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);
    const [importBatches, setImportBatches] = useState([]);

    const supabase = createClient()

    useEffect(() => {
        loadStockSummary();
        loadImportBatches();
        loadLocations();
        loadSuppliers();
    }, []);

    const loadImportBatches = async () => {
        try {
            const response = await apiService.getImportBatches();
            if (response.status === 'success') {
                setImportBatches(response.data || []);
            }
        } catch (error) {
            console.error('Error loading import batches:', error);
        }
    };

    const loadLocations = async () => {
        try {
            const { data, error } = await supabase.from('locations').select('id, name');
            if (error) {
                console.error('Error loading locations:', error);
                return;
            }
            const locMap = data.reduce((acc, loc) => {
                acc[loc.id] = loc.name;
                return acc;
            }, {});
            setLocations(locMap);
        } catch (error) {
            console.error('Error loading locations:', error);
        }
    };

    const loadSuppliers = async () => {
        try {
            const response = await apiService.getSuppliers();
            if (response.status === 'success') {
                const supMap = response.data.reduce((acc, sup) => {
                    acc[sup.id] = sup;
                    return acc;
                }, {});
                setSuppliers(supMap);
            }
        } catch (error) {
            console.error('Error loading suppliers:', error);
        }
    };

    const loadStockSummary = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await apiService.getStocks();

            if (response.status === 'success') {
                const productItems = (response.data.products || []).map(p => ({
                    ...p,
                    type: 'product',
                    id: p.product_id,
                    components_needed: p.components_needed || []
                }));
                const componentItems = (response.data.components || []).map(c => ({
                    ...c,
                    type: 'component',
                    id: c.component_id,
                    components_needed: []
                }));
                setItems([...productItems, ...componentItems]);
            } else {
                setError('Failed to load stock summary');
                toast.error('Failed to load stock summary');
                setItems([]);
            }
        } catch (error) {
            console.error('Error loading stock summary:', error);
            setError('Failed to load stock summary');
            toast.error('Failed to load stock summary');
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpanded = (id) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const typeColors = {
        product: 'bg-purple-100 text-purple-800',
        component: 'bg-orange-100 text-orange-800'
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b88b1b]"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Stock Summary</h3>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-[#b88b1b] text-white px-4 py-2 rounded-lg transition-all hover:bg-[#856515] flex items-center"
                >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Add Stock
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mx-6 mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Item
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                SKU
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock Quantity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                    No stock entries found
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <React.Fragment key={item.id}>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${typeColors[item.type] || 'bg-gray-100 text-gray-800'}`}>
                                                {item.type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {item.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.sku}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.stock_quantity}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            {item.type === 'product' && item.components_needed.length > 0 && (
                                                <button
                                                    onClick={() => toggleExpanded(item.id)}
                                                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                    title={expanded[item.id] ? "Hide Components" : "Show Components"}
                                                >
                                                    <FontAwesomeIcon icon={expanded[item.id] ? faChevronUp : faChevronDown} />
                                                </button>
                                            )}
                                            {/* Add other actions if needed, e.g., view individual stocks */}
                                        </td>
                                    </tr>
                                    {item.type === 'product' && expanded[item.id] && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 bg-gray-50">
                                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Components Needed</h4>
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-100">
                                                        <tr>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {item.components_needed.map((comp) => (
                                                            <tr key={comp.component_id}>
                                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{comp.name}</td>
                                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{comp.sku}</td>
                                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{comp.required_quantity}</td>
                                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{comp.available_quantity}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {showCreateModal && (
                <StockEntryModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        loadStockSummary();
                        onDataChange();
                    }}
                    importBatches={importBatches}
                />
            )}
        </div>
    );
}