import React, { useState } from 'react';
import {
  MessageSquare,
  Share2,
  Heart,
  Bookmark,
  Volume2,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Send,
  Sparkles,
  Search,
  Filter,
  Users,
  AlertCircle,
  ThumbsUp,
  Image,
  Paperclip,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  Vote,
  Clock,
  MapPin,
  FileText,
  User,
  LogIn,
  LogOut,
  X,
  Phone,
} from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  wardNo: number;
  role: 'citizen' | 'official' | 'representative';
  text: string;
  timeAgo: string;
}

interface SocialPost {
  id: string;
  author: string;
  authorRole: 'पालिका कार्यपालिका' | 'वडा कार्यालय' | 'प्रमाणीकृत नागरिक' | 'टोल विकास संस्था' | 'कृषि सहकारी';
  authorType: 'official' | 'citizen' | 'organization';
  wardNo?: number;
  timeAgo: string;
  title: string;
  content: string;
  category: 'आधिकारिक सूचना' | 'टोल समस्या' | 'सुझाव/विचार' | 'कृषि/हाटबजार' | 'जनमत सर्वेक्षण';
  tags: string[];
  imageUrl?: string;
  likesCount: number;
  userLiked: boolean;
  bookmarked: boolean;
  comments: Comment[];
  actionLink?: {
    label: string;
    url: string;
  };
  pollData?: {
    question: string;
    totalVotes: number;
    userVotedOption?: number;
    options: { text: string; votes: number }[];
  };
}

