'use client'

import React, {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import {useRouter} from 'next/navigation';

export default function NewLogIn() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const checkFields = async() => {
            if(username.trim().length===0 || username.length===0 || password.trim().length===0 || password.length===0){
                setError("Fill in both username and password fields");
                return;
            }

            const response = await axios.post('http://localhost:5000/logIn' , {user: username, password: password});

            if(!response.data.isUsernameExisting){
                setError("Username does not exist")
            }
            else if(!response.data.isPasswordVerified){
                setError("Password is not valid")
            }
            else{
                await axios.post('http://localhost:5000/initializeSession' , {user: username}, {withCredentials: true});
                router.push(`/dashboard?username=${encodeURIComponent(username)}`);

            }  
    }

    return(
        <div className="flex flex-col justify-center w-3/4 h-screen bg-slate-400 absolute left-1/2 -translate-x-1/2">
            <input type='text' onChange={(e)=>setUsername(e.target.value)} value={username}/>

            <input type='text' onChange={(e)=>setPassword(e.target.value)} value={password}/>

            <button onClick={checkFields}>Log In</button>

            <div>{error}</div>

        </div>
    )
}