// ==========================================================================
// QUÁN CAFE ĐỒI CHILL - INTERACTIVE SCRIPT (CART, TOTAL CALCULATOR & BOOKING)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Navigation Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
      });
    });
  }

  // 2. Menu Category Filter
  const filterBtns = document.querySelectorAll('.filter-btn');
  const menuCards = document.querySelectorAll('.menu-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');
      menuCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        const isNoel = card.getAttribute('data-noel') === 'true';
        if (filterValue === 'all') {
          card.style.display = 'flex';
        } else if (filterValue === 'noel') {
          card.style.display = isNoel ? 'flex' : 'none';
        } else if (category === filterValue) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 3. Automatic Cart & Combo Total Calculator
  const PACKAGE_FEES = {
    'Trọn gói lều': 150000,
    'Gói Lều Giáng Sinh Cozy': 220000,
    'Chỉ thuê bếp nướng': 80000,
    'Bàn cafe thường': 0
  };

  // Map of item label -> { qty, unitPrice }
  const cartMap = new Map([
    ['Cà phê ngọt ngào (35k)', { qty: 1, unitPrice: 35000 }],
    ['Mỳ lửa Hàn Quốc (55k)', { qty: 1, unitPrice: 55000 }]
  ]);

  const selectItemBtns = document.querySelectorAll('.btn-select-item');
  const selectedItemsListEl = document.getElementById('selectedItemsList');
  const cartBreakdownListEl = document.getElementById('cartBreakdownList');
  const totalBillAmountEl = document.getElementById('totalBillAmount');
  const packageFeeLabelEl = document.getElementById('packageFeeLabel');
  const floatingCartCountEl = document.getElementById('floatingCartCount');
  const floatingCartTotalEl = document.getElementById('floatingCartTotal');
  const servicePackageSelect = document.getElementById('servicePackage');

  function parsePriceFromLabel(label) {
    const match = label.match(/(\d+)\s*k/i);
    return match ? parseInt(match[1], 10) * 1000 : 35000;
  }

  function formatVND(amount) {
    return amount.toLocaleString('vi-VN') + 'đ';
  }

  function calculateTotals() {
    const currentPkg = servicePackageSelect ? servicePackageSelect.value : 'Trọn gói lều';
    const pkgFee = PACKAGE_FEES[currentPkg] ?? 0;

    let itemsTotal = 0;
    let totalCount = 0;
    cartMap.forEach((entry) => {
      itemsTotal += entry.qty * entry.unitPrice;
      totalCount += entry.qty;
    });

    return {
      currentPkg,
      pkgFee,
      itemsTotal,
      totalCount,
      grandTotal: pkgFee + itemsTotal
    };
  }

  function updateSelectedItemsUI() {
    const { currentPkg, pkgFee, totalCount, grandTotal } = calculateTotals();

    if (packageFeeLabelEl) {
      packageFeeLabelEl.textContent = `${currentPkg}: +${formatVND(pkgFee)}`;
    }

    if (selectedItemsListEl) {
      if (cartMap.size === 0) {
        selectedItemsListEl.textContent = 'Chưa chọn món kèm theo (Nhấn "+ Chọn món" ở thực đơn trên)';
      } else {
        const summaryParts = [];
        cartMap.forEach((val, key) => {
          summaryParts.push(val.qty > 1 ? `${key} x${val.qty}` : key);
        });
        selectedItemsListEl.textContent = summaryParts.join(', ');
      }
    }

    if (cartBreakdownListEl) {
      cartBreakdownListEl.innerHTML = '';
      cartMap.forEach((val, key) => {
        const row = document.createElement('div');
        row.className = 'cart-line-item';
        row.innerHTML = `
          <span>• ${key}</span>
          <div class="cart-line-controls">
            <button type="button" class="qty-mini-btn" data-action="dec" data-item="${key}" aria-label="Giảm số lượng">-</button>
            <span>${val.qty}</span>
            <button type="button" class="qty-mini-btn" data-action="inc" data-item="${key}" aria-label="Tăng số lượng">+</button>
            <strong style="min-width: 68px; text-align: right; color: var(--sand-light);">${formatVND(val.qty * val.unitPrice)}</strong>
          </div>
        `;
        cartBreakdownListEl.appendChild(row);
      });

      cartBreakdownListEl.querySelectorAll('.qty-mini-btn').forEach((miniBtn) => {
        miniBtn.addEventListener('click', () => {
          const itemKey = miniBtn.getAttribute('data-item');
          const action = miniBtn.getAttribute('data-action');
          const existing = cartMap.get(itemKey);
          if (!existing) return;

          if (action === 'inc') {
            existing.qty += 1;
          } else if (action === 'dec') {
            existing.qty -= 1;
            if (existing.qty <= 0) {
              cartMap.delete(itemKey);
            }
          }
          updateSelectedItemsUI();
        });
      });
    }

    if (totalBillAmountEl) {
      totalBillAmountEl.textContent = formatVND(grandTotal);
    }

    if (floatingCartCountEl) {
      floatingCartCountEl.textContent = `${totalCount} món`;
    }

    if (floatingCartTotalEl) {
      floatingCartTotalEl.textContent = `Tổng: ${formatVND(grandTotal)}`;
    }

    selectItemBtns.forEach((btn) => {
      const itemName = btn.getAttribute('data-item');
      if (cartMap.has(itemName)) {
        const q = cartMap.get(itemName).qty;
        btn.classList.add('selected');
        btn.textContent = q > 1 ? `✓ Đã chọn (${q})` : '✓ Đã chọn';
      } else {
        btn.classList.remove('selected');
        btn.textContent = '+ Chọn món';
      }
    });
  }

  selectItemBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const itemName = btn.getAttribute('data-item');
      if (cartMap.has(itemName)) {
        cartMap.delete(itemName);
      } else {
        cartMap.set(itemName, {
          qty: 1,
          unitPrice: parsePriceFromLabel(itemName)
        });
      }
      updateSelectedItemsUI();
    });
  });

  // 4. Sync Package Cards & Select Dropdown
  const packageCards = document.querySelectorAll('.package-option-card');

  packageCards.forEach((card) => {
    card.addEventListener('click', () => {
      const pkg = card.getAttribute('data-package');
      packageCards.forEach((c) => c.classList.remove('active'));
      card.classList.add('active');
      if (servicePackageSelect && pkg) {
        servicePackageSelect.value = pkg;
        updateSelectedItemsUI();
      }
    });
  });

  if (servicePackageSelect) {
    servicePackageSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      packageCards.forEach((card) => {
        if (card.getAttribute('data-package') === val) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });
      updateSelectedItemsUI();
    });
  }

  updateSelectedItemsUI();

  // 5. Booking Form Submit -> Alert "Đơn phượt đồi đã chốt!" + Ticket + Zalo
  const bookingForm = document.getElementById('campingBookingForm');
  const successBanner = document.getElementById('bookingSuccessBanner');
  const successDetail = document.getElementById('bookingSuccessDetail');
  const ticketCodeBadge = document.getElementById('ticketCodeBadge');
  const copyTicketBtn = document.getElementById('copyTicketBtn');
  let latestOrderText = '';

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const customerName = document.getElementById('customerName')?.value.trim() || 'nguyễn Thúy Quỳnh';
      const customerPhone = document.getElementById('customerPhone')?.value.trim() || '0962210196';
      const bookingTime = document.getElementById('bookingTime')?.value.trim() || '6g-20g';
      const servicePackage = document.getElementById('servicePackage')?.value || 'Trọn gói lều';
      const bookingNote = document.getElementById('bookingNote')?.value.trim() || '';
      const { grandTotal } = calculateTotals();

      const ticketCode = '#DC-' + Math.floor(1000 + Math.random() * 9000);
      const itemsText = selectedItemsListEl ? selectedItemsListEl.textContent : '';

      // Show required alert message
      alert('Đơn phượt đồi đã chốt!');

      latestOrderText = `[ĐƠN PHƯỢT ĐỒI CHILL ${ticketCode}] Khách: ${customerName} (${customerPhone}) | Giờ: ${bookingTime} | Gói: ${servicePackage} | Món: ${itemsText} | Tổng: ${formatVND(grandTotal)} | Ghi chú: ${bookingNote}`;

      // Save to localStorage for order history
      try {
        const savedOrders = JSON.parse(localStorage.getItem('doiChillOrders') || '[]');
        savedOrders.unshift({
          ticketCode,
          customerName,
          customerPhone,
          bookingTime,
          servicePackage,
          itemsText,
          total: formatVND(grandTotal),
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('doiChillOrders', JSON.stringify(savedOrders.slice(0, 20)));
      } catch (_) {}

      if (ticketCodeBadge) {
        ticketCodeBadge.textContent = ticketCode;
      }

      if (successBanner && successDetail) {
        successDetail.textContent = `Khách hàng: ${customerName} (${customerPhone}) • Khung giờ: ${bookingTime} • Gói: ${servicePackage} • Tổng thanh toán: ${formatVND(grandTotal)}. Hẹn gặp bạn bên ánh lửa trại Đồi Chill Phước Long!`;
        successBanner.classList.add('show');
      }
    });
  }

  if (copyTicketBtn) {
    copyTicketBtn.addEventListener('click', () => {
      if (!latestOrderText) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(latestOrderText).then(() => {
          copyTicketBtn.textContent = '✓ Đã sao chép mã vé!';
          setTimeout(() => {
            copyTicketBtn.textContent = '📋 Sao Chép Mã Vé Đặt Lều';
          }, 2000);
        });
      }
    });
  }

  // ==========================================================================
  // 6. NOEL SPECIAL: CANVAS SNOWFALL SYSTEM (TOGGLEABLE & PERSISTENT)
  // ==========================================================================
  const canvas = document.getElementById('snowCanvas');
  let snowActive = localStorage.getItem('doiChillSnow') !== 'off';
  let animationId = null;
  const toggleSnowBtns = document.querySelectorAll('.toggle-snow-btn');

  function updateSnowButtons() {
    toggleSnowBtns.forEach((b) => {
      if (snowActive) {
        b.classList.add('active');
        b.innerHTML = '❄️ Tuyết Rơi: BẬT';
      } else {
        b.classList.remove('active');
        b.innerHTML = '❄️ Tuyết Rơi: TẮT';
      }
    });
  }

  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const flakeCount = Math.min(85, Math.floor(window.innerWidth / 15));
    const flakes = [];

    for (let i = 0; i < flakeCount; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2.8 + 1,
        d: Math.random() * flakeCount,
        vx: Math.random() * 0.8 - 0.4,
        vy: Math.random() * 1.2 + 0.6,
        alpha: Math.random() * 0.6 + 0.3
      });
    }

    function drawSnow() {
      if (!snowActive) {
        ctx.clearRect(0, 0, width, height);
        animationId = null;
        return;
      }
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        ctx.save();
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, false);
        ctx.fillStyle = `rgba(240, 248, 255, ${f.alpha})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
        ctx.restore();

        f.y += f.vy;
        f.x += f.vx + Math.sin(f.d) * 0.5;
        f.d += 0.015;

        if (f.y > height) {
          f.y = -5;
          f.x = Math.random() * width;
        }
        if (f.x > width) f.x = 0;
        if (f.x < 0) f.x = width;
      }
      animationId = requestAnimationFrame(drawSnow);
    }

    if (snowActive) {
      drawSnow();
    }
    updateSnowButtons();

    toggleSnowBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        snowActive = !snowActive;
        localStorage.setItem('doiChillSnow', snowActive ? 'on' : 'off');
        updateSnowButtons();
        if (snowActive) {
          if (!animationId) drawSnow();
        } else {
          ctx.clearRect(0, 0, width, height);
        }
      });
    });
  }

  // ==========================================================================
  // 7. NOEL TOPBAR CLOSE LISTENER
  // ==========================================================================
  const noelTopbar = document.getElementById('noelTopbar');
  const noelTopbarClose = document.getElementById('noelTopbarClose');
  if (noelTopbarClose && noelTopbar) {
    noelTopbarClose.addEventListener('click', () => {
      noelTopbar.classList.add('closed');
      sessionStorage.setItem('doiChillNoelBannerClosed', 'true');
    });
    if (sessionStorage.getItem('doiChillNoelBannerClosed') === 'true') {
      noelTopbar.classList.add('closed');
    }
  }

  // ==========================================================================
  // 8. NOEL CAMPFIRE & CHILL ACOUSTIC MELODY (WEB AUDIO API)
  // ==========================================================================
  const toggleMusicBtns = document.querySelectorAll('.toggle-music-btn');
  let audioCtx = null;
  let isPlayingMusic = false;
  let musicTimer = null;

  // Gentle pentatonic holiday chime frequencies
  const melodyNotes = [
    659.25, 659.25, 659.25, // E5 E5 E5
    659.25, 659.25, 659.25, // E5 E5 E5
    659.25, 783.99, 523.25, 587.33, 659.25, // E5 G5 C5 D5 E5
    698.46, 698.46, 698.46, 698.46, 698.46, 659.25, 659.25 // F5 F5 F5 F5 F5 E5 E5
  ];

  function playChime(freq, start, duration) {
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.06, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(start);
      osc.stop(start + duration);
    } catch (_) {}
  }

  function startMelody() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    isPlayingMusic = true;
    updateMusicButtons();

    let noteIndex = 0;
    function playStep() {
      if (!isPlayingMusic) return;
      const now = audioCtx.currentTime;
      playChime(melodyNotes[noteIndex % melodyNotes.length], now, 0.42);
      noteIndex++;
      musicTimer = setTimeout(playStep, 400);
    }
    playStep();
  }

  function stopMelody() {
    isPlayingMusic = false;
    if (musicTimer) clearTimeout(musicTimer);
    updateMusicButtons();
  }

  function updateMusicButtons() {
    toggleMusicBtns.forEach((b) => {
      if (isPlayingMusic) {
        b.classList.add('active');
        b.innerHTML = '🎵 Nhạc Noel: BẬT';
      } else {
        b.classList.remove('active');
        b.innerHTML = '🎵 Nhạc Noel: TẮT';
      }
    });
  }

  toggleMusicBtns.forEach((b) => {
    b.addEventListener('click', () => {
      if (isPlayingMusic) {
        stopMelody();
      } else {
        startMelody();
      }
    });
  });
});
