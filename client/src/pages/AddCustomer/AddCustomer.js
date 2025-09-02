import React, { useState } from 'react'
import { FaArrowLeft } from "react-icons/fa";
import { FiSave } from "react-icons/fi";
import { IoMdPerson } from "react-icons/io";
import './AddCustomer.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddCustomer = () => {
  const [customerDetails, setCustomerDetails] = useState({
    first_name: '', last_name: '', phone_number: ''
  }) 
  const [errMsg, setErrMsg] = useState('')

  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value} = e.target
    setCustomerDetails(prevDetails => ({
        ...prevDetails, 
        [name]: value
    }))
  }

  const handleSubmit = async (e) => {
     e.preventDefault()
     try {
        const response = await axios.post('http://localhost:5000/api/customers', customerDetails)
        if (response.status === 200) {
            setErrMsg('')
        } else {
            setErrMsg(response.data.message)
        }
     } catch (error) {
        console.log('error while adding customer: ',error.message)
     }
  }
  

  return (
    <div className='add-customer-container'>
      <div className='add-header'>
          <FaArrowLeft onClick={() => navigate('/customer')} className='back-home' /> 
          <div className='add-header-details'> 
            <h1>Add New Customer</h1>
            <p>Create a new customer record</p>
          </div>
      </div>
      <div className='details-card'>
        <h2><IoMdPerson /> Customer Information</h2>
        <form onSubmit={handleSubmit}>
            <div className='name-form'>
                <div className='group'>
                    <label>First Name</label>
                    <input type='text' value={customerDetails.first_name} onChange={handleChange} name='first_name' placeholder='Enter first name' />
                </div>
                <div className='group'>
                    <label>Last Name</label>
                    <input type='text' value={customerDetails.last_name} onChange={handleChange} name='last_name' placeholder='Enter last name' />
                </div>
            </div>
            <div className='group'>
                <label>
                    Phone Number
                </label>
                <input type="text" value={customerDetails.phone_number} onChange={handleChange} name='phone_number' placeholder='Enter your phone number' />
            </div>
            <div className='btn-section'>
               <button onClick={() => navigate('/customer')} className='cancel-btn'>Cancel</button>
               <button type='submit' className='create-btn'><FiSave /> Create Customer</button>

            </div>
            {errMsg && <p style={{fontSize: '18px', color: 'red', textAlign: 'center'}}>{errMsg}</p>}
        </form>
      </div>
      <div className='note-container'>
         <p>Note:</p>
         <ul>
            <li>All fields are required to create a customer</li>
            <li>Phone numbers should include country code for international customers</li>
         </ul>
      </div>
    </div>
  )
}

export default AddCustomer