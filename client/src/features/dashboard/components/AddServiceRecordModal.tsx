'use client';
import { useState } from 'react';
import { FaTimes, FaUser, FaCar, FaTools, FaCalendar, FaPhone } from 'react-icons/fa';

interface AddServiceRecordModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddServiceRecordModal({ open, onClose }: AddServiceRecordModalProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    vehicleNumber: '',
    serviceDetail: '',
    serviceDate: '',
    phoneNumber: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement service record creation logic
    console.log('Service Record Data:', formData);
    // Reset form and close modal
    setFormData({
      customerName: '',
      vehicleNumber: '',
      serviceDetail: '',
      serviceDate: '',
      phoneNumber: ''
    });
    onClose();
  };

  const handleCancel = () => {
    // Reset form and close modal
    setFormData({
      customerName: '',
      vehicleNumber: '',
      serviceDetail: '',
      serviceDate: '',
      phoneNumber: ''
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
          <h2 className="text-xl font-bold text-[#27272A]">Add Service Record</h2>
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-[#F4F4F5] transition-colors"
          >
            <FaTimes className="text-[#71717A] text-lg" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-[#27272A] mb-2 flex items-center gap-2">
              <FaUser className="text-[#F97316]" />
              Customer Name *
            </label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-[#27272A] placeholder-[#9CA3AF]"
              placeholder="Enter customer name"
            />
          </div>

          {/* Vehicle Number */}
          <div>
            <label className="block text-sm font-medium text-[#27272A] mb-2 flex items-center gap-2">
              <FaCar className="text-[#F97316]" />
              Vehicle Number *
            </label>
            <input
              type="text"
              required
              value={formData.vehicleNumber}
              onChange={(e) => handleInputChange('vehicleNumber', e.target.value)}
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-[#27272A] placeholder-[#9CA3AF]"
              placeholder="Enter vehicle number"
            />
          </div>

          {/* Service Detail */}
          <div>
            <label className="block text-sm font-medium text-[#27272A] mb-2 flex items-center gap-2">
              <FaTools className="text-[#F97316]" />
              Service Detail *
            </label>
            <textarea
              required
              value={formData.serviceDetail}
              onChange={(e) => handleInputChange('serviceDetail', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-[#27272A] placeholder-[#9CA3AF] resize-none"
              placeholder="Describe the service performed"
            />
          </div>

          {/* Service Date */}
          <div>
            <label className="block text-sm font-medium text-[#27272A] mb-2 flex items-center gap-2">
              <FaCalendar className="text-[#F97316]" />
              Service Date *
            </label>
            <input
              type="date"
              required
              value={formData.serviceDate}
              onChange={(e) => handleInputChange('serviceDate', e.target.value)}
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-[#27272A]"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-[#27272A] mb-2 flex items-center gap-2">
              <FaPhone className="text-[#F97316]" />
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-[#27272A] placeholder-[#9CA3AF]"
              placeholder="Enter phone number"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-3 border border-[#E5E7EB] text-[#27272A] rounded-lg hover:bg-[#F9FAFB] transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-colors font-medium"
            >
              Add Service Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 