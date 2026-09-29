const DEFAULT_SETTINGS = {
  enabled: true,
  count: 6,
  topics: "جهان، ایران و منطقه، فناوری، اقتصاد، ورزش",
  style: "خلاصه و بی‌طرفانه",
  template: "📰 {title}\n\n{summary}\n\n🔗 منبع: {source}\n{url}",
};

const HTML = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>پنل ربات اخبار</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#0b1120;color:#e5e7eb;font-family:system-ui,-apple-system,Segoe UI,Tahoma,sans-serif}.wrap{max-width:1100px;margin:auto;padding:24px}.card{background:#111827;border:1px solid #263244;border-radius:18px;padding:18px;margin:14px 0;box-shadow:0 8px 30px #0002}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}.stat{font-size:26px;font-weight:800;margin-top:6px}.muted{color:#94a3b8}.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}input,textarea,select{width:100%;padding:11px;border-radius:10px;border:1px solid #334155;background:#0f172a;color:#fff;margin:6px 0 12px}button{border:0;border-radius:10px;padding:11px 15px;background:#38bdf8;color:#082f49;font-weight:800;cursor:pointer}button.secondary{background:#334155;color:#e5e7eb}button.danger{background:#fb7185;color:#450a0a}label{display:block;margin-top:8px}.hidden{display:none!important}.login{max-width:420px;margin:10vh auto}.ok{color:#86efac}.err{color:#fca5a5}pre{white-space:pre-wrap;background:#020617;border-radius:12px;padding:14px;overflow:auto}.pill{display:inline-block;padding:5px 9px;border-radius:999px;background:#1e293b;margin:2px}
</style></head>
<body>
<div id="login" class="wrap login"><div class="card"><h1>🔐 ورود</h1><p class="muted">پنل مدیریت ربات اخبار</p><input id="password" type="password" placeholder="رمز مدیریت"><button onclick="login()">ورود</button><p id="loginMsg"></p></div></div>
<div id="app" class="wrap hidden">
<h1>📰 ربات اخبار تلگرام</h1><p class="muted">مدیریت کامل ربات از داخل Cloudflare Worker</p>
<div class="grid"><div class="card"><div class="muted">وضعیت</div><div id="status" class="stat">—</div></div><div class="card"><div class="muted">آخرین اجرا</div><div id="last">—</div></div><div class="card"><div class="muted">تعداد ارسال</div><div id="sent" class="stat">—</div></div></div>
<div class="card"><h2>کنترل سریع</h2><div class="row"><button onclick="runNow()">▶️ ارسال خبر الان</button><button class="secondary" onclick="testTelegram()">📢 تست تلگرام</button><button class="secondary" onclick="save()">💾 ذخیره تنظیمات</button><button class="danger" onclick="logout()">خروج</button></div><p id="msg" class="muted"></p></div>
<div class="card"><h2>تنظیمات اخبار</h2><label>ارسال خودکار</label><select id="enabled"><option value="true">فعال</option><option value="false">خاموش</option></select>
<label>تعداد خبر در هر نوبت</label><input id="count" type="number" min="1" max="10">
<label>دسته‌های خبری</label><input id="topics">
<label>سبک نوشتار</label><select id="style"><option>خلاصه و بی‌طرفانه</option><option>کوتاه و خبری</option><option>کامل‌تر</option></select>
<label>قالب پیام</label><textarea id="template" rows="8"></textarea>
<p class="muted">Cron فعلاً هر ۳۰ دقیقه اجرا می‌شود. تغییر فاصله از داشبورد Cloudflare انجام می‌شود.</p></div>
<div class="card"><h2>آخرین خروجی</h2><pre id="preview">—</pre></div>
</div>
<script>
async function api(path,opt={}){const r=await fetch('/api/'+path,{...opt,headers:{'content-type':'application/json',...(opt.headers||{})}});const j=await r.json().catch(()=>({}));if(r.status===401){showLogin();throw Error('لطفاً دوباره وارد شوید.')}if(!r.ok)throw Error(j.error||'خطا');return j}
function showLogin(){document.getElementById('login').classList.remove('hidden');document.getElementById('app').classList.add('hidden')}
function showApp(){document.getElementById('login').classList.add('hidden');document.getElementById('app').classList.remove('hidden')}
function message(x,ok=false){const e=document.getElementById('msg');e.textContent=x;e.className=ok?'ok':'err'}
async function login(){try{await api('login',{method:'POST',body:JSON.stringify({password:document.getElementById('password').value})});showApp();await load()}catch(e){document.getElementById('loginMsg').textContent=e.message}}
async function load(){try{const x=await api('status');document.getElementById('status').textContent=x.settings.enabled?'فعال':'خاموش';document.getElementById('last').textContent=x.last||'هنوز اجرا نشده';document.getElementById('sent').textContent=x.sent||0;document.getElementById('preview').textContent=x.preview||'—';document.getElementById('enabled').value=String(x.settings.enabled);document.getElementById('count').value=x.settings.count;document.getElementById('topics').value=x.settings.topics;document.getElementById('style').value=x.settings.style;document.getElementById('template').value=x.settings.template}catch(e){if(!e.message.includes('دوباره'))message(e.message)}}
async function save(){try{await api('settings',{method:'POST',body:JSON.stringify({enabled:document.getElementById('enabled').value==='true',count:Number(document.getElementById('count').value),topics:document.getElementById('topics').value,style:document.getElementById('style').value,template:document.getElementById('template').value})});message('تنظیمات ذخیره شد ✅',true);await load()}catch(e){message(e.message)}}
async function runNow(){try{message('در حال جست‌وجو و آماده‌سازی خبرها...');const x=await api('run',{method:'POST'});message('خبرها ارسال شدند ✅',true);document.getElementById('preview').textContent=x.text;await load()}catch(e){message(e.message)}}
async function testTelegram(){try{await api('test',{method:'POST'});message('پیام تست ارسال شد ✅',true)}catch(e){message(e.message)}}
async function logout(){await api('logout',{method:'POST'}).catch(()=>{});showLogin()}
(async()=>{try{await api('status');showApp();await load()}catch(e){showLogin()}})();
</script></body></html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    try {
      if (request.method === "GET" && url.pathname === "/") return html(HTML);
      if (url.pathname.startsWith("/api/")) return await api(request, env, ctx, url.pathname.slice(5));
      return new Response("Not found", { status: 404 });
    } catch (e) {
      return json({ error: e.message || "Unknown error" }, { status: 500 });
    }
  },
  async scheduled(controller, env, ctx) {
    const s = await getSettings(env);
    if (s.enabled) ctx.waitUntil(publish(env));
  },
};

