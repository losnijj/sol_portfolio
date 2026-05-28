import { type CSSProperties, type PointerEvent, useEffect, useRef, useState } from 'react'

type SectionId = 'losnij' | 'works' | 'more'

type WorkItem = {
  src: string
  title: string
  category: string
  role: string
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
  initialClipPath: string
  panelRect: {
    left: number
    top: number
    width: number
    height: number
  }
  expandedTransform: string
  expandedHeight: number
  expandedScale: number
}

type ZoomOverlayStyle = CSSProperties & {
  '--zoom-scale': number
  '--zoom-inverse': number
}

const works: WorkItem[] = [
  {
    src: '/assets/work01.png',
    title: 'Simmons',
    category: 'Global Website Renewal',
    role: 'UI/UX · Branding · Web',
    className: 'work-wide',
  },
  {
    src: '/assets/work02.png',
    title: 'Joohap',
    category: 'Pairing Community App',
    role: 'Mobile App · UX/UI',
    className: 'work-large',
  },
  {
    src: '/assets/work03.png',
    title: 'Hospital',
    category: 'Hospital Website Renewal',
    role: 'Web · Information Architecture',
    className: 'work-stack',
  },
  {
    src: '/assets/work000.png',
    title: 'Fashion Archive',
    category: 'Fashion Curation App',
    role: 'Mobile App · Archive · Curation',
    className: 'work-small',
  },
]

const sections: PortfolioSection[] = [
  {
    id: 'losnij',
    title: 'losnij',
    intro: 'Portrait direction',
    className: 'column-losnij',
  },
  {
    id: 'works',
    title: 'Works',
    intro: 'Selected editorial fragments.',
    className: 'column-works',
  },
  {
    id: 'more',
    title: 'Index',
    intro: 'Everything we imagine can be made.',
    className: 'column-more',
  },
]

