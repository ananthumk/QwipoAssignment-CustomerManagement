import React, { useContext, useEffect, useState } from 'react'
import { FaArrowLeft } from "react-icons/fa";
import { FiSave } from "react-icons/fi";
import { IoMdPerson } from "react-icons/io";
import './EditCustomer.css'
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const EditCustomer = () => {
  const [customer, setCustomer] = useState({})
  const [updateDetails, setUpdatedDetails] = useState({
    first_name: '', last_name: '', phone_number: ''
  })
   
   const navigate = useNavigate()
   const {url} = useContext(AppContext)

   const { id } = useParams()
   console.log('customerId', id)

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        const response = await axios.get(`${url}/api/customers/${id}`)
        if(response.status === 200){
          setCustomer(response.data.data)
          setUpdatedDetails(
            {
              first_name: response.data.data.first_name,
              last_name: response.data.data.last_name,
              phone_number: response.data.data.phone_number
            }
          )
        }
      } catch (error) {
        console.log('Error while fetching specific user: ', error.message)
      }
    }
    fetchCustomerDetails()


  }, [])

  const handleChange = (e) => {
    const { value, name} = e.target
    setUpdatedDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }))
  }

  const handleSubmit = async(e) => {
    e.preventDefault()
    try {
      const response = await axios.put(`${url}/api/customers/${id}`, updateDetails)
      if (response.status === 200) {
        toast.success('Updated successfully')
        setTimeout(() => {
    navigate('/customer');
  }, 1500); 
      }
    } catch (error) {
      console.log('Error While updating customer details: ', error.message)
      toast.error('Failed to update')
    }
  }

  return (
    <>
    <div className='add-customer-container'>
      <div className='add-header'>
          <FaArrowLeft onClick={() => navigate('/customer')} className='back-home' /> 
          <div className='add-header-details'> 
            <h1>Edit Customer</h1>
            <p>Update customer information</p>
          </div>
      </div>
      <div className='details-card'>
        <h2><IoMdPerson /> Customer Information</h2>
        <form onSubmit={handleSubmit}>
            <div className='name-form'>
                <div className='group'>
                    <label>First Name</label>
                    <input type='text' value={updateDetails.first_name} name='first_name' onChange={handleChange} placeholder='Enter first name' />
                </div>
                <div className='group'>
                    <label>Last Name</label>
                    <input type='text' value={updateDetails.last_name} name='last_name' onChange={handleChange} placeholder='Enter last name' />
                </div>
            </div>
            <div className='group'>
                <label>
                    Phone Number
                </label>
                <input type="text" value={updateDetails.phone_number} name='phone_number' onChange={handleChange} placeholder='Enter your phone number' />
            </div>
            <div className='btn-section'>
               <button onClick={() => navigate('/customer')} className='cancel-btn'>Cancel</button>
               <button type='submit' className='create-btn'><FiSave /> Update Customer</button>

            </div>
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
    <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  )
}

export default EditCustomer