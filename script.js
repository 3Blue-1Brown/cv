/**
 * CV Lý Công Minh - Interactive Logic
 * Features: Dark/Light Mode, Print to PDF, Project Filtering,
 * Clipboard Copy with Toast, and Optional Avatar Preview/Reset.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  /* --------------------------------------------------
     1. THEME SWITCHER (DARK / LIGHT)
     -------------------------------------------------- */
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const htmlRoot = document.documentElement;

  // Retrieve saved theme or default to 'dark'
  const savedTheme = localStorage.getItem('lycongminh_cv_theme') || 'dark';
  htmlRoot.setAttribute('data-theme', savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      htmlRoot.setAttribute('data-theme', newTheme);
      localStorage.setItem('lycongminh_cv_theme', newTheme);
      
      showToast(`Đã chuyển sang giao diện ${newTheme === 'dark' ? 'Tối' : 'Sáng'}`);
    });
  }

  /* --------------------------------------------------
     2. PRINT / EXPORT PDF
     -------------------------------------------------- */
  const printBtn = document.getElementById('printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  /* --------------------------------------------------
     3. SHARE CV LINK
     -------------------------------------------------- */
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const url = window.location.href;
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Lý Công Minh - CV',
            text: 'CV Lý Công Minh - Backend / Fullstack Developer',
            url: url
          });
          return;
        } catch (err) {
          // If user cancelled or failed, fall back to copy
        }
      }

      // Fallback copy to clipboard
      copyToClipboard(url, 'Đã sao chép liên kết CV vào bộ nhớ tạm!');
    });
  }

  /* --------------------------------------------------
     4. COPY CONTACT BUTTONS
     -------------------------------------------------- */
  const copyButtons = document.querySelectorAll('.copy-mini-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const textToCopy = btn.getAttribute('data-copy');
      if (textToCopy) {
        copyToClipboard(textToCopy, `Đã sao chép: ${textToCopy}`);
      }
    });
  });

  /* --------------------------------------------------
     5. PROJECT FILTERING
     -------------------------------------------------- */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (filterValue === 'all' || cardCategory === filterValue) {
          card.classList.remove('fade-out');
        } else {
          card.classList.add('fade-out');
        }
      });
    });
  });

  /* --------------------------------------------------
     6. OPTIONAL AVATAR UPLOAD / RESET (BLANK BY DEFAULT)
     -------------------------------------------------- */
  const avatarCard = document.getElementById('avatarCard');
  const avatarPlaceholder = document.getElementById('avatarPlaceholder');
  const avatarImage = document.getElementById('avatarImage');
  const avatarUpload = document.getElementById('avatarUpload');
  const toggleUploadBtn = document.getElementById('toggleUploadBtn');

  // By default, avatar is kept blank as requested
  if (toggleUploadBtn && avatarUpload && avatarCard) {
    toggleUploadBtn.addEventListener('click', () => {
      if (!avatarImage.classList.contains('hidden')) {
        // If image is currently displayed, remove it and return to blank
        resetAvatarToBlank();
      } else {
        // Trigger file input
        avatarUpload.click();
      }
    });

    avatarCard.addEventListener('click', () => {
      if (avatarImage.classList.contains('hidden')) {
        avatarUpload.click();
      }
    });

    avatarUpload.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          avatarImage.src = event.target.result;
          avatarImage.classList.remove('hidden');
          avatarPlaceholder.classList.add('hidden');
          
          toggleUploadBtn.innerHTML = `
            <i data-lucide="trash-2"></i>
            <span>Để trống ảnh</span>
          `;
          if (typeof lucide !== 'undefined') lucide.createIcons();
          showToast('Đã tải ảnh lên thành công!');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  function resetAvatarToBlank() {
    avatarImage.src = '';
    avatarImage.classList.add('hidden');
    avatarPlaceholder.classList.remove('hidden');
    avatarUpload.value = '';
    
    toggleUploadBtn.innerHTML = `
      <i data-lucide="camera"></i>
      <span>Thêm ảnh (Tùy chọn)</span>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    showToast('Đã để trống khung ảnh đại diện!');
  }

  /* --------------------------------------------------
     7. TOAST NOTIFICATION UTILITY
     -------------------------------------------------- */
  let toastTimeout;
  function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.classList.add('show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  function copyToClipboard(text, successMsg) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg);
      }).catch(() => {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(successMsg);
    } catch (err) {
      showToast('Không thể sao chép tự động!');
    }
    document.body.removeChild(textArea);
  }
});
