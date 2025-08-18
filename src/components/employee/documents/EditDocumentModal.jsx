"use client";
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import apiService from '@/app/lib/apiService';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';

const EditDocumentModal = ({
    document,
    isOpen,
    onClose,
    onDocumentUpdated
}) => {
    const router = useRouter();
    const supabase = createClient();
    const [formData, setFormData] = useState({
        name: document?.name || '',
        type: document?.type || '',
        file: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const documentTypes = [
        "official documents",
        "payslips",
        "contracts",
        "certificates",
        "ids"
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, file: e.target.files[0] }));
    };

    const uploadFileToSupabase = async (file, bucketName, folderPath) => {
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `${folderPath}/${fileName}`;
        const { error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) {
            console.error(`Error uploading file to ${bucketName}:`, error);
            throw new Error(`Failed to upload ${file.name}: ${error.message}`);
        }

        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let documentUrl = document.url;

            // If a new file was uploaded
            if (formData.file) {
                documentUrl = await uploadFileToSupabase(
                    formData.file,
                    'documents',
                    'employee_documents'
                );
            }

            const payload = {
                name: formData.name,
                type: formData.type,
                ...(formData.file && { url: documentUrl })
            };

            await apiService.updateEmployeeDocument(
                document.id,
                payload,
                router
            );

            toast.success('Document updated successfully!');
            onClose();
            onDocumentUpdated();
        } catch (error) {
            console.error("Update failed:", error);
            toast.error(error.message || 'Failed to update document');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#000000aa] flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Edit Document</h2>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                            Document Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            className="w-full p-2 border rounded border-gray-400 focus:ring-[#b88b1b] focus:border-[#b88b1b] focus:ring-0 focus:outline-none"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                            Document Type
                        </label>
                        <select
                            name="type"
                            className="w-full p-2 border rounded border-gray-400 focus:ring-[#b88b1b] focus:border-[#b88b1b] focus:ring-0 focus:outline-none"
                            value={formData.type}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="">Select Type</option>
                            {documentTypes.map(type => (
                                <option key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                            Current File
                        </label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded border-gray-400 bg-gray-100 mb-2"
                            value={document?.url?.split('/').pop() || 'N/A'}
                            readOnly
                        />
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                            Replace File (optional)
                        </label>
                        <input
                            type="file"
                            className="w-full p-2 file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-[#b88b1b] file:text-white
                hover:file:bg-[#8d6b14]"
                            onChange={handleFileChange}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            className="px-4 py-2 border rounded border-gray-400 hover:bg-gray-100 transition-colors"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#b88b1b] text-white rounded hover:bg-[#8d6b14] transition-colors"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center">
                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                    Saving...
                                </span>
                            ) : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDocumentModal;