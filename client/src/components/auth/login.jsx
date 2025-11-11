import './auth.css'
import React, { useState } from 'react'
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Outlet, Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '../../redux/userSlice';
import { saveState } from '../../redux/localStorage';
import { store } from '../../redux/store';

const apiUrl =  process.env.REACT_APP_API_URL;


function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [show, setShow] = useState(false);
   const [loginData, setLoginData] = useState({
    email :"",
    password: "",
    role:"customer"
   })

   function handleChange(e){
    const name = e.target.name;
    const value = e.target.value;
    setLoginData((prev) => {
        return{
            ...prev,
            [name] : value
        }
    })
   }
   function handleLogin(){
    
      const API = apiUrl + "users/login";
    axios.post(API, {"email": loginData.email, "password": loginData.password, role: loginData.role})
    .then(res => {
        console.log("login data");
        console.log(res.data.data);
        dispatch(setUser(res.data.data.user));
        dispatch(setToken(res.data.token));
        saveState(store.getState());
        localStorage.setItem('token', res.data.token);
        if(res.data.data.user.role === "provider"){
            navigate("/home/provider");
        }else{
            navigate("/home");
        }
    }).catch(err => {
        console.log(err);
     alert("error occured")
    })
    console.log(loginData);
   setLoginData(() => {
    return {
        email :"",
        password: "",
        role:"customer"
    }
   })
   }

    function togglePassword(){
        var pass = document.getElementById("password");
        if(pass.type === "password"){
            setShow(true);
         pass.type = "text";
        }else{
            setShow(false);
         pass.type = "password";
        }
     }

  return (
    <div>
       
       <div className="out-cont center">
       <div className="main-login">

            <div className="inside-box">
                <h1 className="heading-login">Login</h1>
            </div>

            <div className="inside-box inside-box-2">
                <div className="input-field-login field-1">
                <input onChange={handleChange} type="text" value={loginData.email} name="email" id="email" required />
                <label htmlFor="email">Email</label>
                </div>
       
                <div className="input-field-login field-2">
                <input onChange={handleChange} type="password" value={loginData.password} name="password" id="password" required />
                <label htmlFor="password">Password</label>
                <div id='eye' onClick={togglePassword} className="eye">{show?  <VisibilityOffIcon />: <VisibilityIcon />} </div>
                </div>

                <div className='field-3'>
                    <label htmlFor="role">Select a role-</label>
                    <select onChange={handleChange} value={loginData.role} name="role" id="role">
                    <option value="customer">customer</option>
                    <option value="provider">provider</option>
                    {/* <option value="admin">admin</option> */}
                    </select>
                </div>
           </div>

            <div className="forgot">  <a href="#">Forgot password?</a>
            </div>
        
            <div className="inside-box">
                  <button onClick={handleLogin} id="login-btn" type="submit">Login</button>
                  <p>Don't have an account yet?
                     <Link to="/SignUp">Sign up</Link>
                     </p>
            </div>
       </div>
    </div>

    </div>
  )
}

export default Login
