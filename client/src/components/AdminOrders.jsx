import React, { useState, useEffect } from 'react';
import { useToast } from './ToastProvider';
import { API_BASE } from '../config';

function AdminOrders({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/orders`, {
        credentials: 'include'
      });
      const data = await response.json();
      setOrders(data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success(`Order ${newStatus} successfully!`);
        fetchOrders();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update order status');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'requested': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'purchased': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'requested': return 'Requested';
      case 'approved': return 'Approved';
      case 'purchased': return 'Purchased';
      case 'rejected': return 'Rejected';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-white/80 text-lg font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 lg:px-8">
      <div className="content-wrapper fade-in">
        <div className="mb-8 text-center slide-in-up">
          <div className="flex items-center justify-center mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg mr-3">
              <i className="bx bx-package text-white"></i>
            </div>
            <h1 className="text-3xl font-bold text-black"><span className="text-gradient">Manage Orders</span></h1>
          </div>
          <p className="text-sm text-gray-600">Approve and manage book requests</p>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mx-auto mt-3"></div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-16 modern-card slide-in-up">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="bx bx-package text-4xl text-gray-400"></i>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">No orders yet</h3>
              <p className="text-sm text-gray-600">No book requests have been submitted</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="modern-card p-4 group hover:scale-105 transition-transform duration-200 slide-in-up">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-black">
                        {order.title}
                      </h3>
                      <span className={`px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                      {order.author && (
                        <div className="flex items-center space-x-2">
                          <i className="bx bx-user text-sm text-gray-400"></i>
                          <span><span className="font-semibold">Author:</span> {order.author}</span>
                        </div>
                      )}
                      {order.isbn && (
                        <div className="flex items-center space-x-2">
                          <i className="bx bx-barcode text-sm text-gray-400"></i>
                          <span><span className="font-semibold">ISBN:</span> {order.isbn}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <i className="bx bx-user-circle text-sm text-gray-400"></i>
                        <span><span className="font-semibold">Requested by:</span> {order.requestedBy?.name || 'Unknown User'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <i className="bx bx-calendar text-sm text-gray-400"></i>
                        <span><span className="font-semibold">Requested on:</span> {new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {order.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <i className="bx bx-note text-sm text-gray-400 mt-1"></i>
                          <div>
                            <span className="font-semibold text-gray-800 text-sm">Notes:</span>
                            <p className="text-gray-700 mt-1 text-sm">{order.notes}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-3 border-t border-gray-200">
                  {order.status === 'requested' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(order._id, 'approved')}
                        className="modern-btn bg-green-600 text-white hover:bg-green-700 flex items-center space-x-2 text-sm font-medium"
                      >
                        <i className="bx bx-check text-sm"></i>
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(order._id, 'rejected')}
                        className="modern-btn bg-red-600 text-white hover:bg-red-700 flex items-center space-x-2 text-sm font-medium"
                      >
                        <i className="bx bx-x text-sm"></i>
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                  
                  {order.status === 'approved' && (
                    <button
                      onClick={() => handleStatusUpdate(order._id, 'purchased')}
                      className="modern-btn bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-2 text-sm font-medium"
                    >
                      <i className="bx bx-check-circle text-sm"></i>
                      <span>Mark as Purchased</span>
                    </button>
                  )}
                  
                  {order.status === 'purchased' && (
                    <span className="px-3 py-2 bg-green-100 text-green-800 text-xs font-semibold rounded-lg flex items-center space-x-2">
                      <i className="bx bx-check-circle text-sm"></i>
                      <span>Completed</span>
                    </span>
                  )}
                  
                  {order.status === 'rejected' && (
                    <span className="px-3 py-2 bg-red-100 text-red-800 text-xs font-semibold rounded-lg flex items-center space-x-2">
                      <i className="bx bx-x-circle text-sm"></i>
                      <span>Rejected</span>
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="modern-card p-4 text-center">
            <div className="text-2xl font-bold text-black mb-1">
              {orders.filter(o => o.status === 'requested').length}
            </div>
            <div className="text-sm text-gray-600">Pending Requests</div>
          </div>
          <div className="modern-card p-4 text-center">
            <div className="text-2xl font-bold text-black mb-1">
              {orders.filter(o => o.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="modern-card p-4 text-center">
            <div className="text-2xl font-bold text-black mb-1">
              {orders.filter(o => o.status === 'purchased').length}
            </div>
            <div className="text-sm text-gray-600">Purchased</div>
          </div>
          <div className="modern-card p-4 text-center">
            <div className="text-2xl font-bold text-black mb-1">
              {orders.filter(o => o.status === 'rejected').length}
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrders;
