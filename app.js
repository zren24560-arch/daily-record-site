/**
 * 记事本应用 - 主应用逻辑
 * 使用 Supabase 作为后端数据库（ES 模块版本）
 */

// ============================================
// Supabase 配置 - 请替换为你自己的配置
// ============================================
const SUPABASE_URL = 'https://uwzwxnywhgezgzutsfzk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3end4bnl3aGdlemd6dXRzZnprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNTM5NjIsImV4cCI6MjA5NjkyOTk2Mn0.hvOjyMmtXOYmjRV80zPGJvxPb6VBp88WhO-D1732v0k';

// 使用 ES 模块导入 Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// 初始化 Supabase 客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// 应用状态
// ============================================
const state = {
    currentUser: null,
    notes: [],
    currentNote: null,
    saveTimeout: null,
    isSaving: false
};

// ============================================
// DOM 元素引用
// ============================================
const elements = {
    // 屏幕
    loginScreen: document.getElementById('login-screen'),
    appScreen: document.getElementById('app-screen'),
    
    // 登录表单
    emailInput: document.getElementById('email'),
    passwordInput: document.getElementById('password'),
    loginBtn: document.getElementById('login-btn'),
    signupBtn: document.getElementById('signup-btn'),
    loginMessage: document.getElementById('login-message'),
    
    // 应用头部
    userAvatar: document.getElementById('user-avatar'),
    userEmail: document.getElementById('user-email'),
    logoutBtn: document.getElementById('logout-btn'),
    
    // 侧边栏
    newNoteBtn: document.getElementById('new-note-btn'),
    searchInput: document.getElementById('search-input'),
    notesList: document.getElementById('notes-list'),
    
    // 编辑器
    emptyState: document.getElementById('empty-state'),
    editor: document.getElementById('editor'),
    noteTitle: document.getElementById('note-title'),
    noteContent: document.getElementById('note-content'),
    lastSaved: document.getElementById('last-saved'),
    deleteNoteBtn: document.getElementById('delete-note-btn'),
    
    // 模态框
    confirmModal: document.getElementById('confirm-modal'),
    cancelDeleteBtn: document.getElementById('cancel-delete-btn'),
    confirmDeleteBtn: document.getElementById('confirm-delete-btn'),
    
    // Toast
    toast: document.getElementById('toast')
};

// ============================================
// 工具函数
// ============================================

/**
 * 显示消息
 */
function showMessage(element, text, type) {
    type = type || 'error';
    element.textContent = text;
    element.className = 'message ' + type;
    element.classList.remove('hidden');
    
    if (type !== 'loading') {
        setTimeout(function() {
            element.classList.add('hidden');
        }, 5000);
    }
}

/**
 * 显示 Toast 通知
 */
function showToast(message, type) {
    type = type || 'success';
    elements.toast.textContent = message;
    elements.toast.className = 'toast ' + type + ' active';
    
    setTimeout(function() {
        elements.toast.classList.remove('active');
    }, 3000);
}

/**
 * 格式化日期
 */
