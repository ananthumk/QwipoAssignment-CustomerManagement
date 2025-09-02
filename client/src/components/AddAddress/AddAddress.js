import React, {  useContext, useState } from 'react'
import './AddAdress.css'
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddAddress = ({setAddAddress, customerId}) => {
    const [address, setAddress] = useState({
        address_details: '', city: '', state: '', pin_code: ''
    })

    const { url } = useContext(AppContext)

    const handleChange = (e) => {
       const {name, value} = e.target 
       setAddress(prevDetails => ({
        ...prevDetails, 
        [name]: value
       }))
    }
    
    const handleSubmit = async(e) => {
        e.preventDefault()
        try {
            const response = await axios.post(`${url}/api/customers/${customerId}/addresses`, address)
            if (response.status === 201){
                toast.success('Address added successfully')
                
                setTimeout(() => {setAddAddress(false)}, 2000)
                
            }
        } catch (error) {
            console.log('Error while adding address: ', error.message)
            toast.error('Failed to add Address')
        }
    }
  return (
    <>
    <div className='add-address-page'>
       <div  className='details-card address-card'>
               <h2>Add New Address</h2>
               <form onSubmit={handleSubmit} >
                <div className='group'>
                   <label>Address Details</label>
                   <textarea rows={5} cols={8} value={address.address_details} name='address_details' onChange={handleChange} placeholder='Enter your address' /></div>
                   <div className='name-form'>
                       <div className='group'>
                           <label>City</label>
                           <input type='text' value={address.city} name='city' onChange={handleChange} placeholder='Enter city' />
                       </div>
                       <div className='group'>
                           <label>State</label>
                           <input type='text' value={address.state} name='state' onChange={handleChange} placeholder='Enter state' />
                       </div>
                   </div>
                   <div className='group'>
                       <label>
                           Pin Code
                       </label>
                       <input type="text" value={address.pin_code} name='pin_code' onChange={handleChange} placeholder='Enter pin code' />
                   </div>
                   <div className='btn-section'>
                      <button onClick={() => setAddAddress(false)} className='cancel-btn'>Cancel</button>
                      <button type='submit' className='create-btn'>Create Address</button>
       
                   </div>
               </form>
             </div>
    </div>
         <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    
    </>
  )
}

export default AddAddress