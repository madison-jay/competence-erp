import React from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBus, faFirstAid, faGlobe, faMoneyBill } from "@fortawesome/free-solid-svg-icons";
import { faBarChart, faNoteSticky } from "@fortawesome/free-regular-svg-icons";

const LoginBanner = () => {
  return (
    <div className="bg-[#000000] w-1/2 h-[604px] rounded-3xl relative login-banner p-8 overflow-hidden flex justify-center items-center"> 
    <img src="/Login_GIF.gif" alt="login gif" className="mb-10" />
      <h2 className="absolute bottom-[4%] whitespace-nowrap translate-x-1/2 right-1/2 text-white font-semibold text-xl">Building Great Workplaces Together</h2>
    </div>
  );
}

export default LoginBanner;