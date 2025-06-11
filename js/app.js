// استرجاع عناصر DOM
const linkForm = document.getElementById('add-link-form');
const urlInput = document.getElementById('url');
const titleInput = document.getElementById('title');
const categoryInput = document.getElementById('category');
const descriptionInput = document.getElementById('description');
const linksGrid = document.getElementById('links-grid');
const categoryFilter = document.getElementById('category-filter');
const searchInput = document.getElementById('search');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editIdInput = document.getElementById('edit-id');
const editUrlInput = document.getElementById('edit-url');
const editTitleInput = document.getElementById('edit-title');
const editCategoryInput = document.getElementById('edit-category');
const editDescriptionInput = document.getElementById('edit-description');
const closeModal = document.querySelector('.close-modal');
const themeToggle = document.getElementById('theme-toggle');

// تخزين الروابط
let links = JSON.parse(localStorage.getItem('links')) || [];

// التصنيفات المتاحة
const categories = {
    general: 'عام',
    work: 'العمل',
    education: 'التعليم',
    entertainment: 'الترفيه',
    social: 'التواصل الاجتماعي',
    other: 'أخرى'
};

// إنشاء معرف فريد
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// عرض الروابط
function displayLinks(linksToDisplay = links) {
    linksGrid.innerHTML = '';
    
    if (linksToDisplay.length === 0) {
        linksGrid.innerHTML = '<p class="no-links">لا توجد روابط محفوظة حالياً</p>';
        return;
    }
    
    const linkTemplate = document.getElementById('link-template');
    
    linksToDisplay.forEach(link => {
        const linkElement = document.importNode(linkTemplate.content, true);
        
        const linkDate = linkElement.querySelector('.link-date');
        const linkTitle = linkElement.querySelector('.link-title');
        const linkCategory = linkElement.querySelector('.link-category');
        const linkDescription = linkElement.querySelector('.link-description');
        const visitLink = linkElement.querySelector('.visit-link');
        const editButton = linkElement.querySelector('.edit-link');
        const deleteButton = linkElement.querySelector('.delete-link');
        
        // تنسيق التاريخ
        const date = new Date(link.date);
        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        
        linkDate.textContent = formattedDate;
        linkTitle.textContent = link.title;
        linkCategory.textContent = categories[link.category];
        linkDescription.textContent = link.description || 'لا يوجد وصف';
        visitLink.href = link.url;
        
        // إضافة معالجات الأحداث
        editButton.addEventListener('click', () => openEditModal(link));
        deleteButton.addEventListener('click', () => deleteLink(link.id));
        
        linksGrid.appendChild(linkElement);
    });
}

// إضافة رابط جديد
function addLink(e) {
    e.preventDefault();
    
    const newLink = {
        id: generateId(),
        url: urlInput.value,
        title: titleInput.value,
        category: categoryInput.value,
        description: descriptionInput.value,
        date: new Date().toISOString()
    };
    
    links.unshift(newLink);
    saveLinks();
    displayLinks();
    
    // إعادة تعيين النموذج
    linkForm.reset();
    
    // عرض إشعار نجاح
    showNotification('تم إضافة الرابط بنجاح', 'success');
}

// المتغيرات الخاصة بنافذة تأكيد الحذف
const deleteConfirmModal = document.getElementById('delete-confirm-modal');
const closeDeleteModal = document.getElementById('close-delete-modal');
const cancelDelete = document.getElementById('cancel-delete');
const confirmDelete = document.getElementById('confirm-delete');
let linkIdToDelete = null;

// حذف رابط
function deleteLink(id) {
    // تخزين معرف الرابط المراد حذفه
    linkIdToDelete = id;
    
    // عرض نافذة تأكيد الحذف
    deleteConfirmModal.style.display = 'block';
}

// تنفيذ حذف الرابط
function confirmDeleteLink() {
    if (linkIdToDelete) {
        links = links.filter(link => link.id !== linkIdToDelete);
        saveLinks();
        displayLinks();
        
        // إغلاق نافذة التأكيد
        closeDeleteConfirmModal();
        
        // عرض إشعار نجاح
        showNotification('تم حذف الرابط بنجاح', 'success');
        
        // إعادة تعيين المعرف
        linkIdToDelete = null;
    }
}

// إغلاق نافذة تأكيد الحذف
function closeDeleteConfirmModal() {
    deleteConfirmModal.style.display = 'none';
}

// فتح نافذة التعديل
function openEditModal(link) {
    editIdInput.value = link.id;
    editUrlInput.value = link.url;
    editTitleInput.value = link.title;
    editCategoryInput.value = link.category;
    editDescriptionInput.value = link.description || '';
    
    editModal.style.display = 'block';
}

// إغلاق نافذة التعديل
function closeEditModal() {
    editModal.style.display = 'none';
}

// تحديث رابط
function updateLink(e) {
    e.preventDefault();
    
    const linkId = editIdInput.value;
    const linkIndex = links.findIndex(link => link.id === linkId);
    
    if (linkIndex !== -1) {
        links[linkIndex] = {
            ...links[linkIndex],
            url: editUrlInput.value,
            title: editTitleInput.value,
            category: editCategoryInput.value,
            description: editDescriptionInput.value
        };
        
        saveLinks();
        displayLinks();
        closeEditModal();
        
        // عرض إشعار نجاح
        showNotification('تم تحديث الرابط بنجاح', 'success');
    }
}

// تصفية الروابط حسب التصنيف
function filterLinksByCategory(category) {
    if (category === 'all') {
        displayLinks();
    } else {
        const filteredLinks = links.filter(link => link.category === category);
        displayLinks(filteredLinks);
    }
}

// البحث في الروابط
function searchLinks(query) {
    query = query.toLowerCase();
    
    if (query === '') {
        displayLinks();
    } else {
        const filteredLinks = links.filter(link => 
            link.title.toLowerCase().includes(query) || 
            link.description.toLowerCase().includes(query) ||
            categories[link.category].toLowerCase().includes(query)
        );
        
        displayLinks(filteredLinks);
    }
}

// حفظ الروابط في التخزين المحلي
function saveLinks() {
    localStorage.setItem('links', JSON.stringify(links));
}

// عرض إشعار
function showNotification(message, type) {
    // إزالة أي إشعارات سابقة
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // إنشاء إشعار جديد
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // إظهار الإشعار
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // إخفاء الإشعار بعد 3 ثوانٍ
    setTimeout(() => {
        notification.classList.remove('show');
        
        // إزالة الإشعار من DOM بعد انتهاء الانتقال
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// تبديل الوضع المظلم
function toggleDarkMode() {
    const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
    const themeIcon = themeToggle.querySelector('i');
    const themeText = themeToggle.querySelector('span');
    
    // إضافة تأثير انتقالي للزر
    themeToggle.classList.add('animating');
    
    // تأثير دوران للأيقونة
    themeIcon.style.transform = 'rotate(360deg)';
    
    setTimeout(() => {
        if (isDarkMode) {
            // التبديل إلى الوضع الفاتح
            document.body.removeAttribute('data-theme');
            themeIcon.className = 'fas fa-moon';
            themeText.textContent = 'الوضع المظلم';
            localStorage.setItem('theme', 'light');
        } else {
            // التبديل إلى الوضع المظلم
            document.body.setAttribute('data-theme', 'dark');
            themeIcon.className = 'fas fa-sun';
            themeText.textContent = 'الوضع الفاتح';
            localStorage.setItem('theme', 'dark');
        }
        
        // إزالة تأثير الدوران بعد الانتهاء
        setTimeout(() => {
            themeIcon.style.transform = '';
            themeToggle.classList.remove('animating');
        }, 300);
    }, 150);
}

// تحميل الوضع المحفوظ
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = themeToggle.querySelector('i');
    const themeText = themeToggle.querySelector('span');
    
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
        themeText.textContent = 'الوضع الفاتح';
    }
}

// معالجات الأحداث
linkForm.addEventListener('submit', addLink);
editForm.addEventListener('submit', updateLink);
closeModal.addEventListener('click', closeEditModal);
categoryFilter.addEventListener('change', () => filterLinksByCategory(categoryFilter.value));
searchInput.addEventListener('input', () => searchLinks(searchInput.value));
themeToggle.addEventListener('click', toggleDarkMode);

// إضافة تأثير انتقالي بطيء لرابط حول
const aboutLink = document.querySelector('.about-link');
aboutLink.addEventListener('click', function(e) {
    e.preventDefault();
    const aboutSection = document.getElementById('about');
    
    // إضافة فئة للتأثير
    aboutLink.classList.add('clicked');
    
    // الانتقال البطيء إلى قسم حول
    setTimeout(() => {
        window.scrollTo({
            top: aboutSection.offsetTop,
            behavior: 'smooth'
        });
        
        // إزالة الفئة بعد الانتقال
        setTimeout(() => {
            aboutLink.classList.remove('clicked');
        }, 800);
    }, 300);
});

// معالجات الأحداث لنافذة تأكيد الحذف
closeDeleteModal.addEventListener('click', closeDeleteConfirmModal);
cancelDelete.addEventListener('click', closeDeleteConfirmModal);
confirmDelete.addEventListener('click', confirmDeleteLink);

// إغلاق النوافذ المنبثقة عند النقر خارجها
window.addEventListener('click', (e) => {
    if (e.target === editModal) {
        closeEditModal();
    }
    if (e.target === deleteConfirmModal) {
        closeDeleteConfirmModal();
    }
});

// إضافة روابط افتراضية إذا لم تكن هناك روابط
if (links.length === 0) {
    links = [
        {
            id: generateId(),
            url: 'https://www.google.com',
            title: 'جوجل',
            category: 'general',
            description: 'محرك البحث الأكثر شهرة في العالم',
            date: new Date().toISOString()
        },
        {
            id: generateId(),
            url: 'https://www.youtube.com',
            title: 'يوتيوب',
            category: 'entertainment',
            description: 'منصة مشاركة الفيديو الأكثر شعبية',
            date: new Date().toISOString()
        },
        {
            id: generateId(),
            url: 'https://www.github.com',
            title: 'جيثب',
            category: 'work',
            description: 'منصة استضافة الشيفرة المصدرية والتعاون',
            date: new Date().toISOString()
        }
    ];
    saveLinks();
}

// عرض الروابط عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    displayLinks();
    loadSavedTheme();
});