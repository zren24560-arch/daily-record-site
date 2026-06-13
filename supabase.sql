-- 记事本应用数据库初始化 SQL
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 创建笔记表
CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL DEFAULT '无标题',
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. 启用行级安全策略 (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 3. 创建策略：用户只能访问自己的笔记
-- 查看策略
CREATE POLICY "Users can view own notes" 
    ON notes FOR SELECT 
    USING (auth.uid() = user_id);

-- 插入策略
CREATE POLICY "Users can insert own notes" 
    ON notes FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- 更新策略
CREATE POLICY "Users can update own notes" 
    ON notes FOR UPDATE 
    USING (auth.uid() = user_id);

-- 删除策略
CREATE POLICY "Users can delete own notes" 
    ON notes FOR DELETE 
    USING (auth.uid() = user_id);

-- 4. 创建更新时间自动更新的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. 创建触发器
CREATE TRIGGER update_notes_updated_at 
    BEFORE UPDATE ON notes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);

-- ============================================
-- 可选：如果你想要公开访问（不需要登录），使用以下策略代替上面的策略
-- ============================================

-- 公开访问策略（取消注释使用）
-- CREATE POLICY "Public access" ON notes FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 初始化说明：
-- 1. 在 Supabase 仪表板中，进入 SQL Editor
-- 2. 复制并粘贴此脚本
-- 3. 点击 "Run" 执行
-- 4. 在 Authentication > Settings 中配置认证设置
-- 5. 在 API 设置中获取 URL 和 Anon Key
-- ============================================
