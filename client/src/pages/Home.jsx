import React from 'react'
import { useSelector, useDispatch } from 'react-redux';
import {logout} from '../redux/userSlice';
import { useNavigate, Outlet } from 'react-router-dom';
import CustomerDashboard from './userDashboard';
import Header from './Header';

const Home = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(state => state.user);
  console.log("redux user", user);

//  dispatch(logout());
//           localStorage.clear();
//            navigate("/");
//            window.location.reload();
  return (
    <div>
       {/* welcome Home!! */}
       <Header />
       <Outlet />
       {/* <h3>id: {user?._id}</h3>
       <h3>name: {user?.name}</h3>
       <h3>email: {user?.email}</h3>
       <h3>role: {user?.role}</h3>
       <h3>phone: {user?.phone}</h3>
       <h3>rating: {user?.rating}</h3>
       <h3>company name:{user?.companyName}</h3>
        services is an array 
       <h3>services offered:{user?.services}</h3> 
       <button onClick={handleLogout}>logout</button> */}
    </div>
  )
}

export default Home

