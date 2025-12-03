import './App.css'
import AdminDashboard from './pages/AdminDashboard';
// import Login from './pages/Login';

function App() {

  const payNow = async () => {
    const email = "akapsyjr@gmail.com";
    const quantity = 7;
    const unit_price = 2500;
    const amount = 45000;
    const id = 9;

    const response = await fetch('http://127.0.0.1:5000/payments/api/initialize-payment', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        email: email,
        quantity: Number(quantity),
        unit_price: Number(unit_price),
        amount: Number(amount),
        id: 8
      })
    });
    console.log({id, quantity, unit_price, amount, email});
    const data = await response.json();

    if (data.status === true) {
      // SUCCESS! Redirect the user to Paystack
      window.location.href = data.auth_url; 
    } else {
      alert("Payment initialization failed: " + data.message);
    }
    console.log(response)
  }

  return (
    <>
      <AdminDashboard />
      {/* <Login /> */}

    <button onClick={payNow}>SUBMIT</button>
    </>
  )
}

export default App
