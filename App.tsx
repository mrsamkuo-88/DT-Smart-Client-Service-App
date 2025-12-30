import React, { useState } from 'react';
import { 
  Home, MapPin, BookOpen, UserCircle, 
  Search, ChevronRight, Map, Printer, 
  Wifi, Coffee, ShieldCheck, Mail, Users,
  Plus, PlayCircle, Image as ImageIcon, FileText, Trash2,
  ChevronDown, ChevronUp, ExternalLink, CalendarX, MonitorPlay, X,
  Projector, Tv, Presentation, Mic, Speaker, Wind, Zap, Star,
  Car, Monitor, HelpCircle, KeyRound, Wrench, Coins, Utensils, 
  ChefHat, Sandwich, Calculator, Package, Inbox, Send,
  Edit2, Briefcase, Globe, Database, Building2, FileSignature, Laptop, ArrowRight,
  LogOut, Lock, Settings, Shield, Upload, Check
} from 'lucide-react';
import { BRANCHES, EQUIPMENTS, ANNOUNCEMENTS, INITIAL_SPACES, SPACE_AMENITIES, WIKI_CATEGORIES, BUSINESS_PARTNERS, INITIAL_OFFICE_TYPES } from './constants';
import { BranchId, Equipment, Announcement, LocationSpace, WikiCategory, BusinessPartner, OfficeType } from './types';
import * as Types from './types';
import FloorPlan from './components/FloorPlan';
import Assistant from './components/Assistant';
import WikiUploadModal from './components/WikiUploadModal';
import AnnouncementModal from './components/AnnouncementModal';
import SpaceManageModal from './components/SpaceManageModal';
import BusinessPartnerModal from './components/BusinessPartnerModal';
import OfficeEditModal from './components/OfficeEditModal';

