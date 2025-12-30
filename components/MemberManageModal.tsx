
import React, { useState, useEffect } from 'react';
import { X, Check, Users, Plus, Trash2, Edit2, Coins, Calendar, Clock, Lock, Briefcase } from 'lucide-react';
import { MemberProfile } from '../types';

interface MemberManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: MemberProfile[];
  onSave: (members: MemberProfile[]) => void;
}

const MemberManageModal: React.FC<MemberManageModalProps> = ({ isOpen, onClose, members, onSave }) => {
  const [localMembers, setLocalMembers] = useState<MemberProfile[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Edit Form State
  const [editForm, setEditForm] = useState<Partial<MemberProfile>>({});

  useEffect(() => {
    if (isOpen) {
      setLocalMembers([...members]);
      setEditingId(null);
    }
  }, [isOpen, members]);

  if (!isOpen) return null;

  const handleEditClick = (member: MemberProfile) => {
    setEditingId(member.id);
    setEditForm({ ...member });
  };

  const handleAddNew = () => {
    const newMember: MemberProfile = {
      id: Date.now().toString(),
      name: '新客戶',
      password: '123',
      pettyCashBalance: 0, // Default 0
      meetingPointsTotal: 6, // Default 6 hours
      meetingPointsUsed: 0,
      contractDate: new Date().toISOString().split('T')[0].replace(/-/g, '/')
    };
    setLocalMembers([newMember, ...localMembers]);
    setEditingId(newMember.id);
    setEditForm(newMember);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('確定要刪除此客戶資料嗎？此動作無法復原。')) {
      const updated = localMembers.filter(m => m.id !== id);
      setLocalMembers(updated);
      if (editingId === id) setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    // If it was a new unsaved member (check if id exists in original props or if logic allows), 
    // strictly simpler here: just reset edit mode. 
    // Ideally we might remove the item if it was just added but not saved, 
    // but for simplicity we keep it in list until user explicitly deletes or saves.
    setEditingId(null);
  };

  const handleSaveEdit = () => {
    if (!editForm.name || !editForm.password) {
      alert("客戶名稱與密碼為必填欄位");
      return;
    }

    const updated = localMembers.map(m => 
      m.id === editingId ? { ...m, ...editForm } as MemberProfile : m
    );
    setLocalMembers(updated);
    setEditingId(null);
  };

  const handleSaveChanges = () => {
    onSave(localMembers);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90%]">
        {/* Header */}
        <div className="bg-slate-800 p-4 text-white flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Users size={20} /> 會員資料庫管理
          </h3>
          <button onClick={onClose} className="hover:bg-slate-700 p-1 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
             <p className="text-sm text-gray-500">管理客戶登入資訊、零用金與點數設定。</p>
             <button 
               onClick={handleAddNew}
               className="bg-brand-600 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-brand-700"
             >
               <Plus size={16} /> 新增客戶
             </button>
          </div>

          <div className="space-y-4">
            {localMembers.map(member => (
              <div 
                key={member.id} 
                className={`bg-white rounded-xl border shadow-sm transition-all ${
                  editingId === member.id ? 'border-brand-500 ring-2 ring-brand-100' : 'border-gray-200'
                }`}
              >
                {editingId === member.id ? (
                  // Edit Mode
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
                    <div className="col-span-1 sm:col-span-2 flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
                       <span className="text-brand-600 font-bold text-sm">編輯中...</span>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block flex items-center gap-1"><Briefcase size={12}/> 客戶名稱 (ID)</label>
                      <input 
                        type="text" 
                        value={editForm.name || ''}
                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block flex items-center gap-1"><Lock size={12}/> 登入密碼</label>
                      <input 
                        type="text" 
                        value={editForm.password || ''}
                        onChange={e => setEditForm({...editForm, password: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none font-mono bg-white text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block flex items-center gap-1"><Coins size={12}/> 零用金餘額 ($) [Max: 1000]</label>
                      <input 
                        type="number" 
                        max={1000}
                        min={0}
                        value={editForm.pettyCashBalance}
                        onChange={e => {
                          let val = Number(e.target.value);
                          if (val > 1000) val = 1000;
                          if (val < 0) val = 0;
                          setEditForm({...editForm, pettyCashBalance: val});
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block flex items-center gap-1"><Calendar size={12}/> 合約到期日</label>
                      <input 
                        type="text" 
                        value={editForm.contractDate || ''}
                        onChange={e => setEditForm({...editForm, contractDate: e.target.value})}
                        placeholder="YYYY/MM/DD"
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900"
                      />
                    </div>

                    <div>
                       <label className="text-xs font-bold text-gray-500 mb-1 block flex items-center gap-1"><Clock size={12}/> 每月會議點數 (Total) [Max: 120]</label>
                       <input 
                        type="number"
                        max={120}
                        min={0} 
                        value={editForm.meetingPointsTotal}
                        onChange={e => {
                          let val = Number(e.target.value);
                          if (val > 120) val = 120;
                          if (val < 0) val = 0;
                          setEditForm({...editForm, meetingPointsTotal: val});
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900"
                      />
                    </div>

                    <div>
                       <label className="text-xs font-bold text-gray-500 mb-1 block flex items-center gap-1"><Clock size={12}/> 已使用點數 (Used)</label>
                       <input 
                        type="number" 
                        value={editForm.meetingPointsUsed}
                        onChange={e => setEditForm({...editForm, meetingPointsUsed: Number(e.target.value)})}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900"
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2 flex justify-end gap-2 mt-2">
                       <button onClick={handleCancelEdit} className="px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded text-sm">取消</button>
                       <button onClick={handleSaveEdit} className="px-4 py-1.5 bg-brand-600 text-white rounded text-sm font-bold shadow-sm hover:bg-brand-700">完成</button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0">
                      {member.name.charAt(0)}
                    </div>
                    
                    <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                       <div>
                          <p className="text-xs text-gray-400">客戶名稱</p>
                          <p className="font-bold text-gray-800 truncate">{member.name}</p>
                       </div>
                       <div>
                          <p className="text-xs text-gray-400">密碼</p>
                          <p className="font-mono text-sm bg-gray-100 px-1 rounded inline-block text-gray-600">{member.password}</p>
                       </div>
                       <div>
                          <p className="text-xs text-gray-400">零用金</p>
                          <p className={`font-bold ${member.pettyCashBalance < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                            ${member.pettyCashBalance.toLocaleString()}
                          </p>
                       </div>
                       <div>
                          <p className="text-xs text-gray-400">會議點數</p>
                          <p className="font-bold text-brand-600">
                            {member.meetingPointsTotal - member.meetingPointsUsed} <span className="text-xs text-gray-400 font-normal">/ {member.meetingPointsTotal}</span>
                          </p>
                       </div>
                    </div>

                    <div className="flex gap-2 sm:ml-auto mt-2 sm:mt-0">
                       <button 
                         onClick={() => handleEditClick(member)}
                         className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors"
                       >
                         <Edit2 size={16} />
                       </button>
                       <button 
                         onClick={() => handleDelete(member.id)}
                         className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {localMembers.length === 0 && (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                 尚未建立任何客戶資料
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-white flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button 
            onClick={handleSaveChanges}
            className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition-colors flex items-center gap-2"
          >
            <Check size={18} /> 儲存變更
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberManageModal;
