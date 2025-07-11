import React from "react";

export default function PayrollCard({ title, value}) {
    return (
        <div className="px-4 py-5 border-[0.5px] border-solid border-[#DDD9D9] hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 rounded-xl hover:bg-[#b88b1b] min-w-[240px] flex-grow group">
            <h5 className="text-[#A09D9D] text-[16px] font-bold group-hover:text-white">{title}</h5>
            <p className="text-black font-bold text-3xl group-hover:text-white">{value}</p>
        </div>
    )
}   