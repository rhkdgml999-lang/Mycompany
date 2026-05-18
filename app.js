let currentLang = 'ko';

document.addEventListener('DOMContentLoaded', () => {
  initLanguageSwitcher();
  setLanguage('ko'); // Ensure initial UI is synced to Korean
  initRouter();
});

function initLanguageSwitcher() {
  const langBtns = document.querySelectorAll('.lang-btn');
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.textContent.trim().toLowerCase();
      if (lang === 'kr') setLanguage('ko');
      else if (lang === 'en') setLanguage('en');
    });
  });

  // Mobile Menu Logic
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('#main-nav');
  
  // Create overlay if not exists
  let overlay = document.querySelector('.menu-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);
  }
  
  // Move header-actions into nav for mobile if screen is small
  const headerActions = document.querySelector('.header-actions');
  const handleResize = () => {
    if (window.innerWidth <= 900) {
      if (headerActions.parentElement !== nav) {
        nav.appendChild(headerActions);
      }
    } else {
      const header = document.querySelector('header');
      if (headerActions.parentElement !== header) {
        header.appendChild(headerActions);
      }
    }
  };
  window.addEventListener('resize', handleResize);
  handleResize();

  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      const isActive = nav.classList.toggle('active');
      overlay.classList.toggle('active', isActive);
      mobileBtn.textContent = isActive ? '✕' : '☰';
      document.body.style.overflow = isActive ? 'hidden' : '';
    });
  }

  overlay.addEventListener('click', () => {
    nav.classList.remove('active');
    overlay.classList.remove('active');
    if (mobileBtn) mobileBtn.textContent = '☰';
    document.body.style.overflow = '';
  });

  // Close mobile menu when nav link clicked
  document.querySelectorAll('#main-nav a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('active');
      overlay.classList.remove('active');
      if (mobileBtn) mobileBtn.textContent = '☰';
      document.body.style.overflow = '';
    });
  });
}

function setLanguage(lang) {
  currentLang = lang;
  // Update header/nav UI
  const t = translations[lang];
  
  // Ensure Logo is preserved (fix for previous selector collision)
  const logoLink = document.querySelector('.logo');
  if (logoLink) {
    logoLink.innerHTML = `<img src="logo_rg.png" alt="RG ROBOTICS Logo" class="logo-img"> RG ROBOTICS`;
  }
  
  document.querySelector('#main-nav a[href="#home"]').textContent = t.home;
  document.querySelector('#main-nav a[href="#company"]').textContent = t.company;
  document.querySelector('#main-nav a[href="#careers"]').textContent = t.careers;
  document.querySelector('#main-nav a[href="#products"]').textContent = t.products;
  document.querySelector('#main-nav a[href="#news"]').textContent = t.news;
  document.querySelector('#main-nav a[href="#support"]').textContent = t.support;
  document.querySelector('#main-nav a[href="#faq"]').textContent = t.supportFAQ;
  document.querySelector('#main-nav a[href="#qna"]').textContent = t.supportQnA;
  document.querySelector('#main-nav a[href="#service"]').textContent = t.supportService;
  
  // Mobile only: Ensure actions are visible if needed or in menu
  // (Optional: add more dynamic logic if requested)
  
  document.querySelector('.header-actions .btn-primary').textContent = t.contactUs;
  
  // Update Chatbot UI
  const chatHeader = document.querySelector('.chat-header h3');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');
  const firstBotMsg = document.querySelector('#chat-messages .message.bot:first-child');
  
  if (chatHeader) chatHeader.textContent = lang === 'ko' ? 'RG AI Assistant' : 'RG AI Assistant'; // Title is same
  if (chatInput) chatInput.placeholder = lang === 'ko' ? '메시지를 입력하세요...' : 'Type a message...';
  if (chatSend) chatSend.textContent = lang === 'ko' ? '전송' : 'Send';
  if (firstBotMsg) {
    firstBotMsg.textContent = lang === 'ko' 
      ? '안녕하세요! RG ROBOTICS AI 비서입니다. 무엇을 도와드릴까요?' 
      : 'Hello! I am the RG ROBOTICS AI assistant. How can I help you?';
  }
  
  // Update Footer UI
  const footerDocs = document.querySelectorAll('footer h3, footer h4, footer p, footer li');
  // Simple footer update (ideally would be mapped more specifically)
  // Re-rendering footer is easier if it's dynamic, but for now let's just re-run handleRoute
  
  // Update active lang btn style
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent.trim().toLowerCase() === (lang === 'ko' ? 'kr' : 'en')) {
      btn.classList.add('active');
    }
  });

  handleRoute(); // Refresh current page with new language
  renderFooter();
}

function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
  renderFooter();

  // PWA Service Worker Registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then(reg => {
        console.log('Service Worker Registered!', reg);
      }).catch(err => {
        console.log('Service Worker registration failed: ', err);
      });
    });
  }
}

async function handleRoute() {
  const hash = location.hash || '#home';
  
  // Ensure data is synced if we are accessing a detail page directly on refresh
  if (hash.startsWith('#qna/view/') || hash.startsWith('#qna/edit/') || hash === '#qna') {
    if (qnaData.length === 0 && window.db) {
       await syncQnAData();
    }
  }

  // Force scroll to top on every navigation
  window.scrollTo(0, 0);

  if (hash === '#qna') renderQnA();
  else if (hash === '#qna/write') renderWriteQnA();
  else if (hash.startsWith('#qna/view/')) {
    const id = hash.split('/')[2];
    renderQnADetail(id);
  } else if (hash === '#home') renderHome();
  else if (hash === '#news') renderNews();
  else if (hash.startsWith('#news/')) {
    const id = parseInt(hash.split('/')[1]);
    renderNewsDetail(id);
  } else if (hash === '#faq') {
    renderSupport('faq');
  } else if (hash === '#service') {
    renderSupport('service');
  } else if (hash === '#support') {
    renderSupport('main');
  } else if (hash === '#careers') {
    renderCareers();
  } else if (hash === '#company') {
    renderCompany();
  } else if (hash === '#products') renderProducts();
  else renderHome();
}

