import { type CSSProperties, type PointerEvent, type ReactNode, useEffect, useRef, useState } from 'react'

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
      setIsExpanded(true)
      openFrameRef.current = null
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

  const goToWorks = () => {
    closeSection()
    window.setTimeout(() => {
      openSection('works')
    }, 460)
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

  const appClassName = [
    'app',
    activeSection ? 'is-section-open' : '',
    activeSection && (!isSettled || isClosing) ? 'is-zooming' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={appClassName}>
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
            className={`zoom-scroll ${isExpanded ? 'is-expanded' : ''} ${isClosing ? 'is-closing' : ''} ${
              isSettled ? 'is-settled' : ''
            }`}
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
              className={`zoom-detail-canvas ${activeSection.id === 'losnij' ? 'has-losnij-detail' : ''}`}
              style={{
                marginTop: isExpanded ? activeSection.expandedHeight : '100vh',
                minHeight:
                  activeSection.id === 'losnij'
                    ? 'auto'
                    : isExpanded
                      ? Math.max(window.innerHeight, 720)
                      : '100vh',
              }}
            >
              {activeSection.id === 'losnij' ? (
                <LosnijDetailPage isVisible={isExpanded && isSettled && !isClosing} onBack={closeSection} onNext={goToWorks} />
              ) : (
                <section className="zoom-detail-placeholder" aria-hidden="true" />
              )}
            </div>
          </div>
          {!isClosing && (
            <button className="section-close" type="button" aria-label="Close section" onClick={closeSection}>
              <span className="section-close-icon" aria-hidden="true">
                <span />
                <span />
              </span>
            </button>
          )}
        </>
      )}
      <ContactModal isClosing={isContactClosing} isOpen={isContactOpen} onClose={closeContact} />
    </div>
  )
}

const attitudeCards = [
  ['Clarity', '정보를 쉽게 이해할 수 있도록 정리합니다.'],
  ['Flow', '사용자의 행동이 자연스럽게 이어지도록 설계합니다.'],
  ['Mood', '브랜드의 분위기가 화면 안에서 일관되게 느껴지도록 다듬습니다.'],
]

const designItems = [
  [
    'Web Design',
    '브랜드의 이야기를 구조화하고 사용자가 필요한 정보를 자연스럽게 탐색할 수 있는 웹 경험을 설계합니다.',
  ],
  ['Mobile App', '사용자의 상황과 목적에 맞춰 간결하고 명확한 모바일 흐름을 구성합니다.'],
  ['Brand Experience', '브랜드의 태도와 분위기가 디지털 화면 안에서 일관되게 느껴지도록 디자인합니다.'],
]

const workSteps = [
  ['Discover', '사용자와 브랜드가 가진 문제를 파악합니다.'],
  ['Structure', '정보의 우선순위와 화면 흐름을 정리합니다.'],
  ['Design', '와이어프레임과 UI를 통해 경험을 구체화합니다.'],
  ['Refine', '여백, 타이포그래피, 이미지, 인터랙션을 다듬어 완성도를 높입니다.'],
]

