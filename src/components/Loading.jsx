// src/components/Loading.jsx
"use client"

import React from 'react';
import Image from 'next/image';

export default function Loading() {
    return (
        <div className='flex justify-center items-center h-screen'>
            <Image
                src="/competence-logo.webp"
                width={250}
                height={250}
                alt='competence logo'
                priority
                className='zoomAnimation'
            />
        </div>
    );
}