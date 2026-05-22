import { type CSSProperties, type RefObject, useEffect, useRef, useState } from 'react'

type SectionId = 'losnij' | 'works' | 'more'

type WorkItem = {
  src: string
  title: string
  caption: string
  className: string
}

type PortfolioSection = {
  id: SectionId
  title: string
  intro: string
  className: string
}

type ActiveSection = {
  id: SectionId
  sectionOffsetX: number
  sectionOffsetY: number
  sectionWidth: number
  sectionHeight: number
  panelRect: {
    left: number
    top: number
    width: number
    height: number
  }
  expandedTransform: string
  expandedHeight: number
}

const works: WorkItem[] = [
  {
    src: '/assets/work01.png',
    title: 'Fashion capsule',
    caption: 'Editorial campaign',
    className: 'work-tall',
  },
  {
    src: '/assets/work02.png',
    title: 'Product launch',
    caption: 'UX direction',
    className: 'work-wide',
  },
  {
    src: '/assets/work03.png',
    title: 'Brand system',
    caption: 'Visual identity',
    className: 'work-square',
  },
]

const sections: PortfolioSection[] = [
  {
    id: 'losnij',
    title: 'LOSNIJ',
    intro: 'A quiet portrait study for visual direction.',
    className: 'column-losnij',
  },
  {
    id: 'works',
    title: 'WORKS',
    intro: 'Selected editorial campaigns, product systems, and visual identities.',
    className: 'column-works',
  },
  {
    id: 'more',
    title: 'MORE',
    intro: 'Everything we imagine can be made.',
    className: 'column-more',
  },
]

function App() {
  const panelRef = useRef<HTMLElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const morePageRef = useRef<HTMLElement | null>(null)
  const scrollFrameRef = useRef<number | null>(null)
  const sectionRefs = useRef<Record<SectionId, HTMLButtonElement | null>>({
    losnij: null,
    works: null,
    more: null,
  })
  const [activeSection, setActiveSection] = useState<ActiveSection | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isSettled, setIsSettled] = useState(false)

  const openSection = (id: SectionId) => {
    const section = sectionRefs.current[id]
    const panel = panelRef.current

    if (!section || !panel) {
      return
    }

    const sectionRect = section.getBoundingClientRect()
    const panelRect = panel.getBoundingClientRect()
    const scale = Math.max(window.innerWidth / sectionRect.width, window.innerHeight / sectionRect.height)
    const sectionOffsetX = sectionRect.left - panelRect.left
    const sectionOffsetY = sectionRect.top - panelRect.top
    const targetX = (window.innerWidth - sectionRect.width * scale) / 2 - sectionOffsetX * scale
    const targetY = -sectionOffsetY * scale

    setActiveSection({
      id,
      sectionOffsetX,
      sectionOffsetY,
      sectionWidth: sectionRect.width,
      sectionHeight: sectionRect.height,
      panelRect: {
        left: panelRect.left,
        top: panelRect.top,
        width: panelRect.width,
        height: panelRect.height,
      },
      expandedTransform: `translate(${targetX}px, ${targetY}px) scale(${scale})`,
      expandedHeight: panelRect.height * scale,
    })
    setIsClosing(false)
    setIsSettled(false)
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setIsExpanded(true))
    })
  }

  const closeSection = () => {
    if (!activeSection) {
      return
    }

    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
    if (morePageRef.current) {
      morePageRef.current.style.setProperty('--more-progress', '0')
    }
    if (scrollFrameRef.current) {
      window.cancelAnimationFrame(scrollFrameRef.current)
      scrollFrameRef.current = null
    }

    const section = sectionRefs.current[activeSection.id]
    const panel = panelRef.current
    const sectionRect = section?.getBoundingClientRect()
    const panelRect = panel?.getBoundingClientRect()
    const nextPanelRect = panelRect
      ? {
          left: panelRect.left,
          top: panelRect.top,
          width: panelRect.width,
          height: panelRect.height,
        }
      : activeSection.panelRect
    const nextSectionRect = sectionRect ?? {
      left: activeSection.panelRect.left,
      top: activeSection.panelRect.top,
      width: activeSection.panelRect.width,
      height: activeSection.panelRect.height,
    }
    const scale = Math.max(window.innerWidth / nextSectionRect.width, window.innerHeight / nextSectionRect.height)
    const sectionOffsetX = nextSectionRect.left - nextPanelRect.left
    const sectionOffsetY = nextSectionRect.top - nextPanelRect.top
    const targetX = (window.innerWidth - nextSectionRect.width * scale) / 2 - sectionOffsetX * scale
    const targetY = -sectionOffsetY * scale

    setActiveSection({
      id: activeSection.id,
      sectionOffsetX,
      sectionOffsetY,
      sectionWidth: nextSectionRect.width,
      sectionHeight: nextSectionRect.height,
      panelRect: nextPanelRect,
      expandedTransform: `translate(${targetX}px, ${targetY}px) scale(${scale})`,
      expandedHeight: nextPanelRect.height * scale,
    })
    setIsSettled(false)
    setIsClosing(true)
    setIsExpanded(false)
  }

  const handleZoomScroll = () => {
    if (!scrollRef.current || !morePageRef.current || activeSection?.id !== 'more' || !isSettled) {
      return
    }

    if (scrollFrameRef.current) {
      return
    }

    scrollFrameRef.current = window.requestAnimationFrame(() => {
      if (!scrollRef.current || !morePageRef.current) {
        scrollFrameRef.current = null
        return
      }

      const progress = Math.min(Math.max(scrollRef.current.scrollTop / window.innerHeight, 0), 1)
      morePageRef.current.style.setProperty('--more-progress', progress.toFixed(4))
      scrollFrameRef.current = null
    })
  }

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeSection()
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  })

  const overlayStyle: CSSProperties | undefined = activeSection
    ? isExpanded
      ? {
          width: activeSection.panelRect.width,
          height: activeSection.panelRect.height,
          transform: activeSection.expandedTransform,
        }
      : {
          width: activeSection.panelRect.width,
          height: activeSection.panelRect.height,
          transform: `translate(${activeSection.panelRect.left}px, ${activeSection.panelRect.top}px) scale(1)`,
        }
    : undefined

  return (
    <div className="app">
      <main className="main-panel" aria-label="Losnij portfolio showroom" ref={panelRef}>
        <PanelContent openSection={openSection} sectionRefs={sectionRefs} />
      </main>

      {activeSection && (
        <>
          <div className="zoom-scroll" role="dialog" aria-modal="true" ref={scrollRef} onScroll={handleZoomScroll}>
            <div
              className={`section-overlay ${isExpanded ? 'is-expanded' : ''} ${isClosing ? 'is-closing' : ''} ${
                isSettled ? 'is-settled' : ''
              } ${activeSection.id === 'more' ? 'is-more' : ''}`}
              aria-label={sections.find((section) => section.id === activeSection.id)?.title}
              onTransitionEnd={(event) => {
                if (event.currentTarget !== event.target || event.propertyName !== 'transform') {
                  return
                }

                if (isClosing) {
                  setActiveSection(null)
                  setIsClosing(false)
                  setIsSettled(false)
                  return
                }

                setIsSettled(true)
              }}
              style={overlayStyle}
            >
              <main className="main-panel zoom-panel" aria-hidden="true">
                <PanelContent />
              </main>
            </div>
            {activeSection.id === 'more' && isSettled && (
              <section
                className="more-scroll-page"
                ref={morePageRef}
                style={{ '--more-progress': 0 } as CSSProperties}
              >
                <article className="magazine-detail">
                  <p>Project Detail</p>
                  <h2>Archive for an imagined campaign system.</h2>
                  <div className="magazine-grid">
                    <img src="/assets/more.png" alt="Magazine project cover" />
                    <div>
                      <span>
                        This page is prepared as a magazine-style project detail. Add narrative, credits, images,
                        process notes, and related work here.
                      </span>
                      <small>Editorial direction / Visual system / Digital showroom</small>
                    </div>
                  </div>
                </article>
              </section>
            )}
            <div
              className="zoom-scroll-space"
              style={{
                height: isExpanded
                  ? activeSection.id === 'more'
                    ? '200vh'
                    : activeSection.expandedHeight
                  : '100vh',
              }}
            />
          </div>
          <button className="section-close" type="button" aria-label="Close" onClick={closeSection}>
            X
          </button>
        </>
      )}
    </div>
  )
}

