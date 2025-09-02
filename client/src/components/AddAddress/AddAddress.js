import React from 'react'
import { FiSave } from "react-icons/fi";
import { IoMdPerson } from "react-icons/io";
import './AddAdress.css'

const AddAddress = ({setAddAddress}) => {
  return (
    <div className='add-address-page'>
       <div  className='details-card address-card'>
               <h2>Add New Address</h2>
               <form >
                <div className='group'>
                   <label>Address Details</label>
                   <textarea rows={5} cols={8} placeholder='Enter your address' /></div>
                   <div className='name-form'>
                       <div className='group'>
                           <label>City</label>
                           <input type='text' placeholder='Enter city' />
                       </div>
                       <div className='group'>
                           <label>State</label>
                           <input type='text'placeholder='Enter state' />
                       </div>
                   </div>
                   <div className='group'>
                       <label>
                           Pin Code
                       </label>
                       <input type="text" placeholder='Enter pin code' />
                   </div>
                   <div className='btn-section'>
                      <button onClick={() => setAddAddress(false)} className='cancel-btn'>Cancel</button>
                      <button type='submit' className='create-btn'>Create Address</button>
       
                   </div>
               </form>
             </div>
    </div>
  )
}

export default AddAddress