const INITIAL_POSTS: SocialPost[] = [
  {
    id: 'post-1',
    author: 'पाँचपोखरी थाङपाल गाउँपालिका',
    authorRole: 'पालिका कार्यपालिका',
    authorType: 'official',
    timeAgo: '२ घण्टा अगाडि',
    title: '📢 आ.व. २०८१/०८२ को हिउँदे बाली बीउ अनुदान तथा बाली बिमा कार्यक्रम सम्बन्धी जरुरी सूचना',
    content: 'गाउँपालिकाभित्रका सम्पूर्ण कृषक दाजुभाइ तथा दिदीबहिनीहरूमा जानकारी! वडा नं. १ देखि ८ सम्मका किसानहरूलाई ५०% अनुदानमा उन्नत गहुँ, आलु तथा हिउँदे तरकारीको बीउ वितरण सुरु भएको छ। साथै, असिना र खडेरीबाट हुने क्षति न्यूनीकरणका लागि बाली बिमा फारम खुला गरिएको छ। इच्छुक किसानले अनलाइन वा वडा कार्यालयमा दरखास्त दिनुहुन अनुरोध छ।',
    category: 'आधिकारिक सूचना',
    tags: ['#कृषि_अनुदान', '#बाली_बिमा', '#पाँचपोखरी_कृषि'],
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80',
    likesCount: 54,
    userLiked: false,
    bookmarked: true,
    actionLink: {
      label: 'कृषि अनुदान तथा बिमा आवेदन भर्नुहोस्',
      url: '/app/citizen-portal',
    },
    comments: [
      {
        id: 'c-1',
        author: 'रामप्रसाद सापकोटा',
        wardNo: 3,
        role: 'citizen',
        text: 'वडा नं. ३ मा बीउ लिन कहिलेसम्म आइपुग्नुपर्छ? र के-के कागजात चाहिन्छ?',
        timeAgo: '१ घण्टा अगाडि',
      },
      {
        id: 'c-2',
        author: 'कृषि शाखा प्रमुख (सुमन अधिकारी)',
        wardNo: 3,
        role: 'official',
        text: 'रामप्रसादजी, जग्गाधनी प्रमाणपुर्जा (वा मोहियानी सम्झौता) र नागरिकताको प्रतिलिपिसहित आगामी शुक्रबारभित्र वडा ३ को सेवा केन्द्रमा सम्पर्क गर्नुहोला। अनलाइन पोर्टलबाटै पनि भर्न सक्नुहुन्छ।',
        timeAgo: '४० मिनेट अगाडि',
      },
    ],
  },
  {
    id: 'post-2',
    author: 'सुनिता तामाङ',
    authorRole: 'प्रमाणीकृत नागरिक',
    authorType: 'citizen',
    wardNo: 3,
    timeAgo: '४ घण्टा अगाडि',
    title: '⚠️ गुन्सा-भोताङ जोड्ने सडकको कल्भर्ट मर्मत र ह्युमपाइप राखिदिन वडा कार्यालयमा अनुरोध',
    content: 'हिजो रातिको वर्षाले गुन्सा चोक नजिकैको कल्भर्टमा पानीको निकास थुनिएर बाटोमा हिलो जमेको छ। विद्यालय जाने नानीबाबुहरू र दूध बोक्ने गाडीलाई समस्या परेको छ। वडा अध्यक्षज्यूको ध्यानाकर्षण होस्!',
    category: 'टोल समस्या',
    tags: ['#वडा३_गुनासो', '#सडक_मर्मत', '#टोल_समस्या'],
    likesCount: 38,
    userLiked: true,
    bookmarked: false,
    comments: [
      {
        id: 'c-3',
        author: 'दावा दोर्जे तामाङ (वडा अध्यक्ष - ३)',
        wardNo: 3,
        role: 'representative',
        text: 'सुनिताजी नमस्कार! आज बिहानै प्राविधिक टोली पठाएर निरीक्षण भइसकेको छ। वडा विपद् व्यवस्थापन कोषबाट ह्युमपाइप खरिद भई भोलि बिहान ९ बजेदेखि मर्मत कार्य सुरु हुनेछ। ध्यानाकर्षण गराउनुभएकोमा धन्यवाद!',
        timeAgo: '२ घण्टा अगाडि',
      },
    ],
  },
  {
    id: 'post-3',
    author: 'योजना तथा बजेट शाखा',
    authorRole: 'पालिका कार्यपालिका',
    authorType: 'official',
    timeAgo: '१ दिन अगाडि',
    title: '📊 [जनमत सर्वेक्षण] आगामी आर्थिक वर्षमा तपाईंको वडामा कुन पूर्वाधारलाई पहिलो प्राथमिकता दिनुपर्छ?',
    content: 'स्थानीय तहको बजेट तर्जुमा प्रक्रियामा नागरिक सहभागिता सुनिश्चित गर्न पाँचपोखरी थाङपाल गाउँपालिकाले यो जनमत संकलन सुरु गरेको छ। तपाईंको बहुमूल्य मतले वडा बजेटको सिलिङ निर्धारण गर्न मद्दत गर्नेछ। तलको विकल्पमा भोट गर्नुहोस्:',
    category: 'जनमत सर्वेक्षण',
    tags: ['#नागरिक_बजेट', '#जनमत_संग्रह', '#योजना_प्राथमिकता'],
    likesCount: 89,
    userLiked: false,
    bookmarked: false,
    pollData: {
      question: 'वडा बजेटको पहिलो प्राथमिकता कुन हुनुपर्छ?',
      totalVotes: 342,
      userVotedOption: undefined,
      options: [
        { text: 'सडक स्तरोन्नति तथा पक्की नाला निर्माण', votes: 148 },
        { text: 'कृषि सिँचाइ कुलो, बीउबिजन र शीतभण्डार', votes: 112 },
        { text: 'विद्यालय डिजिटल कक्षा र गुणस्तरीय स्वास्थ्यचौकी', votes: 58 },
        { text: 'स्थानीय युवा रोजगार तथा सूचना प्रविधि तालिम', votes: 24 },
      ],
    },
    comments: [],
  },
  {
    id: 'post-4',
    author: 'भोताङ कृषि सहकारी संस्था',
    authorRole: 'कृषि सहकारी',
    authorType: 'organization',
    wardNo: 4,
    timeAgo: '२ दिन अगाडि',
    title: '🍓 यस हप्ताको हाटबजारमा अर्गानिक किवी र ट्राउट माछाको संकलन दर सार्वजनिक',
    content: 'पाँचपोखरीका कृषकहरूले उत्पादन गरेको ताजा किवी (ग्रेड ए) प्रतिकेजी रु. ३५० र रेन्बो ट्राउट माछा प्रतिकेजी रु. १,२०० मा सहकारीको संकलन केन्द्रबाट खरिद-बिक्री भइरहेको छ। काठमाडौं बजार पठाउने गाडी प्रत्येक मंगलबार र शुक्रबार छुट्नेछ।',
    category: 'कृषि/हाटबजार',
    tags: ['#पाँचपोखरी_किवी', '#अर्गानिक_उत्पादन', '#हाटबजार'],
    likesCount: 42,
    userLiked: false,
    bookmarked: false,
    actionLink: {
      label: 'दैनिक कृषि बजारभाउ सूची हेर्नुहोस्',
      url: '/app/citizen-portal',
    },
    comments: [],
  },
];

