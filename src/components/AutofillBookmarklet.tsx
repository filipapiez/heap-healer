import { useEffect, useRef } from "react";
import { MousePointerClick } from "lucide-react";

type Profile = {
  product_name?: string | null;
  tagline?: string | null;
  short_description?: string | null;
  long_description?: string | null;
  website_url?: string | null;
  logo_url?: string | null;
  category?: string | null;
  contact_email?: string | null;
  pricing_model?: string | null;
  twitter_handle?: string | null;
  founder_name?: string | null;
} | null;

// Runs on the directory's own page. Matches each empty field by its label/name/placeholder
// and fills it from the profile, firing input/change events so React/Vue forms notice.
function buildScript(p: NonNullable<Profile>): string {
  const first = (p.founder_name ?? "").split(" ")[0] ?? "";
  const last = (p.founder_name ?? "").split(" ").slice(1).join(" ");
  const tw = (p.twitter_handle ?? "").replace(/^@/, "");
  const rules: [string, string][] = [
    ["e-?mail", p.contact_email ?? ""],
    ["twitter|x\\.com|x handle", tw ? "https://x.com/" + tw : ""],
    ["logo|icon|image url", p.logo_url ?? ""],
    ["first.?name", first],
    ["last.?name|surname", last],
    ["founder|your name|full.?name|maker|contact name|^name$|author", p.founder_name ?? ""],
    ["url|website|link|domain|homepage|site", p.website_url ?? ""],
    ["tagline|slogan|headline|one.?liner|subtitle", p.tagline ?? ""],
    ["long|full desc|about|detail|pitch|message|body", p.long_description ?? p.short_description ?? ""],
    ["desc|summary|short|intro|what does", p.short_description ?? p.tagline ?? ""],
    ["categor|tag|industry|niche", p.category ?? ""],
    ["pric", p.pricing_model ?? ""],
    ["product|startup|tool|app|company|project|title|name", p.product_name ?? ""],
  ];
  const data = JSON.stringify(rules.filter(([, v]) => v));
  const fn = `(function(){var R=${data};var n=0;
function hint(el){var t=[el.name,el.id,el.placeholder,el.getAttribute('aria-label'),el.getAttribute('autocomplete')];
if(el.id){var l=document.querySelector('label[for="'+CSS.escape(el.id)+'"]');if(l)t.push(l.innerText)}
var p=el.closest('label');if(p)t.push(p.innerText);
if(!p&&el.parentElement)t.push((el.parentElement.innerText||'').slice(0,80));
return t.filter(Boolean).join(' ').toLowerCase()}
function set(el,v){var pr=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:el.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype;
Object.getOwnPropertyDescriptor(pr,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}
document.querySelectorAll('input,textarea,select').forEach(function(el){
var ty=(el.type||'').toLowerCase();if(['hidden','password','file','checkbox','radio','submit','button','search'].indexOf(ty)>-1)return;
if(el.disabled||el.readOnly||el.offsetParent===null||el.value)return;
var h=hint(el);if(ty==='email')h='email '+h;if(ty==='url')h='url '+h;
for(var i=0;i<R.length;i++){if(new RegExp(R[i][0]).test(h)){var v=R[i][1];
if(el.tagName==='SELECT'){var o=[].find.call(el.options,function(o){return o.text.toLowerCase().indexOf(v.toLowerCase())>-1});if(!o)return;v=o.value}
if(el.maxLength>0&&v.length>el.maxLength)v=v.slice(0,el.maxLength);set(el,v);el.style.outline='2px solid #6C5CE7';n++;return}}});
var d=document.createElement('div');d.textContent='MentionMyApp filled '+n+' field'+(n===1?'':'s')+' — check them and press Submit';
d.style.cssText='position:fixed;z-index:2147483647;bottom:20px;right:20px;background:#0C0E1A;color:#fff;padding:12px 16px;border-radius:10px;font:600 14px sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.3)';
document.body.appendChild(d);setTimeout(function(){d.remove()},5000)})();`;
  return "javascript:" + encodeURIComponent(fn);
}

export function AutofillBookmarklet({ profile }: { profile: Profile }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const ready = !!profile?.product_name;
  // React blocks javascript: hrefs in JSX, so attach it directly.
  useEffect(() => {
    if (ref.current && profile && ready) ref.current.setAttribute("href", buildScript(profile));
  }, [profile, ready]);

  if (!ready) return null;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-4 rounded-xl border border-[#dcd8fb] bg-[#f6f5ff] p-4">
      <a
        ref={ref}
        onClick={(e) => {
          e.preventDefault();
          alert("Drag this button to your bookmarks bar, then click it on a directory's form page.");
        }}
        className="inline-flex cursor-grab items-center gap-2 rounded-lg bg-[#6C5CE7] px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
      >
        <MousePointerClick className="h-4 w-4" /> Fill form
      </a>
      <div className="min-w-0 flex-1 text-sm text-[#4b4760]">
        <strong>One-click fill.</strong> Drag the purple button to your bookmarks bar once. On any
        directory form, click it: your details are filled in, you check them and press Submit.
        <span className="block text-xs text-[#85818b]">
          Don't see a bookmarks bar? Press Ctrl+Shift+B (Cmd+Shift+B on Mac). Re-drag it if you change
          your profile.
        </span>
      </div>
    </div>
  );
}
