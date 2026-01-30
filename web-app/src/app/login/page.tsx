'use client'

import React from 'react';
import LogIn from '@/app/components/LogIn';
import { useSearchParams } from 'next/navigation';

export default function LogInPage() {
    const parameter = useSearchParams();
    const isAccountCreated = parameter.get('isAccountCreated');

    return (
        <main>
          <div className="relative">
            <div className="flex flex-col justify-center w-3/4 h-screen bg-slate-400 absolute left-1/2 -translate-x-1/2">
                {isAccountCreated && (
                    <div className="text-white">your account has been created, please log in</div>
                )}  
                <LogIn/>
            </div>
          </div>
        </main>       
    );
  }