function formatDate(dateString) {
    var date = new Date(dateString);
    var now = new Date();
    var diffMs = now - date;
    var diffMins = Math.floor(diffMs / 60000);
    var diffHours = Math.floor(diffMs / 3600000);
    var diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return diffMins + ' 分钟前';
    if (diffHours < 24) return diffHours + ' 小时前';
    if (diffDays < 7) return diffDays + ' 天前';
    
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * 获取内容预览
 */
function getPreview(content) {
    if (!content) return '暂无内容';
    return content.replace(/\n/g, ' ').substring(0, 100);
}

/**
 * 切换屏幕
 */
function showScreen(screenName) {
    elements.loginScreen.classList.remove('active');
    elements.appScreen.classList.remove('active');
    
    if (screenName === 'login') {
        elements.loginScreen.classList.add('active');
    } else {
        elements.appScreen.classList.add('active');
    }
}

// ============================================
// 认证功能
// ============================================

/**
 * 注册新用户
 */
async function signUp(email, password) {
    try {
        var result = await supabase.auth.signUp({
            email: email,
            password: password
        });
        
        if (result.error) throw result.error;
        
        showMessage(elements.loginMessage, '注册成功！请检查邮箱验证账号。', 'success');
        return result.data;
    } catch (error) {
        showMessage(elements.loginMessage, '注册失败: ' + error.message, 'error');
        return null;
    }
}

/**
 * 登录
 */
async function signIn(email, password) {
    try {
        var result = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (result.error) throw result.error;
        
        return result.data;
    } catch (error) {
        showMessage(elements.loginMessage, '登录失败: ' + error.message, 'error');
        return null;
    }
}

/**
 * 退出登录
 */
async function signOut() {
    try {
        var result = await supabase.auth.signOut();
        if (result.error) throw result.error;
        
        state.currentUser = null;
        state.notes = [];
        state.currentNote = null;
        
        showScreen('login');
        showToast('已退出登录');
    } catch (error) {
        showToast('退出失败: ' + error.message, 'error');
    }
}

/**
 * 检查当前会话
 */
async function checkSession() {
    try {
        var result = await supabase.auth.getSession();
        var session = result.data.session;
        var error = result.error;
        
        if (error) throw error;
        
        if (session) {
            state.currentUser = session.user;
            updateUserInfo();
            showScreen('app');
            await loadNotes();
        } else {
            showScreen('login');
        }
    } catch (error) {
        console.error('检查会话失败:', error);
        showScreen('login');
    }
}

// ============================================
// 用户信息更新
// ============================================

function updateUserInfo() {
    if (!state.currentUser) return;
    
    var email = state.currentUser.email;
    elements.userEmail.textContent = email;
    
    // 设置头像字母
    var initial = email.charAt(0).toUpperCase();
    elements.userAvatar.textContent = initial;
}

// ============================================
// 笔记 CRUD 操作
// ============================================

/**
 * 加载所有笔记
 */
async function loadNotes() {
    try {
        var result = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', state.currentUser.id)
            .order('updated_at', { ascending: false });
        
        if (result.error) throw result.error;
        
        state.notes = result.data || [];
        renderNotesList();
        
        // 如果有笔记，选择第一篇
        if (state.notes.length > 0 && !state.currentNote) {
            selectNote(state.notes[0].id);
        } else if (state.notes.length === 0) {
            showEmptyState();
        }
    } catch (error) {
        showToast('加载笔记失败: ' + error.message, 'error');
    }
}

/**
 * 创建新笔记
 */
async function createNote() {
    try {
        var newNote = {
            title: '无标题',
            content: '',
            user_id: state.currentUser.id
        };
        
        var result = await supabase
            .from('notes')
            .insert([newNote])
            .select()
            .single();
        
        if (result.error) throw result.error;
        
        state.notes.unshift(result.data);
        renderNotesList();
        selectNote(result.data.id);
        showToast('笔记已创建');
        
        // 聚焦到标题输入框
        setTimeout(function() { elements.noteTitle.focus(); }, 100);
    } catch (error) {
        showToast('创建笔记失败: ' + error.message, 'error');
    }
}

/**
 * 更新笔记
 */
async function updateNote(noteId, updates) {
    try {
        state.isSaving = true;
        elements.lastSaved.textContent = '保存中...';
        
        var result = await supabase
            .from('notes')
            .update(updates)
            .eq('id', noteId)
            .eq('user_id', state.currentUser.id)
            .select()
            .single();
        
        if (result.error) throw result.error;
        
        var data = result.data;
        
        // 更新本地状态
        var index = state.notes.findIndex(function(n) { return n.id === noteId; });
        if (index !== -1) {
            state.notes[index] = data;
        }
        
        state.isSaving = false;
        elements.lastSaved.textContent = '已保存 ' + formatDate(data.updated_at);
        
        // 重新渲染列表以更新预览和日期
        renderNotesList();
        setActiveNote(noteId);
        
        return data;
    } catch (error) {
        state.isSaving = false;
        elements.lastSaved.textContent = '保存失败';
        showToast('保存失败: ' + error.message, 'error');
        return null;
    }
}

/**
 * 删除笔记
 */
async function deleteNote(noteId) {
    try {
        var result = await supabase
            .from('notes')
            .delete()
            .eq('id', noteId)
            .eq('user_id', state.currentUser.id);
        
        if (result.error) throw result.error;
        
        // 更新本地状态
        state.notes = state.notes.filter(function(n) { return n.id !== noteId; });
        
        // 如果删除的是当前笔记
        if (state.currentNote && state.currentNote.id === noteId) {
            state.currentNote = null;
            
            if (state.notes.length > 0) {
                selectNote(state.notes[0].id);
            } else {
                showEmptyState();
            }
        }
        
        renderNotesList();
        showToast('笔记已删除');
    } catch (error) {
        showToast('删除失败: ' + error.message, 'error');
    }
}

// ============================================
// UI 渲染
// ============================================

/**
 * 渲染笔记列表
 */
function renderNotesList(filterText) {
    filterText = filterText || '';
    var notesList = elements.notesList;
    notesList.innerHTML = '';
    
    var filteredNotes = state.notes;
    
    // 搜索过滤
    if (filterText) {
        var searchLower = filterText.toLowerCase();
        filteredNotes = state.notes.filter(function(note) {
            return note.title.toLowerCase().includes(searchLower) ||
                (note.content && note.content.toLowerCase().includes(searchLower));
        });
    }
    
    if (filteredNotes.length === 0) {
        var emptyMsg = document.createElement('div');
        emptyMsg.className = 'empty-notes';
        var msgHtml = '<p>暂无笔记</p>';
        if (filterText) {
            msgHtml += '<p>没有找到匹配的笔记</p>';
        }
        emptyMsg.innerHTML = msgHtml;
        notesList.appendChild(emptyMsg);
        return;
    }
    
    filteredNotes.forEach(function(note) {
        var noteItem = document.createElement('div');
        noteItem.className = 'note-item';
        noteItem.dataset.id = note.id;
        
        if (state.currentNote && state.currentNote.id === note.id) {
            noteItem.classList.add('active');
        }
        
        noteItem.innerHTML = 
            '<div class="note-item-title">' + escapeHtml(note.title) + '</div>' +
            '<div class="note-item-preview">' + escapeHtml(getPreview(note.content)) + '</div>' +
            '<div class="note-item-date">' + formatDate(note.updated_at) + '</div>';
        
        noteItem.addEventListener('click', function() { selectNote(note.id); });
        notesList.appendChild(noteItem);
    });
}

/**
 * 选择笔记
 */
function selectNote(noteId) {
    var note = state.notes.find(function(n) { return n.id === noteId; });
    if (!note) return;
    
    state.currentNote = note;
    
    // 更新编辑器
    elements.noteTitle.value = note.title;
    elements.noteContent.value = note.content || '';
    elements.lastSaved.textContent = '已保存 ' + formatDate(note.updated_at);
    
    // 显示编辑器，隐藏空状态
    elements.emptyState.classList.remove('active');
    elements.emptyState.style.display = 'none';
    elements.editor.classList.remove('hidden');
    elements.editor.classList.add('active');
    
    // 更新列表激活状态
    setActiveNote(noteId);
}

/**
 * 设置激活的笔记
 */
function setActiveNote(noteId) {
    document.querySelectorAll('.note-item').forEach(function(item) {
        item.classList.remove('active');
        if (item.dataset.id === noteId) {
            item.classList.add('active');
        }
    });
}

/**
 * 显示空状态
 */
function showEmptyState() {
    elements.editor.classList.remove('active');
    elements.editor.classList.add('hidden');
    elements.emptyState.style.display = 'flex';
    elements.emptyState.classList.add('active');
    state.currentNote = null;
}

/**
 * HTML 转义
 */
function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// 自动保存功能
// ============================================

function scheduleAutoSave() {
    if (state.saveTimeout) {
        clearTimeout(state.saveTimeout);
    }
    
    state.saveTimeout = setTimeout(function() {
        if (state.currentNote && !state.isSaving) {
            var updates = {
                title: elements.noteTitle.value || '无标题',
                content: elements.noteContent.value
            };
            
            updateNote(state.currentNote.id, updates);
        }
    }, 1000);  // 1秒后自动保存
}

// ============================================
// 事件监听
// ============================================

function setupEventListeners() {
    // 登录按钮
    elements.loginBtn.addEventListener('click', async function() {
        var email = elements.emailInput.value.trim();
        var password = elements.passwordInput.value;
        
        if (!email || !password) {
            showMessage(elements.loginMessage, '请输入邮箱和密码', 'error');
            return;
        }
        
        await signIn(email, password);
    });
    
    // 注册按钮
    elements.signupBtn.addEventListener('click', async function() {
        var email = elements.emailInput.value.trim();
        var password = elements.passwordInput.value;
        
        if (!email || !password) {
            showMessage(elements.loginMessage, '请输入邮箱和密码', 'error');
            return;
        }
        
        if (password.length < 6) {
            showMessage(elements.loginMessage, '密码长度至少6位', 'error');
            return;
        }
        
        await signUp(email, password);
    });
    
    // 退出登录按钮
    elements.logoutBtn.addEventListener('click', signOut);
    
    // 新建笔记按钮
    elements.newNoteBtn.addEventListener('click', createNote);
    
    // 搜索输入
    elements.searchInput.addEventListener('input', function(e) {
        renderNotesList(e.target.value);
    });
    
    // 标题输入 - 自动保存
    elements.noteTitle.addEventListener('input', scheduleAutoSave);
    
    // 内容输入 - 自动保存
    elements.noteContent.addEventListener('input', scheduleAutoSave);
    
    // 删除笔记按钮
    elements.deleteNoteBtn.addEventListener('click', function() {
        elements.confirmModal.classList.remove('hidden');
        elements.confirmModal.classList.add('active');
    });
    
    // 取消删除
    elements.cancelDeleteBtn.addEventListener('click', function() {
        elements.confirmModal.classList.remove('active');
        elements.confirmModal.classList.add('hidden');
    });
    
    // 确认删除
    elements.confirmDeleteBtn.addEventListener('click', function() {
        if (state.currentNote) {
            deleteNote(state.currentNote.id);
            elements.confirmModal.classList.remove('active');
            elements.confirmModal.classList.add('hidden');
        }
    });
    
    // 点击模态框外部关闭
    elements.confirmModal.addEventListener('click', function(e) {
        if (e.target === elements.confirmModal) {
            elements.confirmModal.classList.remove('active');
            elements.confirmModal.classList.add('hidden');
        }
    });
    
    // 回车键登录
    elements.passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            elements.loginBtn.click();
        }
    });
    
    // 监听认证状态变化
    supabase.auth.onAuthStateChange(function(event, session) {
        console.log('Auth state changed:', event);
        if (event === 'SIGNED_IN' && session) {
            state.currentUser = session.user;
            updateUserInfo();
            showScreen('app');
            loadNotes();
        } else if (event === 'SIGNED_OUT') {
            state.currentUser = null;
            state.notes = [];
            state.currentNote = null;
            showScreen('login');
        }
    });
}

// ============================================
// 初始化应用
// ============================================

async function initApp() {
    console.log('记事本应用初始化中...');
    console.log('Supabase URL:', SUPABASE_URL);
    console.log('Supabase 客户端已创建');
    
    setupEventListeners();
    await checkSession();
    
    console.log('记事本应用初始化完成');
}

// 启动应用 - ES 模块自带 defer 行为，DOM 已就绪
initApp();
