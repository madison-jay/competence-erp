import React from "react";

const TopSellingProducts = () => {
    const products = [
        { name: 'Sofa sets', units: 100 },
        { name: 'Dining table', units: 94 },
        { name: 'Coffee table', units: 90 },
        { name: 'Recliner chair', units: 88 },
        { name: 'Bookshelves', units: 80 },
    ];

    return (
        <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-7">
                <h2 className="text-lg font-bold">Top 5 Selling Products</h2>
                <div className="flex items-center text-gray-600 text-sm cursor-pointer">
                   ( Monthly )
                </div>
            </div>
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-gray-600 text-sm">
                            <th className="pb-4">Product name</th>
                            <th className="pb-4 text-right">Units sold</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product, index) => (
                            <tr key={index} className="border-t border-gray-300">
                                <td className="py-3">{product.name}</td>
                                <td className="py-3 text-right">{product.units}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TopSellingProducts;