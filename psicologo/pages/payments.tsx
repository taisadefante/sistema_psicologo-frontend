import { useEffect, useState } from "react";
import axios from "axios";

const Payments = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/payments").then((response) => {
      setPayments(response.data);
    });
  }, []);

  return (
    <div className="container mt-4">
      <h2>Pagamentos</h2>
      <ul>
        {payments.map((payment: any) => (
          <li key={payment.id}>
            {payment.amount} - {payment.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Payments;