function App() {
  const panelRef = useRef<HTMLElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const morePageRef = useRef<HTMLElement | null>(null)
  const scrollFrameRef = useRef<number | null>(null)
  const openFrameRef = useRef<number | null>(null)
  const openDelayRef = useRef<number | null>(null)
  const closeDelayRef = useRef<number | null>(null)
  const sectionRefs = useRef<Record<SectionId, HTMLButtonElement | null>>({
    losnij: null,
    works: null,
    more: null,
  })
  const [activeSection, setActiveSection] = useState<ActiveSection | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isSettled, setIsSettled] = useState(false)
  const [closingTransform, setClosingTransform] = useState<string | null>(null)
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [isContactClosing, setIsContactClosing] = useState(false)
  const setSectionRef = (id: SectionId, node: HTMLButtonElement | null) => {
    sectionRefs.current[id] = node
  }

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
    const initialClipPath = `inset(${sectionRect.top}px ${window.innerWidth - sectionRect.right}px ${
      window.innerHeight - sectionRect.bottom
    }px ${sectionRect.left}px)`
    const targetX = (window.innerWidth - sectionRect.width * scale) / 2 - sectionOffsetX * scale
    const targetY = -sectionOffsetY * scale

    setActiveSection({
      id,
      sectionOffsetX,
      sectionOffsetY,
      sectionWidth: sectionRect.width,
      sectionHeight: sectionRect.height,
      initialClipPath,
      panelRect: {
        left: panelRect.left,
        top: panelRect.top,
        width: panelRect.width,
        height: panelRect.height,
      },
      expandedTransform: `translate3d(${targetX}px, ${targetY}px, 0) scale(${scale})`,
      expandedHeight: panelRect.height * scale,
      expandedScale: scale,
    })
    setIsClosing(false)
    setIsSettled(false)
    setClosingTransform(null)

    if (openFrameRef.current) {
      window.cancelAnimationFrame(openFrameRef.current)
    }
    if (openDelayRef.current) {
      window.clearTimeout(openDelayRef.current)
    }

    openFrameRef.current = window.requestAnimationFrame(() => {
      openDelayRef.current = window.setTimeout(() => {
        setIsExpanded(true)
        openFrameRef.current = null
        openDelayRef.current = null
      }, 95)
    })
  }

  const closeSection = () => {
    if (!activeSection) {
      return
    }

    const scrollTop = scrollRef.current?.scrollTop ?? 0
    const compensatedTransform =
      scrollTop > 0
        ? activeSection.expandedTransform.replace(
            /translate3d\(([-0-9.]+)px, ([-0-9.]+)px, 0\) scale\(([-0-9.]+)\)/,
            (_, x: string, y: string, scale: string) =>
              `translate3d(${x}px, ${Number(y) - scrollTop}px, 0) scale(${scale})`,
          )
        : activeSection.expandedTransform

    if (scrollRef.current && scrollTop > 0) {
      scrollRef.current.scrollTop = 0
    }
    if (morePageRef.current) {
      morePageRef.current.style.setProperty('--more-progress', '0')
    }
    if (scrollFrameRef.current) {
      window.cancelAnimationFrame(scrollFrameRef.current)
      scrollFrameRef.current = null
    }
    if (openFrameRef.current) {
      window.cancelAnimationFrame(openFrameRef.current)
      openFrameRef.current = null
    }
    if (openDelayRef.current) {
      window.clearTimeout(openDelayRef.current)
      openDelayRef.current = null
    }
    if (closeDelayRef.current) {
      window.clearTimeout(closeDelayRef.current)
      closeDelayRef.current = null
    }

    setIsSettled(false)
    setClosingTransform(compensatedTransform)
    setIsClosing(true)
    openFrameRef.current = window.requestAnimationFrame(() => {
      openFrameRef.current = window.requestAnimationFrame(() => {
        setIsExpanded(false)
        openFrameRef.current = null
      })
    })
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

  const closeContact = () => {
    if (!isContactOpen || isContactClosing) {
      return
    }

    setIsContactClosing(true)
    window.setTimeout(() => {
      setIsContactOpen(false)
      setIsContactClosing(false)
    }, 520)
  }

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeContact()
        closeSection()
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  })

  useEffect(() => {
    if (!isContactOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isContactOpen])

  useEffect(
    () => () => {
      if (openFrameRef.current) {
        window.cancelAnimationFrame(openFrameRef.current)
      }
      if (openDelayRef.current) {
        window.clearTimeout(openDelayRef.current)
      }
      if (closeDelayRef.current) {
        window.clearTimeout(closeDelayRef.current)
      }
    },
    [],
  )

  const overlayStyle: ZoomOverlayStyle | undefined = activeSection
    ? isExpanded
      ? {
          width: activeSection.panelRect.width,
          height: activeSection.panelRect.height,
          transform: closingTransform ?? activeSection.expandedTransform,
          '--zoom-scale': activeSection.expandedScale,
          '--zoom-inverse': 1 / activeSection.expandedScale,
        }
      : {
          width: activeSection.panelRect.width,
          height: activeSection.panelRect.height,
          transform: `translate3d(${activeSection.panelRect.left}px, ${activeSection.panelRect.top}px, 0) scale(1)`,
          '--zoom-scale': activeSection.expandedScale,
          '--zoom-inverse': 1 / activeSection.expandedScale,
        }
    : undefined

  return (
    <div className={`app ${activeSection ? 'is-section-open' : ''}`}>
      <CustomCursor />
      <button
        className="contact-trigger"
        type="button"
        onClick={() => {
          setIsContactClosing(false)
          setIsContactOpen(true)
        }}
      >
        CONTACT
      </button>
      <main className="main-panel" aria-label="Losnij portfolio showroom" ref={panelRef}>
        <PanelContent openSection={openSection} setSectionRef={setSectionRef} />
      </main>

      {activeSection && (
        <>
          <div
            className={`zoom-scroll ${isExpanded ? 'is-expanded' : ''} ${isClosing ? 'is-closing' : ''}`}
            role="dialog"
            aria-modal="true"
            ref={scrollRef}
            onScroll={handleZoomScroll}
          >
            <div
              className={`section-overlay ${activeSection.id === 'works' ? 'is-works' : ''} ${
                isExpanded ? 'is-expanded' : ''
              } ${isClosing ? 'is-closing' : ''} ${
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
                  setClosingTransform(null)
                  return
                }

                setIsSettled(true)
              }}
              style={overlayStyle}
            >
              <main className="main-panel zoom-panel" aria-hidden="true">
                <PanelContent isExpandedView={isExpanded && !isClosing} />
              </main>
            </div>
            <div
              className="zoom-scroll-space"
              style={{
                height: isExpanded
                  ? Math.max(activeSection.expandedHeight + window.innerHeight * 0.45, window.innerHeight * 1.8)
                  : '100vh',
              }}
            />
          </div>
          <button className="section-close" type="button" aria-label="Close" onClick={closeSection}>
            <span className="section-close-label">CLOSE</span>
            <span className="section-close-icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </>
      )}
      <ContactModal isClosing={isContactClosing} isOpen={isContactOpen} onClose={closeContact} />
    </div>
  )
}

function ContactModal({ isClosing, isOpen, onClose }: { isClosing: boolean; isOpen: boolean; onClose: () => void }) {
  return (
    <div
      className={`contact-modal ${isOpen ? 'is-open' : ''} ${isClosing ? 'is-closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Contact"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <article className="contact-card">
        <div className="contact-card-header">
          <h2>
            AVAILABLE
            <span>FOR PROJECTS</span>
          </h2>
          <div className="contact-actions">
            <button type="button" onClick={onClose}>
              CLOSE
            </button>
            <button className="contact-x" type="button" aria-label="Close contact modal" onClick={onClose}>
              X
            </button>
          </div>
        </div>

        <div className="contact-card-body">
          <section className="contact-identity">
            <p>JIN SOL</p>
            <span>UI/UX Designer</span>
          </section>

          <section>
            <h3>EMAIL</h3>
            <a href="mailto:wlsthf796@naver.com">wlsthf796@naver.com</a>
          </section>

          <section>
            <h3>FIELD</h3>
            <ul>
              <li>UI/UX Design</li>
              <li>Web Design</li>
              <li>Visual Direction</li>
              <li>Brand Experience</li>
            </ul>
          </section>

          <section>
            <h3>LINK</h3>
            <div className="contact-links">
              <a href="https://github.com/" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
                Instagram
              </a>
              <a href="/" aria-label="Portfolio home">
                Portfolio
              </a>
            </div>
          </section>
        </div>

        <p className="contact-card-note">Quiet digital experiences, designed with intention.</p>
      </article>
    </div>
  )
}

function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const hoverTargetRef = useRef<EventTarget | null>(null)
  const positionRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })

  useEffect(() => {
    const cursor = cursorRef.current
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches

    if (!cursor || !canHover) {
      return
    }

    const moveCursor = () => {
      const position = positionRef.current
      position.x += (position.targetX - position.x) * 0.22
      position.y += (position.targetY - position.y) * 0.22
      cursor.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`
      frameRef.current = window.requestAnimationFrame(moveCursor)
    }

    const handleMouseMove = (event: MouseEvent) => {
      const position = positionRef.current
      position.targetX = event.clientX
      position.targetY = event.clientY

      if (!cursor.classList.contains('is-visible')) {
        position.x = event.clientX
        position.y = event.clientY
        cursor.classList.add('is-visible')
      }

      if (!frameRef.current) {
        frameRef.current = window.requestAnimationFrame(moveCursor)
      }
    }

    const handleMouseLeave = () => {
      cursor.classList.remove('is-visible', 'is-hover', 'is-hidden')
    }

    const handleMouseOver = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null
      const hoverTarget = target?.closest('a, button, .works-collage .section-media, [role="button"]')

      if (!hoverTarget || hoverTarget === hoverTargetRef.current) {
        return
      }

      hoverTargetRef.current = hoverTarget
      cursor.classList.add('is-hover')

      if (hoverTarget.matches('.works-collage .section-media')) {
        cursor.classList.add('is-hidden')
      } else {
        cursor.classList.remove('is-hidden')
      }
    }

    const handleMouseOut = (event: MouseEvent) => {
      const currentHoverTarget = hoverTargetRef.current

      if (!(currentHoverTarget instanceof Element)) {
        return
      }

      const nextTarget = event.relatedTarget instanceof Node ? event.relatedTarget : null

      if (nextTarget && currentHoverTarget.contains(nextTarget)) {
        return
      }

      hoverTargetRef.current = null
      cursor.classList.remove('is-hover', 'is-hidden')
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)

      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])

  return <div className="custom-cursor" aria-hidden="true" ref={cursorRef} />
}

function PanelContent({
  isExpandedView = false,
  openSection,
  setSectionRef,
}: {
  isExpandedView?: boolean
  openSection?: (id: SectionId) => void
  setSectionRef?: (id: SectionId, node: HTMLButtonElement | null) => void
}) {
  return (
    <div className="book-pages">
      <section className="book-page book-page-left">
        <InteractiveSection
          isExpandedView={isExpandedView}
          section={sections[0]}
          openSection={openSection}
          setSectionRef={setSectionRef}
        />
      </section>
      <section className="book-page book-page-right">
        <InteractiveSection
          isExpandedView={isExpandedView}
          section={sections[1]}
          openSection={openSection}
          setSectionRef={setSectionRef}
        />
        <InteractiveSection
          isExpandedView={isExpandedView}
          section={sections[2]}
          openSection={openSection}
          setSectionRef={setSectionRef}
        />
      </section>
    </div>
  )
}

function InteractiveSection({
  isExpandedView,
  section,
  openSection,
  setSectionRef,
}: {
  isExpandedView: boolean
  section: PortfolioSection
  openSection?: (id: SectionId) => void
  setSectionRef?: (id: SectionId, node: HTMLButtonElement | null) => void
}) {
  if (openSection && setSectionRef) {
    return (
      <button
        className={`portfolio-section ${section.className}`}
        type="button"
        onClick={() => openSection(section.id)}
        ref={(node) => {
          setSectionRef(section.id, node)
        }}
      >
        <SectionContent isExpandedView={isExpandedView} section={section} />
      </button>
    )
  }

  return (
    <div className={`portfolio-section ${section.className}`}>
      <SectionContent isExpandedView={isExpandedView} section={section} />
    </div>
  )
}

function WorkProject({ work, index }: { work: WorkItem; index: number }) {
  const tagRef = useRef<HTMLDivElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const initializedRef = useRef(false)
  const positionRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })

  const stopTracking = () => {
    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
    initializedRef.current = false
  }

  const moveTag = () => {
    const tag = tagRef.current

    if (!tag) {
      frameRef.current = null
      return
    }

    const position = positionRef.current
    position.x += (position.targetX - position.x) * 0.18
    position.y += (position.targetY - position.y) * 0.18
    tag.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, 14px) rotate(-3deg)`

    const shouldContinue = Math.abs(position.targetX - position.x) > 0.1 || Math.abs(position.targetY - position.y) > 0.1
    frameRef.current = shouldContinue ? window.requestAnimationFrame(moveTag) : null
  }

  const updateTagPosition = (event: PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const position = positionRef.current

    position.targetX = event.clientX - bounds.left
    position.targetY = event.clientY - bounds.top

    if (!initializedRef.current) {
      position.x = position.targetX
      position.y = position.targetY
      initializedRef.current = true
    }

    if (!frameRef.current) {
      frameRef.current = window.requestAnimationFrame(moveTag)
    }
  }

  useEffect(
    () => () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current)
      }
    },
    [],
  )

  return (
    <figure
      className={`section-media ${work.className}`}
      data-num={String(index + 1).padStart(2, '0')}
      data-title={work.title}
      data-desc={work.category}
      data-keywords={work.role}
      onPointerEnter={updateTagPosition}
      onPointerMove={updateTagPosition}
      onPointerLeave={stopTracking}
    >
      <img src={work.src} alt={work.title} />
      <figcaption data-caption={work.title}>{work.title}</figcaption>
      <div className="project-hover-tag" aria-hidden="true" ref={tagRef}>
        <small>{String(index + 1).padStart(2, '0')}</small>
        <strong>{work.title}</strong>
        <span>{work.category}</span>
        <em>{work.role}</em>
      </div>
    </figure>
  )
}

function SectionContent({ isExpandedView, section }: { isExpandedView: boolean; section: PortfolioSection }) {
  return (
    <div className={`section-inner ${isExpandedView ? 'is-expanded-view' : ''}`}>
      <h1 data-title={section.title}>{section.title}</h1>

      {section.id === 'losnij' && (
        <>
          <figure className="section-media portrait-media">
            <img src="/assets/main-person.png" alt="LOSNIJ portrait" />
          </figure>
          <p className="losnij-caption">Designing quiet but intentional digital experiences.</p>
        </>
      )}

      {section.id === 'works' && (
        <>
          <div className="works-collage">
            {works.map((work, index) => (
              <WorkProject work={work} index={index} key={work.title} />
            ))}
          </div>
        </>
      )}

      {section.id === 'more' && (
        <>
          <figure className="section-media more-media">
            <img src="/assets/more.png" alt="More work" />
          </figure>
          <p>{section.intro}</p>
        </>
      )}
    </div>
  )
}

export default App
