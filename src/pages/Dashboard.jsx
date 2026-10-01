// src/pages/Dashboard.jsx
// Shared dashboard component for both Expert and Learner roles
import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Rss, User, Wand2, GraduationCap, ArrowRight, Sparkles, BookOpen, Users, Star, Hand, Clock,
  ChevronRight, Mail, Phone,
} from 'lucide-react';
import { TUTORIALS, getPracticePath } from '../tutorials';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { BlockPrintBand, Jaali, OrnamentDivider, Rosette } from '@/components/ornaments';

const AR_TUTORIALS = TUTORIALS.filter((t) => getPracticePath(t));

// Each tone is a natural dye: indigo, madder/terracotta, turmeric-gold, leaf.
const TONES = {
  indigo: { hex: '#2F3B6B', icon: 'text-[#2F3B6B] bg-[#2F3B6B]/8 ring-[#2F3B6B]/20' },
  terracotta: { hex: '#B0573D', icon: 'text-[#B0573D] bg-[#B0573D]/8 ring-[#B0573D]/20' },
  gold: { hex: '#A8873A', icon: 'text-[#8A6D2A] bg-[#A8873A]/10 ring-[#A8873A]/25' },
  sage: { hex: '#5D7A58', icon: 'text-[#5D7A58] bg-[#5D7A58]/8 ring-[#5D7A58]/20' },
};

function StatCard({ label, value, icon: Icon, tone }) {
  const t = TONES[tone];
  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-[var(--shadow-soft)]">
      <CardContent className="flex items-center gap-4 p-5">
        <span className={`grid size-11 shrink-0 place-items-center rounded-full ring-1 ${t.icon}`}>
          <Icon className="size-[18px]" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <div className="font-serif text-3xl leading-none text-foreground">{value}</div>
          <div className="mt-1.5 text-xs tracking-wide text-muted-foreground">{label}</div>
        </div>
      </CardContent>
      <BlockPrintBand height={8} primary={t.hex} secondary={`${t.hex}66`} className="opacity-80" />
    </Card>
  );
}

function ActionRow({ label, description, icon: Icon, onClick, tone }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-xl px-3 py-3.5 text-left transition-colors hover:bg-accent/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <span className={`grid size-10 shrink-0 place-items-center rounded-full ring-1 ${TONES[tone].icon}`}>
        <Icon className="size-[17px]" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-foreground">{label}</span>
        <span className="mt-0.5 block text-sm text-muted-foreground">{description}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
    </button>
  );
}

function PracticeCard({ tutorial, onStart }) {
  return (
    <Card
      onClick={onStart}
      className="group cursor-pointer gap-0 overflow-hidden py-0 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]"
    >
      {/* Mounted like a print: paper mat around the image */}
      <div className="p-3 pb-0">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-secondary ring-1 ring-border">
          {tutorial.thumbnail && (
            <img
              src={tutorial.thumbnail}
              alt=""
              className="size-full object-cover object-[center_30%] transition-transform duration-700 group-hover:scale-[1.04]"
            />
          )}
          <Badge className="absolute left-3 top-3 border-[#5D7A58]/30 bg-card/95 text-[#5D7A58]">
            <Sparkles /> Live AR practice
          </Badge>
        </div>
      </div>
      <CardHeader className="gap-2 px-5 pt-5">
        <CardTitle className="font-serif text-xl font-normal leading-snug">{tutorial.title}</CardTitle>
        <CardDescription className="leading-relaxed text-[#4A423B]">{tutorial.description}</CardDescription>
      </CardHeader>
      <CardContent className="px-5 pt-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          {tutorial.duration}
        </span>
      </CardContent>
      <CardFooter className="px-5 pb-5 pt-4">
        <Button
          type="button"
          size="lg"
          className="w-full rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            onStart();
          }}
        >
          Start AR Practice
          <ArrowRight />
        </Button>
      </CardFooter>
    </Card>
  );
}

