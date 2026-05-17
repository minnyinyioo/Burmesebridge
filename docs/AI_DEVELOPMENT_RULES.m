# BurmeseBridge AI Development Rules

## 0. 变更保护规则（最高优先级）

禁止私自修改未要求内容。

① 不修改用户未明确要求功能

② 不删除已有可运行逻辑

③ 不覆盖已有功能

④ 不重命名：

- 文件
- API
- 数据库字段

除非明确要求

⑤ 不替换现有方案除非：

- 原方案错误
- 已说明风险
- 已列出影响范围
- 已说明替代原因

## 必须保证：

- 登录
- 注册
- Forum
- Admin
- 三语
- 权限
- Supabase
- 数据库
- 已完成功能

禁止：

修复A坏B

优化C丢D

新增E影响F

---

## 开发原则

优先：

- 增加
- 扩展
- 补丁修复
- 局部优化

禁止：

- 整页重写
- 大规模重构
- 替换技术栈
- 随意换组件

---

## SQL规则

所有：

- migration
- table
- policy
- RLS
- function
- trigger
- view

必须进入：

supabase/migrations/

禁止：

数据库改了
仓库没记录

---

## 输出规则

禁止：

自己找位置加

应该放这里

大概加这里

必须给：

文件路径

完整覆盖版

测试步骤

Git步骤

---

## 调试规则

同问题最多两次。

失败：

查日志

查数据库

查版本

查官方文档

禁止猜测

---

## UI规则

统一：

SiteShell

FeedCard

Button

Lucide

禁止：

Emoji 正式图标

---

## 国际化

所有用户文字：

my

zh

en

包括：

Badge

Tooltip

Admin

错误提示

按钮

---

## 开发完成验证

□ 无404

□ 无类型错误

□ 无控制台报错

□ 三语正常

□ Admin正常

□ RLS正常

□ 手机版正常

□ Git完成