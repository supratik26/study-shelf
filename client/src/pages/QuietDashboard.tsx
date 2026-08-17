/**
 * Study Shelf — Quiet Observatory: the study desk is asymmetric, quiet, and action-led.
 * Shelf Violet is reserved for recognition and action; teal signals continuity; amber is a warm milestone detail.
 */
import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookMarked,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Code2,
  Compass,
  FileText,
  Flame,
  FolderPlus,
  Gauge,
  House,
  Landmark,
  Languages,
  Layers3,
  LibraryBig,
  Menu,
  Microscope,
  MoreHorizontal,
  NotepadText,
  Palette,
  PencilLine,
  Plus,
  Search,
  Settings,
  Sigma,
  Sparkles,
  Timer,
  TrendingUp,
  X,
} from "lucide-react";
import { toast } from "sonner";

type Subject = "All" | "Mathematics" | "Science" | "Programming" | "History" | "Languages" | "Design" | "Study skills";
type ModalKind = "resource" | "note" | "focus" | null;

interface Resource {
  id: number;
  title: string;
  type: string;
  subject: Subject;
  metadata: string;
  progress?: number;
  image?: string;
  tone: "violet" | "teal" | "amber" | "coral";
  icon: ReactNode;
}

const navItems = [
  { label: "Home", icon: House },
  { label: "My Shelf", icon: LibraryBig },
  { label: "Study Plans", icon: BookMarked },
  { label: "Notes", icon: NotepadText },
  { label: "Progress", icon: TrendingUp },
];

const subjectFilters: { name: Subject; count: number; icon: ReactNode; color: string }[] = [
  { name: "Mathematics", count: 12, icon: <Sigma size={16} />, color: "violet" },
  { name: "Science", count: 8, icon: <Microscope size={16} />, color: "teal" },
  { name: "Programming", count: 18, icon: <Code2 size={16} />, color: "violet" },
  { name: "History", count: 9, icon: <Landmark size={16} />, color: "amber" },
  { name: "Languages", count: 6, icon: <Languages size={16} />, color: "violet" },
  { name: "Design", count: 7, icon: <Palette size={16} />, color: "violet" },
];

const resources: Resource[] = [
  {
    id: 1,
    title: "The Complete Guide to Linear Algebra",
    type: "Book",
    subject: "Mathematics",
    metadata: "12 chapters · 4h 20m",
    image: "/assets/study-shelf-math-resource.png",
    tone: "violet",
    icon: <Sigma size={22} />,
  },
  {
    id: 2,
    title: "World History: Industrial Revolution",
    type: "Course",
    subject: "History",
    metadata: "9 lessons · 72% complete",
    progress: 72,
    image: "/assets/study-shelf-history-resource.png",
    tone: "amber",
    icon: <Landmark size={22} />,
  },
  {
    id: 3,
    title: "JavaScript Patterns and Practice",
    type: "Article collection",
    subject: "Programming",
    metadata: "24 resources",
    tone: "violet",
    icon: <Code2 size={22} />,
  },
  {
    id: 4,
    title: "Research Methods Cheat Sheet",
    type: "PDF notes",
    subject: "Study skills",
    metadata: "Updated yesterday",
    tone: "violet",
    icon: <FileText size={22} />,
  },
];

const activity = [42, 74, 58, 86, 33, 96, 69];
const upcoming = [
  { title: "Review flashcards", context: "Biology · Today, 4:00 PM", icon: <Layers3 size={16} />, complete: false },
  { title: "Complete lesson 5", context: "Linear Algebra · Tomorrow", icon: <BookOpen size={16} />, complete: false },
  { title: "Write summary notes", context: "Cognitive Science · Friday", icon: <PencilLine size={16} />, complete: true },
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand-lockup" aria-label="Study Shelf">
      <img className="brand-mark" src="/assets/study-shelf-logo.png" alt="" />
      {!compact && (
        <div>
          <p className="brand-name">Study Shelf</p>
          <p className="brand-tagline">Your learning space</p>
        </div>
      )}
    </div>
  );
}

