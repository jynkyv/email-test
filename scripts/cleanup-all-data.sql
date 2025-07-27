-- ========================================
-- 数据清理脚本 - 清理所有表数据但保留表结构
-- ========================================

-- 首先查看当前数据统计
SELECT '=== 清理前数据统计 ===' as info;

SELECT 'customers' as table_name, COUNT(*) as record_count FROM customers
UNION ALL
SELECT 'customer_groups' as table_name, COUNT(*) as record_count FROM customer_groups
UNION ALL
SELECT 'customer_emails' as table_name, COUNT(*) as record_count FROM customer_emails
UNION ALL
SELECT 'email_queue' as table_name, COUNT(*) as record_count FROM email_queue
UNION ALL
SELECT 'email_approvals' as table_name, COUNT(*) as record_count FROM email_approvals
UNION ALL
SELECT 'users' as table_name, COUNT(*) as record_count FROM users;

-- ========================================
-- 开始清理数据（按依赖关系顺序）
-- ========================================

-- 1. 清理邮件相关数据（先清理依赖表）
DELETE FROM customer_emails;
DELETE FROM email_queue;
DELETE FROM email_approvals;

-- 2. 清理客户相关数据
DELETE FROM customers;
DELETE FROM customer_groups;

-- 3. 清理用户数据（保留管理员账户，可选）
-- 如果只想清理普通用户，使用下面的语句：
-- DELETE FROM users WHERE role != 'admin';
-- 如果要清理所有用户（包括管理员），使用下面的语句：
DELETE FROM users;

-- ========================================
-- 重置自增序列（如果有的话）
-- ========================================

-- 重置各表的自增ID序列
-- 注意：序列名称可能需要根据实际情况调整
-- 可以通过以下命令查看序列名称：
-- SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public';

-- 重置customers表的序列
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'customers_id_seq') THEN
        ALTER SEQUENCE customers_id_seq RESTART WITH 1;
    END IF;
END $$;

-- 重置customer_groups表的序列
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'customer_groups_id_seq') THEN
        ALTER SEQUENCE customer_groups_id_seq RESTART WITH 1;
    END IF;
END $$;

-- 重置customer_emails表的序列
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'customer_emails_id_seq') THEN
        ALTER SEQUENCE customer_emails_id_seq RESTART WITH 1;
    END IF;
END $$;

-- 重置email_queue表的序列
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'email_queue_id_seq') THEN
        ALTER SEQUENCE email_queue_id_seq RESTART WITH 1;
    END IF;
END $$;

-- 重置email_approvals表的序列
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'email_approvals_id_seq') THEN
        ALTER SEQUENCE email_approvals_id_seq RESTART WITH 1;
    END IF;
END $$;

-- 重置users表的序列
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'users_id_seq') THEN
        ALTER SEQUENCE users_id_seq RESTART WITH 1;
    END IF;
END $$;

-- ========================================
-- 清理后数据统计
-- ========================================

SELECT '=== 清理后数据统计 ===' as info;

SELECT 'customers' as table_name, COUNT(*) as record_count FROM customers
UNION ALL
SELECT 'customer_groups' as table_name, COUNT(*) as record_count FROM customer_groups
UNION ALL
SELECT 'customer_emails' as table_name, COUNT(*) as record_count FROM customer_emails
UNION ALL
SELECT 'email_queue' as table_name, COUNT(*) as record_count FROM email_queue
UNION ALL
SELECT 'email_approvals' as table_name, COUNT(*) as record_count FROM email_approvals
UNION ALL
SELECT 'users' as table_name, COUNT(*) as record_count FROM users;

-- ========================================
-- 清理完成确认
-- ========================================

SELECT '✅ 数据清理完成！所有表数据已清空，表结构保持不变。' as completion_message; 