import React, { useState } from 'react';
import {
  Compass,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Camera,
  MapPin,
  AlertTriangle,
  FileCheck,
  ChevronRight,
  Plus,
  X,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { SiteSurvey, SurveyStatus, RoofType } from '../../types/solar';
import { useSolar } from '../../context/SolarContext';

interface SiteSurveysViewProps {
  onGenerateQuotation?: (surveyId: string) => void;
}

export const SiteSurveysView: React.FC<SiteSurveysViewProps> = ({ onGenerateQuotation }) => {
  const {
    surveys,
    customers,
    users,
    currentUser,
    scheduleSurvey,
    updateSurvey,
    approveSurvey,
    rejectSurvey,
  } = useSolar();

  const [selectedSurvey, setSelectedSurvey] = useState<SiteSurvey | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');

  // Form State for Scheduling New Survey
  const [formData, setFormData] = useState({
    customerId: customers[0]?.id || '',
    assignedTechnicianId: 'user-survey',
    surveyDate: new Date().toISOString().split('T')[0],
    roofType: 'RCC Flat Roof' as RoofType,
    shadowFreeAreaSqFt: 450,
    roofDirection: 'True South (180°)',
    roofTiltAngleDeg: 18,
    cableDistanceMeters: 15,
    gridSuitability: 'Excellent' as SiteSurvey['gridSuitability'],
    technicalObservations: 'Terrace structure inspected. Concrete load-bearing capacity exceeds standards. Direct southern exposure with zero tree shading.',
    recommendedCapacityKw: 3,
  });

  const handleCreateSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === formData.customerId);
    const tech = users.find((u) => u.id === formData.assignedTechnicianId);

    if (!cust) return;

    const newSrv = scheduleSurvey({
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      customerAddress: cust.address,
      assignedTechnicianId: formData.assignedTechnicianId,
      assignedTechnicianName: tech?.name || 'Amit Patel (Survey Tech)',
      surveyDate: formData.surveyDate,
      roofType: formData.roofType,
      shadowFreeAreaSqFt: Number(formData.shadowFreeAreaSqFt),
      roofDirection: formData.roofDirection,
      roofTiltAngleDeg: Number(formData.roofTiltAngleDeg),
      cableDistanceMeters: Number(formData.cableDistanceMeters),
      gridSuitability: formData.gridSuitability,
      roofPhotographs: [
        'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
      ],
      technicalObservations: formData.technicalObservations,
      recommendedCapacityKw: Number(formData.recommendedCapacityKw),
    });

    setIsNewModalOpen(false);
    setSelectedSurvey(newSrv);
  };

  const handleApprove = (surveyId: string) => {
    approveSurvey(surveyId, approvalNotes || 'Survey verified & approved by engineer.');
    setApprovalNotes('');
    const updated = surveys.find((s) => s.id === surveyId);
    if (updated) setSelectedSurvey({ ...updated, status: 'Approved' });
  };

  const handleReject = (surveyId: string) => {
    rejectSurvey(surveyId, approvalNotes || 'Inadequate shadow-free area or structural constraint.');
    setApprovalNotes('');
    const updated = surveys.find((s) => s.id === surveyId);
    if (updated) setSelectedSurvey({ ...updated, status: 'Rejected' });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Site Survey & Technical Feasibility</h1>
          <p className="text-xs text-slate-500 mt-1">
            Conduct shadow analysis, roof tilt measurement, and grid suitability checks. Approved surveys unlock quotation generation.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Compass className="w-4 h-4" />
          Schedule Site Survey
        </button>
      </div>

      {/* Surveys List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Customer & Location</th>
                <th className="py-3 px-4">Survey Date</th>
                <th className="py-3 px-4">Assigned Tech</th>
                <th className="py-3 px-4">Roof Spec</th>
                <th className="py-3 px-4">Shadow-Free Area</th>
                <th className="py-3 px-4">Rec. Capacity</th>
                <th className="py-3 px-4">Grid Feasibility</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {surveys.map((survey) => (
                <tr key={survey.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{survey.customerName}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                      {survey.customerAddress}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {survey.surveyDate}
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {survey.assignedTechnicianName}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{survey.roofType}</div>
                    <div className="text-[11px] text-slate-500">
                      {survey.roofDirection} • {survey.roofTiltAngleDeg}° tilt
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {survey.shadowFreeAreaSqFt} sq. ft.
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-emerald-700">
                      {survey.recommendedCapacityKw} kW DC
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        survey.gridSuitability === 'Excellent'
                          ? 'bg-emerald-100 text-emerald-800'
                          : survey.gridSuitability === 'Adequate'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {survey.gridSuitability}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        survey.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : survey.status === 'Rejected'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : survey.status === 'Scheduled'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}
                    >
                      {survey.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedSurvey(survey)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium cursor-pointer transition-colors"
                      >
                        Inspect
                      </button>

                      {survey.status === 'Approved' ? (
                        <button
                          onClick={() => onGenerateQuotation && onGenerateQuotation(survey.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                        >
                          <FileText className="w-3 h-3" />
                          Quote
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedSurvey(survey)}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-xs font-semibold cursor-pointer"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Survey Detail / Review / Approval Modal */}
      {selectedSurvey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-slate-200 text-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-semibold text-sm">Site Survey Report & Technical Feasibility</h3>
                  <p className="text-[11px] text-slate-400">{selectedSurvey.customerName} • {selectedSurvey.surveyDate}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSurvey(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Status Header */}
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Approval Status:</span>
                  <span
                    className={`font-bold text-sm ${
                      selectedSurvey.status === 'Approved'
                        ? 'text-emerald-700'
                        : selectedSurvey.status === 'Rejected'
                        ? 'text-red-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {selectedSurvey.status}
                  </span>
                </div>
                {selectedSurvey.approvedBy && (
                  <div className="text-right text-[11px] text-slate-500">
                    Approved by: <span className="font-semibold text-slate-800">{selectedSurvey.approvedBy}</span>
                  </div>
                )}
              </div>

              {/* Technical Spec Matrix */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Roof Type</span>
                  <span className="font-bold text-slate-900 mt-1 block">{selectedSurvey.roofType}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Shadow-Free Area</span>
                  <span className="font-bold text-emerald-700 mt-1 block">{selectedSurvey.shadowFreeAreaSqFt} sq. ft.</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Recommended Size</span>
                  <span className="font-bold text-emerald-800 mt-1 block">{selectedSurvey.recommendedCapacityKw} kW DC</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Roof Azimuth / Direction</span>
                  <span className="font-medium text-slate-800 mt-1 block">{selectedSurvey.roofDirection}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Tilt Angle</span>
                  <span className="font-medium text-slate-800 mt-1 block">{selectedSurvey.roofTiltAngleDeg}° Degrees</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">DC Cable Distance</span>
                  <span className="font-medium text-slate-800 mt-1 block">{selectedSurvey.cableDistanceMeters} Meters</span>
                </div>
              </div>

              {/* Technical Observations */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  Technician Observations & Structure Notes
                </h4>
                <p className="text-slate-700 leading-relaxed">{selectedSurvey.technicalObservations}</p>
                {selectedSurvey.approvalNotes && (
                  <p className="mt-2 text-emerald-800 font-medium border-t border-slate-200 pt-2">
                    Reviewer Notes: {selectedSurvey.approvalNotes}
                  </p>
                )}
              </div>

              {/* Roof Photographs Preview */}
              <div>
                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-slate-500" />
                  Site & Rooftop Photographs ({selectedSurvey.roofPhotographs.length})
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedSurvey.roofPhotographs.map((photo, i) => (
                    <div key={i} className="aspect-16/10 rounded-lg overflow-hidden border border-slate-200 relative group">
                      <img src={photo} alt="Rooftop" className="w-full h-full object-cover" />
                      <div className="absolute bottom-1 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                        Photo #{i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Approval Controls */}
              {selectedSurvey.status !== 'Approved' && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 space-y-3">
                  <h4 className="font-bold text-amber-900 text-xs">Technical Feasibility Approval Decision</h4>
                  <p className="text-amber-800 text-[11px]">
                    Only approved site surveys enable the sales team to configure package components and issue final quotations.
                  </p>
                  <input
                    type="text"
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Approval / Rejection comments for quotation team..."
                    className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleReject(selectedSurvey.id)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold cursor-pointer"
                    >
                      Reject Survey
                    </button>
                    <button
                      onClick={() => handleApprove(selectedSurvey.id)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve Survey for Quotation
                    </button>
                  </div>
                </div>
              )}

              {selectedSurvey.status === 'Approved' && onGenerateQuotation && (
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-900 text-xs">Survey Approved & Verified</span>
                    <p className="text-[11px] text-emerald-700">Ready for automated Bill of Materials generation.</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSurvey(null);
                      onGenerateQuotation(selectedSurvey.id);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    Generate Final Quotation →
                  </button>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedSurvey(null)}
                className="px-4 py-1.5 text-slate-600 hover:bg-slate-200 rounded font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Survey Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full my-8 overflow-hidden border border-slate-200 text-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-sm">Schedule Solar Rooftop Site Survey</h3>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSurvey} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Select Customer / Lead *
                  </label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.city}) – {c.requiredCapacityKw} kW {c.systemPreference} [Status: {c.status}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Assigned Survey Technician
                  </label>
                  <select
                    value={formData.assignedTechnicianId}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedTechnicianId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {users
                      .filter((u) => u.role === 'survey_technician' || u.role === 'admin')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role.replace('_', ' ')})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">Survey Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.surveyDate}
                    onChange={(e) => setFormData({ ...formData, surveyDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">Roof Type</label>
                  <select
                    value={formData.roofType}
                    onChange={(e) => setFormData({ ...formData, roofType: e.target.value as RoofType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="RCC Flat Roof">RCC Flat Concrete Roof</option>
                    <option value="Slanted Metal Sheet">Slanted Metal / Tin Deck</option>
                    <option value="Tiled Roof">Tiled / Slanted Mangalore Tile</option>
                    <option value="Industrial Shed">Industrial Warehouse Shed</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Available Shadow-Free Area (Sq. Ft.) *
                  </label>
                  <input
                    type="number"
                    min={100}
                    step={10}
                    required
                    value={formData.shadowFreeAreaSqFt}
                    onChange={(e) =>
                      setFormData({ ...formData, shadowFreeAreaSqFt: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Roof Direction / Azimuth
                  </label>
                  <input
                    type="text"
                    value={formData.roofDirection}
                    onChange={(e) => setFormData({ ...formData, roofDirection: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Roof Tilt Angle (Degrees)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={formData.roofTiltAngleDeg}
                    onChange={(e) =>
                      setFormData({ ...formData, roofTiltAngleDeg: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Cable Distance to DB (Meters)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={formData.cableDistanceMeters}
                    onChange={(e) =>
                      setFormData({ ...formData, cableDistanceMeters: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Grid Feasibility Suitability
                  </label>
                  <select
                    value={formData.gridSuitability}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gridSuitability: e.target.value as SiteSurvey['gridSuitability'],
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Excellent">Excellent (Stable 230V/415V)</option>
                    <option value="Adequate">Adequate</option>
                    <option value="Requires Phase Upgrade">Requires Phase Upgrade</option>
                    <option value="High Voltage Fluctuation">High Voltage Fluctuation</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Recommended Solar Capacity (kW)
                  </label>
                  <select
                    value={formData.recommendedCapacityKw}
                    onChange={(e) =>
                      setFormData({ ...formData, recommendedCapacityKw: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white font-bold text-emerald-800"
                  >
                    <option value={1}>1 kW DC</option>
                    <option value={2}>2 kW DC</option>
                    <option value={3}>3 kW DC</option>
                    <option value={4}>4 kW DC</option>
                    <option value={5}>5 kW DC</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Technical Observations & Structural Load Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.technicalObservations}
                    onChange={(e) =>
                      setFormData({ ...formData, technicalObservations: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Compass className="w-4 h-4" />
                  Save Survey Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
