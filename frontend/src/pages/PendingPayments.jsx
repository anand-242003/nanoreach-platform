import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DollarSign, Clock, Copy, CheckCircle, Loader2 } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
export default function PendingPayments() {
  const navigate = useNavigate();
  const [escrows, setEscrows] = useState([]);
  const [bankDetails, setBankDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [escrowsRes, bankRes] = await Promise.all([
        axios.get(`${API_URL}/api/escrow/my-pending`, { withCredentials: true }),
        axios.get(`${API_URL}/api/escrow/bank-details`, { withCredentials: true }),
      ]);
      setEscrows(escrowsRes.data.escrows || []);
      setBankDetails(bankRes.data.bankDetails);
    } catch (error) {} 
    finally { setLoading(false); }
  };

  const handleConfirm = async (campaignId) => {
    setConfirming(campaignId);
    try {
      await axios.post(`${API_URL}/api/escrow/campaigns/${campaignId}/confirm-payment`, {}, { withCredentials: true });
      fetchData();
    } catch (error) { alert(error.response?.data?.message || 'Failed'); }
    finally { setConfirming(null); }
  };

  const copy = (text) => navigator.clipboard.writeText(text);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Pending Payments</h1>
        <p className="text-muted-foreground text-sm mt-1">Complete your campaign payments</p>
      </div>

      {escrows.length === 0 ? (
        <div className="bg-white border rounded-lg p-12 text-center">
          <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">No pending payments</p>
        </div>
      ) : (
        <div className="space-y-6">
          {escrows.map((escrow) => (
            <div key={escrow.id} className="bg-white border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-lg">{escrow.campaign?.title}</h2>
                  <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${escrow.status === 'PENDING' ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                    {escrow.status === 'PENDING' ? 'Payment Pending' : 'Under Verification'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-primary/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">₹{escrow.amount?.toLocaleString()}</p>
                  <p className="text-sm text-primary">Security Deposit (25%)</p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold text-foreground">₹{escrow.totalPrizePool?.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Prize Pool</p>
                </div>
              </div>

              {bankDetails && (
                <div className="mb-6 space-y-2">
                  <h3 className="font-semibold mb-3">Bank Details</h3>
                  <div className="flex justify-between p-2 bg-muted rounded text-sm">
                    <span>Bank</span><span className="font-medium">{bankDetails.bankName}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded text-sm">
                    <span>Account</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{bankDetails.accountNumber}</span>
                      <button onClick={() => copy(bankDetails.accountNumber)} className="p-1 hover:bg-muted/80 rounded"><Copy className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded text-sm">
                    <span>IFSC</span><span className="font-mono">{bankDetails.ifsc}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-primary/10 border border-primary/20 rounded text-sm">
                    <span className="text-primary">Reference</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary">ESC-{escrow.id.slice(-8).toUpperCase()}</span>
                      <button onClick={() => copy(`ESC-${escrow.id.slice(-8).toUpperCase()}`)} className="p-1 hover:bg-primary/20 rounded"><Copy className="w-3 h-3 text-primary" /></button>
                    </div>
                  </div>
                </div>
              )}

              {escrow.status === 'PENDING' && (
                <button onClick={() => handleConfirm(escrow.campaignId)} disabled={confirming === escrow.campaignId}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {confirming === escrow.campaignId ? <><Loader2 className="w-4 h-4 animate-spin" />Confirming...</> : "I've Made the Payment"}
                </button>
              )}

              {escrow.status === 'PAYMENT_PENDING' && (
                <div className="p-4 bg-primary/10 border border-primary/20 rounded flex items-start gap-2">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div className="text-sm text-foreground">
                    <p className="font-medium">Under Verification</p>
                    <p>Payment verification takes up to 24 hours.</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
