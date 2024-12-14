# Sui-Zealy

类似zealy的任务发布平台，可以质押SUI作为任务奖励，完成任务后可以领取SUI。

### 1. 填写环境变量:
项目依赖supabase，请在`.env.local`文件中填写以下环境变量：

```
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_PUBLIC_KEY=your-supabase-public-key
```

### 2. 创建Supabase项目:
在[Supabase](https://supabase.com/)上创建一个新项目，并获取以下信息：

- Supabase URL
- Supabase Anon Key
- Supabase Public Key

### 1. Install dependencies:

For npm:

```bash
npm install
```

For yarn:

```bash
yarn
```

### 2. Magic Link Auth (Supabase)

In your supabase [dashboard](https://supabase.com/dashboard/), select newly created project, go to Authentication -> Email Templates -> Magic Link and paste the following template:

```
<h2>Magic Link</h2>
<p>Follow this link to login:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Log In</a></p>
```

Then, make sure to setup your site URL and redirect urls in the supabase dashboard under Authentication -> URL Configuration.

For example:

Site URL: https://headshots-starter.vercel.app

Redirect URL: https://headshots-starter.vercel.app/**
