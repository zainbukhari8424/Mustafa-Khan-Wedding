/* ==========================================================================
   Mustafa Khan  - Wedding Invitation Interactive Script
   Features: Google Sheets Cloud Integration, Eng. Mustafa Khan Titles,
             Custom Location Link, Dynamic Language Switcher (EN/AR),
             Photo Envelope Opener, Interactive Guestbook Warm Wishes Feed,
             MP3 Wedding Music, Hijri Date, & LocalStorage Persistence
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Lock scrolling while invitation card envelope is present
    document.body.classList.add('overlay-active');

    // --------------------------------------------------
    // Google Sheets Integration Endpoint
    // Replace GOOGLE_SHEET_SCRIPT_URL with your Google Apps Script Web App URL
    // --------------------------------------------------
    const GOOGLE_SHEET_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

    // Helper to send data to Google Sheets
    async function sendDataToGoogleSheet(payload) {
        if (!GOOGLE_SHEET_SCRIPT_URL || GOOGLE_SHEET_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
            console.log('Google Sheets URL not configured yet. Saving to LocalStorage.', payload);
            return;
        }

        try {
            await fetch(GOOGLE_SHEET_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Avoid CORS issues with Google Apps Script
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            console.log('Successfully sent payload to Google Sheet:', payload);
        } catch (error) {
            console.error('Error sending data to Google Sheet:', error);
        }
    }

    // --------------------------------------------------
    // 1. Language Switcher Engine (English <-> Arabic)
    // --------------------------------------------------
    let currentLang = 'en';
    const langToggleBtn = document.getElementById('lang-toggle-btn');
    const langLabel = document.getElementById('lang-label');

    function setLanguage(lang) {
        currentLang = lang;
        if (lang === 'ar') {
            document.body.classList.remove('lang-en');
            document.body.classList.add('lang-ar');
            document.documentElement.setAttribute('dir', 'rtl');
            document.documentElement.setAttribute('lang', 'ar');
            if (langLabel) langLabel.textContent = 'English';
        } else {
            document.body.classList.remove('lang-ar');
            document.body.classList.add('lang-en');
            document.documentElement.setAttribute('dir', 'ltr');
            document.documentElement.setAttribute('lang', 'en');
            if (langLabel) langLabel.textContent = 'العربية';
        }

        // Update all elements with data-en and data-ar
        const translatableElements = document.querySelectorAll('[data-en][data-ar]');
        translatableElements.forEach(el => {
            const text = el.getAttribute(`data-${lang}`);
            if (text) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = text;
                } else {
                    el.textContent = text;
                }
            }
        });

        // Re-render wishes feed to update language texts
        renderWishesFeed();

        // Update music label if music is playing
        if (musicLabel) {
            if (isPlayingAudio) {
                musicLabel.textContent = lang === 'ar' ? 'إيقاف الموسيقى' : 'Pause Music';
            } else {
                musicLabel.textContent = lang === 'ar' ? 'الموسيقى' : 'Play Music';
            }
        }
    }

    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            const nextLang = currentLang === 'en' ? 'ar' : 'en';
            setLanguage(nextLang);
            showToast(nextLang === 'ar' ? 'تم تغيير اللغة إلى العربية' : 'Switched to English');
        });
    }

    // --------------------------------------------------
    // 2. Interactive Photo Envelope Intro Opener
    // --------------------------------------------------
    const envelopeOverlay = document.getElementById('envelope-overlay');
    const openEnvelopeBtn = document.getElementById('open-envelope-btn');
    const physicalEnvelope = document.getElementById('physical-envelope');

    function openInvitationEnvelope() {
        if (!envelopeOverlay || envelopeOverlay.classList.contains('opened')) return;

        envelopeOverlay.classList.add('opened');
        document.body.classList.remove('overlay-active');

        // Burst gold sparkling dust
        createGoldParticleBurst();

        // Start the selected background music at 00:20
        if (!isPlayingAudio) {
            toggleMusic();
        }

        const toastMsg = currentLang === 'ar' ? '✨ ' : '✨ Welcome to Mustafa Khan Wedding';
        showToast(toastMsg);
    }

    if (openEnvelopeBtn) {
        openEnvelopeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openInvitationEnvelope();
        });
    }

    if (physicalEnvelope) {
        physicalEnvelope.addEventListener('click', openInvitationEnvelope);
    }

    function createGoldParticleBurst() {
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            p.style.position = 'fixed';
            p.style.left = '50%';
            p.style.top = '50%';
            p.style.width = Math.random() * 8 + 4 + 'px';
            p.style.height = p.style.width;
            p.style.backgroundColor = '#D4AF37';
            p.style.borderRadius = '50%';
            p.style.boxShadow = '0 0 10px #FCF6BA';
            p.style.pointerEvents = 'none';
            p.style.zIndex = '10000';
            p.style.transition = 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)';

            document.body.appendChild(p);

            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 250 + 60;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            setTimeout(() => {
                p.style.transform = `translate(${x}px, ${y}px) scale(0)`;
                p.style.opacity = '0';
            }, 30);

            setTimeout(() => {
                p.remove();
            }, 1300);
        }
    }

    // --------------------------------------------------
    // 3. Realtime Countdown Timer (22 August 2026 / 9 Safar 1448 AH at 9:00 PM)
    // --------------------------------------------------
    const weddingDate = new Date('2026-12-05T21:00:00').getTime();

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function updateCountdown() {
        const now = new Date().getTime();
        const difference = weddingDate - now;

        if (difference <= 0) {
           
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        daysEl.textContent = days < 10 ? '0' + days : days;
        hoursEl.textContent = hours < 10 ? '0' + hours : hours;
        minutesEl.textContent = minutes < 10 ? '0' + minutes : minutes;
        secondsEl.textContent = seconds < 10 ? '0' + seconds : seconds;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // --------------------------------------------------
    // 4. Background Music: "Thank You My Lord"
    // Starts at 00:20 when the invitation envelope is opened.
    // The MP3 file is expected beside index.html.
    // --------------------------------------------------
    const weddingMusic = document.getElementById('wedding-background-music');
    const musicBtn = document.getElementById('music-toggle-btn');
    const musicLabel = musicBtn ? musicBtn.querySelector('.music-label') : null;
    const MUSIC_START_SECONDS = 20;
    let isPlayingAudio = false;

    function updateMusicButton(playing) {
        isPlayingAudio = playing;
        if (musicBtn) musicBtn.classList.toggle('playing', playing);
        if (musicLabel) {
            musicLabel.textContent = playing
                ? (currentLang === 'ar' ? 'إيقاف الموسيقى' : 'Pause Music')
                : (currentLang === 'ar' ? 'الموسيقى' : 'Play Music');
        }
    }

    async function toggleMusic() {
        if (!weddingMusic) {
            console.error('Music element not found in index.html.');
            return;
        }

        if (!weddingMusic.paused) {
            weddingMusic.pause();
            updateMusicButton(false);
            return;
        }

        try {
            // Start at 20 seconds on the first play, or restart after the track ends.
            if (weddingMusic.currentTime < MUSIC_START_SECONDS || weddingMusic.ended) {
                await new Promise((resolve, reject) => {
                    if (weddingMusic.readyState >= 1) {
                        resolve();
                    } else {
                        const onReady = () => { cleanup(); resolve(); };
                        const onError = () => { cleanup(); reject(new Error('The music file could not be loaded.')); };
                        const cleanup = () => {
                            weddingMusic.removeEventListener('loadedmetadata', onReady);
                            weddingMusic.removeEventListener('error', onError);
                        };
                        weddingMusic.addEventListener('loadedmetadata', onReady, { once: true });
                        weddingMusic.addEventListener('error', onError, { once: true });
                        weddingMusic.load();
                    }
                });
                if (Number.isFinite(weddingMusic.duration) && weddingMusic.duration <= MUSIC_START_SECONDS) {
                    throw new Error('The audio track is 20 seconds or shorter; it cannot start at 00:20.');
                }
                weddingMusic.currentTime = MUSIC_START_SECONDS;
            }

            await weddingMusic.play();
            updateMusicButton(true);
        } catch (error) {
            updateMusicButton(false);
            console.error('Unable to play wedding music:', error);
            showToast(currentLang === 'ar'
                ? 'تعذر تشغيل الموسيقى. تحقق من ملف الصوت.'
                : 'Music could not play. Please check the MP3 file.');
        }
    }

    if (weddingMusic) {
        weddingMusic.addEventListener('ended', () => updateMusicButton(false));
        weddingMusic.addEventListener('pause', () => {
            if (weddingMusic.ended || weddingMusic.currentTime === 0) updateMusicButton(false);
        });
        weddingMusic.addEventListener('play', () => updateMusicButton(true));
    }

    if (musicBtn) {
        musicBtn.addEventListener('click', toggleMusic);
    }

    // --------------------------------------------------
    // 5. Ambient Golden Dust Canvas Animation
    // --------------------------------------------------
    const canvas = document.getElementById('ambient-particles');
    const ctx = canvas.getContext('2d');

    let particles = [];
    const particleCount = 45;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + Math.random() * 100;
            this.size = Math.random() * 2.5 + 0.5;
            this.speedY = Math.random() * 0.6 + 0.2;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.opacity = Math.random() * 0.6 + 0.2;
        }

        update() {
            this.y -= this.speedY;
            this.x += this.speedX;

            if (this.y < -10) {
                this.reset();
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#D4AF37';
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateParticles);
    }

    animateParticles();

    // --------------------------------------------------
    // 6. Interactive Guestbook & Warm Wishes Feed
    // --------------------------------------------------
    const defaultWishes = [
        {
            author: "Omar & Family",
            authorAr: "عائلة علي",
            relation: "Family",
            relationAr: "العائلة",
            text: "Warmest congratulations to Mustafa Khan ! Wishing you a lifetime filled with endless love, joy, and laughter.",
            textAr: "ألف مبروك للمهندس عبدالله والدكتورة M! نتمنى لكما حياة ممتلئة بالحب والسعادة ",
            time: "Just now"
        },
        {
            author: "Dr. Sarah Ahmed",
            authorAr: "د. سارة محمد",
            relation: "Friend",
            relationAr: "صديقة العروس",
            text: "So thrilled to celebrate your special day at Doctors Club! May your journey together be blessed.",
            textAr: "سعداء جداً بانتظار ليلتكم المميزة في نادي الأطباء! الف مبروك يا أجمل عروسين.",
            time: "1 hour ago"
        },
        {
            author: "Khaled & Layla",
            authorAr: "ليلى",
            relation: "Best Friends",
            relationAr: "أصدقاء المقربين",
            text: "Two beautiful souls ,Cannot wait to dance and celebrate with you on August 22!",
            textAr: "بارك الله لكما وبارك عليكما وجمع بينكما في خير. ننتظر بشوق 22 أغسطس لنحتفل معكم!",
            time: "3 hours ago"
        }
    ];

    function getStoredWishes() {
        const stored = localStorage.getItem('wedding_wishes_abdallah_m');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error(e);
            }
        }
        return defaultWishes;
    }

    function renderWishesFeed() {
        const feedContainer = document.getElementById('wishes-feed');
        if (!feedContainer) return;

        const wishes = getStoredWishes();
        feedContainer.innerHTML = '';

        wishes.forEach(wish => {
            const card = document.createElement('div');
            card.className = 'wish-card glass-card';

            const authorName = currentLang === 'ar' ? (wish.authorAr || wish.author) : wish.author;
            const relationTag = currentLang === 'ar' ? (wish.relationAr || wish.relation) : wish.relation;
            const wishText = currentLang === 'ar' ? (wish.textAr || wish.text) : wish.text;

            card.innerHTML = `
                <div class="wish-card-header">
                    <div class="wish-author-info">
                        <h4>${authorName}</h4>
                        ${relationTag ? `<span class="wish-relation-badge">${relationTag}</span>` : ''}
                    </div>
                    <span class="wish-date">${wish.time || ''}</span>
                </div>
                <p class="wish-text">"${wishText}"</p>
            `;

            feedContainer.appendChild(card);
        });
    }

    renderWishesFeed();

    const wishForm = document.getElementById('wish-form');
    if (wishForm) {
        wishForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const author = document.getElementById('wish-author').value.trim();
            const relation = document.getElementById('wish-relation').value.trim();
            const text = document.getElementById('wish-text').value.trim();

            if (!author || !text) {
                showToast(currentLang === 'ar' ? 'يرجى كتابة الاسم والتهنئة.' : 'Please fill in your name and message.');
                return;
            }

            const newWish = {
                type: 'GUESTBOOK_WISH',
                author: author,
                authorAr: author,
                relation: relation || (currentLang === 'ar' ? 'مُهنئ' : 'Well-wisher'),
                relationAr: relation || 'مُهنئ',
                text: text,
                textAr: text,
                time: currentLang === 'ar' ? 'الآن' : 'Just now',
                timestamp: new Date().toLocaleString()
            };

            const wishes = getStoredWishes();
            wishes.unshift(newWish);
            localStorage.setItem('wedding_wishes_abdallah_m', JSON.stringify(wishes));

            // Send wish payload to Google Sheets
            sendDataToGoogleSheet(newWish);

            wishForm.reset();
            renderWishesFeed();
            createHeartBurst();

            showToast(currentLang === 'ar' ? '✨ شكراً لك! تم نشر تهنئتك وحفظها.' : '✨ Thank you! Your warm wishes have been posted.');
        });
    }

    // --------------------------------------------------
    // 7. RSVP Form & LocalStorage Persistence
    // --------------------------------------------------
    const rsvpForm = document.getElementById('rsvp-form');
    const rsvpSuccess = document.getElementById('rsvp-success-message');
    const rsvpSummaryText = document.getElementById('rsvp-summary-text');
    const editRsvpBtn = document.getElementById('edit-rsvp-btn');

    function loadSavedRSVP() {
        const savedRSVP = localStorage.getItem('wedding_rsvp_abdallah_m');
        if (savedRSVP) {
            try {
                const data = JSON.parse(savedRSVP);
                if (rsvpForm) rsvpForm.classList.add('hidden');
                if (rsvpSuccess) rsvpSuccess.classList.remove('hidden');

                if (data.attendance === 'accept') {
                    rsvpSummaryText.textContent = currentLang === 'ar' 
                        ? `أهلاً بك يا ${data.guestName}! يسعدنا جداً حضورك معنا (${data.guestCount} شخص).`
                        : `Thank you ${data.guestName}! We are thrilled to celebrate with you (${data.guestCount} guest(s)).`;
                } else {
                    rsvpSummaryText.textContent = currentLang === 'ar'
                        ? `شكراً لك يا ${data.guestName} على إبلاغنا. سنشتاق لحضورك!`
                        : `Thank you ${data.guestName} for letting us know. You will be missed!`;
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    loadSavedRSVP();

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const guestName = document.getElementById('guest-name').value.trim();
            const attendance = document.getElementById('attendance').value;
            const guestCount = document.getElementById('guest-count').value;
            const dietary = document.getElementById('dietary').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!guestName || !attendance) {
                showToast(currentLang === 'ar' ? 'يرجى ملء الحقول المطلوبة.' : 'Please fill in required fields.');
                return;
            }

            const rsvpData = {
                type: 'RSVP_CONFIRMATION',
                guestName,
                attendance: attendance === 'accept' ? 'Joyfully Accept (سيحضر)' : 'Regretfully Decline (يعتذر)',
                guestCount,
                dietary: dietary || '-',
                message: message || '-',
                timestamp: new Date().toLocaleString()
            };

            localStorage.setItem('wedding_rsvp_abdallah_m', JSON.stringify(rsvpData));

            // Send payload to Google Sheets
            sendDataToGoogleSheet(rsvpData);

            createHeartBurst();

            rsvpForm.classList.add('hidden');
            rsvpSuccess.classList.remove('hidden');

            if (attendance === 'accept') {
                rsvpSummaryText.textContent = currentLang === 'ar' 
                    ? `أهلاً بك يا ${guestName}! يسعدنا جداً حضورك معنا (${guestCount} شخص).`
                    : `Thank you ${guestName}! We are thrilled to celebrate with you (${guestCount} guest(s)).`;
                
                showToast(currentLang === 'ar' ? '✨ تم تأكيد الحضور! ننتظركم في نادي الأطباء الساعة 9:00 مساءً.' : '✨ RSVP Confirmed! See you at Doctors Club at 9:00 PM.');
            } else {
                rsvpSummaryText.textContent = currentLang === 'ar'
                    ? `شكراً لك يا ${guestName} على إبلاغنا. سنشتاق لحضورك!`
                    : `Thank you ${guestName} for letting us know. You will be missed!`;
                
                showToast(currentLang === 'ar' ? 'تم حفظ الرد. شكراً لكم!' : 'RSVP saved. Thank you!');
            }
        });
    }

    if (editRsvpBtn) {
        editRsvpBtn.addEventListener('click', () => {
            rsvpSuccess.classList.add('hidden');
            rsvpForm.classList.remove('hidden');
        });
    }

    function createHeartBurst() {
        for (let i = 0; i < 18; i++) {
            const heart = document.createElement('div');
            heart.innerHTML = '❤️';
            heart.style.position = 'fixed';
            heart.style.left = '50%';
            heart.style.top = '50%';
            heart.style.fontSize = Math.random() * 20 + 20 + 'px';
            heart.style.pointerEvents = 'none';
            heart.style.zIndex = '3000';
            heart.style.transition = 'all 1.5s cubic-bezier(0.16, 1, 0.3, 1)';

            document.body.appendChild(heart);

            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 200 + 80;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance - 100;

            setTimeout(() => {
                heart.style.transform = `translate(${x}px, ${y}px) scale(0)`;
                heart.style.opacity = '0';
            }, 50);

            setTimeout(() => {
                heart.remove();
            }, 1600);
        }
    }

    // --------------------------------------------------
    // 8. Copy Venue Address & Link
    // --------------------------------------------------
    const copyAddressBtn = document.getElementById('copy-address-btn');
    if (copyAddressBtn) {
        copyAddressBtn.addEventListener('click', () => {
            const address = "https://maps.app.goo.gl/ozCcCxxA4USmRRwE8";
            navigator.clipboard.writeText(address).then(() => {
                showToast(currentLang === 'ar' ? '📋 تم نسخ رابط الموقع!' : '📋 Location link copied to clipboard!');
            }).catch(() => {
                showToast(address);
            });
        });
    }

    // --------------------------------------------------
    // 9. Add to Calendar Generator (.ics download)
    // --------------------------------------------------
    const calendarBtn = document.getElementById('add-to-calendar-btn');
    if (calendarBtn) {
        calendarBtn.addEventListener('click', () => {
            const icsContent = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//Abdallah and M Wedding//EN',
                'BEGIN:VEVENT',
                'SUMMARY:Wedding of Mustafa Khan | M',
                'DESCRIPTION:Join us for the wedding celebration of Mustafa Khan at PCSIR Phase 2 starting at 7:00 PM (Saturday 22 August 2026 / 9 Safar 1448 AH). Location:',
                'LOCATION:PCSIR Phase 2',
                'DTSTART:20260822T210000',
                'DTEND:20260823T020000',
                'STATUS:CONFIRMED',
                'END:VEVENT',
                'END:VCALENDAR'
            ].join('\n');

            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', 'Mustafa Khan Wedding.ics');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showToast(currentLang === 'ar' ? '📅 تم إضافة الموعد لتقويمك!' : '📅 Wedding event added to your calendar!');
        });
    }

    // --------------------------------------------------
    // 10. Toast Helper Notification
    // --------------------------------------------------
    const toast = document.getElementById('toast');
    let toastTimeout = null;

    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');

        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3200);
    }
});
