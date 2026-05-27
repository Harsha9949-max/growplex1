const fs = require('fs');
const path = require('path');

const filesToEdit = [
    "src/pages/Support.tsx",
    "src/pages/Pricing.tsx",
    "src/pages/FAQ.tsx",
    "src/pages/About.tsx",
    "src/pages/BlogPost.tsx",
    "src/pages/HowItWorks.tsx",
    "src/pages/Services.tsx",
    "src/pages/Home.tsx",
    "src/pages/Blog.tsx",
    "src/pages/ResellerGuide.tsx",
    "src/pages/TermsOfService.tsx",
    "src/components/SchemaMarkup.tsx",
    "src/components/Footer.tsx",
    "src/components/Navbar.tsx",
    "src/components/FloatingBadge.tsx"
];

const replacements = [
    [/ No login needed — ever\./g, ""],
    [/ No login needed to get help\./g, ""],
    [/ – No Login Required/g, ""],
    [/ No login, no password, instant delivery\./g, " Instant delivery."],
    [/, and absolutely <strong className="text-text-main">no login required<\/strong>/g, ""],
    [/<li className="flex items-center gap-2"><Check size=\{14\} className="text-brand-success flex-shrink-0" \/> No login required<\/li>/g, ""],
    [/ — no login needed/g, ""],
    [/ Why No Login is Safer/g, " Why We Are Safer"],
    [/Watch your follower count grow — no login needed!/g, "Watch your follower count grow instantly!"],
    [/<li><strong>No login required — ever\.<\/strong> We never ask for your password or account credentials\.<\/li>/g, ""],
    [/<strong>Growplex: No login required\.<\/strong> You can order any service without creating an account, depositing funds, or sharing credentials\. Most competitors require full account registration with email verification, and some even ask for your social media password for certain services\. Growplex is the only major panel offering a completely account-free experience\./g, "Growplex provides a secure tracking experience and simple deposits so you can manage your growth at scale."],
    [/Try Growplex now — no login needed →/g, "Try Growplex now →"],
    [/No login\. No password\. Just results\./g, "Simple to use. Just results."],
    [/No password\. No login\. Just a link\./g, "Just a link to get started."],
    [/ No login, no password, no account needed\./g, ""],
    [/ \(No Login\)/g, ""],
    [/ No login required\./g, ""],
    [/ No login required — just/g, " Just"],
    [/No Login Required/g, "Fast Checkout"],
    [/Order without creating an account or giving any password\./g, "Easily order online and track your processing securely."],
    [/ — no login needed\./g, "."],
    [/ No login asked — very safe!/g, " Very safe!"],
    [/with NO LOGIN required\./g, "with easy sign up."],
    [/\{\/\* Logo \+ No Login Badge \*\/\}/g, "{/* Logo */}"],
    [/\{\/\* NO LOGIN Badge \*\/\}\s*<div[^>]*>\s*<div[^>]*>\s*<Lock[^>]*\/>\s*<span>NO LOGIN REQUIRED — 100% SAFE<\/span>\s*<\/div>\s*<\/div>/g, ""],
    [/With No Login Required\./g, "With Maximum Security & Ease."],
    [/ No login, no password — just results\./g, ""],
    [/<Lock size=\{12\} \/> NO LOGIN EVER/g, "<Lock size={12} /> SECURE DASHBOARD"],
    [/ Grow smarter with no login needed\./g, " Grow smarter."],
    [/No Login Overhead/g, "Zero Overhead"],
    [/ and no login required\./g, "."],
    [/ NO LOGIN /g, " PREMIUM "],
    [/ — no login required/g, ""],
    [/ with no login required/g, ""],
    [/ No login asked/g, ""],
    [/ No login\./g, ""],
    [/ No login, no password/g, " Fast & secure"],
];

for (const relPath of filesToEdit) {
    const filepath = path.join(process.cwd(), relPath);
    if (!fs.existsSync(filepath)) continue;
    
    const content = fs.readFileSync(filepath, 'utf-8');
    let newContent = content;
    
    for (const [pattern, repl] of replacements) {
        newContent = newContent.replace(pattern, repl);
    }
    
    if (newContent !== content) {
        fs.writeFileSync(filepath, newContent, 'utf-8');
        console.log("Updated", filepath);
    }
}
