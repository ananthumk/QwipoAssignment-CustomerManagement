import React from 'react'
import { MdPeopleAlt } from "react-icons/md";
import { FaArrowRight } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { VscGraph } from "react-icons/vsc";
import './Home.css'
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate()
  return (
    <div className='home-page'>
        <div className='home1-container'>
            <h1 className='heading'>
                Customer Management <br />
                <span style={{color: '#2d779f'}}> Made Simple</span>
            </h1>
            <p>Efficiently manage your customer database with powerful tools for organization, search, and address management.</p>
            <div className='btns-container'>
               <button onClick={() => navigate('/customer')} className='c-view-btn'>
                  <MdPeopleAlt /> View Customers <FaArrowRight />
               </button>
               <button onClick={() => navigate('/customer/new')} className='add-btn'>
                  <i className="bi bi-person-plus-fill"></i> Add Customer
               </button>
            </div>
        </div>
        <div className='home2-container'>
          <h2 className='sub-heading'>
            Everything you need to manage customers
          </h2>
          <p>Powerful features designed to streamline your customer management workflow</p>
          <div className='home-card-container'>
             <div className='card'>
                <MdPeopleAlt className='icon' />
                <h2>Customer Database</h2>
                <p>Comprehensive customer profiles with detailed information, contact details, and complete address management.</p>
             </div>
             <div className='card'>
                <FaSearch className='icon' />
                <h2>Advanced Search</h2>
                <p>Quickly find customers with powerful search and filtering capabilities. Search by name, phone number, or location.</p>
             </div>
             <div className='card'>
                <VscGraph className='icon' />
                <h2>Analytics & Insights</h2>
                <p>Track customer growth, monitor activity, and gain insights into your customer base with detailed analytics.</p>
             </div>
          </div>
        </div>
        <div className='home3-container'>
           <h2 className='sub-heading'>Ready to get started?</h2>
           <p>Start managing your customers more effectively today</p>
           <button onClick={() => navigate('/customer')} className='start-btn'>
             <MdPeopleAlt /> Get Started <FaArrowRight />
           </button>
        </div>
    </div>
  )
}

export default Home