function PanelContent({
  openSection,
  sectionRefs,
}: {
  openSection?: (id: SectionId) => void
  sectionRefs?: RefObject<Record<SectionId, HTMLButtonElement | null>>
}) {
  return (
    <>
      {sections.map((section) =>
        openSection && sectionRefs ? (
          <button
            className={`portfolio-section ${section.className}`}
            key={section.id}
            type="button"
            onClick={() => openSection(section.id)}
            ref={(node) => {
              sectionRefs.current[section.id] = node
            }}
          >
            <SectionContent section={section} />
          </button>
        ) : (
          <div className={`portfolio-section ${section.className}`} key={section.id}>
            <SectionContent section={section} />
          </div>
        ),
      )}
    </>
  )
}

function SectionContent({ section }: { section: PortfolioSection }) {
  return (
    <div className="section-inner">
      <h1>{section.title}</h1>

      {section.id === 'losnij' && (
        <>
          <figure className="section-media portrait-media">
            <img src="/assets/main-person.png" alt="LOSNIJ portrait" />
            <figcaption>
              <strong>Portrait direction</strong>
              <span>{section.intro}</span>
            </figcaption>
          </figure>
        </>
      )}

      {section.id === 'works' && (
        <>
          <div className="works-collage">
            {works.map((work) => (
              <figure className={`section-media ${work.className}`} key={work.title}>
                <img src={work.src} alt={work.title} />
                <figcaption>
                  <strong>{work.title}</strong>
                  <span>{work.caption}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </>
      )}

      {section.id === 'more' && (
        <>
          <figure className="section-media more-media">
            <img src="/assets/more.png" alt="More work" />
            <figcaption>
              <strong>Studio archive</strong>
              <span>{section.intro}</span>
            </figcaption>
          </figure>
          <p>{section.intro}</p>
        </>
      )}
    </div>
  )
}

export default App