function SectionLabel({ children }) {
  return <p className="m-0 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-gold">{children}</p>;
}

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const isExpert = user?.role === 'Expert';

  const stats = isExpert
    ? [
        { label: 'Tutorials', value: '0', icon: BookOpen, tone: 'indigo' },
        { label: 'Followers', value: '0', icon: Users, tone: 'terracotta' },
        { label: 'Posts', value: '0', icon: Rss, tone: 'gold' },
        { label: 'Rating', value: '—', icon: Star, tone: 'sage' },
      ]
    : [
        { label: 'Experts Followed', value: '0', icon: Users, tone: 'terracotta' },
        { label: 'Tutorials Viewed', value: '0', icon: BookOpen, tone: 'indigo' },
        { label: 'Posts Created', value: '0', icon: Rss, tone: 'gold' },
        { label: 'Skills Explored', value: '0', icon: Star, tone: 'sage' },
      ];

  const actions = [
    {
      label: 'Go to Social Feed',
      description: 'Browse posts from the community',
      icon: Rss,
      onClick: () => navigate('/feed'),
      tone: 'indigo',
    },
    !isExpert && AR_TUTORIALS[0] && {
      label: 'Start AR Practice',
      description: `Practise ${AR_TUTORIALS[0].title} with your camera and an AI coach`,
      icon: Hand,
      onClick: () => navigate(getPracticePath(AR_TUTORIALS[0])),
      tone: 'sage',
    },
    isExpert && {
      label: 'View My Profile',
      description: 'See how learners see your profile',
      icon: User,
      onClick: () => navigate(`/expert/${user.id}`),
      tone: 'terracotta',
    },
    {
      label: isExpert ? 'Manage Tutorials' : 'Browse Tutorials',
      description: isExpert ? 'View your AR tutorial stubs' : 'Discover expert tutorials',
      icon: BookOpen,
      onClick: () => navigate('/feed'),
      tone: 'gold',
    },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1120px] px-4 pb-20 pt-8 sm:px-6">
        {/* ── Hero ─────────────────────────────────────────── */}
        <Card className="relative gap-0 overflow-hidden py-0 shadow-[var(--shadow-soft)]">
          <BlockPrintBand />
          <div className="relative px-6 py-10 sm:px-10 sm:py-12">
            <Jaali className="absolute inset-0 size-full text-[#A8873A] opacity-[0.08]" />
            <Rosette className="absolute -right-24 -top-24 hidden size-[22rem] text-[#A8873A]/35 md:block" />

            <div className="relative flex flex-wrap items-center gap-6 sm:gap-8 md:pr-56">
              <div className="relative grid size-28 shrink-0 place-items-center">
                <Rosette className="absolute inset-0 size-full text-[#A8873A]/60" />
                <Avatar className="size-20 ring-4 ring-card">
                  <AvatarFallback
                    className={`font-serif text-3xl text-[#FBF8F3] ${isExpert ? 'bg-[#2F3B6B]' : 'bg-[#B0573D]'}`}
                  >
                    {user?.name?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="min-w-0 flex-1">
                <SectionLabel>{isExpert ? 'Artisan studio' : 'Learner studio'}</SectionLabel>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h1 className="m-0 text-4xl font-normal leading-tight sm:text-[2.6rem]">
                    Welcome back, <span className="italic text-[#2F3B6B]">{user?.name}</span>!
                  </h1>
                  <Badge
                    variant="outline"
                    className={
                      isExpert
                        ? 'border-[#2F3B6B]/25 bg-[#2F3B6B]/8 text-[#2F3B6B]'
                        : 'border-[#B0573D]/30 bg-[#B0573D]/8 text-[#B0573D]'
                    }
                  >
                    {isExpert ? <Wand2 /> : <GraduationCap />}
                    {user?.role}
                  </Badge>
                </div>
                <p className="mb-0 mt-3 text-[0.95rem] text-muted-foreground">
                  {isExpert
                    ? `Sharing ${user?.expertise || 'your craft'} with the Kalaverse`
                    : 'Continue your craft learning journey'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* ── Stats ────────────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* ── Actions + Profile ────────────────────────────── */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <Card className="gap-4 shadow-[var(--shadow-soft)]">
            <CardHeader>
              <SectionLabel>Quick Actions</SectionLabel>
              <CardTitle className="font-serif text-2xl font-normal">Where to next?</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4">
              {actions.map((a, i) => (
                <Fragment key={a.label}>
                  {i > 0 && <Separator className="mx-3 w-auto" />}
                  <ActionRow {...a} />
                </Fragment>
              ))}
            </CardContent>
          </Card>

          <Card className="relative gap-4 overflow-hidden shadow-[var(--shadow-soft)]">
            <Rosette className="absolute -bottom-20 -right-20 size-56 text-[#A8873A]/15" />
            <CardHeader>
              <SectionLabel>Your Profile</SectionLabel>
              <CardTitle className="font-serif text-2xl font-normal">{user?.name}</CardTitle>
            </CardHeader>
            <CardContent className="relative flex flex-1 flex-col gap-5">
              {user?.bio ? (
                <blockquote className="relative m-0 border-l-2 border-[#A8873A]/50 pl-4 font-serif text-lg italic leading-relaxed text-[#4A423B]">
                  {user.bio}
                </blockquote>
              ) : (
                <p className="m-0 font-serif italic text-muted-foreground">No bio added yet.</p>
              )}

              {isExpert && user?.expertise && (
                <div>
                  <SectionLabel>CRAFT</SectionLabel>
                  <Badge variant="outline" className="mt-2 border-[#2F3B6B]/25 bg-[#2F3B6B]/8 text-[#2F3B6B]">
                    {user.expertise}
                  </Badge>
                </div>
              )}

              {(user?.contact?.email || user?.contact?.mobile) && (
                <div className="flex flex-col gap-2 text-sm text-[#4A423B]">
                  {user.contact.email && (
                    <span className="inline-flex items-center gap-2">
                      <Mail className="size-4 text-[#A8873A]" /> {user.contact.email}
                    </span>
                  )}
                  {user.contact.mobile && (
                    <span className="inline-flex items-center gap-2">
                      <Phone className="size-4 text-[#A8873A]" /> {user.contact.mobile}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
            {isExpert && (
              <CardFooter className="relative">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full border-[#2F3B6B]/35 text-[#2F3B6B] hover:bg-[#2F3B6B]/5 hover:text-[#2F3B6B]"
                  onClick={() => navigate(`/expert/${user.id}`)}
                >
                  <Sparkles />
                  View Public Profile
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* ── AR Practice ──────────────────────────────────── */}
        {AR_TUTORIALS.length > 0 && (
          <section className="mt-16" aria-labelledby="ar-practice-heading">
            <OrnamentDivider className="mb-10" />
            <div className="mb-8 max-w-xl">
              <SectionLabel>From the studio</SectionLabel>
              <h2 id="ar-practice-heading" className="mb-2 mt-2 text-4xl font-normal">
                AR Practice
              </h2>
              <p className="m-0 text-muted-foreground">
                Practise with your camera: hand tracking checks each step and an AI coach guides you.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {AR_TUTORIALS.map((tutorial) => (
                <PracticeCard
                  key={tutorial.id}
                  tutorial={tutorial}
                  onStart={() => navigate(getPracticePath(tutorial))}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
