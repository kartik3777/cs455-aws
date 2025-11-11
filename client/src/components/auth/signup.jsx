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


const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [apiOtp, setApiOtp] = useState("");
   const [loginData, setLoginData] = useState({
    name:"",
    email :"",
    password: "",
    phone:"",
    role:"customer",
    otp:"",
    companyName:"",
    service:""
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
    if(apiOtp !== loginData.otp){
      alert("otp not matched!!");
      return;
    }
    
      const API = apiUrl + "users/signup";
    axios.post(API, {"name": loginData.name, 
      "email": loginData.email, "password": loginData.password, 
      "role": loginData.role,"phone": loginData.phone,
      "companyName": loginData.companyName, "servicesOffered": loginData.service
     })
    .then(res => {
        console.log("login data");
        console.log(res.data.data);
        dispatch(setUser(res.data.data.user));
        dispatch(setToken(res.data.token));
        saveState(store.getState());
        localStorage.setItem('token', res.data.token);

                navigate("/home");
    }).catch(err => {
        console.log(err);
     alert("error occured")
    })
    console.log(loginData);
   setLoginData(() => {
    return {
        name:"",
        email :"",
        password: "",
        phone:"",
        role:"customer",
        otp:"",
        companyName:"",
        service:""
    }
   })
   }

    async function handleContinue(){
      //send otp
      const API = apiUrl + "users/sendotp"
      try {
        const res = await axios.post(API, {"email": loginData.email});
        console.log('otp data===============================');
        console.log(res.data);
        setApiOtp(res.data.otp);
        
      } catch (error) {
        
      }
      var x = document.getElementById("signup-box");
      var y = document.getElementById("afterSignup");
      x.style.display= 'none';
      y.style.display = 'flex';
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
        <div id='afterSignup' className="main-login">
          <div className="input-field-login field-1">
                <p>Enter the otp sent to email {loginData.email}</p>
                <input onChange={handleChange} type="text" value={loginData.otp} name="otp" id="otp"  required />
          </div>
          {
            (loginData.role === "provider") && 
            <>
                <div className="input-field-login field-1">
                <input onChange={handleChange} type="text" value={loginData.companyName} name="companyName" id="companyName" required />
                <label htmlFor="companyName">Company Name</label>
                </div>
                <div className="input-field-login field-1">
                <input onChange={handleChange} type="text" value={loginData.service} name="service" id="service" required />
                <label htmlFor="service">Service Offered</label>
                </div>
            </>

          }
          <button onClick={handleLogin} id="login-btn" type="submit">Sign Up</button>

        </div>
       <div id='signup-box' className="main-login">

            <div className="inside-box">
                <h1 className="heading-login">Sign Up</h1>
            </div>

            <div className="inside-box inside-box-2">
                 <div className="input-field-login field-1">
                <input onChange={handleChange} type="text" value={loginData.name} name="name" id="name" required />
                <label htmlFor="name">Name</label>
                </div>

                <div className="input-field-login field-1">
                <input onChange={handleChange} type="text" value={loginData.email} name="email" id="email" required />
                <label htmlFor="email">Email</label>
                </div>
       
                <div className="input-field-login field-2">
                <input onChange={handleChange} type="password" value={loginData.password} name="password" id="password" required />
                <label htmlFor="password">Password</label>
                <div id='eye' onClick={togglePassword} className="eye">{show?  <VisibilityOffIcon />: <VisibilityIcon />} </div>
                </div>

                <div className="input-field-login field-1">
                <input onChange={handleChange} type="text" value={loginData.phone} name="phone" id="phone" required />
                <label htmlFor="phone">Phone</label>
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
                  <button onClick={handleContinue} id="login-btn" type="submit">Continue</button>
                  <p>Already have an account? 
                     <Link to="/login"> Login</Link>
                     </p>
            </div>
       </div>
    </div>

    </div>
  )
}

export default Signup
