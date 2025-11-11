import { createSlice } from '@reduxjs/toolkit'

const initialState= {
    
 _id:"",
 name: "",
 email:"",
 phone:"",
 role:"",
 token:"",
 companyName:"",
 rating:"",
 services: []
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action)=> {
        state._id= action.payload._id
        state.name= action.payload.name
        state.email= action.payload.email
        state.phone= action.payload.phone
        state.role= action.payload.role
        state.companyName= action.payload.companyName
        state.services = action.payload.services
        state.rating = action.payload.rating
    },
    setToken : (state, action) => {
        state.token = action.payload
    },
    logout : (state, action) => {
        state._id= ""
        state.name= ""
        state.email= ""
        state.phone= ""
        state.role= ""
        state.token= ""
        state.companyName= ""
        state.rating = ""
        state.services=[]
        localStorage.removeItem('state')
    }
  },
})

// Action creators are generated for each case reducer function
export const {setUser,  setToken, logout, setOnlineUser, setSocket } = userSlice.actions

export default userSlice.reducer