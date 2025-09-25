import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import toast from "react-hot-toast";

const DeleteCustomerModal = ({ isOpen, onClose, onDeleteCustomer, customer }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        setIsLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            onDeleteCustomer(customer);

            toast.success("Customer deleted successfully!");

            onClose();
        } catch (error) {
            toast.error("Failed to delete customer");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#000000aa] flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-[#b88b1b]">Delete Customer</h2>
                    <button onClick={onClose} disabled={isLoading}>
                        <FontAwesomeIcon icon={faTimes} className={`text-gray-600 hover:text-[#b88b1b] ${isLoading ? 'opacity-50' : ''}`} />
                    </button>
                </div>
                <p className="text-gray-700 mb-6">
                    Are you sure you want to delete <span className="font-semibold">{customer?.name}</span>? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className={`px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        className={`px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"></path>
                                </svg>
                                Deleting...
                            </span>
                        ) : (
                            "Delete"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteCustomerModal;