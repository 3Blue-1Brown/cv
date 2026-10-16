/**
 * CV LỲ CÔNG MINH - INTERACTIVE LOGIC
 * Features: Dark/Light Mode toggle, Print/Export PDF A4, Share link with Toast,
 * and Optional Avatar Photo Upload/Reset.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Khởi tạo Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  /* --------------------------------------------------
     1. CHUYỂN ĐỔI GIAO DIỆN SÁNG / TỐI (LIGHT / DARK)
     Mặc định: 'light' (chuẩn mực theo ảnh mẫu)
     -------------------------------------------------- */
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const htmlRoot = document.documentElement;

  const savedTheme = localStorage.getItem('lycongminh_cv_theme') || 'light';
  htmlRoot.setAttribute('data-theme', savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';

      htmlRoot.setAttribute('data-theme', newTheme);
      localStorage.setItem('lycongminh_cv_theme', newTheme);

      if (typeof lucide !== 'undefined') lucide.createIcons();

      showToast(`Đã chuyển sang giao diện ${newTheme === 'dark' ? 'Tối' : 'Sáng'}`);
    });
  }

  /* --------------------------------------------------
     2. XUẤT FILE PDF / IN ẤN CHUẨN A4
     -------------------------------------------------- */
  const printBtn = document.getElementById('printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  /* --------------------------------------------------
     3. CHIA SẺ LIÊN KẾT CV
     -------------------------------------------------- */
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const currentUrl = window.location.href;

      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Lỳ Công Minh — IT Intern / Junior Web Developer',
            text: 'Hồ sơ CV của Lỳ Công Minh',
            url: currentUrl
          });
          return;
        } catch (err) {
          // Bỏ qua nếu người dùng hủy
        }
      }

      copyToClipboard(currentUrl, 'Đã sao chép liên kết CV vào bộ nhớ tạm!');
    });
  }

  /* --------------------------------------------------
     4. TẢI ẢNH CHÂN DUNG TRÒN & GỠ ẢNH
     -------------------------------------------------- */
  const avatarCircle = document.getElementById('avatarCircle');
  const avatarUploadBtn = document.getElementById('avatarUploadBtn');
  const avatarFileInput = document.getElementById('avatarFileInput');
  const avatarPlaceholder = document.getElementById('avatarPlaceholder');
  const avatarImg = document.getElementById('avatarImg');
  const avatarBtnText = document.getElementById('avatarBtnText');

  let hasCustomPhoto = false;

  function triggerAvatarUpload() {
    if (hasCustomPhoto) {
      const confirmRemove = confirm('Bạn có muốn gỡ ảnh thẻ hiện tại không?');
      if (confirmRemove) {
        avatarImg.src = '';
        avatarImg.classList.add('hidden');
        avatarPlaceholder.classList.remove('hidden');
        hasCustomPhoto = false;
        if (avatarBtnText) avatarBtnText.textContent = 'Chọn ảnh';
        avatarFileInput.value = '';
        showToast('Đã để trống khung ảnh');
      } else {
        avatarFileInput.click();
      }
    } else {
      avatarFileInput.click();
    }
  }

  if (avatarCircle) {
    avatarCircle.addEventListener('click', triggerAvatarUpload);
  }

  if (avatarUploadBtn) {
    avatarUploadBtn.addEventListener('click', triggerAvatarUpload);
  }

  if (avatarFileInput) {
    avatarFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          showToast('Vui lòng chọn tệp hình ảnh hợp lệ (jpg, png, webp)');
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          avatarImg.src = event.target.result;
          avatarImg.classList.remove('hidden');
          avatarPlaceholder.classList.add('hidden');
          hasCustomPhoto = true;
          if (avatarBtnText) avatarBtnText.textContent = 'Đổi / Gỡ ảnh';
          showToast('Đã tải ảnh chân dung lên thành công!');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  /* --------------------------------------------------
     5. TOAST & CLIPBOARD HELPER
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
      showToast('Không thể sao chép tự động');
    }
  }
});