function html(body){return new Response(body,{headers:{"content-type":"text/html;charset=UTF-8","cache-control":"no-store"}})}
function json(data, init={}){return new Response(JSON.stringify(data),{status:init.status||200,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store",...(init.headers||{})}})}

async function api(req, env, ctx, action){
  if(action === "login" && req.method === "POST"){
    const {password} = await req.json();
    if(!env.ADMIN_PASSWORD || password !== env.ADMIN_PASSWORD) return json({error:"رمز نادرست است"},{status:401});
    const token = crypto.randomUUID();
    await env.NEWS_KV.put(`session:${token}`, "1", {expirationTtl: 60*60*24*7});
    return new Response(JSON.stringify({ok:true}),{headers:{"content-type":"application/json","set-cookie":`session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${60*60*24*7}`}});
  }
  if(action === "logout" && req.method === "POST"){
    const token = cookie(req,"session"); if(token) await env.NEWS_KV.delete(`session:${token}`);
    return new Response(JSON.stringify({ok:true}),{headers:{"content-type":"application/json","set-cookie":"session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0"}});
  }
  await requireAuth(req,env);
  if(action === "status") return json(await status(env));
  if(action === "settings" && req.method === "POST"){
    const b=await req.json();
    const s={enabled:Boolean(b.enabled),count:clamp(Number(b.count)||6,1,10),topics:String(b.topics||DEFAULT_SETTINGS.topics).slice(0,500),style:String(b.style||DEFAULT_SETTINGS.style).slice(0,100),template:String(b.template||DEFAULT_SETTINGS.template).slice(0,2000)};
    await env.NEWS_KV.put("settings",JSON.stringify(s)); return json({ok:true});
  }
  if(action === "run" && req.method === "POST"){const text=await publish(env);return json({ok:true,text})}
  if(action === "test" && req.method === "POST"){await telegram(env,"✅ اتصال ربات اخبار به تلگرام برقرار است.");return json({ok:true})}
  return json({error:"Not found"},{status:404});
}

async function requireAuth(req,env){
  const token=cookie(req,"session");
  if(!token || !(await env.NEWS_KV.get(`session:${token}`))) throw Object.assign(new Error("Unauthorized"),{status:401});
}
function cookie(req,name){const h=req.headers.get("cookie")||"";const m=h.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));return m?m[1]:null}
function clamp(n,min,max){return Math.max(min,Math.min(max,n))}

async function getSettings(env){return {...DEFAULT_SETTINGS,...JSON.parse(await env.NEWS_KV.get("settings")||"{}")}}
async function status(env){return {settings:await getSettings(env),last:await env.NEWS_KV.get("last_run"),sent:Number(await env.NEWS_KV.get("sent_count")||0),preview:await env.NEWS_KV.get("preview")}}

async function publish(env){
  if(!env.OPENAI_API_KEY || !env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHANNEL) throw new Error("Secrets ناقص است: OPENAI_API_KEY / TELEGRAM_BOT_TOKEN / TELEGRAM_CHANNEL");
  const s=await getSettings(env);
  const prompt=`برای یک کانال خبری فارسی، مهم‌ترین اخبار جدید و قابل‌تأیید را پیدا کن.\nموضوعات: ${s.topics}\nحداکثر ${s.count} خبر.\nسبک: ${s.style}\nفقط خبرهای جدید را انتخاب کن و خبرهای تکراری، شایعات و ادعاهای تأییدنشده را حذف کن. برای هر خبر تیتر کوتاه، خلاصه 2 تا 4 جمله‌ای، نام منبع و لینک مستقیم منبع بده. خروجی را برای انتشار مستقیم در تلگرام و به زبان فارسی آماده کن.`;
  const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${env.OPENAI_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:env.OPENAI_MODEL||"gpt-5.6-luna",tools:[{type:"web_search"}],input:prompt,max_output_tokens:4000})});
  if(!r.ok) throw new Error("OpenAI: "+await r.text());
  const d=await r.json();
  const text=extractText(d);
  if(!text) throw new Error("OpenAI خروجی متنی برنگرداند");
  for(let i=0;i<text.length;i+=3900) await telegram(env,text.slice(i,i+3900));
  await env.NEWS_KV.put("last_run",new Date().toISOString());
  await env.NEWS_KV.put("preview",text);
  await env.NEWS_KV.put("sent_count",String(Number(await env.NEWS_KV.get("sent_count")||0)+1));
  return text;
}
function extractText(d){return (d.output||[]).flatMap(x=>x.content||[]).filter(x=>typeof x.text==="string").map(x=>x.text).join("\n").trim()}
async function telegram(env,text){const r=await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({chat_id:env.TELEGRAM_CHANNEL,text,disable_web_page_preview:false})});if(!r.ok)throw new Error("Telegram: "+await r.text())}
