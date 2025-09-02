import React from 'react'
import './Delete.css'

const Delete = ({setShowPopup}) => {
  return (
    <div className='delete-container'>
        <div className='delete-card'>
       <p>Are you sure?</p>
       <div className='buttons'>
         <button onClick={() => setShowPopup(false)} className='btn-no'>
            No
         </button>
         <button className='btn-yes'> 
            Yes
         </button>
       </div></div>
    </div>
  )
}

export default Delete