function LosnijDetailPage({
  isVisible,
  onBack,
  onNext,
}: {
  isVisible: boolean
  onBack: () => void
  onNext: () => void
}) {
  const detailRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const root = detailRef.current

    if (!root || !isVisible) {
      return
    }

    const reveals = Array.from(root.querySelectorAll<HTMLElement>('.losnij-reveal'))
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.18 },
    )

    reveals.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [isVisible])

  return (
    <article className={`losnij-about ${isVisible ? 'is-visible' : ''}`} ref={detailRef}>
      <header className="losnij-about-hero losnij-reveal">
        <p>Hero</p>
        <h2>ABOUT LOSNIJ</h2>
      </header>

      <DetailSection title="Editor’s Note">
        <p>
          LOSNIJ는 UI/UX 디자이너 진솔의 포트폴리오입니다. 화려한 표현보다 사용자가 자연스럽게 이해하고
          머무를 수 있는 흐름을 중요하게 생각합니다.
        </p>
        <p>
          브랜드의 분위기, 사용자의 행동, 정보의 구조를 함께 바라보며 하나의 경험으로 정리하는 디자인을
          지향합니다.
        </p>
      </DetailSection>

      <DetailSection title="Design Attitude">
        <p>
          좋은 디자인은 먼저 이해되어야 한다고 생각합니다. 사용자가 망설이지 않고 다음 행동으로 이어질 수
          있도록 정보의 순서와 화면의 흐름을 정리합니다.
        </p>
        <p>
          눈에 강하게 남는 장면보다, 오래 보아도 편안하고 필요한 순간에 정확히 작동하는 화면을 만들고자
          합니다.
        </p>
        <div className="losnij-card-grid">
          {attitudeCards.map(([title, body]) => (
            <section className="losnij-card" key={title}>
              <h4>{title}</h4>
              <p>{body}</p>
            </section>
          ))}
        </div>
      </DetailSection>

      <DetailSection title="What I Design">
        <p>
          웹사이트, 모바일 앱, 브랜드 기반 디지털 경험을 중심으로 디자인합니다. 정보 구조를 정리하고, 사용자
          흐름을 설계하며, 화면의 시각적 톤과 인터랙션 방향까지 함께 고민합니다.
        </p>
        <div className="losnij-list">
          {designItems.map(([title, body]) => (
            <section className="losnij-list-item" key={title}>
              <h4>{title}</h4>
              <p>{body}</p>
            </section>
          ))}
        </div>
      </DetailSection>

      <DetailSection title="How I Work">
        <div className="losnij-process">
          {workSteps.map(([title, body], index) => (
            <section className="losnij-step" key={title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h4>{title}</h4>
              <p>{body}</p>
            </section>
          ))}
        </div>
      </DetailSection>

      <DetailSection title="Short Profile">
        <div className="losnij-profile">
          <dl>
            <div>
              <dt>Name</dt>
              <dd>진솔</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>UI/UX Designer</dd>
            </div>
            <div>
              <dt>About</dt>
              <dd>
                브랜드와 사용자를 연결하는 디지털 경험을 디자인합니다. 정보를 정리하고, 흐름을 만들고,
                조용하지만 오래 남는 화면을 만드는 일에 관심이 있습니다.
              </dd>
            </div>
            <div>
              <dt>Interest</dt>
              <dd>UI/UX Design · Web Design · Mobile App Design · Brand Experience · Visual Direction</dd>
            </div>
            <div>
              <dt>Tools</dt>
              <dd>Figma · Photoshop · Illustrator · HTML · CSS · JavaScript</dd>
            </div>
          </dl>
        </div>
      </DetailSection>

      <footer className="losnij-detail-actions losnij-reveal">
        <button type="button" onClick={onBack}>
          Back to Main
        </button>
        <button type="button" onClick={onNext}>
          Next: Works
        </button>
      </footer>
    </article>
  )
}

function DetailSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="losnij-detail-section losnij-reveal">
      <div className="losnij-detail-title">
        <h3>{title}</h3>
      </div>
      <div className="losnij-detail-body">{children}</div>
    </section>
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
  const scaleRef = useRef({ current: 1, target: 1 })
  const initializedRef = useRef(false)

  useEffect(() => {
    const cursor = cursorRef.current
    const app = cursor?.parentElement

    if (!cursor || !app) {
      return
    }

    const paintCursor = () => {
      const position = positionRef.current
      const scale = scaleRef.current
      cursor.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%) scale(${
        scale.current
      })`
    }

    const renderCursor = () => {
      const position = positionRef.current
      const scale = scaleRef.current
      position.x = position.targetX
      position.y = position.targetY
      scale.current += (scale.target - scale.current) * 0.52

      if (Math.abs(scale.target - scale.current) < 0.006) {
        scale.current = scale.target
      }

      paintCursor()

      const shouldContinue = scale.current !== scale.target
      frameRef.current = shouldContinue ? window.requestAnimationFrame(renderCursor) : null
    }

    const scheduleCursor = () => {
      if (!frameRef.current) {
        frameRef.current = window.requestAnimationFrame(renderCursor)
      }
    }

    const hideCursor = () => {
      hoverTargetRef.current = null
      scaleRef.current.target = 1
      initializedRef.current = false
      cursor.classList.remove('is-visible', 'is-hover', 'is-hidden')
    }

    const handlePointerEnter = (event: globalThis.PointerEvent) => {
      handlePointerMove(event)
    }

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      const target = document.elementFromPoint(event.clientX, event.clientY)
      const isCursorArea = Boolean(target?.closest('.main-panel:not(.zoom-panel), .contact-trigger'))

      if (!isCursorArea) {
        hideCursor()
        return
      }

      const position = positionRef.current
      position.targetX = event.clientX
      position.targetY = event.clientY

      const hoverTarget = target?.closest('a, button, .works-collage .section-media, [role="button"]') ?? null

      if (hoverTarget !== hoverTargetRef.current) {
        hoverTargetRef.current = hoverTarget

        if (hoverTarget) {
          scaleRef.current.target = 1.28
          cursor.classList.add('is-hover')

          if (hoverTarget.matches('.works-collage .section-media')) {
            cursor.classList.add('is-hidden')
          } else {
            cursor.classList.remove('is-hidden')
          }
        } else {
          scaleRef.current.target = 1
          cursor.classList.remove('is-hover', 'is-hidden')
        }
      }

      if (!cursor.classList.contains('is-visible')) {
        position.x = position.targetX
        position.y = position.targetY
        scaleRef.current.current = scaleRef.current.target
        initializedRef.current = true
        cursor.classList.add('is-visible')
      }

      if (!initializedRef.current) {
        position.x = position.targetX
        position.y = position.targetY
        initializedRef.current = true
      }

      position.x = position.targetX
      position.y = position.targetY
      paintCursor()
      scheduleCursor()
    }

    const handleMouseLeave = () => {
      hideCursor()
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
    }

    const handleMouseOver = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null
      const hoverTarget = target?.closest('a, button, .works-collage .section-media, [role="button"]')

      if (!hoverTarget || hoverTarget === hoverTargetRef.current) {
        return
      }

      hoverTargetRef.current = hoverTarget
      scaleRef.current.target = 1.28
      cursor.classList.add('is-hover')
      scheduleCursor()

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
      scaleRef.current.target = 1
      cursor.classList.remove('is-hover', 'is-hidden')
      scheduleCursor()
    }

    const moveEventName = 'onpointerrawupdate' in window ? 'pointerrawupdate' : 'pointermove'
    const handlePointerUpdate = handlePointerMove as EventListener

    window.addEventListener('pointerenter', handlePointerEnter, { passive: true })
    window.addEventListener(moveEventName, handlePointerUpdate, { passive: true })
    if (moveEventName !== 'pointermove') {
      window.addEventListener('pointermove', handlePointerMove, { passive: true })
    }
    window.addEventListener('pointerleave', handleMouseLeave)
    app.addEventListener('mouseover', handleMouseOver, { passive: true })
    app.addEventListener('mouseout', handleMouseOut, { passive: true })

    return () => {
      window.removeEventListener('pointerenter', handlePointerEnter)
      window.removeEventListener(moveEventName, handlePointerUpdate)
      if (moveEventName !== 'pointermove') {
        window.removeEventListener('pointermove', handlePointerMove)
      }
      window.removeEventListener('pointerleave', handleMouseLeave)
      app.removeEventListener('mouseover', handleMouseOver)
      app.removeEventListener('mouseout', handleMouseOut)

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
  const boundsRef = useRef<DOMRect | null>(null)
  const positionRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })

  const stopTracking = () => {
    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
    initializedRef.current = false
    boundsRef.current = null
  }

  const moveTag = () => {
    const tag = tagRef.current

    if (!tag) {
      frameRef.current = null
      return
    }

    const position = positionRef.current
    position.x += (position.targetX - position.x) * 0.46
    position.y += (position.targetY - position.y) * 0.46
    tag.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, 14px) rotate(-3deg)`

    const shouldContinue = Math.abs(position.targetX - position.x) > 0.1 || Math.abs(position.targetY - position.y) > 0.1
    frameRef.current = shouldContinue ? window.requestAnimationFrame(moveTag) : null
  }

  const startTracking = (event: PointerEvent<HTMLElement>) => {
    boundsRef.current = event.currentTarget.getBoundingClientRect()
    updateTagPosition(event)
  }

  const updateTagPosition = (event: PointerEvent<HTMLElement>) => {
    const bounds = boundsRef.current

    if (!bounds) {
      return
    }

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
      onPointerEnter={startTracking}
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
