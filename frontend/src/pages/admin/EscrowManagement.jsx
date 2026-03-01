import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, CheckCircle, XCircle, DollarSign, Clock, ArrowRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export default function EscrowManagement() {
  const navigate = useNavigate();
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEscrow, setSelectedEscrow] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchEscrows();
  }, []);

  const fetchEscrows = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/escrow/pending`, { withCredentials: true });
      setEscrows(data.escrows || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (escrowId) => {
    setActionLoading(true);
    try {
      await axios.post(`${API_URL}/api/escrow/${escrowId}/verify`, { notes }, { withCredentials: true });
      setSelectedEscrow(null);
      setNotes('');
      fetchEscrows();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to verify');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (escrowId) => {
    if (!notes) {
      alert('Please provide a reason');
      return;
    }
    setActionLoading(true);
    try {
      await axios.post(`${API_URL}/api/escrow/${escrowId}/reject`, { reason: notes }, { withCredentials: true });
      setSelectedEscrow(null);
      setNotes('');
      fetchEscrows();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PAYMENT_PENDING: 'bg-muted text-muted-foreground',
      FUNDED: 'bg-primary/10 text-primary',
    };
    return badges[status] || 'bg-muted text-muted-foreground';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Escrow Management</h1>
        <p className="text-muted-foreground text-sm mt-1">Verify payments and manage campaign funds</p>
      </div>

      {escrows.length === 0 ? (
        <div className="bg-white border rounded-lg p-12 text-center">
          <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No pending escrows</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {escrows.map((escrow) => (
              <div
                key={escrow.id}
                onClick={() => setSelectedEscrow(escrow)}
                className={`bg-white border rounded-lg p-4 cursor-pointer ${
                  selectedEscrow?.id === escrow.id ? 'ring-2 ring-primary' : 'hover:border-foreground/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{escrow.campaign?.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(escrow.status)}`}>
                    {escrow.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{escrow.campaign?.brand?.name}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">₹{escrow.amount?.toLocaleString()}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>

          {selectedEscrow && (
            <div className="bg-white border rounded-lg p-6 h-fit sticky top-6">
              <h2 className="text-lg font-bold mb-4">Escrow Details</h2>
              
              <div className="space-y-3 mb-6">
                <div>
                  <label className="text-sm text-muted-foreground">Campaign</label>
                  <p className="font-medium">{selectedEscrow.campaign?.title}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Brand</label>
                  <p className="font-medium">{selectedEscrow.campaign?.brand?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedEscrow.campaign?.brand?.email}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Amount</label>
                  <p className="text-2xl font-bold text-primary">₹{selectedEscrow.amount?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Payment Reference</label>
                  <p className="font-mono">{selectedEscrow.paymentReference || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Status</label>
                  <p className={`inline-block px-2 py-1 text-xs rounded ${getStatusBadge(selectedEscrow.status)}`}>
                    {selectedEscrow.status}
                  </p>
                </div>
              </div>

              {selectedEscrow.status === 'PAYMENT_PENDING' && (
                <>
                  <div className="mb-4">
                    <label className="text-sm text-muted-foreground block mb-2">Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes (required for rejection)..."
                      rows={2}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleVerify(selectedEscrow.id)}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Verify Payment
                    </button>
                    <button
                      onClick={() => handleReject(selectedEscrow.id)}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      Reject
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
