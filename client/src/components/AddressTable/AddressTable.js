import React from 'react'
import { FiSave, FiEdit } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import './Addresstable.css'

const AddressTable = ({customerDetails, setEditAddress,setAddressId, setAddAddress, setShowPopup}) => {
  return (
    <div className='table-container'>
            <table className='customer-table'>
                <thead>
                    <tr>
                        <th>Address Details</th>
                        <th>City</th>
                        <th>State</th>
                        <th>Pin Code</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                  
  {customerDetails?.addresses && customerDetails.addresses.length > 0 ? (
    customerDetails.addresses.map((data) => (
      <tr key={data.id}>
        <td>{data.address_details}</td>
        <td>{data.city}</td>
        <td>{data.state}</td>
        <td>{data.pin_code}</td>
        <td style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <FiEdit
            onClick={() => {
              setEditAddress(true);
              setAddAddress(false);
              setAddressId(data.id);
            }}
            style={{ cursor: 'pointer' }}
            size={18}
          />
          <MdDeleteOutline
            onClick={() => {setShowPopup(true) 
              setAddressId(data.id)
            }}
            size={18}
            style={{ color: 'red', cursor: 'pointer' }}
          />
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="5" style={{ fontSize:'20px', fontWeight: '600', textAlign: 'center' }}>
        No Address Available
      </td>
    </tr>
  )}
</tbody>

            </table>
        </div>
  )
}

export default AddressTable