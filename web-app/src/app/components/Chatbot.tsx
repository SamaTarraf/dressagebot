'use client'

import React, {useState} from 'react';
import axios from 'axios';
import {useRouter} from 'next/navigation';
import {useSearchParams} from 'next/navigation'

export default function Chatbot() {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState([{
    sender: '',
    message: ''
  }]);
  const[error, setError] = useState();
  const router = useRouter();
  const parameter = useSearchParams();
  const username = parameter.get('username') || ""
  const title = parameter.get('title') || ""

  const getResponse = async () => {
    //question into history
    //setHistory([...history, {role: 'user', text: question}]);
    const saveMessage  = await axios.post('http://localhost:5000/saveMessage', {sender: 'user', message: question, title: title, username: username})

    setHistory(saveMessage.data.history);

    //get response
    const response = await axios.post('http://localhost:5000/bot', {query: question});

    //response into history
    //setHistory([...history, {role: 'user', text: question}, {role: 'bot', text: response.data.text}]);

    const saveResponse = await axios.post('http://localhost:5000/saveMessage', {sender: 'bot', message: response.data.text, title: title, username: username})
    setHistory(saveResponse.data.history);


    setQuestion('');

  };

  const authenticate = async() => {
    const response = await axios.post('http://localhost:5000/authenticate', {}, {withCredentials: true});
    if(response.data.isTokenValid){

        router.push(`/dashboard?username=${encodeURIComponent(username)}`);
    }
    else{
        setError(response.data.error);
        router.push('/login');
    }
  }

  return(
      <div className="flex flex-col justify-center w-3/4 h-screen bg-slate-400 absolute left-1/2 -translate-x-1/2">
        <button className="text-white" onClick={authenticate}>Dashboard</button>
        <div>Username:{username}</div> <br></br>
        <div>Title:{title}</div>
        <div className="h-5/6 grow-0 bg-slate-400 overflow-auto">  
          {history.map((message, i) => (
            <div key = {i}>
              <strong>{message.sender}:</strong>
              <span>{message.message}</span>
            </div>
          ))}
        </div>
        <input type="text" onChange={(e) => setQuestion(e.target.value)} value={question} className="h-1/6 bg-slate-200 rounded-lg"/>
        <button className="h-10 w-20" onClick={getResponse}>
          Send
        </button>
      </div>
  );
};