// Icon mapper for detail view
const iconMap: any = {
  Wifi, Projector, Tv, Presentation, Mic, Speaker, Wind, Zap, Coffee,
  Map, Monitor, Car, KeyRound, HelpCircle, Printer
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Types.Tab>('home');
  const [selectedBranch, setSelectedBranch] = useState<Types.BranchId>(BranchId.MINQUAN);
  
  // -- Auth State --
  const [isMemberLoggedIn, setIsMemberLoggedIn] = useState(false);
  const [memberPasswordInput, setMemberPasswordInput] = useState('');
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');

  // -- Wiki State --
  const [wikiItems, setWikiItems] = useState<Equipment[]>(EQUIPMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeWikiCategory, setActiveWikiCategory] = useState<WikiCategory | 'all'>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // -- Announcement State --
  const [announcements, setAnnouncements] = useState<Announcement[]>(ANNOUNCEMENTS);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [expandedAnnouncementId, setExpandedAnnouncementId] = useState<string | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  // -- Location Spaces State --
  const [locationSpaces, setLocationSpaces] = useState<LocationSpace[]>(INITIAL_SPACES);
  const [isSpaceModalOpen, setIsSpaceModalOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<LocationSpace | null>(null); // For viewing details
  const [activeSpaceImage, setActiveSpaceImage] = useState<string>(''); // For gallery viewing in detail modal

  // -- Business Partner State --
  const [businessPartners, setBusinessPartners] = useState<BusinessPartner[]>(BUSINESS_PARTNERS);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<BusinessPartner | null>(null);

  // -- Office Types State --
  const [officeTypes, setOfficeTypes] = useState<OfficeType[]>(INITIAL_OFFICE_TYPES);
  const [showOfficeSelector, setShowOfficeSelector] = useState(false);
  const [selectedOfficeType, setSelectedOfficeType] = useState<OfficeType | null>(null); // For detail view
  const [isOfficeEditModalOpen, setIsOfficeEditModalOpen] = useState(false);
  const [editingOfficeType, setEditingOfficeType] = useState<OfficeType | null>(null);
  const [activeOfficeImage, setActiveOfficeImage] = useState<string>(''); // For gallery

  // -- Service State --
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);

  // -- Auth Actions --

  const handleMemberLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (memberPasswordInput === 'app5286') {
      setIsMemberLoggedIn(true);
      setMemberPasswordInput('');
    } else {
      alert('會員密碼錯誤');
    }
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      if (window.confirm("確定要登出管理者模式嗎？")) {
        setIsAdmin(false);
      }
    } else {
      setShowAdminLogin(true);
      setAdminPasswordInput('');
    }
  };

  const submitAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === 'app5286!@#') {
      setIsAdmin(true);
      setIsMemberLoggedIn(true); // Admin implicitly has member access
      setShowAdminLogin(false);
      setAdminPasswordInput('');
      alert("管理者登入成功！已啟用編輯權限。");
    } else {
      alert("管理者密碼錯誤");
    }
  };

  // Helper to ensure admin is active before actions (double check)
  const requireAdmin = () => {
    if (isAdmin) return true;
    alert("此操作需要管理者權限，請點擊右上角齒輪登入。");
    return false;
  };

  // -- Content Actions --

  const handleAddWikiItem = (newItem: Equipment) => {
    setWikiItems([newItem, ...wikiItems]);
  };

  const handleSaveAnnouncement = (item: Announcement) => {
    setAnnouncements(prev => {
      const exists = prev.find(a => a.id === item.id);
      if (exists) {
        return prev.map(a => a.id === item.id ? item : a);
      }
      return [item, ...prev];
    });
    setEditingAnnouncement(null);
  };

  const handleEditAnnouncement = (ann: Announcement, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireAdmin()) return;
    setEditingAnnouncement(ann);
    setIsAnnouncementModalOpen(true);
  };

  const handleDeleteAnnouncement = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireAdmin()) return;

    if (window.confirm('確定要刪除此公告嗎？此動作無法復原。')) {
      setAnnouncements(announcements.filter(a => a.id !== id));
    }
  };

  const handleClearExpired = () => {
    if (!requireAdmin()) return;

    const today = new Date().toISOString().split('T')[0];
    const expiredCount = announcements.filter(a => a.date < today).length;
    
    if (expiredCount === 0) {
      alert('目前沒有已過期的公告。');
      return;
    }

    if (window.confirm(`確定要清除 ${expiredCount} 則已過期的公告嗎？`)) {
       setAnnouncements(announcements.filter(a => a.date >= today));
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedAnnouncementId(expandedAnnouncementId === id ? null : id);
  };

  const handleAddSpace = (newSpace: LocationSpace) => {
    setLocationSpaces([...locationSpaces, newSpace]);
  };

  const handleDeleteSpace = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireAdmin()) return;

    if (window.confirm('確定要刪除此空間嗎？此動作無法復原。')) {
      setLocationSpaces(locationSpaces.filter(s => s.id !== id));
    }
  };

  const openSpaceDetail = (space: LocationSpace) => {
    setSelectedSpace(space);
    setActiveSpaceImage(space.imageUrl); // Set cover as default active image
  };

  const handleSavePartner = (partner: BusinessPartner) => {
    setBusinessPartners(prev => {
      const exists = prev.find(p => p.id === partner.id);
      if (exists) {
        return prev.map(p => p.id === partner.id ? partner : p);
      }
      return [...prev, partner];
    });
    setEditingPartner(null);
  };

  const handleEditPartner = (partner: BusinessPartner, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireAdmin()) return;
    setEditingPartner(partner);
    setIsPartnerModalOpen(true);
  };

  const handleDeletePartner = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireAdmin()) return;
    
    if (window.confirm('確定要下架此合作夥伴嗎？')) {
      setBusinessPartners(businessPartners.filter(p => p.id !== id));
    }
  };

  const handleSaveOfficeType = (item: OfficeType) => {
    setOfficeTypes(prev => prev.map(o => o.id === item.id ? item : o));
    setEditingOfficeType(null);
  };

  const handleEditOfficeType = (item: OfficeType, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingOfficeType(item);
    setIsOfficeEditModalOpen(true);
  };

  const openOfficeDetail = (item: OfficeType) => {
    setSelectedOfficeType(item);
    setActiveOfficeImage(item.imageUrl);
  };

  const handleRepairClick = () => {
    window.open('https://3gltz.share.hsforms.com/2iuXFloH0RIKGzjHtbt8ZHg', '_blank');
  };

  const handlePettyCashClick = () => {
    alert('零用金申請：請至行政櫃台填寫紙本申請單，或聯繫財務部門。');
  };

  const handleMealLink = (url: string) => {
    window.open(url, '_blank');
    setIsMealModalOpen(false);
  };

  const handlePackageOption = (type: 'receive' | 'send') => {
    if (type === 'send') {
      window.open('https://share-na2.hsforms.com/2H5NQIAL1T1m36jBDVLTh-g3gltz', '_blank');
    } else {
      alert('系統查詢：目前您沒有待領取的包裹或郵件。');
    }
    setIsPackageModalOpen(false);
  };

  // -- Views --

  const renderHome = () => (
    <div className="space-y-6 pb-24">
      {/* Hero Section */}
      <div className="relative h-64 bg-brand-900 rounded-b-3xl overflow-hidden shadow-lg shrink-0">
        <div className="absolute inset-0 opacity-60">
           <img 
            src={BRANCHES.find(b => b.id === selectedBranch)?.image || 'https://picsum.photos/800/600'} 
            alt="Coworking" 
            className="w-full h-full object-cover"
           />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/90 to-transparent"></div>
        <div className="absolute bottom-6 left-6 right-6">
          <p className="text-brand-200 text-sm font-medium mb-1">Welcome back,</p>
          <h1 className="text-3xl font-bold text-white mb-2">道騰國際共享空間</h1>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
             {BRANCHES.map(b => (
               <button 
                key={b.id}
                onClick={() => setSelectedBranch(b.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm transition-colors ${
                  selectedBranch === b.id 
                  ? 'bg-white text-brand-900 border-white' 
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
               >
                 {b.name.split(' ')[0]}
               </button>
             ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-xl shadow-lg p-4 grid grid-cols-4 gap-2">
          {[
            { label: 'Wi-Fi', icon: Wifi, action: () => { setActiveTab('wiki'); setActiveWikiCategory('wifi'); } },
            { label: '門禁', icon: ShieldCheck, action: () => { setActiveTab('wiki'); setActiveWikiCategory('access'); } },
            { label: '列印', icon: Printer, action: () => { setActiveTab('wiki'); setActiveWikiCategory('equipment'); } },
            { label: '茶水', icon: Coffee, action: () => { setActiveTab('wiki'); setActiveWikiCategory('equipment'); } },
          ].map((item, i) => (
            <button key={i} onClick={item.action} className="flex flex-col items-center gap-2 p-2 hover:bg-brand-50 rounded-lg transition-colors">
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
                <item.icon size={20} />
              </div>
              <span className="text-xs text-gray-600 font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Announcements */}
      <div className="px-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Mail size={18} className="text-brand-500"/> 最新公告
          </h2>
          {isAdmin && (
            <div className="flex gap-2">
              <button 
                onClick={handleClearExpired}
                className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-md font-medium hover:bg-red-100 flex items-center gap-1 border border-red-100"
                title="清除過期"
              >
                <CalendarX size={12} /> 清除
              </button>
              <button 
                onClick={() => { 
                  setEditingAnnouncement(null); 
                  setIsAnnouncementModalOpen(true); 
                }}
                className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded-md font-bold hover:bg-brand-200 flex items-center gap-1"
              >
                <Plus size={12} /> 發布
              </button>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          {announcements.map(ann => {
             const isExpired = ann.date < new Date().toISOString().split('T')[0];
             const isExpanded = expandedAnnouncementId === ann.id;
             const dateObj = new Date(ann.date);
             const month = dateObj.getMonth() + 1;
             const day = dateObj.getDate();

             return (
              <div 
                key={ann.id} 
                onClick={() => toggleExpand(ann.id)}
                className={`bg-white border rounded-xl p-3 shadow-sm transition-all cursor-pointer relative overflow-hidden group ${
                  isExpired ? 'border-gray-200 bg-gray-50 opacity-70' : 'border-gray-100 hover:border-brand-300'
                }`}
              >
                {/* Expired Label */}
                {isExpired && (
                  <div className="absolute top-0 right-0 bg-gray-200 text-gray-500 text-[10px] px-2 py-0.5 rounded-bl-lg font-medium z-10">
                    已結束
                  </div>
                )}

                <div className="flex gap-3">
                  {/* Date Badge */}
                  <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg shrink-0 border ${
                    isExpired ? 'bg-gray-100 border-gray-200 text-gray-400' : 'bg-brand-50 border-brand-100 text-brand-600'
                  }`}>
                    <span className="text-[10px] uppercase font-bold tracking-wider">
                      {month}月
                    </span>
                    <span className="text-lg font-bold leading-none">{day}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                           ann.type === 'alert' ? 'bg-red-100 text-red-600' : 
                           ann.type === 'event' ? 'bg-purple-100 text-purple-600' : 
                           'bg-blue-100 text-blue-600'
                        }`}>
                           {ann.type === 'alert' ? '緊急' : ann.type === 'event' ? '活動' : '資訊'}
                        </span>
                        <h4 className={`font-bold text-sm truncate ${isExpired ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                          {ann.title}
                        </h4>
                     </div>
                     
                     {/* Preview or Toggle hint */}
                     <div className="flex justify-between items-center mt-2">
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                           {ann.details ? (
                             <>
                               {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                               {isExpanded ? '收合詳情' : '點擊查看詳情'}
                             </>
                           ) : (
                             <span>無詳細內容</span>
                           )}
                        </div>
                        
                        {/* Admin Actions */}
                        {isAdmin && (
                          <div className="flex gap-2">
                            <button 
                              onClick={(e) => handleEditAnnouncement(ann, e)}
                              className="text-gray-400 hover:text-brand-600 p-1"
                              title="編輯"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={(e) => handleDeleteAnnouncement(ann.id, e)}
                              className="text-gray-400 hover:text-red-500 p-1"
                              title="刪除"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                     </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && ann.details && (
                  <div className="mt-3 pt-3 border-t border-gray-100 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-start gap-2">
                       <FileText size={14} className="text-gray-400 mt-0.5 shrink-0"/>
                       <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{ann.details}</p>
                    </div>
                    {ann.link && (
                      <a 
                        href={ann.link} 
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-brand-600 text-sm font-medium mt-3 hover:underline pl-6"
                      >
                        <ExternalLink size={14} /> 點擊前往報名/相關頁面
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {announcements.length === 0 && (
             <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg text-sm border border-dashed border-gray-200">
               目前沒有公告
             </div>
          )}
        </div>
      </div>

      {/* Interactive Map Preview */}
      <div className="px-6">
        <FloorPlan />
      </div>
    </div>
  );

  const renderLocations = () => (
    <div className="pt-6 pb-24 px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">空間導覽</h1>
        <p className="text-sm text-gray-500">探索 {BRANCHES.find(b => b.id === selectedBranch)?.name} 的各類空間。</p>
      </div>

      {/* Branch Selector (Tabs) */}
      <div className="flex bg-gray-100 p-1 rounded-xl">
        {BRANCHES.map(branch => (
          <button
            key={branch.id}
            onClick={() => setSelectedBranch(branch.id)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              selectedBranch === branch.id 
              ? 'bg-white text-brand-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {branch.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Admin Add Button */}
      {isAdmin && (
        <button 
          onClick={() => setIsSpaceModalOpen(true)}
          className="w-full py-3 border-2 border-dashed border-brand-200 rounded-xl text-brand-600 font-bold flex items-center justify-center gap-2 hover:bg-brand-50 transition-colors"
        >
          <Plus size={20} /> 新增空間
        </button>
      )}

      {/* Spaces Grid */}
      <div className="grid grid-cols-1 gap-4">
        {locationSpaces.filter(s => s.branchId === selectedBranch).map(space => (
          <div 
            key={space.id}
            onClick={() => openSpaceDetail(space)}
            className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="relative h-48">
              <img src={space.imageUrl} alt={space.name} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                {space.capacity}
              </div>
              {/* Admin Delete */}
              {isAdmin && (
                <button 
                  onClick={(e) => handleDeleteSpace(space.id, e)}
                  className="absolute top-2 left-2 bg-red-500 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-800 text-lg mb-1">{space.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{space.description}</p>
              
              {/* Amenities Preview */}
              <div className="flex gap-2">
                {space.features?.slice(0, 4).map(fid => {
                   const amenity = SPACE_AMENITIES.find(a => a.id === fid);
                   const Icon = amenity ? iconMap[amenity.iconName] : null;
                   return Icon ? (
                     <div key={fid} className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center" title={amenity?.label}>
                       <Icon size={12} />
                     </div>
                   ) : null;
                })}
                {(space.features?.length || 0) > 4 && (
                   <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-bold">
                     +{(space.features?.length || 0) - 4}
                   </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

       {/* Space Detail Modal */}
       {selectedSpace && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={() => setSelectedSpace(null)}></div>
          <div className="bg-white w-full h-[90%] sm:max-w-md sm:h-[80%] rounded-t-2xl sm:rounded-2xl flex flex-col pointer-events-auto animate-in slide-in-from-bottom duration-300 overflow-hidden">
             
             {/* Sticky Header */}
             <div className="relative h-64 shrink-0 bg-black">
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedSpace(null)}
                  className="absolute top-4 right-4 z-20 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur-sm"
                >
                  <X size={20} />
                </button>
                
                {/* Main Image or Video */}
                {activeSpaceImage === selectedSpace.videoUrl ? (
                   <video src={selectedSpace.videoUrl} controls autoPlay className="w-full h-full object-contain" />
                ) : (
                   <img src={activeSpaceImage} alt="Detail" className="w-full h-full object-cover" />
                )}

                {/* Gallery Thumbs */}
                <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto no-scrollbar z-10">
                   {selectedSpace.videoUrl && (
                      <button 
                        onClick={() => setActiveSpaceImage(selectedSpace.videoUrl!)}
                        className={`w-16 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 relative ${
                          activeSpaceImage === selectedSpace.videoUrl ? 'border-brand-500' : 'border-white/50'
                        }`}
                      >
                         <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <PlayCircle size={20} className="text-white" />
                         </div>
                      </button>
                   )}
                   {selectedSpace.images.map((img, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setActiveSpaceImage(img)}
                        className={`w-16 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                          activeSpaceImage === img ? 'border-brand-500' : 'border-white/50'
                        }`}
                      >
                         <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                   ))}
                </div>
             </div>

             {/* Content */}
             <div className="flex-1 overflow-y-auto p-6 bg-white">
                <div className="flex justify-between items-start mb-2">
                   <h2 className="text-2xl font-bold text-gray-800">{selectedSpace.name}</h2>
                   <div className="bg-brand-50 text-brand-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Users size={14} /> {selectedSpace.capacity}
                   </div>
                </div>
                
                <p className="text-gray-600 leading-relaxed mb-6">
                   {selectedSpace.description}
                </p>

                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                   <Monitor size={18} /> 空間設備
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-8">
                   {selectedSpace.features?.map(fid => {
                      const amenity = SPACE_AMENITIES.find(a => a.id === fid);
                      const Icon = amenity ? iconMap[amenity.iconName] : null;
                      return amenity ? (
                        <div key={fid} className="flex items-center gap-2 text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">
                           {Icon && <Icon size={16} className="text-brand-500" />}
                           {amenity.label}
                        </div>
                      ) : null;
                   })}
                </div>

                <button className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all flex items-center justify-center gap-2">
                   <CalendarX size={20} /> 立即預約時段
                </button>
             </div>
          </div>
        </div>
       )}
    </div>
  );

  const renderWiki = () => (
    <div className="pt-6 pb-24 px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">空間百科</h1>
        <p className="text-sm text-gray-500">操作指南、設備使用與常見問題。</p>
      </div>

      {/* Search */}
      <div className="relative">
         <Search className="absolute left-3 top-3 text-gray-400" size={20} />
         <input 
           type="text" 
           placeholder="搜尋關鍵字 (例如：Wifi, 印表機)" 
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
         />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
         <button 
           onClick={() => setActiveWikiCategory('all')}
           className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-colors ${
             activeWikiCategory === 'all' 
             ? 'bg-brand-600 text-white border-brand-600' 
             : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
           }`}
         >
           全部
         </button>
         {WIKI_CATEGORIES.map(cat => {
            const Icon = iconMap[cat.iconName];
            return (
              <button 
                key={cat.id}
                onClick={() => setActiveWikiCategory(cat.id as WikiCategory)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border flex items-center gap-1 transition-colors ${
                  activeWikiCategory === cat.id 
                  ? 'bg-brand-600 text-white border-brand-600' 
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
              >
                {Icon && <Icon size={12} />}
                {cat.label}
              </button>
            );
         })}
      </div>

      {/* Admin Add Button */}
      {isAdmin && (
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="w-full py-3 border-2 border-dashed border-brand-200 rounded-xl text-brand-600 font-bold flex items-center justify-center gap-2 hover:bg-brand-50 transition-colors"
        >
          <Upload size={20} /> 新增內容
        </button>
      )}

      {/* Content List */}
      <div className="space-y-4">
         {wikiItems
           .filter(item => {
             const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                   item.description.toLowerCase().includes(searchTerm.toLowerCase());
             const matchesCategory = activeWikiCategory === 'all' || item.category === activeWikiCategory;
             return matchesSearch && matchesCategory;
           })
           .map(item => {
             const Icon = iconMap[item.iconName] || FileText;
             return (
               <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-brand-200 transition-all">
                  <div className="flex items-start gap-4">
                     <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center shrink-0">
                        <Icon size={24} />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                           <h3 className="font-bold text-gray-800 text-base mb-1">{item.title}</h3>
                           <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                              {item.contentType === 'video' ? '影片' : item.contentType === 'image' ? '圖表' : '指南'}
                           </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">{item.description}</p>
                        
                        {/* Inline Content Display based on Type */}
                        {item.contentType === 'guide' && item.instructions && (
                           <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 space-y-1">
                              {item.instructions.map((inst, idx) => (
                                 <div key={idx} className="flex gap-2">
                                    <span className="font-bold text-gray-400 select-none">{idx + 1}.</span>
                                    <span>{inst}</span>
                                 </div>
                              ))}
                           </div>
                        )}
                        
                        {item.contentType === 'video' && item.mediaUrl && (
                           <div className="rounded-lg overflow-hidden bg-black aspect-video relative group cursor-pointer">
                              <video src={item.mediaUrl} controls className="w-full h-full" />
                           </div>
                        )}

                        {item.contentType === 'image' && item.mediaUrl && (
                           <div className="rounded-lg overflow-hidden bg-gray-100 aspect-video cursor-pointer" onClick={() => window.open(item.mediaUrl, '_blank')}>
                              <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" />
                           </div>
                        )}
                     </div>
                  </div>
               </div>
             );
           })}
      </div>
    </div>
  );

  const renderBusiness = () => (
    <div className="pt-6 pb-24 px-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">商務資源中心</h1>
        <p className="text-sm text-gray-500">串聯內部企業，共享商業價值。</p>
      </div>

      {/* Partners Carousel (Horizontal) */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <Users size={20} className="text-brand-500" /> 商務夥伴
          </h3>
          {/* Admin-only Add Button */}
          {isAdmin && (
            <button 
              onClick={() => {
                setEditingPartner(null);
                setIsPartnerModalOpen(true);
              }}
              className="text-xs text-brand-600 font-bold bg-brand-50 px-2 py-1 rounded-full hover:bg-brand-100 transition-colors flex items-center gap-1"
            >
              <Plus size={12} /> 申請上架
            </button>
          )}
        </div>
        
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
          {businessPartners.map(partner => (
            <div 
              key={partner.id}
              className="min-w-[220px] bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-brand-200 transition-all flex flex-col relative group"
            >
               {/* Admin Edit Overlays */}
               {isAdmin && (
                 <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-lg p-1">
                   <button 
                      onClick={(e) => handleEditPartner(partner, e)}
                      className="p-1 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded"
                   >
                      <Edit2 size={14} />
                   </button>
                   <button 
                      onClick={(e) => handleDeletePartner(partner.id, e)}
                      className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                   >
                      <Trash2 size={14} />
                   </button>
                 </div>
               )}

               <div className="flex items-center gap-3 mb-3">
                  {partner.logoUrl ? (
                    <img 
                      src={partner.logoUrl} 
                      alt={partner.name} 
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-full ${partner.logoColor} text-white flex items-center justify-center font-bold text-lg shrink-0`}>
                      {partner.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm leading-tight">{partner.name}</h4>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded mt-1 inline-block">
                      {partner.category}
                    </span>
                  </div>
               </div>
               <p className="text-xs text-gray-500 mb-4 line-clamp-2 flex-1">
                 {partner.description}
               </p>
               {partner.website && (
                 <a 
                   href={partner.website} 
                   target="_blank" 
                   rel="noreferrer"
                   className="mt-auto text-xs font-bold text-brand-600 flex items-center gap-1 hover:underline"
                 >
                   <Globe size={12} /> 訪問官網
                 </a>
               )}
            </div>
          ))}
          {/* Admin-only "Add New" Card at end of list */}
          {isAdmin && (
            <div 
              onClick={() => {
                setEditingPartner(null);
                setIsPartnerModalOpen(true);
              }}
              className="min-w-[140px] bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-gray-400 gap-2 cursor-pointer hover:bg-gray-100 transition-colors"
            >
               <Plus size={24} />
               <span className="text-xs font-medium text-center">新增夥伴</span>
            </div>
          )}
        </div>
      </div>

      {/* Professional Services Grid */}
      <div>
        <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
           <Briefcase size={20} className="text-brand-500" /> 專業服務
        </h3>
        <div className="grid grid-cols-2 gap-4">
           {/* Office Space - Triggers Selector */}
           <div 
             onClick={() => setShowOfficeSelector(true)}
             className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group"
           >
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Building2 size={20} />
              </div>
              <h4 className="font-bold text-gray-800 mb-1">辦公空間</h4>
              <p className="text-xs text-gray-500 mb-2">獨立辦公室、會議室租賃。</p>
              <span className="text-xs text-brand-600 font-bold flex items-center gap-1">
                查看方案 <ArrowRight size={12} />
              </span>
           </div>

           {/* Registration */}
           <div 
             onClick={() => alert("請洽行政櫃台索取工商登記申請書。")}
             className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group"
           >
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileSignature size={20} />
              </div>
              <h4 className="font-bold text-gray-800 mb-1">工商登記</h4>
              <p className="text-xs text-gray-500 mb-2">公司設立、借址登記服務。</p>
              <span className="text-xs text-brand-600 font-bold flex items-center gap-1">
                了解詳情 <ArrowRight size={12} />
              </span>
           </div>

           {/* ERP/CRM */}
           <div 
             onClick={() => window.open('https://example.com/erp', '_blank')}
             className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group"
           >
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Database size={20} />
              </div>
              <h4 className="font-bold text-gray-800 mb-1">ERP/CRM</h4>
              <p className="text-xs text-gray-500 mb-2">企業資源規劃與客戶管理。</p>
              <span className="text-xs text-brand-600 font-bold flex items-center gap-1">
                諮詢顧問 <ArrowRight size={12} />
              </span>
           </div>

           {/* Web/SEO */}
           <div 
             onClick={() => window.open('https://example.com/seo', '_blank')}
             className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group"
           >
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Laptop size={20} />
              </div>
              <h4 className="font-bold text-gray-800 mb-1">官網/SEO</h4>
              <p className="text-xs text-gray-500 mb-2">網站架設與搜尋引擎優化。</p>
              <span className="text-xs text-brand-600 font-bold flex items-center gap-1">
                提升曝光 <ArrowRight size={12} />
              </span>
           </div>
        </div>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="pt-6 pb-24 px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">會員中心</h1>
        <p className="text-sm text-gray-500">管理您的個人設定與專屬服務。</p>
      </div>

      {!isMemberLoggedIn ? (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center space-y-4">
           <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto text-brand-500">
              <Lock size={40} />
           </div>
           <div>
              <h3 className="text-lg font-bold text-gray-800">會員登入</h3>
              <p className="text-sm text-gray-500">請輸入密碼以存取會員服務</p>
           </div>
           <form onSubmit={handleMemberLogin} className="space-y-3">
              <input 
                type="password"
                value={memberPasswordInput}
                onChange={(e) => setMemberPasswordInput(e.target.value)}
                placeholder="輸入會員密碼 (app5286)"
                className="w-full text-center px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
              <button className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 transition-colors">
                 登入
              </button>
           </form>
           <div className="pt-4 border-t border-gray-100">
             <button onClick={() => setShowAdminLogin(true)} className="text-xs text-gray-400 hover:text-gray-600 underline">
               管理者登入
             </button>
           </div>
        </div>
      ) : (
        <>
          {/* Member Card */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
             
             <div className="relative z-10 flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white rounded-full p-1">
                   <img src="https://i.pravatar.cc/150?img=3" alt="Avatar" className="w-full h-full rounded-full object-cover" />
                </div>
                <div>
                   <h2 className="text-xl font-bold">道騰會員</h2>
                   <p className="text-brand-100 text-sm">一般會員</p>
                </div>
                <div className="ml-auto">
                   <button onClick={handleAdminToggle} className={`p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors ${isAdmin ? 'ring-2 ring-yellow-400' : ''}`}>
                      <Settings size={20} />
                   </button>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                   <span className="text-brand-100 text-xs block mb-1">會議室點數</span>
                   <span className="text-2xl font-bold">120 <span className="text-sm font-normal">pts</span></span>
                </div>
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                   <span className="text-brand-100 text-xs block mb-1">合約到期日</span>
                   <span className="text-lg font-bold">2024/12/31</span>
                </div>
             </div>
          </div>

          {/* Service Grid */}
          <div className="grid grid-cols-2 gap-4">
             <button 
               onClick={handleRepairClick}
               className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-brand-300 transition-all text-left group"
             >
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                   <Wrench size={20} />
                </div>
                <h4 className="font-bold text-gray-800">設備報修</h4>
                <p className="text-xs text-gray-500 mt-1">線上填寫維修單</p>
             </button>

             <button 
               onClick={handlePettyCashClick}
               className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-brand-300 transition-all text-left group"
             >
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                   <Coins size={20} />
                </div>
                <h4 className="font-bold text-gray-800">零用金申請</h4>
                <p className="text-xs text-gray-500 mt-1">財務預支與請款</p>
             </button>

             <button 
               onClick={() => setIsMealModalOpen(true)}
               className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-brand-300 transition-all text-left group"
             >
                <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                   <Utensils size={20} />
                </div>
                <h4 className="font-bold text-gray-800">代訂餐點</h4>
                <p className="text-xs text-gray-500 mt-1">便當、午茶點心</p>
             </button>

             <button 
               onClick={() => setIsPackageModalOpen(true)}
               className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-brand-300 transition-all text-left group"
             >
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                   <Package size={20} />
                </div>
                <h4 className="font-bold text-gray-800">包裹收發</h4>
                <p className="text-xs text-gray-500 mt-1">郵件與快遞服務</p>
             </button>
          </div>

          <button 
            onClick={() => setIsMemberLoggedIn(false)}
            className="w-full py-4 text-gray-400 font-medium hover:text-gray-600 flex items-center justify-center gap-2"
          >
             <LogOut size={18} /> 登出會員
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="relative h-full flex flex-col">
      
      {/* Admin Login Modal (New) */}
      {showAdminLogin && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-xs overflow-hidden shadow-2xl flex flex-col p-6 space-y-4">
             <div className="w-14 h-14 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center mx-auto">
               <Shield size={28} />
             </div>
             <div className="text-center">
               <h3 className="font-bold text-lg text-gray-800">管理者登入</h3>
               <p className="text-sm text-gray-500 mt-1">請輸入管理者密碼以啟用編輯權限</p>
             </div>
             <form onSubmit={submitAdminLogin} className="space-y-3">
               <input 
                 type="password"
                 autoFocus
                 placeholder="輸入密碼"
                 value={adminPasswordInput}
                 onChange={(e) => setAdminPasswordInput(e.target.value)}
                 className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-center"
               />
               <div className="flex gap-2">
                 <button 
                   type="button" 
                   onClick={() => setShowAdminLogin(false)}
                   className="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                 >
                   取消
                 </button>
                 <button 
                   type="submit"
                   className="flex-1 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-bold"
                 >
                   確認
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* Package Services Modal */}
      {isPackageModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
              <div className="bg-green-600 p-4 text-white flex justify-between items-center shrink-0">
                 <h3 className="font-bold text-lg flex items-center gap-2">
                    <Package size={20} /> 包裹收/寄服務
                 </h3>
                 <button onClick={() => setIsPackageModalOpen(false)} className="hover:bg-green-700 p-1 rounded-full">
                    <X size={20} />
                 </button>
              </div>
              <div className="p-6 grid grid-cols-1 gap-4">
                 <button 
                    onClick={() => handlePackageOption('receive')}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-green-50 hover:border-green-200 transition-all group"
                 >
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0 group-hover:bg-green-200 group-hover:scale-110 transition-all">
                       <Inbox size={24} />
                    </div>
                    <div className="text-left">
                       <h4 className="font-bold text-gray-800 text-lg">包裹收件</h4>
                       <p className="text-xs text-gray-500">查詢待領郵件/包裹</p>
                    </div>
                 </button>

                 <button 
                    onClick={() => handlePackageOption('send')}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-green-50 hover:border-green-200 transition-all group"
                 >
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 group-hover:bg-blue-200 group-hover:scale-110 transition-all">
                       <Send size={24} />
                    </div>
                    <div className="text-left">
                       <h4 className="font-bold text-gray-800 text-lg">包裹寄件</h4>
                       <p className="text-xs text-gray-500">填寫寄件申請單</p>
                    </div>
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Meal Ordering Modal */}
      {isMealModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
              <div className="bg-orange-500 p-4 text-white flex justify-between items-center shrink-0">
                 <h3 className="font-bold text-lg flex items-center gap-2">
                    <Utensils size={20} /> 代訂餐點服務
                 </h3>
                 <button onClick={() => setIsMealModalOpen(false)} className="hover:bg-orange-600 p-1 rounded-full">
                    <X size={20} />
                 </button>
              </div>
              <div className="p-6 grid grid-cols-1 gap-4">
                 <button 
                    onClick={() => handleMealLink('https://www.daoteng.org/meal-calc')}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-orange-50 hover:border-orange-200 transition-all group"
                 >
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0 group-hover:bg-orange-200 group-hover:scale-110 transition-all">
                       <Utensils size={24} />
                    </div>
                    <div className="text-left">
                       <h4 className="font-bold text-gray-800 text-lg">便當</h4>
                       <p className="text-xs text-gray-500">每日精選、會議便當</p>
                    </div>
                 </button>

                 <button 
                    onClick={() => handleMealLink('https://share.hsforms.com/1CQSr-MtdQEyOKC7j0lAQng3gltz')}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-orange-50 hover:border-orange-200 transition-all group"
                 >
                    <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center shrink-0 group-hover:bg-yellow-200 group-hover:scale-110 transition-all">
                       <Coffee size={24} />
                    </div>
                    <div className="text-left">
                       <h4 className="font-bold text-gray-800 text-lg">精緻午茶點心</h4>
                       <p className="text-xs text-gray-500">蛋糕、咖啡、茶飲</p>
                    </div>
                 </button>

                 <button 
                    onClick={() => handleMealLink('https://share.hsforms.com/1-LOg7KsDQnCAGprXyU2F5A3gltz')}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-orange-50 hover:border-orange-200 transition-all group"
                 >
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0 group-hover:bg-green-200 group-hover:scale-110 transition-all">
                       <Sandwich size={24} />
                    </div>
                    <div className="text-left">
                       <h4 className="font-bold text-gray-800 text-lg">西式餐盒</h4>
                       <p className="text-xs text-gray-500">輕食、三明治、沙拉</p>
                    </div>
                 </button>

                 <button 
                    onClick={() => handleMealLink('https://share.hsforms.com/1K-IzGwa2QRmzw6N0BdLa-w3gltz')}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-orange-50 hover:border-orange-200 transition-all group"
                 >
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center shrink-0 group-hover:bg-purple-200 group-hover:scale-110 transition-all">
                       <ChefHat size={24} />
                    </div>
                    <div className="text-left">
                       <h4 className="font-bold text-gray-800 text-lg">午晚餐精緻Buffet</h4>
                       <p className="text-xs text-gray-500">外燴服務、活動餐點</p>
                    </div>
                 </button>
              </div>
              <div className="p-4 bg-gray-50 text-xs text-gray-500 text-center border-t border-gray-100">
                 點擊選項後將開啟訂購頁面。
              </div>
           </div>
        </div>
      )}

      {/* Office Type Selector Modal (New) */}
      {showOfficeSelector && (
        <div className="absolute inset-0 z-40 bg-gray-50 flex flex-col animate-in slide-in-from-right duration-300">
           {/* Header */}
           <div className="bg-white px-6 py-4 flex items-center gap-4 shadow-sm shrink-0 border-b border-gray-100">
              <button 
                onClick={() => setShowOfficeSelector(false)}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
              >
                 <ArrowRight className="rotate-180" size={24} />
              </button>
              <h2 className="text-xl font-bold text-gray-800">選擇辦公室類型</h2>
           </div>

           {/* List */}
           <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {officeTypes.map(type => (
                 <div 
                   key={type.id}
                   onClick={() => openOfficeDetail(type)}
                   className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:border-brand-300 hover:shadow-md transition-all group relative"
                 >
                    <div className="relative h-40">
                       <img src={type.imageUrl} alt={type.title} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                          <h3 className="text-white font-bold text-lg">{type.title}</h3>
                       </div>
                       
                       {/* Admin Edit Button */}
                       {isAdmin && (
                          <button 
                             onClick={(e) => handleEditOfficeType(type, e)}
                             className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-brand-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                          >
                             <Edit2 size={16} />
                          </button>
                       )}
                    </div>
                    <div className="p-4">
                       <p className="text-sm text-gray-600 line-clamp-2">{type.description}</p>
                       <div className="mt-3 flex gap-2">
                          {type.features?.slice(0, 3).map((fid, idx) => (
                             <span key={idx} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                {SPACE_AMENITIES.find(a => a.id === fid)?.label || fid}
                             </span>
                          ))}
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      {/* Office Detail View Overlay */}
      {selectedOfficeType && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
           {/* Sticky Header with Gallery */}
           <div className="relative h-72 shrink-0 bg-black">
              <button 
                onClick={() => setSelectedOfficeType(null)}
                className="absolute top-4 left-4 z-20 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur-sm"
              >
                <ChevronDown size={24} className="rotate-90" />
              </button>
              
              {activeOfficeImage === selectedOfficeType.videoUrl ? (
                 <video src={selectedOfficeType.videoUrl} controls autoPlay className="w-full h-full object-contain" />
              ) : (
                 <img src={activeOfficeImage} alt="Detail" className="w-full h-full object-cover" />
              )}

              {/* Gallery Thumbs */}
              <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto no-scrollbar z-10">
                 {selectedOfficeType.videoUrl && (
                    <button 
                      onClick={() => setActiveOfficeImage(selectedOfficeType.videoUrl!)}
                      className={`w-16 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 relative ${
                        activeOfficeImage === selectedOfficeType.videoUrl ? 'border-brand-500' : 'border-white/50'
                      }`}
                    >
                       <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <PlayCircle size={20} className="text-white" />
                       </div>
                    </button>
                 )}
                 {selectedOfficeType.images.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveOfficeImage(img)}
                      className={`w-16 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                        activeOfficeImage === img ? 'border-brand-500' : 'border-white/50'
                      }`}
                    >
                       <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                 ))}
              </div>
           </div>

           {/* Content */}
           <div className="flex-1 overflow-y-auto p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedOfficeType.title}</h2>
              
              <div className="prose prose-sm text-gray-600 mb-8 whitespace-pre-wrap">
                 {selectedOfficeType.description}
              </div>

              {selectedOfficeType.features && selectedOfficeType.features.length > 0 && (
                <div className="mb-8">
                   <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Star size={18} className="text-brand-500" /> 包含設備
                   </h3>
                   <div className="grid grid-cols-2 gap-3">
                      {selectedOfficeType.features.map(fid => {
                         const amenity = SPACE_AMENITIES.find(a => a.id === fid);
                         const Icon = amenity ? iconMap[amenity.iconName] : Check;
                         return (
                            <div key={fid} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded-lg">
                               <Icon size={16} className="text-gray-400" />
                               <span>{amenity?.label || fid}</span>
                            </div>
                         );
                      })}
                   </div>
                </div>
              )}
           </div>
           
           {/* Footer CTA */}
           <div className="p-4 border-t border-gray-100 bg-white safe-area-bottom">
              <button 
                 onClick={() => window.open('https://daoteng.org/contact', '_blank')}
                 className="w-full bg-brand-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
              >
                 <Mail size={20} /> 預約參觀 / 詢價
              </button>
           </div>
        </div>
      )}

      {/* Reusable Announcement Modal (Shared for Create & Edit) */}
      <AnnouncementModal 
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        onSave={handleSaveAnnouncement}
        initialData={editingAnnouncement}
      />
      
      {/* Wiki Upload Modal */}
      <WikiUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSave={handleAddWikiItem}
      />

      {/* Space Manage Modal */}
      <SpaceManageModal
        isOpen={isSpaceModalOpen}
        onClose={() => setIsSpaceModalOpen(false)}
        onSave={handleAddSpace}
        branchId={selectedBranch}
      />

      {/* Business Partner Modal (New) */}
      <BusinessPartnerModal 
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        onSave={handleSavePartner}
        initialData={editingPartner}
      />

      {/* Office Edit Modal (New) */}
      {isOfficeEditModalOpen && editingOfficeType && (
         <OfficeEditModal 
            isOpen={isOfficeEditModalOpen}
            onClose={() => setIsOfficeEditModalOpen(false)}
            onSave={handleSaveOfficeType}
            initialData={editingOfficeType}
         />
      )}

      {/* Floating Assistant Button */}
      <Assistant />

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200 py-2 px-6 flex justify-between items-center z-30 pb-safe">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === 'home' ? 'text-brand-600' : 'text-gray-400'}`}
        >
          <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">首頁</span>
        </button>
        <button 
          onClick={() => setActiveTab('locations')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === 'locations' ? 'text-brand-600' : 'text-gray-400'}`}
        >
          <MapPin size={24} strokeWidth={activeTab === 'locations' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">據點</span>
        </button>
        <button 
          onClick={() => setActiveTab('wiki')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === 'wiki' ? 'text-brand-600' : 'text-gray-400'}`}
        >
          <BookOpen size={24} strokeWidth={activeTab === 'wiki' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">百科</span>
        </button>
        <button 
          onClick={() => setActiveTab('business')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === 'business' ? 'text-brand-600' : 'text-gray-400'}`}
        >
          <Briefcase size={24} strokeWidth={activeTab === 'business' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">商務</span>
        </button>
        <button 
          onClick={() => setActiveTab('services')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === 'services' ? 'text-brand-600' : 'text-gray-400'}`}
        >
          <UserCircle size={24} strokeWidth={activeTab === 'services' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">會員</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar bg-gray-50 pb-24">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'locations' && renderLocations()}
        {activeTab === 'wiki' && renderWiki()}
        {activeTab === 'services' && renderServices()}
        {activeTab === 'business' && renderBusiness()}
      </div>
    </div>
  );
};

export default App;