"use client";

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faEye, faTrash, faAngleLeft, faAngleRight, faTimes, faPlus, faDownload } from '@fortawesome/free-solid-svg-icons';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

const warehouses = ['Fatomg', 'Epe', 'Ajah', 'Lekki'];

const initialExistingComponents = [
    { name: 'Chair Leg', price: 5000 },
    { name: 'Chair Arm', price: 3000 },
    { name: 'Chair Seat', price: 10000 },
    { name: 'Table Top', price: 150000 },
    { name: 'Table Leg', price: 20000 },
    { name: 'Sofa Cushion', price: 25000 },
    { name: 'Bed Frame Rail', price: 30000 },
];

const initialInventory = [
    { name: 'Modern Wooden Chair', id: 'CHR-102', warehouse: 'Fatomg', unitPrice: '₦100,000', type: 'single', components: [], createdBy: 'Admin', createdAt: '2025-09-19 10:00 AM' },
    { name: '3-Seater Sofa', id: 'SFA-245', warehouse: 'Epe', unitPrice: '₦80,000', type: 'single', components: [], createdBy: 'Admin', createdAt: '2025-09-19 10:00 AM' },
    { name: 'Queen Bed Frame', id: 'BED-523', warehouse: 'Ajah', unitPrice: '₦200,000', type: 'single', components: [], createdBy: 'Admin', createdAt: '2025-09-19 10:00 AM' },
    { name: 'Round Dining Table', id: 'TBL-321', warehouse: 'Lekki', unitPrice: '₦100,000', type: 'single', components: [], createdBy: 'Admin', createdAt: '2025-09-19 10:00 AM' },
    { name: 'Wooden Chair', id: 'WC-235', warehouse: 'Fatomg', unitPrice: '₦50,000', type: 'single', components: [], createdBy: 'Admin', createdAt: '2025-09-19 10:00 AM' },
    { name: 'Wooden Dining Table', id: 'TBL-349', warehouse: 'Epe', unitPrice: '₦100,000', type: 'single', components: [], createdBy: 'Admin', createdAt: '2025-09-19 10:00 AM' },
    { name: 'Recliner Chair', id: 'CHR-765', warehouse: 'Epe', unitPrice: '₦500,000', type: 'single', components: [], createdBy: 'Admin', createdAt: '2025-09-19 10:00 AM' },
    { name: 'Ergonomic Office Chair', id: 'CHR-674', warehouse: 'Ajah', unitPrice: '₦200,000', type: 'single', components: [], createdBy: 'Admin', createdAt: '2025-09-19 10:00 AM' },
    { name: 'King Size Bed Frame', id: 'BED-241', warehouse: 'Fatomg', unitPrice: '₦1,500,000', type: 'single', components: [], createdBy: 'Admin', createdAt: '2025-09-19 10:00 AM' },
    { name: 'Dining Set', id: 'SET-001', warehouse: 'Lekki', unitPrice: '₦400,000', type: 'group', components: [{ name: 'Table Top', price: 150000, qty: 1 }, { name: 'Table Leg', price: 20000, qty: 4 }, { name: 'Chair Seat', price: 10000, qty: 4 }, { name: 'Chair Leg', price: 5000, qty: 16 }], createdBy: 'Admin', createdAt: '2025-09-19 10:00 AM' },
    { name: 'Office Desk', id: 'DSK-112', warehouse: 'Ajah', unitPrice: '₦150,000', type: 'single', components: [], createdBy: 'Admin', createdAt: '2025-09-19 10:00 AM' },
    { name: 'Bookshelf', id: 'BSH-334', warehouse: 'Epe', unitPrice: '₦120,000', type: 'single', components: [], createdBy: 'Admin', createdAt: '2025-09-19 10:00 AM' },
    { name: 'Wardrobe', id: 'WRD-556', warehouse: 'Fatomg', unitPrice: '₦300,000', type: 'single', components: [], createdBy: 'Admin', createdAt: '2025-09-19 10:00 AM' },
    { name: 'Coffee Table', id: 'TBL-778', warehouse: 'Lekki', unitPrice: '₦70,000', type: 'single', components: [], createdBy: 'Admin', createdAt: '2025-09-19 10:00 AM' },
    { name: 'Ottoman', id: 'OTM-990', warehouse: 'Ajah', unitPrice: '₦50,000', type: 'single', components: [], createdBy: 'Admin', createdAt: '2025-09-19 10:00 AM' },
];

const ITEMS_PER_PAGE = 8;
const goldColor = '#b88b1b';

