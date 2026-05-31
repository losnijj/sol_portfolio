import { type CSSProperties, type PointerEvent, type RefObject, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type SectionId = 'losnij' | 'works' | 'more'

type IndexPageId = 'design-process' | 'tools-skills' | 'resume' | 'contact'

type WorkItem = {
  src: string
  title: string
  subtitle: string
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

type AppStyle = CSSProperties & {
  '--mac-main-scale'?: number
}

const MAC_PANEL_WIDTH = 1575
const MAC_PANEL_HEIGHT = (MAC_PANEL_WIDTH * 7.9) / 16

const getMacMainScale = () =>
  typeof window === 'undefined'
    ? 1
    : Math.min((window.innerWidth * 0.82) / MAC_PANEL_WIDTH, (window.innerHeight * 0.81) / MAC_PANEL_HEIGHT, 1)

const works: WorkItem[] = [
  {
    src: '/assets/work01.png',
    title: 'Simmons',
    subtitle: 'Global Brand Website Redesign',
    category: 'Global Website Renewal',
    role: 'UI/UX · Branding · Web',
    className: 'work-wide',
  },
  {
    src: '/assets/work02.png',
    title: 'Juchap',
    subtitle: 'AI Liquor Pairing App',
    category: 'Pairing Community App',
    role: 'Mobile App · UX/UI',
    className: 'work-large',
  },
  {
    src: '/assets/work03.png',
    title: 'Hospital',
    subtitle: 'Medical Service Website Redesign',
    category: 'Hospital Website Renewal',
    role: 'Web · Information Architecture',
    className: 'work-stack',
  },
  {
    src: '/assets/work000.png',
    title: 'ARCHE',
    subtitle: 'Personal Fashion Archive App',
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

const aboutServices = [
  {
    title: 'Clear Structure',
    description:
      '정보의 우선순위를 정리하고 사용자가 자연스럽게 다음 화면을 이해할 수 있는 구조를 설계합니다.',
    tags: ['Information Architecture', 'Content Flow', 'User Journey', 'Clarity'],
    image: '/assets/work01.png',
    tone: 'white',
  },
  {
    title: 'UI/UX Experience Design',
    description:
      '브랜드의 분위기를 유지하면서도 다양한 화면에서 편안하게 사용할 수 있는 인터페이스를 만듭니다.',
    tags: ['UI Design', 'UX Design', 'Responsive UI', 'Prototype'],
    image: '/assets/work03.png',
    tone: 'beige',
  },
  {
    title: 'Useful Interaction',
    description:
      '움직임은 장식보다 흐름을 돕는 역할에 집중합니다. 필요한 순간에만 자연스럽게 작동하도록 다듬습니다.',
    tags: ['Interaction', 'Motion Direction', 'Micro UX', 'Scroll Flow'],
    image: '/assets/work02.png',
    tone: 'yellow',
  },
  {
    title: 'Web Design & Direction',
    description:
      '콘텐츠, 이미지, 타이포그래피의 리듬을 하나의 경험으로 연결해 브랜드가 또렷하게 보이도록 합니다.',
    tags: ['Web Design', 'Visual Direction', 'Editorial Layout', 'Brand Mood'],
    image: '/assets/more.png',
    tone: 'black',
  },
  {
    title: 'Detailed Finish',
    description:
      '작은 여백과 정렬, 반응형 비율과 전환 속도까지 반복해서 점검하며 화면의 완성도를 높입니다.',
    tags: ['Refinement', 'Responsive Detail', 'Consistency', 'Finish'],
    image: '/assets/work000.png',
    tone: 'white',
  },
]

const indexPages = [
  {
    id: 'design-process',
    number: '01',
    title: 'Design Process',
    eyebrow: 'How each project takes shape',
    description:
      '좋은 화면은 장식보다 이해에서 시작합니다. 문제를 정리하고, 흐름을 만들고, 필요한 움직임만 남기는 과정을 반복합니다.',
    columns: [
      { title: 'Discover', items: ['Context Research', 'User Needs', 'Reference Study'] },
      { title: 'Structure', items: ['Information Architecture', 'User Flow', 'Content Priority'] },
      { title: 'Refine', items: ['Visual Direction', 'Interaction', 'Detailed Finish'] },
    ],
  },
  {
    id: 'tools-skills',
    number: '02',
    title: 'Tools & Skills',
    eyebrow: 'A practical design toolkit',
    description:
      '기획에서 프로토타입, 구현 검토까지 한 흐름으로 연결합니다. 도구는 결과를 또렷하게 만드는 방식으로 선택합니다.',
    columns: [
      { title: 'Design', items: ['Figma', 'Photoshop', 'Illustrator'] },
      { title: 'Web', items: ['HTML & CSS', 'JavaScript', 'React'] },
      { title: 'Focus', items: ['UI/UX Design', 'Web Design', 'Interaction'] },
    ],
  },
  {
    id: 'resume',
    number: '03',
    title: 'Resume',
    eyebrow: 'Selected profile',
    description:
      '차분한 구조와 분명한 사용 경험을 만드는 UI/UX 디자이너입니다. 브랜드의 분위기와 실제 사용성을 함께 다룹니다.',
    columns: [
      { title: 'Profile', items: ['Jin Sol', 'UI/UX Designer', 'Seoul, Korea'] },
      { title: 'Selected', items: ['Web Design', 'App Design', 'Visual Direction'] },
      { title: 'Edition', items: ['Selected Portfolio', '2026', 'Available for work'] },
    ],
  },
  {
    id: 'contact',
    number: '04',
    title: 'Contact',
    eyebrow: 'Let us make something useful',
    description:
      '새로운 프로젝트와 협업 이야기를 기다립니다. 아래 채널을 통해 편하게 연락해 주세요.',
    columns: [
      { title: 'Email', items: ['wlsthf796@naver.com'] },
      { title: 'Social', items: ['GitHub', 'Instagram'] },
      { title: 'Document', items: ['Resume', 'Portfolio'] },
    ],
  },
] satisfies Array<{
  id: IndexPageId
  number: string
  title: string
  eyebrow: string
  description: string
  columns: Array<{ title: string; items: string[] }>
}>

function App() {
  const isMacOS = typeof navigator !== 'undefined' && /Macintosh|MacIntel|Mac OS X/.test(navigator.userAgent)
  const [macMainScale, setMacMainScale] = useState(getMacMainScale)
  const panelRef = useRef<HTMLElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const morePageRef = useRef<HTMLElement | null>(null)
  const scrollFrameRef = useRef<number | null>(null)
  const openFrameRef = useRef<number | null>(null)
  const indexCloseTimeoutRef = useRef<number | null>(null)
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
  const [isIndexCollapsing, setIsIndexCollapsing] = useState(false)
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
    const sectionOffsetX = sectionRect.left - panelRect.left
    const sectionOffsetY = sectionRect.top - panelRect.top
    const frameLeft = id === 'losnij' ? 0 : sectionOffsetX
    const frameRight = id === 'more' ? panelRect.width : sectionOffsetX + sectionRect.width
    const scale = window.innerWidth / (frameRight - frameLeft)
    const initialClipPath = `inset(${sectionRect.top}px ${window.innerWidth - sectionRect.right}px ${
      window.innerHeight - sectionRect.bottom
    }px ${sectionRect.left}px)`
    const targetX = -frameLeft * scale
    const targetY = 0

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
    setIsIndexCollapsing(false)
    setClosingTransform(null)

    if (openFrameRef.current) {
      window.cancelAnimationFrame(openFrameRef.current)
    }
    openFrameRef.current = window.requestAnimationFrame(() => {
      openFrameRef.current = window.requestAnimationFrame(() => {
        setIsExpanded(true)
        openFrameRef.current = null
      })
    })
  }

  const closeSection = () => {
    if (!activeSection) {
      return
    }

    if (activeSection.id === 'more' && isSettled && !isIndexCollapsing) {
      setIsIndexCollapsing(true)
      indexCloseTimeoutRef.current = window.setTimeout(() => {
        indexCloseTimeoutRef.current = null
        closeSectionImmediately()
      }, 980)
      return
    }

    closeSectionImmediately()
  }

  const closeSectionImmediately = () => {
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
    setIsSettled(false)
    setIsIndexCollapsing(false)
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
    if (!scrollRef.current || !activeSection || !isSettled) {
      return
    }

    if (scrollFrameRef.current) {
      return
    }

    scrollFrameRef.current = window.requestAnimationFrame(() => {
      if (!scrollRef.current) {
        scrollFrameRef.current = null
        return
      }

      if (activeSection.id === 'losnij') {
        const imageScrollLimit = Math.max(activeSection.expandedHeight - window.innerHeight, 0)
        const infoScroll = Math.min(Math.max(scrollRef.current.scrollTop, 0), imageScrollLimit)
        const hero = scrollRef.current.querySelector<HTMLElement>('.losnij-soro-hero')

        scrollRef.current.style.setProperty('--losnij-info-scroll', `${infoScroll}px`)

        if (hero) {
          const heroProgress = Math.min(Math.max(-hero.getBoundingClientRect().top / (hero.offsetHeight - window.innerHeight), 0), 1)
          const frameWidth = 220 + (window.innerWidth - 220) * heroProgress
          const frameHeight = 220 + (window.innerHeight - 220) * heroProgress
          const contentProgress = Math.min(Math.max((heroProgress - 0.52) / 0.28, 0), 1)

          hero.style.setProperty('--about-frame-width', `${frameWidth.toFixed(2)}px`)
          hero.style.setProperty('--about-frame-height', `${frameHeight.toFixed(2)}px`)
          hero.style.setProperty('--about-frame-radius', `${(18 * (1 - heroProgress)).toFixed(2)}px`)
          hero.style.setProperty('--about-content-opacity', contentProgress.toFixed(4))
          hero.style.setProperty('--about-scroll-opacity', (1 - Math.min(heroProgress * 2.4, 1)).toFixed(4))
        }

        scrollRef.current.querySelectorAll<HTMLElement>('.losnij-service-card').forEach((card) => {
          const rect = card.getBoundingClientRect()
          const progress = Math.min(Math.max((window.innerHeight - rect.top) / window.innerHeight, 0), 1)

          card.style.setProperty('--service-image-scale', (1.4 - progress * 0.4).toFixed(4))
        })
      }

      if (activeSection.id === 'more' && morePageRef.current) {
        const progress = Math.min(Math.max(scrollRef.current.scrollTop / window.innerHeight, 0), 1)

        morePageRef.current.style.setProperty('--more-progress', progress.toFixed(4))
      }

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
    if (!isMacOS) {
      return
    }

    const updateMacMainScale = () => setMacMainScale(getMacMainScale())

    window.addEventListener('resize', updateMacMainScale)
    return () => window.removeEventListener('resize', updateMacMainScale)
  }, [isMacOS])

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
      if (indexCloseTimeoutRef.current) {
        window.clearTimeout(indexCloseTimeoutRef.current)
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
    isMacOS ? 'is-macos' : '',
    activeSection ? 'is-section-open' : '',
    activeSection && (!isSettled || isClosing) ? 'is-zooming' : '',
  ]
    .filter(Boolean)
    .join(' ')
  const appStyle: AppStyle | undefined = isMacOS ? { '--mac-main-scale': macMainScale } : undefined

  return (
    <div className={appClassName} style={appStyle}>
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
      <div className="main-panel-stage">
        <main className="main-panel" aria-label="Losnij portfolio showroom" ref={panelRef}>
          <PanelContent openSection={openSection} setSectionRef={setSectionRef} />
        </main>
      </div>

      {activeSection && (
        <>
          <div
            className={`zoom-scroll ${isExpanded ? 'is-expanded' : ''} ${isClosing ? 'is-closing' : ''} ${
              isSettled ? 'is-settled' : ''
            } ${activeSection.id === 'more' ? 'is-index-open' : ''}`}
            role="dialog"
            aria-modal="true"
            ref={scrollRef}
            onScroll={handleZoomScroll}
          >
            <div
              className={`section-overlay ${activeSection.id === 'losnij' ? 'is-losnij' : ''} ${
                activeSection.id === 'works' ? 'is-works' : ''
              } ${
                isExpanded ? 'is-expanded' : ''
              } ${isClosing ? 'is-closing' : ''} ${
                isSettled ? 'is-settled' : ''
              } ${activeSection.id === 'more' ? 'is-more' : ''} ${isIndexCollapsing ? 'is-index-collapsing' : ''}`}
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
              className={`zoom-detail-canvas ${activeSection.id === 'losnij' ? 'has-losnij-detail' : ''} ${
                activeSection.id === 'more' ? 'has-index-detail' : ''
              }`}
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
              ) : activeSection.id === 'more' ? (
                <IndexDetailPage
                  isMenuOpen={isExpanded && isSettled && !isClosing && !isIndexCollapsing}
                  isVisible={isExpanded && isSettled && !isClosing}
                  pageRef={morePageRef}
                />
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

function IndexDetailPage({
  isMenuOpen,
  isVisible,
  pageRef,
}: {
  isMenuOpen: boolean
  isVisible: boolean
  pageRef: RefObject<HTMLElement | null>
}) {
  const [activePageId, setActivePageId] = useState<IndexPageId | null>(null)
  const [isSubpageOpen, setIsSubpageOpen] = useState(false)
  const closeTimeoutRef = useRef<number | null>(null)
  const openSubpageFrameRef = useRef<number | null>(null)
  const activePage = indexPages.find((page) => page.id === activePageId) ?? null
  const clearSubpageTimers = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    if (openSubpageFrameRef.current) {
      window.cancelAnimationFrame(openSubpageFrameRef.current)
      openSubpageFrameRef.current = null
    }
  }
  const openSubpage = (pageId: IndexPageId) => {
    clearSubpageTimers()
    setIsSubpageOpen(false)
    setActivePageId(pageId)
    openSubpageFrameRef.current = window.requestAnimationFrame(() => {
      openSubpageFrameRef.current = window.requestAnimationFrame(() => {
        setIsSubpageOpen(true)
        openSubpageFrameRef.current = null
      })
    })
  }
  const closeSubpage = () => {
    clearSubpageTimers()
    setIsSubpageOpen(false)
    closeTimeoutRef.current = window.setTimeout(() => {
      setActivePageId(null)
      closeTimeoutRef.current = null
    }, 920)
  }

  useEffect(
    () => () => {
      clearSubpageTimers()
    },
    [],
  )

  return createPortal(
    <article className={`more-scroll-page ${isVisible ? 'is-visible' : ''} ${isMenuOpen ? 'is-menu-open' : ''}`} ref={pageRef}>
      <div className="index-page-scroll">
        <header className="index-page-header">
          <p>Menu</p>
          <h2>Index</h2>
        </header>

        <nav className="index-page-menu" aria-label="Portfolio index">
          {indexPages.map((page) => (
            <button
              type="button"
              key={page.id}
              onClick={() => openSubpage(page.id)}
            >
              <span>{page.title}</span>
              <span aria-hidden="true">→</span>
            </button>
          ))}
        </nav>

      </div>

      {activePage && (
        <section className={`index-subpage ${isSubpageOpen ? 'is-open' : ''}`} aria-hidden={!isSubpageOpen}>
            <button className="index-subpage-close" type="button" onClick={closeSubpage}>
              <span>Back to Index</span>
              <i aria-hidden="true">×</i>
            </button>

            <div className="index-subpage-inner">
              <header>
                <p>
                  Index / {activePage.number}
                  <span>{activePage.eyebrow}</span>
                </p>
                <h2>{activePage.title}</h2>
              </header>

              <div className="index-subpage-body">
                <p>{activePage.description}</p>
                <div className="index-subpage-columns">
                  {activePage.columns.map((column) => (
                    <section key={column.title}>
                      <h3>{column.title}</h3>
                      {column.items.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </section>
                  ))}
                </div>
              </div>
            </div>
        </section>
      )}
    </article>,
    document.body,
  )
}

function LosnijDetailPage({ onBack, onNext }: { isVisible: boolean; onBack: () => void; onNext: () => void }) {
  return (
    <article className="losnij-about">
      <section className="losnij-soro-hero">
        <div className="losnij-soro-hero-sticky">
          <div className="losnij-soro-frame">
            <img src="/assets/main-person.png" alt="" />
            <div className="losnij-soro-frame-overlay" />
            <div className="losnij-soro-frame-content">
              <p>Design with Meaning</p>
              <h2>About LOSNIJ</h2>
              <span>브랜드와 사람 사이의 자연스러운 경험을 디자인합니다.</span>
            </div>
          </div>
          <small>( Scroll Down )</small>
        </div>
      </section>

      <section className="losnij-service-stack">
        {aboutServices.map((service, index) => (
          <section className={`losnij-service-card is-${service.tone}`} key={service.title}>
            <figure>
              <div>
                <img src={service.image} alt="" />
              </div>
            </figure>
            <div className="losnij-service-content">
              <h2>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {service.title}
              </h2>
              <p>{service.description}</p>
              <div className="losnij-service-tags">
                {service.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </section>
        ))}
      </section>

      <footer className="losnij-detail-actions">
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
      <figcaption>
        <span className="work-caption-title" data-zoom-text={work.title}>
          {work.title}
        </span>
        <span className="work-caption-subtitle" data-zoom-text={work.subtitle}>
          {work.subtitle}
        </span>
      </figcaption>
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
          <div className="losnij-cover-info" aria-label="Portfolio cover information">
            <CoverInfoGroup title="Issue" items={['Selected Portfolio', 'UI/UX Designer', '2026 Edition']} />
            <CoverInfoGroup title="Focus" items={['UI/UX Design', 'Web Design', 'Visual Direction', 'Interaction']} />
            <CoverInfoGroup title="Approach" items={['Clear Structure', 'Quiet Mood', 'Useful Interaction', 'Detailed Finish']} />
            <CoverInfoGroup title="Contact" items={['Email', 'GitHub', 'Resume']} />
          </div>
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
          <p data-zoom-text={section.intro}>{section.intro}</p>
        </>
      )}
    </div>
  )
}

function CoverInfoGroup({ items, title }: { items: string[]; title: string }) {
  return (
    <section className="losnij-cover-group">
      <h2 data-zoom-text={title}>{title}</h2>
      <div>
        {items.map((item) => (
          <span data-zoom-text={item} key={item}>
            {item}
          </span>
        ))}
      </div>
    </section>
  )
}

export default App
