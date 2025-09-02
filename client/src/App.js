import './App.css';
import AddCustomer from './pages/AddCustomer/AddCustomer';
import Customer from './pages/Customer/Customer';
import CustomerDetails from './pages/CustomerDetails/CustomerDetails';
import EditCustomer from './pages/EditCustomer/EditCustomer';
import Home from './pages/Home/Home';
import { Route, Routes} from 'react-router-dom'

function App() {
  return (
    <div className="App">
       <Routes>
         <Route exact path='/' element={<Home />} />
         <Route exact path='/customer' element={<Customer/>} />
         <Route exact path='/customer/new' element={<AddCustomer />} />
         <Route exact path='/customer/edit/:id' element={<EditCustomer />} />
         <Route exact path='/customer/:id' element={<CustomerDetails />} />
       </Routes>
    </div>
  );
}

export default App;
