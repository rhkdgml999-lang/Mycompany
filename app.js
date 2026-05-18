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
  const navLinks = document.querySelectorAll('nav ul li a');
  navLinks[0].textContent = t.home;
  navLinks[1].textContent = t.products;
  navLinks[2].textContent = t.news;
  navLinks[3].textContent = t.support;
  
  // Mobile only: Ensure actions are visible if needed or in menu
  // (Optional: add more dynamic logic if requested)
  
  document.querySelector('.header-actions .btn-primary').textContent = t.contactUs;
  
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
}

function handleRoute() {
  const hash = window.location.hash || '#home';
  const main = document.querySelector('main');
  const t = translations[currentLang];
  
  // Force scroll to top on every navigation
  window.scrollTo(0, 0);

  if (hash === '#home') renderHome();
  else if (hash === '#news') renderNews();
  else if (hash.startsWith('#news/')) {
    const id = parseInt(hash.split('/')[1]);
    renderNewsDetail(id);
  } else if (hash === '#qna') renderQnA();
  else if (hash === '#qna/write') renderWriteQnA();
  else if (hash.startsWith('#qna/view/')) {
    const id = parseInt(hash.split('/')[2]);
    renderQnADetail(id);
  } else if (hash === '#products') renderProducts();
  else renderHome();
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
        id: doc.id,
        ...doc.data()
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
    if (pwd) {
      location.hash = `#qna/view/${id}`;
    } else {
      alert(currentLang === 'ko' ? "비밀번호가 틀렸거나 입력되지 않았습니다." : "Incorrect password.");
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
      <div style="min-height: 200px; line-height: 1.8; font-size: 1.1rem; white-space: pre-wrap; margin-bottom: 50px;">
        ${item.content ? (typeof item.content === 'object' ? item.content[currentLang] : item.content) : (currentLang === 'ko' ? '문의 내용입니다.' : 'This is the inquiry content.')}
      </div>
      <div style="text-align: center;">
        <button class="btn btn-primary" onclick="location.hash='#qna'">${t.list}</button>
      </div>
    </div>
  `;
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

        <div id="pwd-field" class="form-group" style="display: none;">
          <label class="form-label">${t.password}</label>
          <input type="password" id="qna-pwd" class="form-control" placeholder="${currentLang === 'ko' ? '비밀번호 입력' : 'Enter password'}">
        </div>

        <div style="display: flex; gap: 10px; margin-top: 30px;">
          <button type="submit" class="btn btn-primary" style="flex: 1;">${t.submit}</button>
          <button type="button" class="btn btn-outline" onclick="location.hash='#qna'" style="flex: 1;">${t.cancel}</button>
        </div>
      </form>
    </div>
  `;

  // 비밀글 체크박스 토글 로직
  const secretCheckbox = document.getElementById('qna-is-secret');
  const pwdField = document.getElementById('pwd-field');
  secretCheckbox.addEventListener('change', (e) => {
    pwdField.style.display = e.target.checked ? 'block' : 'none';
  });

  document.getElementById('qna-form').addEventListener('submit', handleQnASubmit);
}

async function handleQnASubmit(e) {
  e.preventDefault();
  const t = translations[currentLang];
  const isSecret = document.getElementById('qna-is-secret').checked;
  
  const newData = {
    id: qnaData.length + 1,
    title: { ko: document.getElementById('qna-title').value, en: document.getElementById('qna-title').value },
    author: document.getElementById('qna-name').value,
    date: new Date().toISOString().split('T')[0],
    status: { ko: "답변대기", en: "Pending" },
    isSecret: isSecret
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
    <div style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #333; color: #555; font-size: 0.85rem; text-align: center;">
        &copy; 2026 RG-ROBOTICS. All rights reserved.
    </div>
  `;
}
