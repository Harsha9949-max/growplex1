import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Clock, ArrowRight } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const BLOG_POSTS = [
  {
    slug: "grow-instagram-without-password",
    title: "How to Grow Your Instagram Without Giving Your Password",
    excerpt: "Learn why no-login SMM panels are the safest way to grow your Instagram following. Discover how Growplex delivers real followers without ever asking for your login credentials.",
    date: "2026-05-01",
    readTime: "6 min read",
    category: "Safety"
  },
  {
    slug: "cheapest-smm-panel-safe",
    title: "Cheapest SMM Panel: Are Cheap Services Safe?",
    excerpt: "Can you really trust cheap SMM panels? We break down why Growplex offers the lowest prices without compromising on quality, safety, or delivery speed.",
    date: "2026-04-28",
    readTime: "5 min read",
    category: "Pricing"
  },
  {
    slug: "what-is-smm-panel-no-login",
    title: "What is an SMM Panel and How Does No-Login Work?",
    excerpt: "A complete beginner's guide to SMM panels. Learn what they are, how they work, and why Growplex's no-login model is revolutionizing social media growth.",
    date: "2026-04-25",
    readTime: "7 min read",
    category: "Guide"
  },
  {
    slug: "top-10-social-media-services-2026",
    title: "Top 10 Social Media Marketing Services for 2026",
    excerpt: "From Instagram followers to YouTube subscribers, discover the most in-demand SMM services of 2026 and how to get them at the cheapest prices.",
    date: "2026-04-20",
    readTime: "8 min read",
    category: "Trends"
  },
  {
    slug: "growplex-vs-competitors",
    title: "Growplex vs Competitors: Price & Feature Comparison",
    excerpt: "An honest, detailed comparison of Growplex against the top SMM panels. See how we stack up on pricing, speed, safety, and customer support.",
    date: "2026-04-15",
    readTime: "6 min read",
    category: "Comparison"
  }
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-brand-primary text-text-main font-sans">
      <Helmet>
        <title>Blog – Social Media Growth Tips & SMM Guides | Growplex</title>
        <meta name="description" content="Read Growplex's blog for expert tips on social media growth, SMM panel guides, safety advice, and pricing comparisons. Grow smarter with no login needed." />
        <link rel="canonical" href="https://growplex.sbs/blog" />
        <meta property="og:title" content="Blog – Social Media Growth Tips & SMM Guides | Growplex" />
        <meta property="og:url" content="https://growplex.sbs/blog" />
      </Helmet>

      <Navbar />
      <Breadcrumbs />

      <section className="pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              Growplex <span className="text-brand-accent">Blog</span>
            </h1>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Expert tips, guides, and insights on social media growth, SMM panels, and digital marketing.
            </p>
          </div>

          <div className="space-y-6">
            {BLOG_POSTS.map((post, idx) => (
              <Link
                key={idx}
                to={`/blog/${post.slug}`}
                className="block bg-brand-surface border border-brand-border rounded-2xl p-8 hover:border-brand-accent/50 transition-all group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider bg-brand-accent/10 text-brand-accent px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Clock size={12} /> {post.readTime}
                  </span>
                </div>
                <h2 className="font-heading font-bold text-xl md:text-2xl mb-3 group-hover:text-brand-accent transition-colors">
                  {post.title}
                </h2>
                <p className="text-text-muted leading-relaxed mb-4">{post.excerpt}</p>
                <span className="text-brand-accent font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read More <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