export const CivicSocialFeedTab: React.FC = () => {
  // Current Citizen User Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: 'रामप्रसाद श्रेष्ठ',
    wardNo: 3,
    tole: 'गुन्सा बजार',
    phone: '९८४१******',
    code: 'PPK-CIT-03-1042',
    isVerified: true,
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Feed State
  const [posts, setPosts] = useState<SocialPost[]>(INITIAL_POSTS);
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'official' | 'community' | 'poll' | 'ward'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Post State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<SocialPost['category']>('टोल समस्या');
  const [newPostWard, setNewPostWard] = useState<number>(3);

  // Comment input per post
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({ 'post-1': true, 'post-2': true });

  // Filter posts
  const filteredPosts = posts.filter((p) => {
    // Channel filter
    if (selectedChannel === 'official' && p.authorType !== 'official') return false;
    if (selectedChannel === 'community' && p.authorType === 'official') return false;
    if (selectedChannel === 'poll' && p.category !== 'जनमत सर्वेक्षण') return false;
    if (selectedChannel === 'ward' && p.wardNo !== currentUser.wardNo) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchContent = p.content.toLowerCase().includes(q);
      const matchAuthor = p.author.toLowerCase().includes(q);
      const matchTag = p.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchAuthor && !matchTag) return false;
    }

    return true;
  });

  // Handle Likes
  const toggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const userLiked = !p.userLiked;
          return {
            ...p,
            userLiked,
            likesCount: userLiked ? p.likesCount + 1 : p.likesCount - 1,
          };
        }
        return p;
      })
    );
  };

  // Handle Bookmarks
  const toggleBookmark = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return { ...p, bookmarked: !p.bookmarked };
        }
        return p;
      })
    );
  };

  // Handle Voting in Poll
  const handleVote = (postId: string, optionIdx: number) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId && p.pollData && p.pollData.userVotedOption === undefined) {
          const updatedOptions = p.pollData.options.map((opt, i) => {
            if (i === optionIdx) return { ...opt, votes: opt.votes + 1 };
            return opt;
          });
          return {
            ...p,
            pollData: {
              ...p.pollData,
              totalVotes: p.pollData.totalVotes + 1,
              userVotedOption: optionIdx,
              options: updatedOptions,
            },
          };
        }
        return p;
      })
    );
  };

  // Handle Comment Submit
  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: isLoggedIn ? currentUser.name : 'नागरिक प्रयोगकर्ता',
      wardNo: currentUser.wardNo,
      role: 'citizen',
      text,
      timeAgo: 'भर्खरै',
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return { ...p, comments: [...p.comments, newComment] };
        }
        return p;
      })
    );

    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
  };

  // Handle Create Post
  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const created: SocialPost = {
      id: `post-${Date.now()}`,
      author: isLoggedIn ? currentUser.name : 'प्रमाणीकृत नागरिक (वडा ३)',
      authorRole: 'प्रमाणीकृत नागरिक',
      authorType: 'citizen',
      wardNo: newPostWard,
      timeAgo: 'भर्खरै',
      title: newPostTitle,
      content: newPostContent,
      category: newPostCategory,
      tags: [`#वडा${newPostWard}`, `#${newPostCategory.replace(/\s+/g, '_')}`],
      likesCount: 1,
      userLiked: true,
      bookmarked: false,
      comments: [],
    };

    setPosts([created, ...posts]);
    setIsCreateModalOpen(false);
    setNewPostTitle('');
    setNewPostContent('');
  };

  // Text-to-Speech Audio Read
  const speakPost = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ne-NP';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '1.5rem', alignItems: 'start' }}>
      {/* ─── MAIN FEED COLUMN ─── */}
      <div>
        {/* User Status & Create Post Bar */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1rem',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
                }}
              >
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                    {currentUser.name}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.68rem', backgroundColor: '#e0f2fe', color: '#0284c7', padding: '1px 6px', borderRadius: '10px', fontWeight: 800 }}>
                    <ShieldCheck size={11} /> प्रमाणीकृत नागरिक
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  वडा नं. {currentUser.wardNo}, {currentUser.tole} • कोड: {currentUser.code}
                </div>
              </div>
            </div>

            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => setIsLoggedIn(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#f1f5f9',
                  border: 'none',
                  color: '#64748b',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <LogOut size={13} />
                <span>बाहिरिनुहोस्</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#0284c7',
                  border: 'none',
                  color: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
                }}
              >
                <LogIn size={14} />
                <span>नागरिक लगइन</span>
              </button>
            )}
          </div>

          {/* Trigger to create post */}
          <div
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              backgroundColor: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              color: '#64748b',
              fontSize: '0.85rem',
              transition: 'all 0.15s ease',
            }}
          >
            <span>तपाईंको टोल वा वडामा के हुँदैछ? सूचना, समस्या वा विचार राख्नुहोस्...</span>
            <button
              type="button"
              style={{
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.76rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Sparkles size={13} />
              <span>+ पोस्ट गर्नुहोस्</span>
            </button>
          </div>
        </div>

        {/* ─── CHANNELS & FILTER TABS ─── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            marginBottom: '1rem',
            overflowX: 'auto',
            paddingBottom: '4px',
          }}
        >
          <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {[
              { id: 'all', label: '🌟 सबै संवाद तथा सूचना' },
              { id: 'official', label: '📢 आधिकारिक पालिका सूचना' },
              { id: 'community', label: '💬 नागरिक चौतारी (टोल संवाद)' },
              { id: 'poll', label: '📊 जनमत सर्वेक्षण (Polls)' },
              { id: 'ward', label: `📍 मेरो वडा (${currentUser.wardNo})` },
            ].map((ch) => {
              const active = selectedChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setSelectedChannel(ch.id as any)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: active ? '1px solid #0284c7' : '1px solid #e2e8f0',
                    backgroundColor: active ? '#0284c7' : '#ffffff',
                    color: active ? '#ffffff' : '#475569',
                    fontSize: '0.75rem',
                    fontWeight: active ? 800 : 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: active ? '0 2px 6px rgba(2, 132, 199, 0.25)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {ch.label}
                </button>
              );
            })}
          </div>

          {/* Search Field */}
          <div style={{ position: 'relative', width: '220px', flexShrink: 0 }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="फिडमा खोज्नुहोस्..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: '34px',
                paddingLeft: '30px',
                paddingRight: '10px',
                borderRadius: '17px',
                border: '1px solid #cbd5e1',
                fontSize: '0.74rem',
                backgroundColor: '#ffffff',
              }}
            />
          </div>
        </div>

        {/* ─── POSTS STREAM ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredPosts.map((post) => {
            const isOfficial = post.authorType === 'official';
            const isExpanded = !!expandedComments[post.id];

            return (
              <article
                key={post.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  border: isOfficial ? '2px solid #bae6fd' : '1px solid #e2e8f0',
                  boxShadow: isOfficial ? '0 4px 15px rgba(2, 132, 199, 0.08)' : '0 2px 8px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Post Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: isOfficial ? '#0284c7' : '#7c3aed',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '0.95rem',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      }}
                    >
                      {isOfficial ? <Building2 size={20} /> : post.author.charAt(0)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 900, color: '#0f172a' }}>
                          {post.author}
                        </h4>
                        {isOfficial ? (
                          <span style={{ fontSize: '0.62rem', backgroundColor: '#e0f2fe', color: '#0284c7', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                            ✓ आधिकारिक
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.62rem', backgroundColor: '#f1f5f9', color: '#64748b', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            {post.authorRole} {post.wardNo && `(वडा ${post.wardNo})`}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span>{post.timeAgo}</span>
                        <span>•</span>
                        <span style={{ color: '#0284c7', fontWeight: 700 }}>{post.category}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => speakPost(`${post.title}। ${post.content}`)}
                      title="अडियो सुन्नुहोस्"
                      style={{
                        backgroundColor: '#f1f5f9',
                        border: 'none',
                        color: '#475569',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Volume2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleBookmark(post.id)}
                      title="सुरक्षित गर्नुहोस्"
                      style={{
                        backgroundColor: post.bookmarked ? '#fef3c7' : '#f1f5f9',
                        border: 'none',
                        color: post.bookmarked ? '#d97706' : '#64748b',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Bookmark size={15} />
                    </button>
                  </div>
                </div>

                {/* Post Content */}
                <h3 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.45rem 0', lineHeight: 1.35 }}>
                  {post.title}
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.55, margin: '0 0 0.75rem 0', whiteSpace: 'pre-line' }}>
                  {post.content}
                </p>

                {/* Attached Image if any */}
                {post.imageUrl && (
                  <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '0.85rem', maxHeight: '320px' }}>
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}

                {/* Interactive Civic Poll if any */}
                {post.pollData && (
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      padding: '1rem',
                      border: '1px solid #e2e8f0',
                      marginBottom: '0.85rem',
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Vote size={16} color="#7c3aed" />
                      <span>{post.pollData.question}</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>({post.pollData.totalVotes} मत प्राप्त)</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {post.pollData.options.map((opt, idx) => {
                        const pct = post.pollData!.totalVotes > 0 ? Math.round((opt.votes / post.pollData!.totalVotes) * 100) : 0;
                        const isVoted = post.pollData!.userVotedOption === idx;

                        return (
                          <div
                            key={idx}
                            onClick={() => handleVote(post.id, idx)}
                            style={{
                              position: 'relative',
                              backgroundColor: '#ffffff',
                              borderRadius: '8px',
                              border: isVoted ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                              padding: '8px 12px',
                              cursor: post.pollData!.userVotedOption === undefined ? 'pointer' : 'default',
                              overflow: 'hidden',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            {/* Vote Percentage Fill Bar */}
                            <div
                              style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: `${pct}%`,
                                backgroundColor: isVoted ? 'rgba(124, 58, 237, 0.15)' : 'rgba(2, 132, 199, 0.08)',
                                zIndex: 1,
                                transition: 'width 0.4s ease',
                              }}
                            />
                            <span style={{ fontSize: '0.78rem', fontWeight: isVoted ? 800 : 600, color: '#0f172a', zIndex: 2 }}>
                              {opt.text} {isVoted && '✓ (तपाईंको मत)'}
                            </span>
                            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0284c7', zIndex: 2 }}>
                              {pct}% ({opt.votes})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Direct Action Link (पोस्टबाट सिधै सेवा लिने बटन) */}
                {post.actionLink && (
                  <div style={{ marginBottom: '0.85rem' }}>
                    <a
                      href={post.actionLink.url}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        textDecoration: 'none',
                        boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
                      }}
                    >
                      <Sparkles size={14} />
                      <span>{post.actionLink.label}</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                )}

                {/* Tags */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {post.tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.7rem',
                        color: '#0284c7',
                        backgroundColor: '#f0f9ff',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 600,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Social Actions Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '0.65rem',
                    fontSize: '0.76rem',
                    color: '#64748b',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleLike(post.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: post.userLiked ? '#e11d48' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Heart size={16} fill={post.userLiked ? '#e11d48' : 'none'} />
                    <span>{post.likesCount} मनपर्‍यो</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpandedComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <MessageSquare size={16} />
                    <span>{post.comments.length} टिप्पणी</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: post.title, text: post.content, url: window.location.href });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('लिङ्क कपी गरियो!');
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Share2 size={16} />
                    <span>सेयर</span>
                  </button>
                </div>

                {/* ─── EXPANDABLE COMMENTS SECTION ─── */}
                {isExpanded && (
                  <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9' }}>
                    {/* Existing Comments */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.75rem' }}>
                      {post.comments.map((cm) => {
                        const isRep = cm.role === 'representative' || cm.role === 'official';
                        return (
                          <div
                            key={cm.id}
                            style={{
                              backgroundColor: isRep ? '#f0fdf4' : '#f8fafc',
                              border: isRep ? '1px solid #86efac' : '1px solid #e2e8f0',
                              borderRadius: '10px',
                              padding: '0.65rem 0.85rem',
                              fontSize: '0.78rem',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontWeight: 800, color: isRep ? '#166534' : '#0f172a' }}>
                                  {cm.author}
                                </span>
                                {isRep && (
                                  <span style={{ fontSize: '0.6rem', backgroundColor: '#22c55e', color: '#fff', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                                    ✓ आधिकारिक जवाफ
                                  </span>
                                )}
                              </div>
                              <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{cm.timeAgo}</span>
                            </div>
                            <div style={{ color: '#334155', lineHeight: 1.45 }}>{cm.text}</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Comment Input */}
                    <div style={{ display: 'flex', gap: '0.45rem' }}>
                      <input
                        type="text"
                        placeholder="आफ्नो विचार वा प्रश्न लेख्नुहोस्..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        style={{
                          flex: 1,
                          height: '36px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          padding: '0 10px',
                          fontSize: '0.78rem',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddComment(post.id)}
                        style={{
                          backgroundColor: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0 12px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Send size={13} />
                        <span>पठाउनुहोस्</span>
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>

      {/* ─── RIGHT CIVIC SOCIAL WIDGETS SIDEBAR ─── */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Civic Social Rules Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem',
            boxShadow: '0 4px 15px rgba(15, 23, 42, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
            <ShieldCheck size={20} color="#38bdf8" />
            <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 900 }}>नागरिक चौतारी मर्यादा</h4>
          </div>
          <p style={{ fontSize: '0.74rem', opacity: 0.9, lineHeight: 1.45, margin: 0 }}>
            यो पाँचपोखरी थाङपाल गाउँपालिकाको आधिकारिक नागरिक संवाद मञ्च हो। यहाँ भ्रामक सूचना, व्यक्तिगत गालीगलौज निषेध गरिएको छ। सबै पोस्टहरू पालिका सूचना शाखाबाट अनुगमन हुन्छ।
          </p>
        </div>

        {/* Trending Municipal Bulletins */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.1rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.75rem' }}>
            <TrendingUp size={16} color="#0284c7" />
            <span>आजका मुख्य पालिका सूचनाहरू</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {[
              { title: 'हिउँदे बीउबिजन ५०% अनुदान वितरण सुरु', ward: 'सबै वडा', date: 'आज' },
              { title: 'वडा नं. ३ को खानेपानी योजना अनुगमन सम्पन्न', ward: 'वडा ३', date: 'हिजो' },
              { title: 'सम्पत्ति कर असोज मसान्तभित्र बुझाए १०% छुट', ward: 'राजस्व शाखा', date: '२ दिन अगाडि' },
              { title: 'पाँचपोखरी पदमार्ग सरसफाइ स्वयंसेवा आह्वान', ward: 'पर्यटन विकास', date: '३ दिन अगाडि' },
            ].map((n, i) => (
              <div key={i} style={{ padding: '6px 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                  {n.title}
                </div>
                <div style={{ fontSize: '0.66rem', color: '#64748b', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{n.ward}</span>
                  <span>{n.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ward Leadership Online Hotline */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.1rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.65rem' }}>
            👥 संवादमा जनप्रतिनिधि तथा फोकल पर्सन
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { name: 'टासी लामा ह्योल्मो', role: 'गाउँपालिका अध्यक्ष', phone: '9851122001' },
              { name: 'सुनिता अधिकारी', role: 'गाउँपालिका उपाध्यक्ष (न्यायिक समिति)', phone: '9851122002' },
              { name: 'दावा दोर्जे तामाङ', role: 'वडा अध्यक्ष (वडा नं. ३)', phone: '9851122003' },
              { name: 'दिनेश लामिछाने', role: 'सूचना अधिकारी / प्रवक्ता', phone: '9841234500' },
            ].map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', padding: '4px 0' }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>{p.name}</div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{p.role}</div>
                </div>
                <a
                  href={`tel:${p.phone}`}
                  style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #86efac',
                    color: '#16a34a',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                  }}
                  title="कल गर्नुहोस्"
                >
                  <Phone size={13} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ─── CREATE POST MODAL ─── */}
      {isCreateModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={18} color="#7c3aed" />
                <span>नागरिक चौतारीमा पोस्ट सिर्जना गर्नुहोस्</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>पोस्टको विषय वा शीर्षक:</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. टोलको सडक मर्मत सम्बन्धमा / हाटबजार आयोजना..."
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>श्रेणी (Category):</label>
                  <select
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value as any)}
                    style={{ width: '100%', height: '38px', padding: '0 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                  >
                    <option value="टोल समस्या">टोल समस्या / गुनासो</option>
                    <option value="सुझाव/विचार">विकास सुझाव तथा विचार</option>
                    <option value="कृषि/हाटबजार">कृषि उत्पादन / हाटबजार</option>
                    <option value="आधिकारिक सूचना">सार्वजनिक सूचना</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>सम्बन्धित वडा नं.:</label>
                  <select
                    value={newPostWard}
                    onChange={(e) => setNewPostWard(Number(e.target.value))}
                    style={{ width: '100%', height: '38px', padding: '0 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                  >
                    <option value={0}>सबै वडाहरू (पालिका स्तर)</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                      <option key={w} value={w}>वडा नं. {w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>विस्तृत विवरण (के भन्न चाहनुहुन्छ?):</label>
                <textarea
                  rows={4}
                  required
                  placeholder="आफ्नो विचार, समस्या वा सूचना प्रष्टसँग लेख्नुहोस्..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.7rem', color: '#64748b' }}>
                💡 <strong>नोट:</strong> तपाईंको पोस्ट सार्वजनिक रूपमा देखिनेछ र सम्बन्धित वडा कार्यालयले यसको आधिकारिक जवाफ दिनेछ।
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  height: '42px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  marginTop: '0.25rem',
                }}
              >
                नागरिक चौतारीमा प्रकाशित गर्नुहोस्
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── CITIZEN LOGIN MODAL ─── */}
      {isLoginModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '400px',
              width: '100%',
              padding: '1.5rem',
              textAlign: 'center',
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto' }}>
              <LogIn size={24} />
            </div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
              नागरिक सेवा पोर्टल लगइन
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 1rem 0' }}>
              आफ्नो दर्ता भएको मोबाइल नम्बर हाल्नुहोस्। ६-अंकको OTP कोड पठाइनेछ।
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!otpSent) {
                  setOtpSent(true);
                } else {
                  setIsLoggedIn(true);
                  setIsLoginModalOpen(false);
                  setOtpSent(false);
                }
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}
            >
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700 }}>मोबाइल नम्बर:</label>
                <input
                  type="tel"
                  required
                  placeholder="९८xxxxxxxx"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              {otpSent && (
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700 }}>एसएमएसमा आएको OTP कोड:</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. ४२८१५०"
                    value={loginOtp}
                    onChange={(e) => setLoginOtp(e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '8px', border: '1px solid #7c3aed', fontSize: '0.9rem', letterSpacing: '2px', textAlign: 'center' }}
                  />
                  <span style={{ fontSize: '0.65rem', color: '#16a34a', marginTop: '2px', display: 'block' }}>
                    ✓ डेमो OTP कोड पठाइयो (कुनै पनि ६ अंक हाल्नुहोस्)
                  </span>
                </div>
              )}

              <button
                type="submit"
                style={{
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  height: '40px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                }}
              >
                {otpSent ? 'OTP प्रमाणीकरण गरी लगइन गर्नुहोस्' : 'OTP कोड पठाउनुहोस्'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsLoginModalOpen(false);
                  setOtpSent(false);
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                रद्द गर्नुहोस्
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