function IconButton({ label, children, onClick, className = "" }: { label: string; children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button type="button" aria-label={label} title={label} className={`icon-button ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

export default function Home() {
  const [activeNav, setActiveNav] = useState("Home");
  const [subject, setSubject] = useState<Subject>("All");
  const [query, setQuery] = useState("");
  const [bookmarks, setBookmarks] = useState<number[]>([1, 2]);
  const [modal, setModal] = useState<ModalKind>(null);
  const [isResuming, setIsResuming] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const visibleResources = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return resources.filter((resource) => {
      const matchesSubject = subject === "All" || resource.subject === subject;
      const matchesQuery = !normalizedQuery || [resource.title, resource.type, resource.subject].some((item) => item.toLowerCase().includes(normalizedQuery));
      return matchesSubject && matchesQuery;
    });
  }, [query, subject]);

  function toggleBookmark(id: number) {
    setBookmarks((current) => {
      const isSaved = current.includes(id);
      toast(isSaved ? "Removed from your saved shelf" : "Saved to your shelf");
      return isSaved ? current.filter((savedId) => savedId !== id) : [...current, id];
    });
  }

  function resumeStudy() {
    setIsResuming(true);
    window.setTimeout(() => {
      setIsResuming(false);
      toast.success("Your Cognitive Science session is ready.");
    }, 650);
  }

  function selectNavigation(label: string) {
    setActiveNav(label);
    setMobileNavOpen(false);
    if (label !== "Home") toast(`${label} is ready to explore.`);
  }

  return (
    <main className="app-shell">
      <aside className="side-rail" aria-label="Primary navigation">
        <Logo />
        <nav className="side-nav">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              type="button"
              key={label}
              className={`nav-item ${activeNav === label ? "is-active" : ""}`}
              onClick={() => selectNavigation(label)}
            >
              <Icon size={18} strokeWidth={1.9} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="side-bottom">
          <button type="button" className="nav-item" onClick={() => toast("Settings will be available soon.")}> 
            <Settings size={18} strokeWidth={1.9} />
            <span>Settings</span>
          </button>
          <div className="profile-chip liquid-glass">
            <div className="avatar avatar-small">AM</div>
            <div>
              <p>Alex Morgan</p>
              <span>Student</span>
            </div>
            <MoreHorizontal size={17} aria-hidden="true" />
          </div>
        </div>
      </aside>

      <header className="mobile-header">
        <Logo compact />
        <div className="mobile-header-actions">
          <IconButton label="Notifications" onClick={() => toast("You are all caught up.")}><Bell size={18} /></IconButton>
          <IconButton label="Open navigation" onClick={() => setMobileNavOpen((open) => !open)}><Menu size={20} /></IconButton>
        </div>
      </header>

      {mobileNavOpen && (
        <div className="mobile-nav-sheet liquid-glass" aria-label="Mobile navigation">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} type="button" className={`mobile-nav-item ${activeNav === label ? "is-active" : ""}`} onClick={() => selectNavigation(label)}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </div>
      )}

      <section className="main-desk">
        <header className="dashboard-header stagger-one">
          <div className="heading-group">
            <p className="eyebrow"><Sparkles size={13} aria-hidden="true" /> Good morning, Alex</p>
            <h1>What will you learn <em>today?</em></h1>
            <p className="header-copy">Pick up where you left off or explore something new.</p>
          </div>
          <div className="header-tools">
            <label className="search-box" aria-label="Search your shelf">
              <Search size={18} aria-hidden="true" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your shelf..." />
              {query && <button type="button" className="clear-search" aria-label="Clear search" onClick={() => setQuery("")}><X size={15} /></button>}
            </label>
            <IconButton label="Notifications" onClick={() => toast("You are all caught up.")}><Bell size={18} /></IconButton>
            <div className="avatar" aria-label="Alex Morgan">AM</div>
          </div>
        </header>

        <section className="focus-zone stagger-two" aria-labelledby="continue-title">
          <div className="continue-card liquid-glass-active">
            <div className="constellation constellation-one" />
            <div className="constellation constellation-two" />
            <div className="continue-content">
              <div className="feature-topline">
                <span className="status-dot" />
                <span>Continue studying</span>
                <span className="last-opened"><Clock3 size={13} /> Last opened 12 minutes ago</span>
              </div>
              <div className="course-symbol"><BrainCircuit size={25} strokeWidth={1.6} /></div>
              <p className="course-label">Introduction to Cognitive Science</p>
              <h2 id="continue-title">Chapter 04 — <br />Memory and Attention</h2>
              <p className="course-detail">Make space for what you want to understand.</p>
              <div className="progress-summary">
                <div className="progress-copy"><span>68% complete</span><span>18 minutes remaining</span></div>
                <div className="progress-track" aria-label="Course is 68 percent complete"><span style={{ width: "68%" }} /></div>
              </div>
              <button type="button" className="primary-action" disabled={isResuming} onClick={resumeStudy}>
                {isResuming ? "Opening session..." : "Resume session"} <ArrowRight size={17} />
              </button>
            </div>
            <div className="focus-art" aria-hidden="true">
              <img src="/assets/study-shelf-focus-illustration.png" alt="" />
            </div>
          </div>

          <div className="quick-actions" aria-label="Quick study actions">
            <button type="button" className="quick-action liquid-glass" onClick={() => setModal("resource")}>
              <span className="quick-icon icon-violet"><Plus size={20} /></span>
              <span><strong>Add resource</strong><small>Save something useful</small></span>
              <ArrowUpRight size={16} />
            </button>
            <button type="button" className="quick-action liquid-glass" onClick={() => setModal("note")}>
              <span className="quick-icon icon-violet"><PencilLine size={20} /></span>
              <span><strong>Create note</strong><small>Capture an idea</small></span>
              <ArrowUpRight size={16} />
            </button>
            <button type="button" className="quick-action liquid-glass" onClick={() => setModal("focus")}>
              <span className="quick-icon icon-amber"><Timer size={20} /></span>
              <span><strong>Start focus</strong><small>Choose a study block</small></span>
              <ArrowUpRight size={16} />
            </button>
          </div>
        </section>

        <section className="shelf-section stagger-three" aria-labelledby="shelf-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Personal archive</p>
              <h2 id="shelf-title">My Shelf</h2>
              <p>Your saved learning materials, organized your way.</p>
            </div>
            <button type="button" className="text-action" onClick={() => { setSubject("All"); setQuery(""); toast("Showing every item on your shelf."); }}>View all <ChevronMark /></button>
          </div>

          <div className="filter-row" aria-label="Filter resources by subject">
            <button type="button" className={`subject-filter ${subject === "All" ? "is-active" : ""}`} onClick={() => setSubject("All")}>All subjects <span>{resources.length}</span></button>
            {subjectFilters.map((filter) => (
              <button type="button" key={filter.name} className={`subject-filter subject-${filter.color} ${subject === filter.name ? "is-active" : ""}`} onClick={() => setSubject(filter.name)}>
                {filter.icon}{filter.name}<span>{filter.count}</span>
              </button>
            ))}
          </div>

          {visibleResources.length > 0 ? (
            <div className="resource-grid">
              {visibleResources.map((resource, index) => (
                <article className={`resource-card liquid-glass resource-${resource.tone}`} key={resource.id} style={{ animationDelay: `${0.1 + index * 0.06}s` }}>
                  <div className="resource-top">
                    <span className="resource-type">{resource.type}</span>
                    <IconButton label={bookmarks.includes(resource.id) ? `Remove ${resource.title} from saved shelf` : `Save ${resource.title} to shelf`} className={`bookmark-button ${bookmarks.includes(resource.id) ? "is-bookmarked" : ""}`} onClick={() => toggleBookmark(resource.id)}>
                      {bookmarks.includes(resource.id) ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                    </IconButton>
                  </div>
                  <div className="resource-visual">
                    {resource.image ? <img src={resource.image} alt="" /> : <span className="resource-icon-placeholder">{resource.icon}</span>}
                  </div>
                  <div className="resource-body">
                    <p className="resource-subject">{resource.subject}</p>
                    <h3>{resource.title}</h3>
                    <p className="resource-meta">{resource.metadata}</p>
                    {resource.progress ? <div className="resource-progress"><span><i style={{ width: `${resource.progress}%` }} /></span><b>Continue <ArrowRight size={14} /></b></div> : <button type="button" className="resource-open" onClick={() => toast(`Opening “${resource.title}”`)}>Open resource <ArrowUpRight size={14} /></button>}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-shelf liquid-glass">
              <Search size={25} />
              <h3>Nothing surfaced yet.</h3>
              <p>Try another subject or search for a different title.</p>
              <button type="button" className="text-action" onClick={() => { setSubject("All"); setQuery(""); }}>Clear filters <ChevronMark /></button>
            </div>
          )}
        </section>

        <section className="subjects-section stagger-four" aria-labelledby="subjects-title">
          <div className="section-heading compact-heading">
            <div><p className="eyebrow">Browse the stacks</p><h2 id="subjects-title">Explore subjects</h2></div>
            <span className="section-aside">A little more context goes a long way.</span>
          </div>
          <div className="subject-cards">
            {subjectFilters.map((item) => (
              <button key={item.name} type="button" className={`subject-card subject-${item.color} ${subject === item.name ? "is-selected" : ""}`} onClick={() => setSubject(item.name)}>
                <span className="subject-icon">{item.icon}</span>
                <span><b>{item.name}</b><small>{item.count} resources</small></span>
                <ArrowRight size={15} />
              </button>
            ))}
          </div>
        </section>
      </section>

      <aside className="study-ledger" aria-label="Progress and upcoming study tasks">
        <section className="ledger-panel liquid-glass stagger-three">
          <div className="ledger-heading"><div><p className="eyebrow">This week</p><h2>Your progress</h2></div><Gauge size={19} /></div>
          <div className="study-time"><strong>4<span>h</span> 35<span>m</span></strong><p>of thoughtful study time</p></div>
          <div className="activity-chart" aria-label="Study activity for Monday through Sunday">
            {activity.map((height, index) => <div className={`activity-day ${index === 5 ? "is-today" : ""}`} key={index}><span style={{ height: `${height}%` }} /><small>{["M", "T", "W", "T", "F", "S", "S"][index]}</small></div>)}
          </div>
          <div className="progress-stats"><div><span>12</span><small>Sessions</small></div><div><span><Flame size={15} /> 6</span><small>Day streak</small></div></div>
          <button type="button" className="ledger-button" onClick={() => toast("Your detailed progress view is coming together.")}>View progress <ArrowUpRight size={15} /></button>
        </section>

        <section className="ledger-panel up-next stagger-four">
          <div className="ledger-heading"><div><p className="eyebrow">Coming up</p><h2>Up next</h2></div><Compass size={18} /></div>
          <div className="upcoming-list">
            {upcoming.map((item, index) => (
              <button type="button" className={`upcoming-item ${index === 0 ? "is-next" : ""} ${item.complete ? "is-complete" : ""}`} key={item.title} onClick={() => toast(item.complete ? "This note is already complete." : `${item.title} added to your focus queue.`)}>
                <span className="upcoming-icon">{item.complete ? <CheckCircle2 size={17} /> : item.icon}</span>
                <span><b>{item.title}</b><small>{item.context}</small></span>
                {index === 0 && <ArrowRight size={15} />}
              </button>
            ))}
          </div>
          <button type="button" className="plan-link" onClick={() => selectNavigation("Study Plans")}>Open study plan <ArrowUpRight size={14} /></button>
        </section>

        <section className="daily-note stagger-four">
          <p><Sparkles size={15} /> DAILY NOTE</p>
          <strong>Small sessions.<br />Steady progress.</strong>
        </section>
      </aside>

      <nav className="bottom-nav" aria-label="Mobile navigation">
        {navItems.slice(0, 5).map(({ label, icon: Icon }) => <button key={label} type="button" className={activeNav === label ? "is-active" : ""} onClick={() => selectNavigation(label)}><Icon size={18} /><span>{label}</span></button>)}
      </nav>

      {modal && <QuickActionModal kind={modal} onClose={() => setModal(null)} />}
    </main>
  );
}

function ChevronMark() {
  return <span className="chevron-mark" aria-hidden="true">↗</span>;
}

function QuickActionModal({ kind, onClose }: { kind: Exclude<ModalKind, null>; onClose: () => void }) {
  const content = {
    resource: { icon: <FolderPlus size={23} />, title: "Add a resource", text: "Save a book, article, course, or link to your personal shelf.", action: "Save to shelf" },
    note: { icon: <PencilLine size={23} />, title: "Capture a note", text: "Keep a thought close while you are still following the thread.", action: "Create note" },
    focus: { icon: <Timer size={23} />, title: "Start a focus session", text: "Choose a calm block of time and let the rest of the desk fall quiet.", action: "Start 25-minute focus" },
  }[kind];

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="quick-modal liquid-glass-active" role="dialog" aria-modal="true" aria-labelledby="quick-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" aria-label="Close dialog" onClick={onClose}><X size={18} /></button>
        <span className="modal-symbol">{content.icon}</span>
        <p className="eyebrow">Quick action</p>
        <h2 id="quick-modal-title">{content.title}</h2>
        <p>{content.text}</p>
        {kind === "resource" && <input className="modal-input" autoFocus placeholder="Paste a link or name a resource" aria-label="Resource name or link" />}
        {kind === "note" && <textarea className="modal-input modal-textarea" autoFocus placeholder="What is worth remembering?" aria-label="Write a study note" />}
        {kind === "focus" && <div className="focus-options"><button type="button" className="is-selected">25 min</button><button type="button">45 min</button><button type="button">60 min</button></div>}
        <button type="button" className="primary-action modal-action" onClick={() => { toast.success(kind === "focus" ? "Your focus session has started." : "Saved to your study space."); onClose(); }}>{content.action}<ArrowRight size={17} /></button>
      </section>
    </div>
  );
}
