import './App.css';
import React from 'react';
import axios from 'axios';

function App() {
  const [responseId, setResponseId] = React.useState("");
  const [responseState, setResponseState] = React.useState([]);
  

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        resolve(true);
      }
      script.onerror = () => {
        resolve(false);
      }
      document.body.appendChild(script);
    });
  }

  const createRazorpayOrder =  (amount) => {
    const data = JSON.stringify({

      amount: amount*100,
      currency: 'INR'
    });
    
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'http://localhost:5000/orders',
      headers: { 
        'Content-Type': 'application/json'
      },
      data : data
    };

    axios.request(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      handleRazorpayScreen(response.data.amount);
    }).catch((error) =>{
      console.error("error at ", error);
    })
  }

  const handleRazorpayScreen = async (amount) => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if(!res){
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    const options = {
      key: 'rzp_test_aIYCBi1ZWuZCuU',
      amount: amount,
      currency: 'INR',
      name: 'Suman Sahoo',
      description: 'Payment to Suman Sahoo',
      image: 'https://example.com/your_logo',
      handler: function (response) {
        setResponseId(response.razorpay_payment_id);
      },
      prefill: {
        name: 'Suman Sahoo',
        email: 'ssamsomu@gmail.com',
      },
      theme: {
        color: '#F4C430',
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  }

  const paymentFetch = (e) => {
    e.preventDefault();

    const paymentId = e.target.paymentId.value;

    axios.get(`http://localhost:5000/payment/${paymentId}`) 
    .then((response) => {
      console.log(response.data);
      setResponseState(response.data);
    }).catch((error) => {
      console.error("error at ", error);
    })
  }


  return (
    <div className="App">
      <button onClick={() => createRazorpayOrder(100)}>Pay 100Rs</button>
      {responseId && <p>{responseId}</p>}
      <h1>This is payment verification form</h1>
      <form onSubmit={paymentFetch}>
        <input type="text" name="paymentId" placeholder="Enter payment id" />
        <button type="submit">Fetch payment</button>
        {responseState.length!==0 && 
        <ul>
          <li>Payment Status: {responseState.status}</li>
          <li>Payment Method: {responseState.method}</li>
          <li>Payment Amount: {responseState.amount /100} Rs.</li>
          <li>Payment Currency: {responseState.currency}</li>
        </ul>}
      </form>
    </div>
  );
}

export default App;
