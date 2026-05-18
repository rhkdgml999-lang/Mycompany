const translations = {
  ko: {
    home: "홈",
    products: "제품",
    news: "뉴스 센터",
    support: "고객지원",
    contactUs: "문의하기",
    heroTitle: "인간의 한계를 넘어서는 로봇 기술",
    heroDesc: "인간의 능력을 확장하는 기술, RG-ROBOTICS가 더 멀리, 더 높이 나아가는 당신과 함께합니다. 우리는 보행 지원부터 산업 현장의 근력 보조까지, 로보틱스의 새로운 기준을 세웁니다.",
    viewProducts: "제품 둘러보기",
    latestNews: "최신 뉴스",
    viewAllNews: "전체 소식 보기",
    newsNotice: "공지",
    newsPress: "뉴스",
    newsBlog: "블로그",
    backToList: "목록으로 돌아가기",
    prevPost: "이전글",
    nextPost: "다음글",
    list: "목록",
    qnaTitle: "고객 지원 Q&A",
    qnaDesc: "RG ROBOTICS에 궁금하신 점을 남겨주세요. 전문 상담사가 확인 후 답변 드립니다.",
    write: "문의하기",
    no: "번호",
    title: "제목",
    author: "작성자",
    date: "날짜",
    status: "상태",
    secretPost: "비밀글입니다.",
    name: "이름",
    email: "이메일",
    content: "본문",
    password: "비밀번호 (비밀글용)",
    submit: "등록하기",
    cancel: "취소",
    footerDesc: "인간의 한계를 넘어서는 기술로 세상을 더 따뜻하게 만듭니다.",
    company: "회사소개",
    careers: "채용정보",
    contact: "연락처",
    faq: "자주 묻는 질문",
    serviceCenter: "서비스 센터",
    edit: "수정",
    delete: "삭제"
  },
  en: {
    home: "Home",
    products: "Products",
    news: "News Center",
    support: "Support",
    contactUs: "Contact Us",
    heroTitle: "Beyond Limits, With RG-ROBOTICS",
    heroDesc: "Empowering human potential through technology. RG-ROBOTICS stands with you as you reach further and higher. From walking assistance to skeletal support in industries, we set new standards in robotics.",
    viewProducts: "View Products",
    latestNews: "Latest News",
    viewAllNews: "View All News",
    newsNotice: "Notice",
    newsPress: "Press",
    newsBlog: "Blog",
    backToList: "Back to List",
    prevPost: "Prev",
    nextPost: "Next",
    list: "List",
    qnaTitle: "Support Q&A",
    qnaDesc: "Please leave your inquiries. Our specialists will respond shortly.",
    write: "Inquiry",
    no: "No",
    title: "Title",
    author: "Author",
    date: "Date",
    status: "Status",
    secretPost: "Private Post",
    name: "Name",
    email: "Email",
    content: "Content",
    password: "Password (for private)",
    submit: "Submit",
    cancel: "Cancel",
    footerDesc: "Creating a warmer world through technology that transcends human limits.",
    company: "Company",
    careers: "Careers",
    contact: "Contact",
    faq: "FAQ",
    serviceCenter: "Service Center",
    edit: "Edit",
    delete: "Delete"
  }
};

const newsData = [
  {
    id: 1,
    category: { ko: "공지", en: "Notice" },
    title: { ko: "[공지] 2026년 정기 주주총회 소집 안내", en: "[Notice] 2026 Annual Shareholders Meeting" },
    content: { 
      ko: "RG-ROBOTICS의 2026년 정기 주주총회 소집 및 진행 방식에 대해 안내드립니다. 당사는 이번 주주총회를 통해 미래 성장을 위한 핵심 전략을 공유하고자 합니다.", 
      en: "Information on the 2026 Annual General Meeting of Shareholders of RG-ROBOTICS. We plan to share key strategies for future growth." 
    },
    date: "2026-05-10",
    views: 1250,
    image: "https://images.unsplash.com/photo-1591115765373-520b7a21769b?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 2,
    category: { ko: "뉴스", en: "Press" },
    title: { ko: "RG-ROBOTICS, 초정밀 웨어러블 센서 기술 특허 취득", en: "RG-ROBOTICS Acquires Patent for High-Precision Wearable Sensors" },
    content: { 
      ko: "당사의 연구진이 개발한 차세대 웨어러블 로봇용 센서 기술이 국내외 특허를 취득했습니다. 이 기술은 착용자의 의도를 더욱 정밀하게 파악하여 자연스러운 보행을 돕습니다.", 
      en: "Our researchers have successfully patented next-gen sensor technology for wearable robots. This technology helps natural walking by precisely grasping the wearer's intention." 
    },
    date: "2026-05-08",
    views: 3420,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 3,
    category: { ko: "블로그", en: "Blog" },
    title: { ko: "웨어러블 로봇이 바꾸는 일상의 변화: 'RG 슈트' 개발 비하인드", en: "How Wearable Robots are Changing Daily Life: Behind the 'RG Suit'" },
    content: { 
      ko: "일상 생활에서 도움을 줄 수 있는 보조 로봇 'RG 슈트'의 개발 과정과 엔지니어들의 치열한 고민을 담았습니다. 더 가볍고, 더 똑똑한 로봇을 향한 여정입니다.", 
      en: "This post covers the development process of 'RG Suit' and the intense deliberations of engineers. It's a journey towards lighter and smarter robots." 
    },
    date: "2026-05-05",
    views: 890,
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 4,
    category: { ko: "공지", en: "Notice" },
    title: { ko: "신규 서비스 센터 전국 확대 운영 안내", en: "Notice on Nationwide Expansion of New Service Centers" },
    content: { 
      ko: "고객 여러분의 편의를 위해 수도권 위주로 운영되던 서비스 센터를 전국 5개 거점 도시로 확대 운영하게 되었습니다.", 
      en: "Service centers that were operated mainly in the metropolitan area will be expanded to 5 major base cities nationwide for customer convenience." 
    },
    date: "2026-04-15",
    views: 740,
    image: "https://images.unsplash.com/photo-1521791136364-798a7bc0d26c?auto=format&fit=crop&q=80&w=1000"
  }
];

let qnaData = [
  {
    id: 1,
    title: { ko: "제품 구매처 문의드립니다.", en: "Inquiry about purchasing locations" },
    author: "Kim*",
    date: "2026-05-11",
    isSecret: true,
    status: { ko: "답변완료", en: "Completed" }
  },
  {
    id: 2,
    title: { ko: "대여 서비스 문의", en: "Rental service inquiry" },
    author: "Park*",
    date: "2026-05-10",
    isSecret: false,
    status: { ko: "검토중", en: "Pending" }
  }
];

const appConfig = {
  companyName: "RG-ROBOTICS",
  slogan: { ko: "Beyond Limits, With RG-ROBOTICS", en: "Beyond Limits, With RG-ROBOTICS" }
};
