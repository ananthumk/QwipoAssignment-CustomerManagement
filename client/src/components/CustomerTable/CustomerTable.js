import React from 'react'
import { FiEye, FiEdit  } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import './CustomerTable.css'
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from "react-spinners";

const CustomerTable = ({customersData, loading, setCustomerId, setShowPopup}) => {
  const navigate = useNavigate()
  return (
    <div className='table-container'>
        <table className='customer-table'>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Full Name</th>
                    <th>Phone Number</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {loading ? <ClipLoader color="#36d7b7" className='loader' size={50} /> : 
                (customersData?.map((data) => (
                    <tr key={data.id}>
                        <td>#{data.id}</td>
                        <td>{`${data.first_name} ${data.last_name}`}</td>
                        <td>{data.phone_number}</td>
                        <td style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
                            <FiEye onClick={() => navigate(`/customer/${data.id}`)} style={{cursor: 'pointer'}} size={18} />
                             <FiEdit onClick={() => navigate(`/customer/edit/${data.id}`)} style={{cursor: 'pointer'}} size={18}  />
                                 <MdDeleteOutline onClick={() => {setShowPopup(true)
                                    setCustomerId(data.id)
                                 }} size={18} style={{color: 'red', cursor: 'pointer'}} />
                        </td>
                        
                    </tr>
                )))}
            </tbody>
        </table>
    </div>
  )
}

export default CustomerTable