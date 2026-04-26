import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";


export default function Register() {
    const [form, setForm] = useState({});
    const nav = useNavigate();

    const submit = async ()=>{
        await api.post("/auth/register", form);
        nav("/login");
    };


    return (
        <div className="bg-white p-8 shadow rounded-xl">
            <h2 className="text-xl mb-5 font-bold">Register</h2>
            
            <input className="border p-2 w-full mb-2" placeholder="Name" onChange={(e) => setForm({...form, name: e.target.value})}/>
            <input className="border p-2 w-full mb-2" placeholder="Email" onChange={(e) => setForm({...form, email: e.target.value})} />
            <input className="border p-2 w-full mb-2" type="password" placeholder="Password" onChange={(e)=> setForm({...form, password: e.target.value})} />

            <button onClick={submit} className="bg-green-500 text-white px-4 py-2">Register</button>
        </div>
    );
}