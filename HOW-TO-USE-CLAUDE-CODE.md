# 🤖 Bagaimana Buka di Claude Code

**Kamu punya 2 pilihan cara pakai Claude Code:**

---

## ✅ Option 1: Copy-Paste Prompt (RECOMMENDED)

### Step 1: Siapkan
1. Buka Claude Code di browser atau desktop app
2. Create new conversation
3. Paste this prompt:

```
I'm building a React subdomain for food scanning (calories.20fit.id) 
that connects to existing backend (my.20fit.id).

SITUATION:
- Backend: LIVE at https://my.20fit.id (Node.js, Railway)
- Frontend: NEW React app (need to build)
- Deployment: Railway (same project, different service)
- Auth: Supabase JWT (Bearer token in fetch headers)
- Domain: calories.20fit.id

ARCHITECTURE:
1. React 18 + Vite + TypeScript + Tailwind
2. Supabase client for auth (localStorage session)
3. SSO: my.20fit redirects here with token in URL fragment
4. API calls: all use Bearer auth header
5. Brand: Red #C41101, Barlow Condensed font

TASK:
1. Run setup script (./setup-20fit-calories.sh) to create 22 files
2. Update/create 8 specific files with code I'll provide
3. Install @supabase/supabase-js
4. Test locally (npm run dev)
5. Verify no errors before handoff

FILES TO UPDATE:
1. src/lib/constants.ts (REPLACE)
2. src/lib/supabase.ts (CREATE NEW)
3. src/hooks/useAuth.ts (REPLACE)
4. src/lib/api.ts (REPLACE)
5. tailwind.config.js (REPLACE)
6. src/index.css (REPLACE)
7. src/pages/ScanPage.tsx (REPLACE)
8. package.json (REPLACE)

Ready to receive the files.
```

### Step 2: Send Files
Send the 8 COPY-PASTE files one by one:

```
COPY-PASTE-01-constants.ts
COPY-PASTE-02-supabase.ts
COPY-PASTE-03-useAuth.ts
COPY-PASTE-04-api.ts
COPY-PASTE-05-tailwind.config.js
COPY-PASTE-06-index.css
COPY-PASTE-07-ScanPage.tsx
COPY-PASTE-08-package.json
```

Or upload them all at once as files.

### Step 3: Claude Code Execute

Tell Claude Code:
```
Apply all the changes from the files I just sent to the 20fit-calories project.
Then run:
  - npm install
  - npm run dev
And verify everything works without errors.
```

### Step 4: Monitor
Claude Code will:
- Apply each file
- Install dependencies
- Run npm run dev
- Show you the result

---

## ✅ Option 2: Upload Everything (Faster)

### Step 1: Prepare Upload
You have these files ready:
- `setup-20fit-calories.sh`
- `COPY-PASTE-01-constants.ts` → `COPY-PASTE-08-package.json`
- `CLAUDE-CODE-CONTEXT.md`

### Step 2: Upload to Claude Code
In Claude Code:
1. Click "Upload files"
2. Select all 10 files
3. Upload them

### Step 3: Send Instruction

Tell Claude Code:
```
I've uploaded:
- setup-20fit-calories.sh (project scaffold)
- 8 COPY-PASTE files (code implementations)
- CLAUDE-CODE-CONTEXT.md (full context)

Follow this flow:
1. Run ./setup-20fit-calories.sh to create 22 files
2. Apply all changes from COPY-PASTE-01 through COPY-PASTE-08
3. Run: npm install (install @supabase/supabase-js)
4. Run: npm run dev
5. Verify no errors
6. Show me the result

Let me know when done!
```

### Step 4: Claude Code Execute
Will automatically:
- Create project structure
- Apply all 8 files
- Install dependencies
- Test locally
- Report status

---

## 🎯 Which Option is Better?

| Option | Time | Effort | Best For |
|--------|------|--------|----------|
| **Option 1** | 10 min | Medium | Understanding the process |
| **Option 2** | 5 min | Low | Quick execution |

**Recommendation:** Option 2 (faster, simpler)

---

## 📋 Files You Need for Claude Code

**All in `/mnt/user-data/outputs/`:**

```
CLAUDE-CODE-CONTEXT.md        ← Full context + 8 files embedded

COPY-PASTE-01-constants.ts
COPY-PASTE-02-supabase.ts
COPY-PASTE-03-useAuth.ts
COPY-PASTE-04-api.ts
COPY-PASTE-05-tailwind.config.js
COPY-PASTE-06-index.css
COPY-PASTE-07-ScanPage.tsx
COPY-PASTE-08-package.json

setup-20fit-calories.sh       ← Scaffold generator

CLAUDE-CODE-FULL-PROMPT.txt   ← Quick copy-paste prompt
```

---

## 🚀 Quick Start (2 Minutes)

### If using Claude Code:

1. **Copy this prompt:**
   See `CLAUDE-CODE-FULL-PROMPT.txt`

2. **Paste it into Claude Code**

3. **Upload the 8 COPY-PASTE files**

4. **Tell Claude Code:**
   "Apply all files and run npm install + npm run dev"

5. **Done!** ✅

---

## ⚠️ Important

- **Claude Code needs project folder** — it should have access to 20fit-calories directory
- **internet access** — for npm install
- **Node.js + npm** — must be installed on your machine
- **All 8 files must be applied** — skip one = build fails

---

## 🔗 Workflow After Claude Code

After Claude Code finishes (npm run dev succeeds):

```bash
git init
git add .
git commit -m "Initial: calories.20fit.id"
git remote add origin https://github.com/yourorg/20fit-calories
git push -u origin main

# Then deploy to Railway (follow RAILWAY-QUICK-START.txt)
```

---

## 📞 If Something Goes Wrong

**Error: Cannot find module '@supabase/supabase-js'**
→ Tell Claude Code: Run `npm install` again

**Error: ScanPage.tsx has issues**
→ Tell Claude Code: Check if COPY-PASTE-07 was applied completely

**Error: Redirect loop / auth issues**
→ Tell Claude Code: Check useAuth.ts and constants.ts were applied

---

**Ready to open in Claude Code?** 

Use Option 1 or Option 2 above! 🚀
