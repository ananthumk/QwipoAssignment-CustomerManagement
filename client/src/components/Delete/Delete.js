import React, { useContext } from 'react'
import './Delete.css'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Delete = ({setShowPopup , valueType, addressId, customerId}) => {
  
  const {url} = useContext(AppContext)

  const types = valueType === 'address' ? `/api/addresses/${addressId}` : `/api/customers/${customerId}`
  const handleDelete = async() => {
     try {
      const response = await axios.delete(`${url}${types}`)
      if(response.status === 200){
        
        toast.success('Deleted Successfully!')
        setTimeout(() => {
          setShowPopup(false)
        }, 2000)
      }
     } catch (error) {
       console.log(`Error while deleting : `, error.message)
       toast.error('Failed to delete! try again later')
     }
  }
  return (
    <>
    <div className='delete-container'>
        <div className='delete-card'>
       <p>Are you sure?</p>
       <div className='buttons'>
         <button onClick={() => setShowPopup(false)} className='btn-no'>
            No
         </button>
         <button onClick={handleDelete} className='btn-yes'> 
            Yes
         </button>
       </div></div>
    </div>
     <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  )
}

export default Delete