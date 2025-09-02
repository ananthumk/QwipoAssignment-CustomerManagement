import React, { useEffect, useState } from 'react'
import { FaArrowLeft } from "react-icons/fa";
import { FiSave, FiEdit } from "react-icons/fi";
import { IoMdPerson } from "react-icons/io"
import { IoLocationOutline } from "react-icons/io5";
import './CustomerDetails.css'
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AddAddress from '../../components/AddAddress/AddAddress';
import AddressTable from '../../components/AddressTable/AddressTable';
import EditAddress from '../../components/EditAddress/EditAddress';
import Delete from '../../components/Delete/Delete';

const CustomerDetails = () => {
    const [customerDetails, setCustomerDetails] = useState({})
    const [showAddAddress, setAddAddress] = useState(false)
    const [showEditAddress, setEditAddress] = useState(false)
    const [showPopup, setShowPopup] = useState(false)
    const [addressId, setAddressId] = useState(null)

    const addressLength = customerDetails.addresses?.length || 0
    const navigate = useNavigate()
    const { id } = useParams()

    const filterAddress = customerDetails?.addresses?.find(address => address.id === addressId)


    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/customers/${id}/full`)
                console.log('Customer full',response)
                if(response.status === 200){
                    setCustomerDetails(response.data.data)
                }
            } catch (error) {
                console.log('Error while customer Data: ', error.message)
            }
        }
        fetchCustomer()
    }, [])
  return (
    <>
    <div className='customer-details-page'>
         <div className='customer-header'>
            <div className='add-header'>
          <FaArrowLeft onClick={() => navigate('/customer')} className='back-home' /> 
          <div className='add-header-details'> 
            <h1>{customerDetails.first_name} {customerDetails.last_name}</h1>
            <p>Customer details</p>
          </div>
          </div>
          <button onClick={() => navigate(`/customer/edit/${id}`)} className='edit-button'>
            <FiEdit /> Edit Customer
         </button>
      </div>
      <div className='details-card'>
              <h2><IoMdPerson /> Customer Information</h2>
               <div className='user-details-section'>
                  <div>
                     <h5>Full Name</h5>
                     <p>{customerDetails.first_name} {customerDetails.last_name}</p>
                  </div>
                  <div>
                     <h5>Phone Number</h5>
                     <p>{customerDetails.phone_number}</p>
                  </div>
                  <div>
                     <h5>Customer ID</h5>
                     <p>#{customerDetails.id}</p>
                  </div>
                </div>
        </div>
        <div className='details-card'>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h2><IoLocationOutline /> Addresses ({addressLength})</h2>
            <button onClick={() => {setAddAddress(true)
                 setEditAddress(false)}} className='add-address-btn'>+ Add Address</button>
          </div>
          <AddressTable setEditAddress={setEditAddress} setShowPopup={setShowPopup} 
           setAddressId={setAddressId} setAddAddress={setAddAddress} customerDetails={customerDetails} />
        </div>
    </div>
    {showAddAddress && <AddAddress setAddAddress = {setAddAddress} />}
    {showEditAddress && <EditAddress filterAddress={filterAddress} addressId={addressId} setEditAddress = {setEditAddress} />}
    {showPopup && <Delete setShowPopup={setShowPopup} />}
    </>
  )
}

export default CustomerDetails