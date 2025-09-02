import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const EditAddress = ({setEditAddress,filterAddress, addressId}) => {

  const [editDetails, setEditDetails] = useState({
    address_details: '', city: '', state: '', pin_code: ''
  })
  console.log('Filter ', filterAddress)

  const handleChange = (e) => {
    const {value, name} = e.target
    setEditDetails(prevDetails => ({
        ...prevDetails, 
        [name]:  value
    }))
  }

  const {url} = useContext(AppContext)

  useEffect(() => {
    if (filterAddress) {
        setEditDetails({
            address_details: filterAddress.address_details || '',
            city: filterAddress.city || '',
            state: filterAddress.state || '',
            pin_code: filterAddress.pin_code || ''
        })
    }
  }, [filterAddress])

  const handleSubmit = async(e) => {
    e.preventDefault()
    try {
      const response = await axios.put(`${url}/api/addresses/${addressId}`, editDetails)
      if(response.status === 200){
          toast.success('Address Updated')
          setTimeout(() => {
            setEditAddress(false)
          }, 2000)
          
      }
    } catch (error) {
      console.log('Error while editing address: ', error.message)
      toast.error('failed to update address')
    }
  }
  return (
    <>
    <div className='add-address-page'>
       <div  className='details-card address-card'>
               <h2>Edit Address</h2>
               <form onSubmit={handleSubmit} >
                <div className='group'>
                   <label>Address Details</label>
                   <textarea rows={5} cols={8} value={editDetails.address_details} name='address_details' onChange={handleChange} placeholder='Enter your address' /></div>
                   <div className='name-form'>
                       <div className='group'>
                           <label>City</label>
                           <input type='text' value={editDetails.city} name='city' onChange={handleChange} placeholder='Enter city' />
                       </div>
                       <div className='group'>
                           <label>State</label>
                           <input type='text' value={editDetails.state} name='state' onChange={handleChange} placeholder='Enter state' />
                       </div>
                   </div>
                   <div className='group'>
                       <label>
                           Pin Code
                       </label>
                       <input type="text" name='pin_code' onChange={handleChange} value={editDetails.pin_code} placeholder='Enter pin code' />
                   </div>
                   <div className='btn-section'>
                      <button onClick={() => setEditAddress(false)} className='cancel-btn'>Cancel</button>
                      <button type='submit' className='create-btn'>Update Address</button>
       
                   </div>
               </form>
             </div>
    </div>
    <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  )
}

export default EditAddress