'use client'

import React, {useState} from 'react'
import axios from 'axios'
import {useRouter} from 'next/navigation'
import {useSearchParams} from 'next/navigation'

export default function Dashboard() {
    const [error, setError] = useState('');
    const router = useRouter();
    const [chatName, setChatName] = useState('');
    const [isPopUpOpen, setIsPopUpOpen] = useState(false);
    const parameter = useSearchParams();
    const username = parameter.get('username') || ""
    const [chats, setChats] = useState(['']);

    
    
    const openPopUp = () => {
        if(isPopUpOpen){
            setIsPopUpOpen(false);
        }
        else{
            setIsPopUpOpen(true);
        }
    }

    const listChats = async() => {
        const titles = await axios.post('http://localhost:5000/listChats', {user: username});
        setChats(titles.data.chats);
        
    }

    const createChat = async() => {

            const response = await axios.post('http://localhost:5000/authenticate', {}, {withCredentials: true});

            if(response.data.isTokenValid){
                await axios.post('http://localhost:5000/createChat', {title: chatName, user: username}, {withCredentials: true});
                router.push(`/bot?username=${encodeURIComponent(username)}&title=${encodeURIComponent(chatName)}`);
            }
            else{
                setError(response.data.error);
                router.push('/login')
            }
    }

    const handleClick = async(chat: string) => {
        const response = await axios.post('http://localhost:5000/authenticate', {}, {withCredentials: true});

            if(response.data.isTokenValid){
                router.push(`/bot?username=${encodeURIComponent(username)}&title=${encodeURIComponent(chat)}`);
                
            }
            else{
                setError(response.data.error);
                router.push('/login')
            }

    }

    return( 
        <div>
            <div>
                this is the dashboard
            </div>
            <button onClick={listChats}>Previous Chats</button> <br></br>
            <button onClick={openPopUp}>New Chat</button>
            {isPopUpOpen && (
                <div className="fixed left-1/2 -translate-x-1/2 w-1/4 h-64 border border-slate-300 rounded-lg">
                    Enter title for the new chat
                    <input type='text' onChange={(e)=>setChatName(e.target.value)} value={chatName}/>
                    <button className="fixed left-1/2 -translate-x-1/2 w-16 h-16 bg-slate-300" onClick={createChat}>Next</button>
                </div>
            )}
            <div className="h-5/6 grow-0 bg-slate-400 overflow-auto">  
                {chats.map((chat, i) => (
                    <div key = {i}>
                        <button onClick={()=> handleClick(chat)}>{chat}</button>
                    </div>
                ))}
            </div>
            <div>{error}</div>
        </div>
    );
}