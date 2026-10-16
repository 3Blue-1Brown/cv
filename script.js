/**
 * CV LỲ CÔNG MINH - INTERACTIVE LOGIC
 * Features: Dark/Light Mode toggle, Print/Export PDF A4, Share link with Toast,
 * and Persistent Avatar Photo (LocalStorage & optional avatar.jpg file).
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
            title: 'Lỳ Công Minh — Junior Full Stack Web Developer',
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
     4. TẢI, LƯU VÀ KHÔI PHỤC ẢNH ĐẠI DIỆN (LOCALSTORAGE & FILE)
     -------------------------------------------------- */
  const avatarCircle = document.getElementById('avatarCircle');
  const avatarUploadBtn = document.getElementById('avatarUploadBtn');
  const avatarFileInput = document.getElementById('avatarFileInput');
  const avatarPlaceholder = document.getElementById('avatarPlaceholder');
  const avatarImg = document.getElementById('avatarImg');
  const avatarBtnText = document.getElementById('avatarBtnText');

  const STORAGE_KEY = 'lycongminh_avatar_data';
  let hasCustomPhoto = false;

  function setAvatarDisplay(imageSrc) {
    if (!avatarImg || !avatarPlaceholder) return;
    avatarImg.src = imageSrc;
    avatarImg.classList.remove('hidden');
    avatarPlaceholder.classList.add('hidden');
    hasCustomPhoto = true;
    if (avatarBtnText) avatarBtnText.textContent = 'Đổi / Gỡ ảnh';
  }

  function clearAvatarDisplay() {
    if (!avatarImg || !avatarPlaceholder) return;
    avatarImg.src = '';
    avatarImg.classList.add('hidden');
    avatarPlaceholder.classList.remove('hidden');
    hasCustomPhoto = false;
    if (avatarBtnText) avatarBtnText.textContent = 'Chọn ảnh';
    if (avatarFileInput) avatarFileInput.value = '';
    localStorage.removeItem(STORAGE_KEY);
  }

  // Khôi phục ảnh đã lưu từ LocalStorage khi mở trang
  const savedAvatar = localStorage.getItem(STORAGE_KEY);
  if (savedAvatar) {
    setAvatarDisplay(savedAvatar);
  } else {
    // Nếu chưa lưu trong LocalStorage, thử kiểm tra file tĩnh avatar.jpg hoặc avatar.png trong thư mục
    const testImg = new Image();
    testImg.onload = () => {
      setAvatarDisplay(testImg.src);
    };
    testImg.src = 'avatar.jpg';
  }

  function triggerAvatarUpload() {
    if (hasCustomPhoto) {
      const confirmRemove = confirm('Bạn có muốn gỡ ảnh đại diện hiện tại không?');
      if (confirmRemove) {
        clearAvatarDisplay();
        showToast('Đã xóa ảnh và để trống khung ảnh');
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

  // Tối ưu và nén ảnh bằng Canvas trước khi lưu vào LocalStorage
  if (avatarFileInput) {
    avatarFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showToast('Vui lòng chọn tệp hình ảnh hợp lệ (jpg, png, webp)');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const rawSrc = event.target.result;
        const img = new Image();

        img.onload = () => {
          // Resize ảnh về kích thước tối đa 400x400 để tiết kiệm bộ nhớ LocalStorage (~40KB-70KB)
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Chuyển thành chuỗi Base64 định dạng JPEG chất lượng cao
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);

          try {
            localStorage.setItem(STORAGE_KEY, optimizedDataUrl);
          } catch (storageErr) {
            console.warn('LocalStorage đầy hoặc không khả dụng:', storageErr);
          }

          setAvatarDisplay(optimizedDataUrl);
          showToast('Đã tải và lưu ảnh thẻ thành công!');
        };

        img.src = rawSrc;
      };

      reader.readAsDataURL(file);
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