async function syncQnAData() {
  if (!window.db || !window.firebaseDB) return;
  const { collection, getDocs, query, orderBy } = window.firebaseDB;
  try {
    const qCount = query(collection(window.db, "qna"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(qCount);
    qnaData = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
  } catch (err) {
    console.error("Sync failed:", err);
  }
}

function renderHome() {
  const main = document.querySelector('main');
  const t = translations[currentLang];
  const latestNews = newsData.slice(0, 3);

  main.innerHTML = `
    <section class="hero">
      <img src="hero.png" class="hero-bg" alt="Hero Image">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1>${t.heroTitle}</h1>
        <p>${t.heroDesc}</p>
        <div class="hero-btns">
          <a href="#products" class="btn btn-primary">${t.viewProducts}</a>
          <a href="#news" class="btn btn-outline" style="margin-left: 15px; color: white; border-color: rgba(255,255,255,0.3);">${t.latestNews}</a>
        </div>
      </div>
    </section>

    <section class="container">
      <h2 class="section-title">${t.latestNews}</h2>
      <div class="news-grid">
        ${latestNews.map(item => `
          <div class="news-card" onclick="location.hash='#news/${item.id}'" style="cursor: pointer;">
            <img src="${item.image}" class="news-image" alt="${item.title[currentLang]}" onerror="this.src='https://images.unsplash.com/photo-1485083269755-a7b559a4fe5e?auto=format&fit=crop&q=80&w=1000'">
            <div class="news-content">
              <span class="news-category">${item.category[currentLang]}</span>
              <h3 class="news-title">${item.title[currentLang]}</h3>
              <p class="news-date">${item.date} | ${currentLang === 'ko' ? '조회' : 'Views'} ${item.views}</p>
            </div>
          </div>
        `).join('')}
      </div>
      <div style="text-align: center; margin-top: 50px;">
        <a href="#news" class="btn btn-outline">${t.viewAllNews}</a>
      </div>
    </section>
  `;
}

function renderNews(filter = 'all') {
  const main = document.querySelector('main');
  const t = translations[currentLang];
  
  // Mapping filter English keys to Korean categories for internal filtering
  const filterMap = {
    'notice': currentLang === 'ko' ? '공지' : 'Notice',
    'press': currentLang === 'ko' ? '뉴스' : 'Press',
    'blog': currentLang === 'ko' ? '블로그' : 'Blog'
  };

  const filteredData = filter === 'all' 
    ? newsData 
    : newsData.filter(item => {
        const cat = item.category[currentLang];
        return cat === filterMap[filter] || cat === filter; // Support both cases
      });

  main.innerHTML = `
    <section class="container">
      <h1 class="section-title">${t.news}</h1>
      <div class="tabs">
        <div class="tab ${filter === 'all' ? 'active' : ''}" onclick="renderNews('all')">${currentLang === 'ko' ? '전체' : 'All'}</div>
        <div class="tab ${filter === 'notice' ? 'active' : ''}" onclick="renderNews('notice')">${t.newsNotice}</div>
        <div class="tab ${filter === 'press' ? 'active' : ''}" onclick="renderNews('press')">${t.newsPress}</div>
        <div class="tab ${filter === 'blog' ? 'active' : ''}" onclick="renderNews('blog')">${t.newsBlog}</div>
      </div>
      <div class="news-grid">
        ${filteredData.map(item => `
          <div class="news-card" onclick="location.hash='#news/${item.id}'" style="cursor: pointer;">
            <img src="${item.image}" class="news-image" alt="${item.title[currentLang]}" onerror="this.src='https://images.unsplash.com/photo-1485083269755-a7b559a4fe5e?auto=format&fit=crop&q=80&w=1000'">
            <div class="news-content">
              <span class="news-category">${item.category[currentLang]}</span>
              <h3 class="news-title">${item.title[currentLang]}</h3>
              <p class="news-date">${item.date} | ${currentLang === 'ko' ? '조회' : 'Views'} ${item.views}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderNewsDetail(id) {
  const currentIndex = newsData.findIndex(n => n.id === id);
  const item = newsData[currentIndex];
  const main = document.querySelector('main');
  const t = translations[currentLang];

  if (!item) return;

  const prevItem = currentIndex > 0 ? newsData[currentIndex - 1] : null;
  const nextItem = currentIndex < newsData.length - 1 ? newsData[currentIndex + 1] : null;

  main.innerHTML = `
    <div class="container" style="max-width: 800px;">
      <a href="#news" style="color: var(--primary-color); display: block; margin-bottom: 20px;">&larr; ${t.backToList}</a>
      <div style="margin-bottom: 30px;">
        <span class="news-category">${item.category[currentLang]}</span>
        <h1 style="font-size: 2.5rem; margin: 15px 0;">${item.title[currentLang]}</h1>
        <p style="color: var(--text-muted);">${t.date}: ${item.date} | ${currentLang === 'ko' ? '조회수' : 'Views'}: ${item.views}</p>
      </div>

      <img src="${item.image}" 
           style="width: 100%; border-radius: 12px; margin-bottom: 40px; background: #eee; min-height: 300px; object-fit: cover;" 
           onerror="this.src='https://images.unsplash.com/photo-1591115765373-520b7a21769b?auto=format&fit=crop&q=80&w=1000'">
      
      <div style="font-size: 1.1rem; line-height: 1.8; white-space: pre-wrap; margin-bottom: 80px;">${item.content[currentLang]}</div>
      
      <hr style="margin: 40px 0; border: 0; border-top: 1px solid var(--border-color);">
      
      <div style="display: flex; justify-content: space-between; gap: 15px;">
        ${prevItem ? `<button class="btn btn-outline" style="flex: 1;" onclick="location.hash='#news/${prevItem.id}'">${t.prevPost}</button>` : '<div style="flex: 1;"></div>'}
        <button class="btn btn-outline" style="flex: 1;" onclick="location.hash='#news'">${t.list}</button>
        ${nextItem ? `<button class="btn btn-outline" style="flex: 1;" onclick="location.hash='#news/${nextItem.id}'">${t.nextPost}</button>` : '<div style="flex: 1;"></div>'}
      </div>
    </div>
  `;
}

async function renderQnA() {
  const main = document.querySelector('main');
  const t = translations[currentLang];

  // 1. Firebase에서 최신 데이터 불러오기
  let displayData = [...qnaData];
  try {
    if (window.db && window.firebaseDB) {
      const { collection, getDocs, query, orderBy } = window.firebaseDB;
      const q = query(collection(window.db, "qna"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const firebasePosts = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      
      // Firebase 데이터가 있으면 기존 정적 데이터와 합침 (중복 방지는 id 등으로 체크 가능)
      // 여기서는 Firebase 데이터를 우선적으로 표시
      if (firebasePosts.length > 0) {
        displayData = [...firebasePosts];
      }
    }
  } catch (err) {
    console.error("Failed to sync with Firebase:", err);
  }

  main.innerHTML = `
    <section class="container">
      <h1 class="section-title">${t.qnaTitle}</h1>
      <p style="text-align: center; margin-bottom: 40px; color: var(--text-muted);">${t.qnaDesc}</p>
      <div style="text-align: right; margin-bottom: 20px;">
        <a href="#qna/write" class="btn btn-primary">${t.write}</a>
      </div>
      <table class="board-table">
        <thead>
          <tr>
            <th style="width: 80px;">${t.no}</th>
            <th>${t.title}</th>
            <th style="width: 120px;">${t.author}</th>
            <th style="width: 120px;">${t.date}</th>
            <th style="width: 120px;">${t.status}</th>
          </tr>
        </thead>
        <tbody>
          ${displayData.map(item => `
            <tr onclick="handleQnASelection('${item.id}')" style="cursor: pointer;">
              <td>${item.id.toString().substring(0, 4)}</td>
              <td>${item.isSecret ? '<span class="icon-lock">🔒</span> ' + t.secretPost : item.title[currentLang]}</td>
              <td>${item.author}</td>
              <td>${item.date}</td>
              <td style="color: var(--primary-color); font-weight: 600;">${item.status[currentLang]}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
  `;

  // 전역 데이터 업데이트 (상세 보기를 위해)
  window.currentQnaList = displayData;
}

function handleQnASelection(id) {
  const item = (window.currentQnaList || qnaData).find(q => q.id == id);
  if (!item) return;

  if (item.isSecret) {
    const pwd = prompt(currentLang === 'ko' ? "비밀번호를 입력하세요." : "Please enter the password.");
    if (pwd && pwd.trim() === item.password) {
      location.hash = `#qna/view/${id}`;
    } else {
      alert(currentLang === 'ko' ? "비밀번호가 틀렸거나 입력되지 않았습니다." : "Incorrect or missing password.");
    }
  } else {
    location.hash = `#qna/view/${id}`;
  }
}

function renderQnADetail(id) {
  const item = (window.currentQnaList || qnaData).find(q => q.id == id);
  const main = document.querySelector('main');
  const t = translations[currentLang];
  if (!item) return;

  main.innerHTML = `
    <div class="container" style="max-width: 800px;">
      <h1 class="section-title">${item.isSecret ? '🔒 ' : ''}${item.title[currentLang]}</h1>
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
        <span><strong>${t.author}</strong>: ${item.author}</span>
        <span><strong>${t.date}</strong>: ${item.date}</span>
      </div>
      
      <!-- Attachment Section -->
      ${item.attachment ? `
        <div style="margin: 20px 0; padding: 15px; background: #f0f4ff; border-radius: 8px; font-size: 0.9rem;">
          <strong style="display: block; margin-bottom: 8px;">📎 ${currentLang === 'ko' ? '첨부파일' : 'Attachment'}</strong>
          ${item.attachment.type.startsWith('image/') 
            ? `<img src="${item.attachment.data}" style="max-width: 100%; border-radius: 8px; cursor: pointer;" onclick="window.open(this.src)">`
            : item.attachment.type === 'application/pdf'
            ? `<embed src="${item.attachment.data}" type="application/pdf" width="100%" height="500px" style="border-radius: 8px;">`
            : `<a href="${item.attachment.data}" download="${item.attachment.name}" style="color: var(--primary-color); text-decoration: underline;">${item.attachment.name}</a>`
          }
        </div>
      ` : ''}
      
      <div style="min-height: 200px; line-height: 1.8; font-size: 1.1rem; white-space: pre-wrap; margin-bottom: 50px;">
        ${item.content ? (typeof item.content === 'object' ? item.content[currentLang] : item.content) : (currentLang === 'ko' ? '문의 내용입니다.' : 'This is the inquiry content.')}
      </div>
      <div style="text-align: center; display: flex; gap: 10px; justify-content: center;">
        <button class="btn btn-primary" onclick="location.hash='#qna'">${t.list}</button>
        <button class="btn btn-outline" style="border-color: #ddd;" onclick="renderEditQnA('${item.id}')">${t.edit}</button>
        <button class="btn btn-outline" style="color: #ff4d4f; border-color: #ff4d4f;" onclick="handleDeleteQnA('${item.id}')">${t.delete}</button>
      </div>

      <!-- Reply Section -->
      <div style="margin-top: 60px; border-top: 1px solid #eee; padding-top: 40px;">
        <h3 style="font-size: 1.3rem; margin-bottom: 25px;">${currentLang === 'ko' ? '답변' : 'Replies'}</h3>
        <div id="reply-list">
          ${(item.replies || []).map(r => `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.9rem;">
                <strong style="color: var(--primary-color);">${r.author}</strong>
                <span style="color: #999;">${r.date}</span>
              </div>
              <div style="line-height: 1.7; color: #444;">${r.content}</div>
            </div>
          `).join('')}
          ${(!item.replies || item.replies.length === 0) ? `<p style="color: #aaa; text-align: center; padding: 30px;">${currentLang === 'ko' ? '아직 등록된 답변이 없습니다.' : 'No replies yet.'}</p>` : ''}
        </div>
        
        <div style="margin-top: 40px; background: #fff; border: 1px solid #f0f0f0; padding: 25px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
          <h4 style="margin-bottom: 15px; font-size: 1.1rem;">${currentLang === 'ko' ? '답변 달기' : 'Add a Reply'}</h4>
          <input type="text" id="reply-author" class="form-control" placeholder="${currentLang === 'ko' ? '이름' : 'Name'}" style="margin-bottom: 10px; max-width: 200px;">
          <textarea id="reply-content" class="form-control" placeholder="${currentLang === 'ko' ? '내용을 입력하세요.' : 'Enter your message.'}" style="height: 100px; margin-bottom: 15px;"></textarea>
          <button class="btn btn-primary" onclick="handleReplySubmit('${item.id}')">${currentLang === 'ko' ? '답변 등록' : 'Post Reply'}</button>
        </div>
      </div>
    </div>
  `;
}

window.handleReplySubmit = async (id) => {
  const author = document.getElementById('reply-author').value;
  const content = document.getElementById('reply-content').value;
  if (!author || !content) {
    alert(currentLang === 'ko' ? "이름과 내용을 입력해주세요." : "Please enter your name and content.");
    return;
  }

  const item = (window.currentQnaList || qnaData).find(q => q.id == id);
  if (!item) return;

  const newReply = {
    author: author,
    content: content,
    date: new Date().toISOString().split('T')[0]
  };

  if (!item.replies) item.replies = [];
  item.replies.push(newReply);
  item.status = { ko: "답변완료", en: "Answered" };

  try {
    if (window.db && window.firebaseDB && isNaN(id)) {
      const { doc, updateDoc } = window.firebaseDB;
      const postRef = doc(window.db, "qna", id.toString());
      await updateDoc(postRef, {
        replies: item.replies,
        status: item.status
      });
    }
    alert(currentLang === 'ko' ? "답변이 등록되었습니다." : "Reply posted.");
    renderQnADetail(id);
  } catch (err) {
    console.error("Reply failed:", err);
    alert(currentLang === 'ko' ? "답변 등록에 실패했습니다." : "Failed to post reply.");
  }
};

async function handleDeleteQnA(id) {
  console.log("Attempting to delete post with id:", id);
  const t = translations[currentLang];
  const item = (window.currentQnaList || qnaData).find(q => q.id == id);
  if (!item) return;

  // 비밀번호가 있을 경우만 확인 (기존 임시 데이터 등 보안이 필요 없는 데이터는 패스)
  if (item.password) {
    const enteredPwd = prompt(currentLang === 'ko' ? "글 작성 시 설정한 비밀번호를 입력해주세요." : "Please enter the password you set.");
    if (!enteredPwd || enteredPwd.trim() !== item.password) {
      alert(currentLang === 'ko' ? "비밀번호가 일치하지 않습니다." : "Invalid password.");
      return;
    }
  }

  if (!confirm(currentLang === 'ko' ? "정말로 삭제하시겠습니까?" : "Are you sure you want to delete this?")) return;

  try {
    // Firebase 데이터인 경우 (id가 숫지 1, 2가 아닌 긴 문자열인 경우)에만 Firestore 삭제 수행
    if (window.db && window.firebaseDB && isNaN(id)) {
      const { doc, deleteDoc } = window.firebaseDB;
      const postRef = doc(window.db, "qna", id.toString());
      await deleteDoc(postRef);
      console.log("Firebase document deleted successfully");
    }
    
    // 로컬 데이터에서도 삭제
    const index = qnaData.findIndex(q => q.id == id);
    if (index !== -1) {
      qnaData.splice(index, 1);
    }
    
    alert(currentLang === 'ko' ? "삭제되었습니다." : "Deleted successfully.");
    location.hash = '#qna';
  } catch (err) {
    console.error("Delete failed with error:", err);
    alert(currentLang === 'ko' ? "삭제에 실패했습니다. (Firestore 권한 또는 데이터를 확인해주세요)" : "Failed to delete. (Check Firestore permissions or data)");
  }
}

function renderEditQnA(id) {
  const item = (window.currentQnaList || qnaData).find(q => q.id == id);
  const main = document.querySelector('main');
  const t = translations[currentLang];
  if (!item) return;

  // 비밀번호 확인
  if (item.password) {
    const enteredPwd = prompt(currentLang === 'ko' ? "글 작성 시 설정한 비밀번호를 입력해주세요." : "Please enter the password you set.");
    if (!enteredPwd || enteredPwd.trim() !== item.password) {
      alert(currentLang === 'ko' ? "비밀번호가 일치하지 않습니다." : "Invalid password.");
      return;
    }
  }

  main.innerHTML = `
    <div class="container" style="max-width: 600px;">
      <h1 class="section-title">${t.edit}</h1>
      <form id="edit-qna-form">
        <div class="form-group">
          <label class="form-label">${t.title}</label>
          <input type="text" id="edit-qna-title" class="form-control" value="${item.title[currentLang]}" required>
        </div>
        <div class="form-group">
          <label class="form-label">${t.content}</label>
          <textarea id="edit-qna-content" class="form-control" style="height: 250px;" required>${item.content ? (typeof item.content === 'object' ? item.content[currentLang] : item.content) : ''}</textarea>
        </div>

        <div class="form-group" style="margin-top: 20px; padding: 15px; border: 1px dashed #ccc; border-radius: 8px;">
          <label class="form-label">${currentLang === 'ko' ? '첨부파일 수정' : 'Edit Attachment'}</label>
          ${item.attachment ? `
            <div id="current-attachment-box" style="margin-bottom: 10px; font-size: 0.95rem; display: flex; align-items: center; justify-content: space-between;">
              <span>📄 ${item.attachment.name}</span>
              <button type="button" class="btn btn-outline" style="padding: 4px 10px; font-size: 0.8rem; border-color: #ff4d4f; color: #ff4d4f;" onclick="removeAttachment()">${currentLang === 'ko' ? '파일 삭제' : 'Delete File'}</button>
            </div>
            <input type="hidden" id="remove-attachment-flag" value="false">
          ` : ''}
          <input type="file" id="edit-qna-file" class="form-control" style="padding: 10px;" accept="image/*,application/pdf">
          <p style="font-size: 0.82rem; color: #999; margin-top: 8px;">* ${currentLang === 'ko' ? '이미지나 PDF 파일을 최대 2MB까지 업로드할 수 있습니다.' : 'Upload Image or PDF up to 2MB.'}</p>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 30px;">
          <button type="submit" class="btn btn-primary" style="flex: 1;">${t.submit}</button>
          <button type="button" class="btn btn-outline" onclick="location.hash='#qna/view/${id}'" style="flex: 1;">${t.cancel}</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('edit-qna-form').addEventListener('submit', (e) => handleEditQnASubmit(e, id));
}

window.removeAttachment = () => {
  if (confirm(currentLang === 'ko' ? "현재 첨부된 파일을 삭제할까요?" : "Remove attachment?")) {
    const box = document.getElementById('current-attachment-box');
    const flag = document.getElementById('remove-attachment-flag');
    if (box) box.style.opacity = '0.3';
    if (flag) flag.value = 'true';
  }
};

async function handleEditQnASubmit(e, id) {
  e.preventDefault();
  const titleInput = document.getElementById('edit-qna-title');
  const contentInput = document.getElementById('edit-qna-content');
  const fileInput = document.getElementById('edit-qna-file');
  const newFile = fileInput.files[0];
  const removeFlag = document.getElementById('remove-attachment-flag')?.value === 'true';

  const item = qnaData.find(q => q.id == id);
  if (!item) return;

  let finalAttachment = item.attachment;
  
  if (removeFlag) finalAttachment = null;
  
  if (newFile) {
    if (newFile.size > 2 * 1024 * 1024) {
      alert(currentLang === 'ko' ? "파일 크기는 2MB 이하여야 합니다." : "File size must be under 2MB.");
      return;
    }
    finalAttachment = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve({
        name: newFile.name,
        type: newFile.type,
        data: ev.target.result
      });
      reader.readAsDataURL(newFile);
    });
  }

  try {
    if (window.db && window.firebaseDB) {
      const { doc, updateDoc } = window.firebaseDB;
      const dataToUpdate = {
        title: { ko: newTitle, en: newTitle },
        content: newContent,
        updatedAt: new Date()
      };
      await updateDoc(doc(window.db, "qna", id.toString()), dataToUpdate);
    }
    
    // 로컬 데이터 업데이트
    const item = qnaData.find(q => q.id == id);
    if (item) {
      item.title = { ko: newTitle, en: newTitle };
      item.content = newContent;
    }

    alert(currentLang === 'ko' ? "수정되었습니다." : "Updated successfully.");
    location.hash = '#qna';
  } catch (err) {
    console.error("Update failed:", err);
    alert(currentLang === 'ko' ? "수정 중 오류가 발생했습니다." : "Update failed.");
  }
}

function renderWriteQnA() {
  const main = document.querySelector('main');
  const t = translations[currentLang];
  main.innerHTML = `
    <div class="container" style="max-width: 600px;">
      <h1 class="section-title">${t.write}</h1>
      <form id="qna-form">
        <div class="form-group"><label class="form-label">${t.name}</label><input type="text" id="qna-name" class="form-control" required></div>
        <div class="form-group"><label class="form-label">${t.email}</label><input type="email" id="qna-email" class="form-control" required></div>
        <div class="form-group"><label class="form-label">${t.title}</label><input type="text" id="qna-title" class="form-control" required></div>
        <div class="form-group"><label class="form-label">${t.content}</label><textarea id="qna-content" class="form-control" style="height: 200px;" required></textarea></div>
        
        <div class="form-group" style="display: flex; align-items: center; gap: 10px; margin: 20px 0;">
          <input type="checkbox" id="qna-is-secret" style="width: 20px; height: 20px; cursor: pointer;">
          <label for="qna-is-secret" style="cursor: pointer; font-weight: 600;">${currentLang === 'ko' ? '비밀글로 설정' : 'Set as Secret Post'}</label>
        </div>

        <div id="pwd-field" class="form-group">
          <label class="form-label">${t.password}</label>
          <input type="password" id="qna-pwd" class="form-control" required placeholder="${currentLang === 'ko' ? '비밀번호 입력' : 'Enter password'}">
        </div>

        <div class="form-group" style="margin-top: 20px;">
          <label class="form-label">${currentLang === 'ko' ? '파일 첨부 (이미지/PDF)' : 'Attach File (Image/PDF)'}</label>
          <input type="file" id="qna-file" class="form-control" style="padding: 10px;" accept="image/*,application/pdf">
          <p style="font-size: 0.82rem; color: #999; margin-top: 5px;">* ${currentLang === 'ko' ? '최대 2MB까지 첨부 가능합니다.' : 'Max 2MB allowed.'}</p>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 30px;">
          <button type="submit" class="btn btn-primary" style="flex: 1;">${t.submit}</button>
          <button type="button" class="btn btn-outline" onclick="location.hash='#qna'" style="flex: 1;">${t.cancel}</button>
        </div>
      </form>
    </div>
  `;

  // (Toggle logic removed because it is now always visible)
  document.getElementById('qna-form').addEventListener('submit', handleQnASubmit);
}

async function handleQnASubmit(e) {
  e.preventDefault();
  const title = document.getElementById('qna-title').value;
  const content = document.getElementById('qna-content').value;

  // Spam/Profanity Filter
  const bannedWords = ['욕설', '나쁜말', '바보', '스팸', '광고'];
  const foundWord = bannedWords.find(word => title.includes(word) || content.includes(word));
  if (foundWord) {
    alert(currentLang === 'ko' 
      ? `부적절한 단어('${foundWord}')가 포함되어 있습니다. 바른 말을 사용해주세요.` 
      : `Inappropriate word ('${foundWord}') detected. Please use proper language.`);
    return;
  }

  const isSecret = document.getElementById('qna-is-secret').checked;
  const fileInput = document.getElementById('qna-file');
  const file = fileInput.files[0];
  
  let attachment = null;
  if (file) {
    // 2MB 제한 체크
    if (file.size > 2 * 1024 * 1024) {
      alert(currentLang === 'ko' ? "파일 크기는 2MB 이하여야 합니다." : "File size must be under 2MB.");
      return;
    }
    
    // 파일을 Base64로 변환
    attachment = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve({
        name: file.name,
        type: file.type,
        data: e.target.result
      });
      reader.readAsDataURL(file);
    });
  }

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const fullDate = `${dateStr} ${timeStr}`;

  const newData = {
    id: qnaData.length + 1,
    title: { ko: document.getElementById('qna-title').value, en: document.getElementById('qna-title').value },
    author: document.getElementById('qna-name').value,
    date: fullDate,
    status: { ko: "답변대기", en: "Pending" },
    isSecret: isSecret,
    password: document.getElementById('qna-pwd').value,
    replies: [],
    attachment: attachment
  };

  // 1. 로컬 데이터에 추가 (즉시 반영)
  qnaData.unshift(newData);

  // 2. Firebase Firestore에 저장 (서버 반영)
  try {
    if (window.db && window.firebaseDB) {
      const { collection, addDoc } = window.firebaseDB;
      await addDoc(collection(window.db, "qna"), {
        ...newData,
        email: document.getElementById('qna-email').value,
        content: document.getElementById('qna-content').value,
        password: document.getElementById('qna-pwd').value,
        createdAt: new Date()
      });
    }
  } catch (err) {
    console.error("Firebase save failed:", err);
  }

  alert(currentLang === 'ko' ? "문의가 정상적으로 등록되었습니다." : "Your inquiry has been submitted.");
  location.hash = '#qna';
}

function renderProducts() {
  const main = document.querySelector('main');
  const t = translations[currentLang];
  main.innerHTML = `
    <section class="container">
      <h1 class="section-title">${t.products}</h1>
      <p style="text-align: center; margin-bottom: 60px; color: var(--text-muted); max-width: 800px; margin-left: auto; margin-right: auto;">
        ${currentLang === 'ko' 
          ? 'RG-ROBOTICS의 최신 기술이 집약된 제품 라인업을 소개합니다. 우리는 인간의 삶을 더 가치 있게 만드는 기술을 연구합니다.' 
          : 'Introducing RG-ROBOTICS product lineup, where the latest technology is concentrated. We research technology that makes human life more valuable.'}
      </p>
      
      <div class="news-grid">
        <div class="news-card">
          <img src="prod_medical.png" class="news-image">
          <div class="news-content">
            <h3 class="news-title">${currentLang === 'ko' ? 'RG Medica (의료용 재활 로봇)' : 'RG Medica (Medical Rehab Robot)'}</h3>
            <p style="color: var(--text-muted); margin-top: 10px;">
              ${currentLang === 'ko' 
                ? '보행 재활이 필요한 환자를 위한 인공지능 기반 웨어러블 로봇입니다. 환자의 보행 패턴을 분석하여 최적의 보조력을 제공합니다.' 
                : 'AI-based wearable robot for patients in need of gait rehabilitation. Analyzes gait patterns to provide optimal assistance.'}
            </p>
          </div>
        </div>
        
        <div class="news-card">
          <img src="prod_industrial.png" class="news-image">
          <div class="news-content">
            <h3 class="news-title">${currentLang === 'ko' ? 'RG Industrial (산업용 근력 보조)' : 'RG Industrial (Industrial Power Assist)'}</h3>
            <p style="color: var(--text-muted); margin-top: 10px;">
              ${currentLang === 'ko' 
                ? '물류 및 제조 현장에서 작업자의 근력을 보조하여 부상을 방지하고 효율을 극대화합니다. 고강도 탄소 섬유 소재로 내구성이 뛰어납니다.' 
                : 'Assists workers in logistics and manufacturing to prevent injuries and maximize efficiency. High durability with carbon fiber.'}
            </p>
          </div>
        </div>

        <div class="news-card">
          <img src="prod_core.png" class="news-image">
          <div class="news-content">
            <h3 class="news-title">${currentLang === 'ko' ? 'RG Core (로봇 핵심 구동 모듈)' : 'RG Core (Core Robotic Drive Module)'}</h3>
            <p style="color: var(--text-muted); margin-top: 10px;">
              ${currentLang === 'ko' 
                ? '고정밀 감속기와 고출력 모터가 통합된 일체형 구동 모듈입니다. 로보틱스의 심장을 직접 개발하여 공급합니다.' 
                : 'Integrated drive module with high-precision reducer and high-output motor. We develop and supply the heart of robotics.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderSupport(sub) {
  const main = document.querySelector('main');
  const t = translations[currentLang];
  
  let content = '';
  if (sub === 'faq') {
    content = `
      <section class="container">
        <h1 class="section-title">${t.supportFAQ}</h1>
        <div style="max-width: 800px; margin: 0 auto;">
          <div style="background: #fdfdfd; border: 1px solid #eee; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
            <p style="font-weight: 700; font-size: 1.1rem; margin-bottom: 10px;">Q: ${currentLang === 'ko' ? '제품 구매는 어떻게 하나요?' : 'How can I purchase the products?'}</p>
            <p style="color: var(--text-muted);">${currentLang === 'ko' ? 'A: 상단의 "문의하기" 또는 고객센터(010-1234-5678)를 통해 상담 받으실 수 있습니다.' : 'A: You can get a consultation through "Contact Us" or our service center (+82 10-1234-5678).'}</p>
          </div>
          <div style="background: #fdfdfd; border: 1px solid #eee; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
            <p style="font-weight: 700; font-size: 1.1rem; margin-bottom: 10px;">Q: ${currentLang === 'ko' ? '배송 기간은 얼마나 걸리나요?' : 'How long does delivery take?'}</p>
            <p style="color: var(--text-muted);">${currentLang === 'ko' ? 'A: 주문 제작 방식에 따라 통상 2~4주 정도 소요됩니다.' : 'A: It usually takes 2-4 weeks depending on the custom production process.'}</p>
          </div>
        </div>
      </section>
    `;
  } else if (sub === 'service') {
    content = `
      <section class="container">
        <h1 class="section-title">${t.supportService}</h1>
        <div style="text-align: center; max-width: 800px; margin: 0 auto;">
          <p style="font-size: 1.2rem; margin-bottom: 40px; color: var(--text-muted);">${currentLang === 'ko' ? '전국 5개 거점 센터에서 전문 엔지니어가 신속하게 도와드립니다.' : 'Expert engineers help you quickly at 5 regional centers nationwide.'}</p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
            <div style="padding: 20px; background: #f8f9fa; border-radius: 8px;">
              <h4 style="margin-bottom: 10px;">${currentLang === 'ko' ? '서울/수도권 센터' : 'Seoul Center'}</h4>
              <p>010-1234-5678</p>
            </div>
            <div style="padding: 20px; background: #f8f9fa; border-radius: 8px;">
              <h4 style="margin-bottom: 10px;">${currentLang === 'ko' ? '부산/영남 센터' : 'Busan Center'}</h4>
              <p>051-123-4567</p>
            </div>
          </div>
        </div>
      </section>
    `;
  } else {
    // support main view as shown in the screenshot
    content = `
      <section class="container" style="text-align: center;">
        <h1 class="section-title">${t.support}</h1>
        <div style="display: flex; flex-direction: column; gap: 30px; max-width: 400px; margin: 0 auto; text-align: center; align-items: center;">
          <a href="#faq" style="font-size: 1.8rem; font-weight: 700; color: var(--text-color);">${t.supportFAQ}</a>
          <a href="#qna" style="font-size: 1.8rem; font-weight: 700; color: var(--text-color);">${t.supportQnA}</a>
          <a href="#service" style="font-size: 1.8rem; font-weight: 700; color: var(--text-color);">${t.supportService}</a>
        </div>
      </section>
    `;
  }
  
  main.innerHTML = content;
}

function renderFooter() {
  const footer = document.querySelector('footer');
  const t = translations[currentLang];
  footer.innerHTML = `
    <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 40px;">
        <div>
            <h3 style="margin-bottom: 20px;">RG-ROBOTICS</h3>
            <p style="color: #888; max-width: 300px;">${t.footerDesc}</p>
        </div>
        <div>
            <h4 style="margin-bottom: 20px;">${t.company}</h4>
            <ul style="color: #888; line-height: 2;">
                <li>${t.careers}</li>
                <li style="margin-top: 15px; color: #fff; font-size: 1.1rem; font-weight: 600;">
                    📞 010-1234-5678
                </li>
                <li style="color: #888; font-size: 0.9rem;">
                    📧 rhkdgml999@dongyang.ac.kr
                </li>
            </ul>
        </div>
        <div>
            <h4 style="margin-bottom: 20px;">${t.support}</h4>
            <ul style="color: #888; line-height: 2;"><li>${t.faq}</li><li>Q&A</li><li>${t.serviceCenter}</li></ul>
        </div>
    </div>
    <div style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #333; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
        <div style="color: #555; font-size: 0.85rem;">
            &copy; 2026 RG-ROBOTICS. All rights reserved.
        </div>
        <div class="share-buttons" style="display: flex; gap: 15px; align-items: center;">
            <span style="color: #888; font-size: 0.9rem;">Share:</span>
            <button onclick="copyToClipboard()" style="background: #333; color: #fff; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">🔗 Link</button>
            <button onclick="shareSNS('facebook')" style="background: #3b5998; color: #fff; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">F</button>
            <button onclick="shareSNS('kakao')" style="background: #FEE500; color: #3c1e1e; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: bold;">K</button>
        </div>
    </div>
  `;
}

window.copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert(currentLang === 'ko' ? "링크가 복사되었습니다!" : "Link copied to clipboard!");
};

window.shareSNS = (platform) => {
    const url = encodeURIComponent(window.location.href);
    let shareUrl = '';
    if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    if (platform === 'kakao') shareUrl = `https://sharer.kakao.com/talk/friends/picker/link?url=${url}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
};

function renderCompany() {
    const main = document.querySelector('main');
    const t = translations[currentLang];
    main.innerHTML = `
        <section class="container">
            <h1 class="section-title">${t.company}</h1>
            <div style="max-width: 900px; margin: 0 auto;">
                <div style="margin-bottom: 60px; line-height: 2; font-size: 1.1rem; color: #444;">
                    <h2 style="font-size: 2rem; color: var(--primary-color); margin-bottom: 25px;">
                        ${currentLang === 'ko' ? '인간과 기술의 따뜻한 공존, RG ROBOTICS' : 'Warm Coexistence of Human and Technology, RG ROBOTICS'}
                    </h2>
                    <p style="margin-bottom: 20px;">
                        ${currentLang === 'ko' 
                          ? 'RG ROBOTICS는 웨어러블 로보틱스 기술을 기반으로 인간의 신체적 한계를 극복하고 삶의 질을 향상시키는 것을 목표로 합니다. 의료용 보행 지원 로봇부터 산업 현장의 근력 보조 솔루션까지, 우리는 일상의 모든 움직임에 새로운 가능성을 더합니다.' 
                          : 'RG ROBOTICS aims to overcome human physical limits and improve quality of life based on wearable robotics technology. From medical gait support robots to strength-assist solutions in industrial sites, we add new possibilities to every movement of daily life.'}
                    </p>
                    <p>
                        ${currentLang === 'ko'
                          ? '우리의 기술은 단순히 기계를 만드는 것에 그치지 않습니다. 누군가에게는 다시 걷는 기쁨을, 누군가에게는 안전하고 가벼운 노동 환경을 선사하는 "사람을 향한 기술"을 지향합니다.'
                          : 'Our technology does not stop at just making machines. We aim for "technology for people" that gives the joy of walking again to someone and a safe and light working environment to someone else.'}
                    </p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
                    <div style="padding: 40px; background: #f8f9fa; border-radius: 15px; text-align: center;">
                        <h3 style="margin-bottom: 15px;">Vision</h3>
                        <p style="color: var(--text-muted);">${currentLang === 'ko' ? '로보틱스로 인류의 활동 범위를 무한히 확장합니다.' : 'Infinitely expanding the scope of human activity with robotics.'}</p>
                    </div>
                    <div style="padding: 40px; background: #f8f9fa; border-radius: 15px; text-align: center;">
                        <h3 style="margin-bottom: 15px;">Mission</h3>
                        <p style="color: var(--text-muted);">${currentLang === 'ko' ? '모든 사람이 제약 없이 움직이는 세상을 만듭니다.' : 'Creating a world where everyone moves without constraints.'}</p>
                    </div>
                </div>

                <div style="margin-top: 60px; text-align: center; padding: 40px; border: 1px solid #eee; border-radius: 12px;">
                    <h3 style="margin-bottom: 20px;">${t.careers}</h3>
                    <p style="margin-bottom: 25px; color: var(--text-muted);">${currentLang === 'ko' ? 'RG ROBOTICS의 미래를 함께 만들어갈 동료를 찾습니다.' : 'We are looking for colleagues to build the future of RG ROBOTICS together.'}</p>
                    <a href="#careers" class="btn btn-outline" style="border-color: var(--primary-color); color: var(--primary-color);">${currentLang === 'ko' ? '채용공고 확인하기' : 'View Job Openings'}</a>
                </div>
            </div>
        </section>
    `;
}

function renderCareers() {
    const main = document.querySelector('main');
    const t = translations[currentLang];
    main.innerHTML = `
        <section class="container">
            <h1 class="section-title">${t.careers}</h1>
            <div style="max-width: 800px; margin: 0 auto;">
                <div style="background: #fff; border: 1px solid #eee; border-radius: 12px; padding: 40px; text-align: center;">
                    <h2 style="margin-bottom: 20px;">
                        ${currentLang === 'ko' ? 'RG-ROBOTICS와 함께 세상을 바꿀 동료를 찾습니다.' : 'Looking for colleagues to change the world with RG-ROBOTICS.'}
                    </h2>
                    <p style="color: var(--text-muted); line-height: 1.8; margin-bottom: 40px;">
                        ${currentLang === 'ko' 
                          ? '우리는 기술로 인간의 한계를 극복하고 더 나은 미래를 만듭니다.<br>로보틱스, AI, 임베디드 등 다양한 분야의 인재를 상시 채용 중입니다.' 
                          : 'We overcome human limits through technology and create a better future.<br>Open positions in robotics, AI, embedded systems, and more.'}
                    </p>
                    <a href="mailto:careers@rg-robotics.com" class="btn btn-primary">
                        ${currentLang === 'ko' ? '지원하기 (Email)' : 'Apply Now (Email)'}
                    </a>
                </div>
            </div>
        </section>
    `;
}

/* Chatbot Logic */
document.addEventListener('DOMContentLoaded', () => {
    const chatToggle = document.getElementById('chatbot-toggle');
    const chatClose = document.getElementById('chat-close');
    const chatWindow = document.getElementById('chat-window');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');

    if (chatToggle && chatWindow) {
        chatToggle.addEventListener('click', () => {
            chatWindow.classList.toggle('hidden');
            if (!chatWindow.classList.contains('hidden')) {
                chatInput.focus();
            }
        });

        chatClose.addEventListener('click', () => {
            chatWindow.classList.add('hidden');
        });

        const sendMessage = () => {
            const text = chatInput.value.trim();
            if (!text) return;

            addMessage(text, 'user');
            chatInput.value = '';

            // Keyword based response logic
            setTimeout(() => {
                const response = getBotResponse(text);
                addMessage(response, 'bot');
            }, 600);
        };

        chatSend.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function getBotResponse(input) {
        const text = input.toLowerCase();
        
        // Greeting
        if (text.includes('안녕') || text.includes('반가워') || text.includes('hello') || text.includes('hi')) {
            return currentLang === 'ko' 
                ? '안녕하세요! RG ROBOTICS AI 비서입니다. 무엇을 도와드릴까요?' 
                : 'Hello! I am the RG ROBOTICS AI assistant. How can I help you?';
        }
        
        // Products
        if (text.includes('제품') || text.includes('로봇') || text.includes('웨어러블') || text.includes('product') || text.includes('robot')) {
            return currentLang === 'ko'
                ? 'RG ROBOTICS는 Medica(의료), Industrial(산업), Core(구동모듈) 라인업을 보유하고 있습니다. 자세한 내용은 "제품" 메뉴를 확인해 보세요.'
                : 'RG ROBOTICS offers Medica (Medical), Industrial (Power Assist), and Core (Drive Module) lineups. Please check the "Products" menu for details.';
        }
        
        // Price / Purchase
        if (text.includes('가격') || text.includes('구매') || text.includes('얼마') || text.includes('price') || text.includes('buy') || text.includes('purchase')) {
            return currentLang === 'ko'
                ? '제품별 가격 및 구매 방법은 고객님의 용도에 따라 다를 수 있습니다. 정확한 견적은 "문의하기"를 통해 남겨주시면 상담원이 연락드리겠습니다.'
                : 'Pricing and purchasing methods vary by product and use case. Please leave an inquiry through "Contact Us" for a formal quote.';
        }

        // Location
        if (text.includes('위치') || text.includes('주소') || text.includes('어디') || text.includes('location') || text.includes('address') || text.includes('where')) {
            return currentLang === 'ko'
                ? '본사는 서울특별시 구로구 경인로 445에 위치하고 있습니다. 방문 시 미리 예약 부탁드립니다.'
                : 'Our headquarters is located at 445 Gyeongin-ro, Guro-gu, Seoul. Please make an appointment before visiting.';
        }
        
        // Contact / Support
        if (text.includes('연락') || text.includes('문의') || text.includes('전화') || text.includes('번호') || text.includes('contact') || text.includes('call') || text.includes('support')) {
            return currentLang === 'ko'
                ? '대표번호: 010-1234-5678, 이메일: support@rg-robotics.com 입니다. 고객센터 운영 시간은 평일 09:00~18:00입니다.'
                : 'Phone: +82 10-1234-5678, Email: support@rg-robotics.com. Business hours are weekdays 09:00~18:00 (KST).';
        }
        
        // Career
        if (text.includes('채용') || text.includes('입사') || text.includes('취업') || text.includes('career') || text.includes('job') || text.includes('hiring')) {
            return currentLang === 'ko'
                ? 'RG ROBOTICS와 함께 세상을 바꿀 인재를 찾고 있습니다! 채용 공고는 "Company > Careers" 메뉴를 참조해 주세요.'
                : 'We are looking for talents to change the world! Please check the "Company > Careers" menu for open positions.';
        }

        // AS / Service
        if (text.includes('as') || text.includes('수리') || text.includes('고장') || text.includes('repair') || text.includes('broken') || text.includes('service')) {
            return currentLang === 'ko'
                ? '제품 수리 및 AS 문의는 시리얼 번호와 함께 고객센터로 연락해 주세요. 전국 5개 거점 센터에서 신속히 도와드립니다.'
                : 'For repairs and A/S, please contact our service center with your serial number. We have 5 regional centers to assist you.';
        }

        // Default
        return currentLang === 'ko'
            ? '죄송합니다. 해당 키워드는 아직 학습 중입니다. "제품", "가격", "위치", "문의" 등의 키워드를 입력해 보세요.'
            : 'Sorry, I am still learning that keyword. Please try searching for "Product", "Price", "Location", or "Contact".';
    }
});
