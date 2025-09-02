import React, { use, useEffect, useState } from 'react'
import { MdPeopleAlt } from "react-icons/md";
import { FaSearch, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import axios from 'axios'
import './Customer.css'
import CustomerTable from '../../components/CustomerTable/CustomerTable';
import { useNavigate } from 'react-router-dom';
import Delete from '../../components/Delete/Delete';

const Customer = () => {

  const [customersData, setCustomersData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPage, setTotalPage] = useState(0)
  const [totalRecord, setTotalRecord] = useState(0)
  const [totalRecordPerPage, setTotalRecordPerPage] = useState(0)
  const [paginationLeft, setPaginationLeft] = useState(false)
  const [paginationRight, setPaginationRight] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showPopup, setShowPopup] = useState(false)
  
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async() => {
      const response = await axios.get('http://localhost:5000/api/customers')
      console.log(response)
      if (response.status === 200){
         setCustomersData(response.data.data)
         setCurrentPage(response.data.pagination.current_page)
         setTotalPage(response.data.pagination.total_pages)
         setTotalRecord(response.data.pagination.total_records)
         setPaginationLeft(response.data.pagination.has_previous)
         setPaginationRight(response.data.pagination.has_next)
         setTotalRecordPerPage(response.data.pagination.records_per_page)
      }
    }
    fetchData()
  },[currentPage, searchQuery])

  const handlepagination = (value) => {
    if (value) {
      setCurrentPage(prevPage => prevPage + 1)
    } else {
      setCurrentPage(prevPage => prevPage - 1)
    }

  }
  
  const page = totalRecord * currentPage
  const pages = totalRecordPerPage * totalPage
  return (
    <>
    <div className='customer-page'>
       <div className='header-container'>
          <div className='logo-section'>
            <MdPeopleAlt className='logo-icon' />
            <div className='logos'>
                <h1>Customer Management</h1>
                <p>Manage your customer database</p>
            </div>
          </div>
          <button onClick={() => navigate('/customer/new')} className='add-button'>
             + <span id='add-btn-span'>Add Customer</span>
          </button>
       </div>
       <div className='customers-card'>
          <div className='sub-head'>
            <h2>Customer</h2>
            <button>
                {totalRecord} results
            </button>
          </div>
          <div className='search-container'>
               <FaSearch className='search-icon'/> 
               <input onChange={(e) => setSearchQuery(e.target.value)} type="text" placeholder='Search Customer by name or phone' />
          </div>
          <CustomerTable setShowPopup={setShowPopup} customersData={customersData} />

       </div>
       <div className='pagination-container'> 
           <p style={{fontSize: '16px'}}>{`${page} of ${pages} pages`}</p>
           <button onClick={() => handlepagination(false)} disabled={!paginationLeft}><FaArrowLeft /></button>
           <p>{currentPage}</p>
           <button onClick={() => handlepagination(true)} disabled={!paginationRight}><FaArrowRight /></button>
       </div>
    </div>
    {showPopup && <Delete setShowPopup={setShowPopup} />}
    </>
  )
}

export default Customer