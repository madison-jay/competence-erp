import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import AddCustomerModal from "./AddCustomer";
import EditCustomerModal from "./EditCustomerModal";
import DeleteCustomerModal from "./DeleteCustomerModal";

const CustomerListTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customers, setCustomers] = useState([
        {
            name: "Abdulrauf Fuad",
            phone: "+2348012345678",
            email: "fuad@gmail.com",
            address: "12 Lagos Street",
            state: "Lagos",
            lastOrder: "Sep 08, 2025",
            totalOrders: 50,
            totalSpend: "N170,000",
            status: "Active",
        },
        {
            name: "John Doe",
            phone: "+2348076543210",
            email: "john@gmail.com",
            address: "15 Lagos Avenue",
            state: "Lagos",
            lastOrder: "Sep 07, 2025",
            totalOrders: 40,
            totalSpend: "N140,000",
            status: "Active",
        },
        {
            name: "Irene Israel",
            phone: "+2348034567890",
            email: "irene@gmail.com",
            address: "20 Abuja Road",
            state: "Abuja",
            lastOrder: "Sep 07, 2025",
            totalOrders: 40,
            totalSpend: "N180,000",
            status: "Active",
        },
        {
            name: "Mary Smith",
            phone: "+2348098765432",
            email: "mary@gmail.com",
            address: "10 Akwa Street",
            state: "Akwa",
            lastOrder: "Sep 04, 2025",
            totalOrders: 38,
            totalSpend: "N175,000",
            status: "Active",
        },
        {
            name: "Victor Tobi",
            phone: "+2348054321098",
            email: "tobi@gmail.com",
            address: "5 Abuja Lane",
            state: "Abuja",
            lastOrder: "Sep 02, 2025",
            totalOrders: 38,
            totalSpend: "N170,000",
            status: "Active",
        },
        {
            name: "Murtala Muhammad",
            phone: "+2348012345678",
            email: "murtala@gmail.com",
            address: "8 Kano Road",
            state: "Kano",
            lastOrder: "Sep 02, 2025",
            totalOrders: 42,
            totalSpend: "N150,000",
            status: "Active",
        },
        {
            name: "Ojo Danjuma",
            phone: "+2348076543210",
            email: "dan@gmail.com",
            address: "3 Badan Street",
            state: "Badan",
            lastOrder: "Sep 01, 2025",
            totalOrders: 32,
            totalSpend: "N135,000",
            status: "Inactive",
        },
        {
            name: "Okeke Chukwuma",
            phone: "+2348034567890",
            email: "chukwuma@gmail.com",
            address: "7 Anambra Avenue",
            state: "Anambra",
            lastOrder: "Aug 31, 2025",
            totalOrders: 20,
            totalSpend: "N130,000",
            status: "Inactive",
        },
        {
            name: "Amina Musa",
            phone: "+2348098765432",
            email: "amina@gmail.com",
            address: "4 Abuja Drive",
            state: "Abuja",
            lastOrder: "Aug 24, 2025",
            totalOrders: 10,
            totalSpend: "N110,000",
            status: "Inactive",
        },
    ]);

    const itemsPerPage = 5;

    const handleAddCustomer = (newCustomer) => {
        setCustomers(prev => [...prev, newCustomer]);
    };

    const handleUpdateCustomer = (updatedCustomer) => {
        setCustomers(prev => prev.map(c => c.email === updatedCustomer.email ? updatedCustomer : c));
    };

    const handleDeleteCustomer = (customerToDelete) => {
        setCustomers(prev => prev.filter(c => c.email !== customerToDelete.email));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return 'text-green-500';
            case 'Inactive':
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastOrder.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.totalOrders.toString().includes(searchTerm) ||
        customer.totalSpend.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Customer list table</h2>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search customers"
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b] min-w-[200px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-[#b88b1b] hover:bg-[#886817] transition-all text-white rounded-md whitespace-nowrap"
                    >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        Add Customer
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-gray-600 text-sm border-b border-gray-300">
                            <th className="pb-4 pt-2 px-4 min-w-[150px]">Customer name</th>
                            <th className="pb-4 pt-2 px-4 min-w-[130px]">Phone number</th>
                            <th className="pb-4 pt-2 px-4 min-w-[180px]">Email</th>
                            <th className="pb-4 pt-2 px-4 min-w-[150px]">Address</th>
                            <th className="pb-4 pt-2 px-4 min-w-[100px]">State</th>
                            <th className="pb-4 pt-2 px-4 min-w-[100px]">Last order</th>
                            <th className="pb-4 pt-2 px-4 min-w-[100px]">Total orders</th>
                            <th className="pb-4 pt-2 px-4 min-w-[100px]">Status</th>
                            <th className="pb-4 pt-2 px-4 min-w-[100px]">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentCustomers.length > 0 ? (
                            currentCustomers.map((customer, index) => (
                                <tr key={index} className="border-b border-gray-300">
                                    <td className="py-5 px-4 min-w-[150px] whitespace-nowrap">{customer.name}</td>
                                    <td className="py-5 px-4 min-w-[130px] whitespace-nowrap">{customer.phone}</td>
                                    <td className="py-5 px-4 min-w-[180px] whitespace-nowrap">{customer.email}</td>
                                    <td className="py-5 px-4 min-w-[150px] whitespace-nowrap">{customer.address}</td>
                                    <td className="py-5 px-4 min-w-[100px] whitespace-nowrap">{customer.state}</td>
                                    <td className="py-5 px-4 min-w-[100px] whitespace-nowrap">{customer.lastOrder}</td>
                                    <td className="py-5 px-4 min-w-[100px] whitespace-nowrap">{customer.totalOrders}</td>
                                    <td className="py-5 px-4 min-w-[100px] whitespace-nowrap">
                                        <span className={getStatusColor(customer.status)}>
                                            {customer.status}
                                        </span>
                                    </td>
                                    <td className="py-5 px-4 min-w-[100px] flex space-x-4">
                                        <FontAwesomeIcon
                                            icon={faEdit}
                                            className="text-blue-500 hover:text-blue-600 transition-all cursor-pointer"
                                            onClick={() => {
                                                setSelectedCustomer(customer);
                                                setIsEditModalOpen(true);
                                            }}
                                        />
                                        <FontAwesomeIcon
                                            icon={faTrash}
                                            className="text-red-500 hover:text-red-600 transition-all cursor-pointer"
                                            onClick={() => {
                                                setSelectedCustomer(customer);
                                                setIsDeleteModalOpen(true);
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="py-5 px-4 text-center text-gray-500">
                                    No customers found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="mt-6 mb-3 flex justify-center items-center gap-2 flex-wrap">
                <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-[#b88b1b] text-white rounded-md disabled:opacity-50 whitespace-nowrap"
                >
                    Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        onClick={() => paginate(page)}
                        className={`px-3 py-1 mx-1 rounded-md ${currentPage === page ? 'bg-[#b88b1b] text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        {page}
                    </button>
                ))}
                <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-[#b88b1b] text-white rounded-md disabled:opacity-50 whitespace-nowrap"
                >
                    Next
                </button>
            </div>

            <AddCustomerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddCustomer={handleAddCustomer}
            />
            <EditCustomerModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onUpdateCustomer={handleUpdateCustomer}
                customer={selectedCustomer}
            />
            <DeleteCustomerModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDeleteCustomer={handleDeleteCustomer}
                customer={selectedCustomer}
            />
        </div>
    );
};

export default CustomerListTable;