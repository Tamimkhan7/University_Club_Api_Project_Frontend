import { Link, useNavigate } from "react-router-dom";


export default function Navbar(){
    const nav = useNavigate();

    const logout = () =>{
        localStorage.removeItem("token");
        nav("/login");
    };

    return(
        <div className="bg-white shadow p-4 flex justify-between">
            <div className="flex gap-4">
                <Link to = "/">Feed</Link>
                <Link to="/clubs">Clubs</Link>
                <Link to="/profile">Profile</Link>
            </div>
            <button onClick={logout} className="text-red-500" >Logout</button>
        </div>
    )
}