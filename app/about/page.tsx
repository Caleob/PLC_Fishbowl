import type { Metadata } from 'next';
import Link from 'next/link';
import BuyMeCoffeeButton from '@/components/BuyMeCoffeeButton';

export const metadata: Metadata = {
  title: 'Why I Made This - The Fishbowl',
  description: 'The story behind The Fishbowl: why watching AIs think matters, and how a focus group simulator became a tool I actually use.',
};

export default function AboutPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-deep)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: 'fixed',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '500px',
          background: 'radial-gradient(ellipse, rgba(196,154,42,0.05) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* Navigation */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: 'rgba(17, 16, 16, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(61, 54, 50, 0.5)',
        }}
      >
        <div
          style={{
            maxWidth: '960px',
            margin: '0 auto',
            padding: '12px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: "'Silkscreen', monospace",
              fontSize: '10px',
              letterSpacing: '0.08em',
              color: 'var(--accent-gold)',
              textDecoration: 'none',
            }}
          >
            &larr; THE FISHBOWL
          </Link>
          <Link
            href="/setup"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '9px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              border: '1px solid var(--dark-border)',
              borderRadius: '4px',
              padding: '5px 12px',
            }}
          >
            START A SESSION
          </Link>
        </div>
      </nav>

      {/* Article content */}
      <article
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '60px 24px 80px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <header style={{ marginBottom: '56px' }}>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--accent-gold)',
              marginBottom: '20px',
              opacity: 0.7,
            }}
          >
            MARCH 2026
          </div>
          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
              fontWeight: 600,
              lineHeight: 1.2,
              color: 'var(--text-primary)',
              marginBottom: '24px',
              letterSpacing: '0.02em',
            }}
          >
            Why I Made This
          </h1>
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              maxWidth: '560px',
            }}
          >
            The Fishbowl is a low-stakes pedagogical simulator designed to help educators reflect on lessons, analyze pacing, and gather multi-faceted classroom feedback instantly.
          </p>
          {/* Gold rule */}
          <div
            style={{
              width: '60px',
              height: '2px',
              background: 'linear-gradient(90deg, var(--accent-gold), transparent)',
              marginTop: '32px',
            }}
          />
        </header>

        {/* --- SECTION 1: The Feedback Vacuum --- */}
        <section style={{ marginBottom: '48px' }}>
          <h2
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--accent-gold)',
              marginBottom: '16px',
            }}
          >
            01 / THE FEEDBACK VACUUM
          </h2>

          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '15px',
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
            }}
          >
            <p style={{ marginBottom: '12px' }}>
              Teachers operate in an observation vacuum. Between grading, planning, and lecturing, there is rarely time for school administrators or coaches to sit in on classes—often limiting observation to just once or twice a year. That frequency is simply too low to support real growth or help teachers evaluate new classroom strategies.
            </p>
          </div>
        </section>

        {/* --- SECTION 2: The Leadership Bottleneck --- */}
        <section style={{ marginBottom: '48px' }}>
          <h2
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--accent-gold)',
              marginBottom: '16px',
            }}
          >
            02 / THE LEADERSHIP BOTTLENECK
          </h2>

          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '15px',
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
            }}
          >
            <p style={{ marginBottom: '12px' }}>
              Instructional leaders want to support their staff, but administrative duties stretch them thin. They do not have the hours to review raw transcripts or sit through entire lessons for dozens of classrooms. The Fishbowl bridges this gap, providing teachers with immediate, constructive reflection whenever they need it.
            </p>
          </div>

          <blockquote
            style={{
              margin: '28px 0',
              padding: '0 0 0 20px',
              borderLeft: '3px solid var(--accent-gold)',
            }}
          >
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
                lineHeight: 1.4,
                color: 'var(--text-primary)',
                fontWeight: 300,
                margin: 0,
              }}
            >
              Instructional growth shouldn't be gated by schedule constraints. The Fishbowl offers a space for direct self-reflection.
            </p>
          </blockquote>
        </section>

        {/* --- SECTION 3: Simulating the Roundtable --- */}
        <section style={{ marginBottom: '48px' }}>
          <h2
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--accent-gold)',
              marginBottom: '16px',
            }}
          >
            03 / SIMULATING THE ROUNDTABLE
          </h2>

          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '15px',
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
            }}
          >
            <p style={{ marginBottom: '12px' }}>
              By submitting a lesson transcript or a classroom description, teachers instantly assemble a panel of four virtual educational experts. Instead of a single generic response, the system prompts these characters to debate and build upon one another's ideas, offering multi-dimensional advice in real time.
            </p>
          </div>
        </section>

        {/* --- SECTION 4: Multi-Perspective Discussion --- */}
        <section style={{ marginBottom: '48px' }}>
          <h2
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--accent-gold)',
              marginBottom: '16px',
            }}
          >
            04 / MULTI-PERSPECTIVE DISCUSSION
          </h2>

          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '15px',
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
            }}
          >
            <p style={{ marginBottom: '12px' }}>
              You watch the roundtable unfold step-by-step: Mrs. Frizzle suggests hands-on science connections, Mr. Spock highlights structural objectives and lesson clarity, Mrs. Knope guides emotional support and student reinforcement, and Gandalf challenges the deeper purpose of the lesson. This collaborative, low-stakes sandbox lets you pressure-test strategies before using them with students.
            </p>
          </div>
        </section>

        {/* --- SECTION 5: Acknowledgments & Open Source --- */}
        <section style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--accent-gold)',
              marginBottom: '16px',
            }}
          >
            05 / ACKNOWLEDGMENTS & SOURCE
          </h2>

          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '15px',
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
            }}
          >
            <p style={{ marginBottom: '12px' }}>
              The Fishbowl is open source under the MIT license and is hosted on GitHub. You can clone the project, modify the prompts, or adapt the panelist personas to align with your school's specific instructional rubrics and educational frameworks.
            </p>
            <p style={{ marginBottom: '12px', fontSize: '14px', fontStyle: 'italic', color: 'var(--text-muted)' }}>
              Acknowledgment: This tool is built upon the original open-source codebase of The Fishbowl created by Gavin Purcell and inspired by the AI for Humans podcast. We thank Gavin and the community for their work and inspiration.
            </p>
          </div>
        </section>

        {/* Divider */}
        <div
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, var(--dark-border), transparent)',
            margin: '0 0 24px',
          }}
        />

        {/* CTA Section */}
        <section
          style={{
            textAlign: 'center',
            padding: '20px 0 40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              alignItems: 'center',
            }}
          >
            {/* Try it CTA */}
            <Link
              href="/setup"
              className="cta-game-button"
              style={{
                fontFamily: "'Silkscreen', monospace",
                fontSize: '12px',
                letterSpacing: '0.08em',
                padding: '14px 32px',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Try The Fishbowl
            </Link>

            <BuyMeCoffeeButton variant="popup" />

            {/* Links row */}
            <div
              style={{
                display: 'flex',
                gap: '24px',
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <a
                href="https://github.com/gavinpurcell/the-fishbowl"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                }}
              >
                Original Repository
              </a>
              <span style={{ color: 'var(--dark-border)' }}>/</span>
              <a
                href="https://x.com/caleobking"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                }}
              >
                @caleobking
              </a>
            </div>
          </div>
        </section>

        {/* Footer attribution */}
        <div
          style={{
            textAlign: 'center',
            padding: '24px 0 0',
            borderTop: '1px solid rgba(61, 54, 50, 0.3)',
          }}
        >
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '11px',
              color: 'var(--text-muted)',
            }}
          >
            Original code by{' '}
            <a
              href="https://gavinpurcell.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}
            >
              Gavin Purcell
            </a>
            . Remixed by{' '}
            <a
              href="https://x.com/caleobking"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}
            >
              Caleob King
            </a>
          </p>
        </div>
      </article>
    </div>
  );
}