export default function InventoryTable() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [inventory, setInventory] = useState(initialInventory);
    const [filteredInventory, setFilteredInventory] = useState(initialInventory);
    const [modalType, setModalType] = useState(null); // 'add' only (no edit)
    const [viewItem, setViewItem] = useState(null);
    const [existingComponents, setExistingComponents] = useState(initialExistingComponents);

    useEffect(() => {
        const results = inventory.filter(item =>
            Object.values(item).some(value => {
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(searchTerm.toLowerCase());
                }
                return false;
            })
        );
        setFilteredInventory(results);
        setCurrentPage(1);
    }, [searchTerm, inventory]);

    const totalPages = Math.ceil(filteredInventory.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentInventory = filteredInventory.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const renderPaginationNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 7;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        if (startPage > 1) {
            pageNumbers.push(<span key="1" className="px-3 py-1 rounded-md border border-gray-300 cursor-pointer" onClick={() => setCurrentPage(1)}>1</span>);
            if (startPage > 2) {
                pageNumbers.push(<span key="ellipsis-start" className="px-3 py-1 rounded-md border border-gray-300">...</span>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <span
                    key={i}
                    className={`px-3 py-1 rounded-md border border-gray-300 cursor-pointer ${currentPage === i ? 'text-white font-medium' : 'text-gray-600'}`}
                    style={currentPage === i ? { backgroundColor: goldColor } : {}}
                    onClick={() => setCurrentPage(i)}
                >
                    {i}
                </span>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageNumbers.push(<span key="ellipsis-end" className="px-3 py-1 rounded-md border border-gray-300">...</span>);
            }
            pageNumbers.push(<span key={totalPages} className="px-3 py-1 rounded-md border border-gray-300 cursor-pointer" onClick={() => setCurrentPage(totalPages)}>{totalPages}</span>);
        }

        return pageNumbers;
    };

    const handleSave = (formData) => {
        const now = new Date();
        const createdAt = now.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        const createdBy = localStorage.getItem('first_name') || 'Admin';
        setInventory([...inventory, { ...formData, createdBy, createdAt }]);
        setModalType(null);
        toast.success('Item added and QR code generated', { duration: 4000 });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this item?')) {
            setInventory(inventory.filter(i => i.id !== id));
            toast.success('Item deleted successfully', { duration: 4000 });
        }
    };

    const downloadQRCode = (item) => {
        const canvas = document.createElement('canvas');
        const svg = document.querySelector('#qr-code svg');
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `${item.name}_QRCode.png`;
            link.href = url;
            link.click();
        };
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold flex-shrink-0">Inventory table</h2>
                <div className="flex w-full sm:w-auto">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search inventory"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                        </div>
                    </div>
                    <button
                        className="px-4 py-2 rounded-md ml-3 text-white font-medium flex-shrink-0"
                        style={{ backgroundColor: goldColor }}
                        onClick={() => setModalType('add')}
                    >
                        Add item
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-white">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit price</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentInventory.map((item, index) => (
                            <tr key={index}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{item.id}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{item.warehouse}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{item.unitPrice}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-4 text-gray-500">
                                        <button className="hover:text-gray-700 transition-colors duration-200" aria-label="View" onClick={() => setViewItem(item)}>
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                        <button className="hover:text-gray-700 transition-colors duration-200" aria-label="Delete" onClick={() => handleDelete(item.id)}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center items-center gap-2">
                <button
                    className="flex items-center justify-center p-2 rounded-md border border-gray-300 disabled:opacity-50"
                    style={{ backgroundColor: goldColor }}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                >
                    <FontAwesomeIcon icon={faAngleLeft} className="text-white" />
                </button>
                <div className="flex gap-2 text-sm font-medium">
                    {renderPaginationNumbers()}
                </div>
                <button
                    className="flex items-center justify-center p-2 rounded-md border border-gray-300 disabled:opacity-50"
                    style={{ backgroundColor: goldColor }}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                >
                    <FontAwesomeIcon icon={faAngleRight} className="text-white" />
                </button>
            </div>

            {/* Add Modal */}
            {modalType === 'add' && (
                <AddModal
                    onClose={() => setModalType(null)}
                    onSave={handleSave}
                    existingComponents={existingComponents}
                    setExistingComponents={setExistingComponents}
                    warehouses={warehouses}
                />
            )}

            {/* View Modal */}
            {viewItem && (
                <div className="fixed inset-0 bg-[#000000aa] flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full relative">
                        <button 
                            onClick={() => setViewItem(null)} 
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <FontAwesomeIcon icon={faTimes} size="lg" />
                        </button>
                        <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: goldColor }}>Details for {viewItem.name}</h3>
                        <div className="space-y-3">
                            <p className="text-gray-800"><strong className="font-semibold">ID:</strong> {viewItem.id}</p>
                            <p className="text-gray-800"><strong className="font-semibold">Warehouse:</strong> {viewItem.warehouse}</p>
                            <p className="text-gray-800"><strong className="font-semibold">Unit Price:</strong> {viewItem.unitPrice}</p>
                            <p className="text-gray-800"><strong className="font-semibold">Type:</strong> {viewItem.type}</p>
                            <p className="text-gray-800"><strong className="font-semibold">Created By:</strong> {viewItem.createdBy}</p>
                            <p className="text-gray-800"><strong className="font-semibold">Created At:</strong> {viewItem.createdAt}</p>
                            {viewItem.type === 'group' && viewItem.components.length > 0 && (
                                <>
                                    <h4 className="text-lg font-semibold mt-4 mb-2" style={{ color: goldColor }}>Components:</h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {viewItem.components.map((comp, idx) => (
                                            <li key={idx} className="text-gray-700">{comp.name} x {comp.qty} @ ₦{comp.price.toLocaleString()}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                            <h4 className="text-lg font-semibold mt-4 mb-2" style={{ color: goldColor }}>QR Code:</h4>
                            <div className="flex justify-center mb-4" id="qr-code">
                                <QRCodeSVG
                                    value={`Name: ${viewItem.name}\nID: ${viewItem.id}\nWarehouse: ${viewItem.warehouse}\nUnit Price: ${viewItem.unitPrice}\nType: ${viewItem.type}${viewItem.type === 'group' ? `\nComponents:\n${viewItem.components.map(c => `${c.name}: ${c.qty} @ ₦${c.price}`).join('\n')}` : ''}\nCreated By: ${viewItem.createdBy}\nCreated At: ${viewItem.createdAt}`}
                                    size={128}
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                    level="Q"
                                />
                            </div>
                            <button
                                onClick={() => downloadQRCode(viewItem)}
                                className="w-full px-4 py-2 text-white rounded-md hover:opacity-90 flex items-center justify-center transition duration-200"
                                style={{ backgroundColor: goldColor }}
                            >
                                <FontAwesomeIcon icon={faDownload} className="mr-2" /> Download QR Code
                            </button>
                        </div>
                        <button
                            onClick={() => setViewItem(null)}
                            className="mt-6 w-full px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-200"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const AddModal = ({ onClose, onSave, existingComponents, setExistingComponents, warehouses }) => {
    const [formData, setFormData] = useState({ name: '', id: '', warehouse: '', unitPrice: '₦0', type: 'single', components: [] });
    const [isNewComponent, setIsNewComponent] = useState(false);
    const [newCompName, setNewCompName] = useState('');
    const [newCompPrice, setNewCompPrice] = useState(0);
    const [selectedCompName, setSelectedCompName] = useState('');
    const [compQty, setCompQty] = useState(0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addComponent = () => {
        let newComp;
        if (isNewComponent) {
            if (!newCompName || newCompPrice <= 0) return;
            newComp = { name: newCompName, price: newCompPrice };
            setExistingComponents([...existingComponents, newComp]);
            setNewCompName('');
            setNewCompPrice(0);
        } else {
            if (!selectedCompName) return;
            newComp = existingComponents.find(c => c.name === selectedCompName);
            setSelectedCompName('');
        }

        if (newComp) {
            const qty = formData.type === 'single' ? 1 : compQty;
            if (formData.type === 'single' || qty > 0) {
                setFormData(prev => ({
                    ...prev,
                    components: formData.type === 'single' ? [{ ...newComp, qty }] : [...prev.components, { ...newComp, qty }]
                }));
            }
        }
        setCompQty(0);
    };

    const removeComponent = (index) => {
        setFormData(prev => ({
            ...prev,
            components: prev.components.filter((_, i) => i !== index)
        }));
    };

    const calculatedUnitPrice = formData.components.reduce((sum, comp) => sum + (comp.price * comp.qty), 0);
    const unitPriceDisplay = `₦${calculatedUnitPrice.toLocaleString()}`;

    const handleSubmit = (e) => {
        e.preventDefault();
        const saveData = {
            ...formData,
            unitPrice: unitPriceDisplay
        };
        onSave(saveData);
    };

    const hasComponent = formData.components.length > 0;

    return (
        <div className="fixed inset-0 bg-[#000000aa] flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full overflow-y-auto max-h-[80vh] relative">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                </button>
                <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: goldColor }}>Add Inventory Item</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-5">
                        <label className="block text-sm font-semibold text-gray-800 mb-1">Name</label>
                        <input 
                            type="text" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#b88b1b] focus:border-[#b88b1b] transition duration-200" 
                            required 
                        />
                    </div>
                    <div className="mb-5">
                        <label className="block text-sm font-semibold text-gray-800 mb-1">ID</label>
                        <input 
                            type="text" 
                            name="id" 
                            value={formData.id} 
                            onChange={handleChange} 
                            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#b88b1b] focus:border-[#b88b1b] transition duration-200" 
                            required 
                        />
                    </div>
                    <div className="mb-5">
                        <label className="block text-sm font-semibold text-gray-800 mb-1">Warehouse</label>
                        <select 
                            name="warehouse" 
                            value={formData.warehouse} 
                            onChange={handleChange} 
                            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#b88b1b] focus:border-[#b88b1b] transition duration-200" 
                            required
                        >
                            <option value="">Select Warehouse</option>
                            {warehouses.map(wh => <option key={wh} value={wh}>{wh}</option>)}
                        </select>
                    </div>
                    <div className="mb-5">
                        <label className="block text-sm font-semibold text-gray-800 mb-1">Type</label>
                        <select 
                            name="type" 
                            value={formData.type} 
                            onChange={handleChange} 
                            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#b88b1b] focus:border-[#b88b1b] transition duration-200" 
                            required
                        >
                            <option value="single">Single</option>
                            <option value="group">Group</option>
                        </select>
                    </div>
                    <div className="mb-5">
                        <h4 className="text-lg font-semibold mb-3" style={{ color: goldColor }}>Components</h4>
                        <ul className="mb-4 space-y-2">
                            {formData.components.map((comp, idx) => (
                                <li key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-md shadow-sm">
                                    <span>{comp.name} {formData.type === 'group' ? `x ${comp.qty}` : ''} @ ₦{comp.price.toLocaleString()}</span>
                                    <button type="button" onClick={() => removeComponent(idx)} className="text-red-500 hover:text-red-700 ml-2">
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                        {!hasComponent || formData.type === 'group' ? (
                            <>
                                <div className="flex items-center mb-3">
                                    <input 
                                        type="checkbox" 
                                        checked={isNewComponent} 
                                        onChange={(e) => setIsNewComponent(e.target.checked)} 
                                        className="h-4 w-4 text-[#b88b1b] focus:ring-[#b88b1b] border-gray-300 rounded" 
                                    />
                                    <label className="ml-2 text-sm text-gray-700">Add New Component</label>
                                </div>
                                {isNewComponent ? (
                                    <>
                                        <input 
                                            type="text" 
                                            placeholder="Component Name" 
                                            value={newCompName} 
                                            onChange={(e) => setNewCompName(e.target.value)} 
                                            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#b88b1b] focus:border-[#b88b1b] transition duration-200 mb-3" 
                                        />
                                        <input 
                                            type="number" 
                                            placeholder="Price" 
                                            value={newCompPrice} 
                                            onChange={(e) => setNewCompPrice(parseFloat(e.target.value))} 
                                            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#b88b1b] focus:border-[#b88b1b] transition duration-200 mb-3" 
                                        />
                                        {formData.type === 'group' && (
                                            <input 
                                                type="number" 
                                                placeholder="Quantity" 
                                                value={compQty} 
                                                onChange={(e) => setCompQty(parseInt(e.target.value))} 
                                                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#b88b1b] focus:border-[#b88b1b] transition duration-200 mb-3" 
                                            />
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <select 
                                            value={selectedCompName} 
                                            onChange={(e) => setSelectedCompName(e.target.value)} 
                                            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#b88b1b] focus:border-[#b88b1b] transition duration-200 mb-3"
                                        >
                                            <option value="">Select Component</option>
                                            {existingComponents.map(comp => <option key={comp.name} value={comp.name}>{comp.name}</option>)}
                                        </select>
                                        {formData.type === 'group' && (
                                            <input 
                                                type="number" 
                                                placeholder="Quantity" 
                                                value={compQty} 
                                                onChange={(e) => setCompQty(parseInt(e.target.value))} 
                                                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#b88b1b] focus:border-[#b88b1b] transition duration-200 mb-3" 
                                            />
                                        )}
                                    </>
                                )}
                                <button 
                                    type="button" 
                                    onClick={addComponent} 
                                    className="w-full px-4 py-2 text-white rounded-md hover:opacity-90 flex items-center justify-center transition duration-200"
                                    style={{ backgroundColor: goldColor }}
                                >
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Component
                                </button>
                            </>
                        ) : null}
                    </div>
                    <p className="mb-6 text-center font-semibold"><strong>Unit Price (Total):</strong> {unitPriceDisplay}</p>
                    <div className="flex justify-end space-x-3">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-200"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="px-6 py-2 text-white rounded-md hover:opacity-90 transition duration-200"
                            style={{ backgroundColor: goldColor }}
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};