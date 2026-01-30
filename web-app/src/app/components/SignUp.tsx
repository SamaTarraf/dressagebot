'use client'

import React, {useState, useEffect, useRef} from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function SignUp() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isUsernameExisting, setIsUsernameExisting] = useState(null);
    const [isUsernameEmpty, setIsUsernameEmpty] = useState(null);
    const [isPasswordInvalid, setIsPasswordInvalid] = useState(null);
    const [isAccountCreated, setIsAccountCreated]  = useState(false);
    const isFirstRender = useRef(true);
    const router = useRouter();
    


    const checkFields = async () => {
            //check if either feild is empty
            if(username.trim().length===0 || username.length===0){
                setIsUsernameEmpty(true);
                console.log("username empty");
                console.log(isUsernameEmpty)
            }
            else{
                setIsUsernameEmpty(false);
                console.log("username not empty");
            }

            //check if valid password
            if(password.trim().length<=10){
                setIsPasswordInvalid(true);
                console.log("password is invalid")
            }
            else{
                setIsPasswordInvalid(false);
                console.log("password is valid")
            }
    };

    useEffect(() => {
        console.log("Username state: ", isUsernameEmpty);
        console.log("password:", isPasswordInvalid);
        console.log("condition:", !(isPasswordInvalid || isUsernameEmpty))

        console.log("isfirstrender", isFirstRender.current);

        if(!isFirstRender.current) {
            const createAccount = async() => {
                if(!(isPasswordInvalid || isUsernameEmpty)){
                    
                    const response = await axios.post('http://localhost:5000/signUp' , {user: username, password: password});

                    //checks if account already exists
                    if (!response.data.isAccountCreated) {
                        setIsUsernameExisting(true);
                        console.log("account exists")
                    }
                    else{
                        setIsAccountCreated(true);
                        setIsUsernameExisting(false);
                        console.log("account created");
                        router.push('/dashboard?isAccountCreated=${encodeURIComponent(isAccountCreated)}`');
                        
                    }
                }
            }
            createAccount();
        }

        isFirstRender.current = false;
        console.log("isfirstrender", isFirstRender.current);
    },[isUsernameEmpty, isPasswordInvalid]);
        

    return(
        <div className="flex flex-col justify-center w-3/4 h-screen bg-slate-400 absolute left-1/2 -translate-x-1/2">
            <input type='text' onChange={(e)=>setUsername(e.target.value)} value={username}/>
            {isUsernameExisting && (
                <span>
                    Username already exists.
                </span>

            )}
            {isUsernameEmpty && (
                <span>
                    Username field is empty.
                </span>

            )}
            <input type='text' onChange={(e)=>setPassword(e.target.value)} value={password}/>
            {isPasswordInvalid && (
                <span>
                    Password should contain at least 10 characters.
                </span>
            )}
            <button onClick={checkFields}>
                Sign Up
            </button>
            
        </div>
    );
};
