/**
 * CV LÝ CÔNG MINH - INTERACTIVE LOGIC
 * Features: Dark/Light Mode toggle, Print/Export PDF, Share link with Toast,
 * and Optional Avatar Photo Upload/Reset.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  /* --------------------------------------------------
     1. THEME TOGGLE (LIGHT / DARK)
     Default: 'light' (dễ nhìn, trang nhã, sắc nét)
     -------------------------------------------------- */
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const htmlRoot = document.documentElement;

  // Retrieve saved theme or default to 'light'
  const savedTheme = localStorage.getItem('minh_cv_theme') || 'light';
  htmlRoot.setAttribute('data-theme', savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';

      htmlRoot.setAttribute('data-theme', newTheme);
      localStorage.setItem('minh_cv_theme', newTheme);

      // Re-trigger icon render if needed
      if (typeof lucide !== 'undefined') lucide.createIcons();

      showToast(`Đã chuyển sang giao diện ${newTheme === 'dark' ? 'Tối' : 'Sáng'}`);
    });
  }

  /* --------------------------------------------------
     2. EXPORT / PRINT PDF
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
      const currentUrl = window.location.href;

      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Lý Công Minh — Backend / Fullstack Developer',
            text: 'Xem CV của Lý Công Minh',
            url: currentUrl
          });
          return;
        } catch (err) {
          // Fallback to clipboard if user cancels or browser rejects
        }
      }

      copyToClipboard(currentUrl, 'Đã sao chép liên kết CV vào bộ nhớ tạm!');
    });
  }

  /* --------------------------------------------------
     4. OPTIONAL AVATAR UPLOAD & RESET
     -------------------------------------------------- */
  const avatarWrapper = document.getElementById('avatarWrapper');
  const avatarUploadBtn = document.getElementById('avatarUploadBtn');
  const avatarFileInput = document.getElementById('avatarFileInput');
  const avatarMonogram = document.getElementById('avatarMonogram');
  const avatarImg = document.getElementById('avatarImg');
  const avatarBtnText = document.getElementById('avatarBtnText');

  let hasCustomPhoto = false;

  function triggerAvatarUpload() {
    if (hasCustomPhoto) {
      // Toggle back to monogram or allow re-upload
      const confirmRemove = confirm('Bạn có muốn gỡ ảnh đại diện và quay về chữ viết tắt tối giản không?');
      if (confirmRemove) {
        avatarImg.src = '';
        avatarImg.classList.add('hidden');
        avatarMonogram.classList.remove('hidden');
        hasCustomPhoto = false;
        if (avatarBtnText) avatarBtnText.textContent = 'Thêm ảnh';
        avatarFileInput.value = '';
        showToast('Đã quay về chữ viết tắt tối giản');
      } else {
        avatarFileInput.click();
      }
    } else {
      avatarFileInput.click();
    }
  }

  if (avatarWrapper) {
    avatarWrapper.addEventListener('click', triggerAvatarUpload);
  }

  if (avatarUploadBtn) {
    avatarUploadBtn.addEventListener('click', triggerAvatarUpload);
  }

  if (avatarFileInput) {
    avatarFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          showToast('Vui lòng chọn tệp hình ảnh hợp lệ');
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          avatarImg.src = event.target.result;
          avatarImg.classList.remove('hidden');
          avatarMonogram.classList.add('hidden');
          hasCustomPhoto = true;
          if (avatarBtnText) avatarBtnText.textContent = 'Đổi / Gỡ ảnh';
          showToast('Đã tải ảnh đại diện lên thành công!');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  /* --------------------------------------------------
     5. TOAST & CLIPBOARD HELPER FUNCTIONS
     -------------------------------------------------- */
  let toastTimer = null;

  function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMessage');

    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  function copyToClipboard(text, successMessage) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => showToast(successMessage || 'Đã sao chép!'))
        .catch(() => fallbackCopy(text, successMessage));
    } else {
      fallbackCopy(text, successMessage);
    }
  }

  function fallbackCopy(text, successMessage) {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast(successMessage || 'Đã sao chép!');
    } catch (err) {
      showToast('Không thể sao chép, vui lòng sao chép thủ công');
    }
  }
});
