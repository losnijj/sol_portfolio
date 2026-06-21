import { type CSSProperties, type PointerEvent, type RefObject, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type SectionId = 'losnij' | 'works' | 'more'

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
  '--main-canvas-scale'?: number
}

const PANEL_CANVAS_WIDTH = 1575
const PANEL_CANVAS_HEIGHT = (PANEL_CANVAS_WIDTH * 7.9) / 16

const getMainCanvasScale = () => {
  if (typeof window === 'undefined') {
    return 1
  }

  const widthScale = (window.innerWidth * 0.82) / PANEL_CANVAS_WIDTH
  const heightScale = window.innerWidth >= 901 && window.innerHeight >= 700
    ? 1
    : (window.innerHeight * 0.94) / PANEL_CANVAS_HEIGHT

  return Math.min(widthScale, heightScale, 1)
}

const assetPath = (fileName: string) => `${import.meta.env.BASE_URL}assets/${fileName}`

const works: WorkItem[] = [
  {
    src: assetPath('work000.png'),
    title: 'ARCHE',
    subtitle: '패션 아카이브 앱 컨셉 디자인',
    category: 'Fashion Archive App Concept',
    role: 'UI/UX · Mobile App · Archive',
    className: 'work-feature',
  },
  {
    src: assetPath('work01.png'),
    title: 'SIMMONS',
    subtitle: '글로벌 브랜드 웹사이트 리디자인',
    category: 'Global Brand Website Redesign',
    role: 'UI/UX · Branding · Web',
    className: 'work-medium',
  },
  {
    src: assetPath('work02.png'),
    title: 'JUHAP',
    subtitle: '주류 페어링 앱 UX/UI 디자인',
    category: 'Liquor Pairing App UX/UI',
    role: 'Mobile App · UX/UI · Pairing',
    className: 'work-tall',
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
    title: 'Archive',
    intro: 'Quiet but Clear.',
    className: 'column-more',
  },
]

const aboutFocusItems: Array<[string, string]> = [
  ['Brand Experience', '브랜드의 본질을 정의하고\n일관된 경험으로 설계합니다.'],
  ['Visual Direction', '무드와 톤을 설정하고\n시각 언어로 구체화합니다.'],
  ['Editorial Layout', '정보의 흐름을 구조화하여\n가독성과 리듬을 만듭니다.'],
  ['Digital Interface', '사용자 중심의 인터페이스로\n직관적인 경험을 만듭니다.'],
]

const aboutToolRows: Array<[string, Array<[string, string]>]> = [
  ['DESIGN', [['Figma', '1.png'], ['Photoshop', '2.png'], ['Illustrator', '3.png']]],
  ['WEB', [['HTML', '4.png'], ['CSS', '5.png'], ['JavaScript', '6.png'], ['GitHub', '7.png']]],
  ['AI TOOL', [['ChatGPT', '8.png'], ['claude', '9.png'], ['Gemini', '10.png'], ['Midjourney', '11.png']]],
  ['OFFICE', [['Excel', '12.png'], ['PowerPoint', '13.png'], ['HWP', '14.png']]],
]

const aboutExperienceItems: Array<[string, string, string]> = [
  ['01', 'SIMMONS', '브랜드 헤리티지와 기술력을 전달하는 글로벌 웹사이트 리디자인'],
  ['02', 'ARCHE', '개인의 옷장과 취향을 기록하는 패션 아카이브 앱 컨셉 디자인'],
  ['03', 'JUHAP', '상황과 취향에 맞는 술과 안주 조합을 제안하는 주류 페어링 앱 UX/UI 디자인'],
  ['04', 'LOSNIJ Portfolio', '매거진과 쇼룸 컨셉을 바탕으로 기획하고 구현한 개인 웹 포트폴리오'],
]

function App() {
  const [mainCanvasScale, setMainCanvasScale] = useState(getMainCanvasScale)
  const panelRef = useRef<HTMLElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const morePageRef = useRef<HTMLElement | null>(null)
  const scrollFrameRef = useRef<number | null>(null)
  const openFrameRef = useRef<number | null>(null)
  const indexCloseTimeoutRef = useRef<number | null>(null)
  const sectionCloseFrameRef = useRef<number | null>(null)
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
  const [isSectionScrollingToTop, setIsSectionScrollingToTop] = useState(false)
  const [introPhase, setIntroPhase] = useState<'title' | 'panel' | 'complete'>('title')
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
    setIsSectionScrollingToTop(false)
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

    if (
      activeSection.id !== 'more' &&
      isSettled &&
      !isSectionScrollingToTop &&
      (scrollRef.current?.scrollTop ?? 0) > 0
    ) {
      const scroll = scrollRef.current
      const initialScrollTop = scroll?.scrollTop ?? 0
      let startedAt: number | null = null
      const duration = 980

      setIsSectionScrollingToTop(true)

      const scrollToTop = (now: number) => {
        startedAt ??= now

        if (!scrollRef.current) {
          sectionCloseFrameRef.current = null
          setIsSectionScrollingToTop(false)
          closeSectionImmediately()
          return
        }

        const progress = Math.min((now - startedAt) / duration, 1)
        const easedProgress = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2

        scrollRef.current.scrollTop = initialScrollTop * (1 - easedProgress)

        if (progress < 1) {
          sectionCloseFrameRef.current = window.requestAnimationFrame(scrollToTop)
          return
        }

        scrollRef.current.scrollTop = 0
        sectionCloseFrameRef.current = null
        setIsSectionScrollingToTop(false)
        closeSectionImmediately()
      }

      sectionCloseFrameRef.current = window.requestAnimationFrame(scrollToTop)
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
    if (scrollRef.current) {
      scrollRef.current.style.setProperty('--losnij-info-scroll', '0px')
      scrollRef.current.style.setProperty('--losnij-cover-pin-offset', '0px')
      scrollRef.current.classList.remove('is-losnij-cover-pinned')
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
    if (sectionCloseFrameRef.current) {
      window.cancelAnimationFrame(sectionCloseFrameRef.current)
      sectionCloseFrameRef.current = null
    }
    setIsSettled(false)
    setIsIndexCollapsing(false)
    setIsSectionScrollingToTop(false)
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
    const shouldScrollToTop = activeSection?.id === 'losnij' && isSettled && (scrollRef.current?.scrollTop ?? 0) > 0

    closeSection()
    window.setTimeout(() => {
      openSection('works')
    }, shouldScrollToTop ? 1440 : 460)
  }

  const navigateToSection = (id: SectionId) => {
    if (activeSection?.id === id) {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    closeSection()
    window.setTimeout(() => {
      openSection(id)
    }, activeSection && isSettled ? 1440 : 460)
  }

  const openContact = () => {
    setIsContactClosing(false)
    setIsContactOpen(true)
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
        const coverPinStart = Math.max(activeSection.expandedHeight - window.innerHeight, 0)
        const isCoverPinned = scrollRef.current.scrollTop >= coverPinStart
        const innerScroll = Math.max(scrollRef.current.scrollTop - activeSection.expandedHeight, 0)

        scrollRef.current.style.setProperty('--losnij-info-scroll', `${Math.min(scrollRef.current.scrollTop, coverPinStart)}px`)
        scrollRef.current.style.setProperty('--losnij-cover-pin-offset', `${coverPinStart}px`)
        scrollRef.current.style.setProperty('--losnij-cover-hold-progress', isCoverPinned ? '1' : '0')
        scrollRef.current.classList.toggle('is-losnij-cover-pinned', isCoverPinned)

        const serviceCards = Array.from(scrollRef.current.querySelectorAll<HTMLElement>('.losnij-service-card'))

        serviceCards.forEach((card, index) => {
          const stack = card.closest<HTMLElement>('.losnij-service-stack')
          const cardTop = stack ? card.offsetTop - stack.offsetTop : card.offsetTop
          const progress = Math.min(Math.max((innerScroll - cardTop + window.innerHeight) / window.innerHeight, 0), 1)
          const nextCard = serviceCards[index + 1]
          const nextCardTop = nextCard && stack ? nextCard.offsetTop - stack.offsetTop : cardTop + window.innerHeight
          const stackProgress = Math.min(Math.max((innerScroll - nextCardTop + window.innerHeight) / window.innerHeight, 0), 1)
          const cardHeight = card.offsetHeight || window.innerHeight
          const pinDistance = nextCard ? Math.max(nextCardTop - cardTop, cardHeight) : cardHeight
          const pinOffset = innerScroll > cardTop ? Math.min(innerScroll - cardTop, pinDistance) : 0
          const smoothstep = (value: number) => value * value * (3 - 2 * value)
          const reveal = (start: number, duration: number) =>
            smoothstep(Math.min(Math.max((progress - start) / duration, 0), 1))

          card.style.setProperty('--service-image-scale', (1.4 - progress * 0.4).toFixed(4))
          card.style.setProperty('--service-stack-progress', stackProgress.toFixed(4))
          card.style.setProperty('--service-pin-offset', `${pinOffset}px`)
          card.style.setProperty('--service-number-reveal', reveal(0.04, 0.36).toFixed(4))
          card.style.setProperty('--service-title-reveal', reveal(0.1, 0.42).toFixed(4))
          card.style.setProperty('--service-primary-reveal', reveal(0.22, 0.48).toFixed(4))
          card.style.setProperty('--service-secondary-reveal', reveal(0.34, 0.52).toFixed(4))
        })
      } else {
        scrollRef.current.classList.remove('is-losnij-cover-pinned')
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
    const panelTimer = window.setTimeout(() => setIntroPhase('panel'), 1650)
    const completeTimer = window.setTimeout(() => setIntroPhase('complete'), 3650)

    return () => {
      window.clearTimeout(panelTimer)
      window.clearTimeout(completeTimer)
    }
  }, [])

  useEffect(() => {
    const updateMainCanvasScale = () => setMainCanvasScale(getMainCanvasScale())

    window.addEventListener('resize', updateMainCanvasScale)
    return () => window.removeEventListener('resize', updateMainCanvasScale)
  }, [])

  useEffect(() => {
    if (!activeSection || !isExpanded || isSettled || isClosing) {
      return
    }

    const settleTimer = window.setTimeout(() => {
      setIsSettled(true)
    }, 1520)

    return () => {
      window.clearTimeout(settleTimer)
    }
  }, [activeSection, isClosing, isExpanded, isSettled])

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
      if (sectionCloseFrameRef.current) {
        window.cancelAnimationFrame(sectionCloseFrameRef.current)
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
    introPhase !== 'complete' ? `is-intro-${introPhase}` : '',
    activeSection ? 'is-section-open' : '',
    activeSection && (!isSettled || isClosing) ? 'is-zooming' : '',
  ]
    .filter(Boolean)
    .join(' ')
  const appStyle: AppStyle = { '--main-canvas-scale': mainCanvasScale }

  return (
    <div className={appClassName} style={appStyle}>
      {introPhase !== 'complete' && (
        <div className="site-intro" aria-hidden="true">
          <div className="site-intro-title-mask">
            <strong>
              losnij
              <span className="section-mark">S</span>
            </strong>
          </div>
        </div>
      )}
      <CustomCursor />
      <button
        className="contact-trigger"
        type="button"
        onClick={openContact}
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
            } ${activeSection.id === 'losnij' ? 'is-losnij-open' : ''} ${activeSection.id === 'more' ? 'is-index-open' : ''}`}
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
                <LosnijDetailPage
                  isVisible={isExpanded && isSettled && !isClosing}
                  onContact={openContact}
                  onNavigate={navigateToSection}
                  onNext={goToWorks}
                  onTop={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                />
              ) : activeSection.id === 'more' ? (
                <IndexDetailPage
                  isVisible={isExpanded && isSettled && !isClosing}
                  pageRef={morePageRef}
                />
              ) : (
                <>
                  <section className="zoom-detail-placeholder" aria-hidden="true" />
                  <PortfolioFooter
                    onContact={openContact}
                    onNavigate={navigateToSection}
                    onTop={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                  />
                </>
              )}
            </div>
          </div>
          <button
            className={`section-close ${isExpanded && !isClosing ? 'is-visible' : ''} ${isClosing ? 'is-closing' : ''}`}
            type="button"
            aria-label="Close section"
            data-cursor-label="Menu"
            onClick={closeSection}
          >
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

function IndexDetailPage({
  isVisible,
  pageRef,
}: {
  isVisible: boolean
  pageRef: RefObject<HTMLElement | null>
}) {
  return createPortal(
    <article className={`more-scroll-page ${isVisible ? 'is-visible' : ''}`} ref={pageRef}>
      <div className="archive-photo-stage" aria-hidden="true" />
    </article>,
    document.body,
  )
}

function LosnijDetailPage({
  onContact,
  onNavigate,
  onNext,
  onTop,
}: {
  isVisible: boolean
  onContact: () => void
  onNavigate: (id: SectionId) => void
  onNext: () => void
  onTop: () => void
}) {
  return (
    <article className="losnij-about">
      <section className="losnij-rising-page">
        <header className="losnij-rising-header" aria-hidden="true" />

        <div className="losnij-rising-content">
          <div className="losnij-rising-body">
            <p className="losnij-rising-masthead" aria-hidden="true">
              About me
            </p>
            <div className="losnij-rising-chapter">
              <span>CHAPTER 1</span>
            </div>
            <div className="losnij-rising-left">
              <h2>Identity</h2>
              <span aria-hidden="true" />
            </div>
            <div className="losnij-rising-copy">
              <h3>Quiet but Clear</h3>
              <p className="losnij-rising-subtitle">조용하지만 분명한 화면을 디자인합니다.</p>
              <div>
                <p>losnij는 진솔의 시선과 작업 방식을 담은 개인 디자인 아카이브입니다.</p>
                <p>브랜드의 분위기와 사용자의 흐름이 자연스럽게 만나는 화면을 고민합니다.</p>
                <p>정보를 정리하고, 이미지를 배치하고, 작은 디테일까지 다듬으며</p>
                <p>브랜드가 가진 감도를 디지털 경험으로 풀어내고자 합니다.</p>
                <p>화려하게 설명하기보다, 조용하지만 분명하게 읽히는 화면을 지향합니다.</p>
              </div>
            </div>
          </div>

          <section className="losnij-tools-section">
            <div className="losnij-section-chapter">
              <span>CHAPTER 2</span>
            </div>
            <div className="losnij-section-left">
              <h2>Tools</h2>
              <span aria-hidden="true" />
            </div>
            <div className="losnij-section-copy">
              <h3>Tool &amp; Focus</h3>
              <p>
                생각을 화면으로 정리하기 위한 도구와 방식들입니다.<br />
                결과보다 과정, 장식보다 구조를 우선하며<br />
                브랜드의 감도를 디지털 경험으로 연결합니다.
              </p>
            </div>

            <div className="losnij-focus-list">
              <div className="losnij-list-heading">
                <span>FOCUS</span>
              </div>
              <div className="losnij-focus-grid">
                {aboutFocusItems.map(([title, body]) => (
                  <div key={title}>
                    <h4>{title}</h4>
                    {body.split('\n').map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="losnij-tool-list">
              <div className="losnij-list-heading">
                <span>TOOLS</span>
              </div>
              {aboutToolRows.map(([label, tools]) => (
                <div className="losnij-tool-row" key={`${label}-${tools.map(([name]) => name).join('-')}`}>
                  <strong>{label}</strong>
                  <div>
                    {tools.map(([name, icon]) => (
                      <span className="losnij-tool-item" key={name}>
                        <i>
                          <img src={assetPath(icon)} alt="" />
                        </i>
                        <b>{name}</b>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="losnij-experience-section">
            <div className="losnij-section-chapter">
              <span>CHAPTER 3</span>
            </div>
            <div className="losnij-section-left">
              <h2>Experience</h2>
              <span aria-hidden="true" />
            </div>
            <div className="losnij-section-copy">
              <h3>Selected Project</h3>
              <p>
                구조와 분위기를 함께 다루는 작업들을 통해<br />
                브랜드와 무드, 콘텐츠 흐름, 화면의 밀도를<br />
                정리하는 방식을 쌓아왔습니다.
              </p>
            </div>
            <div className="losnij-project-list">
              {aboutExperienceItems.map(([number, title, body]) => (
                <div className="losnij-project-row" key={number}>
                  <div>
                    <span>{number}</span>
                    <strong>{title}</strong>
                  </div>
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </section>

          <footer className="losnij-rising-actions">
            <button type="button" onClick={onNext}>
              Next: Works
            </button>
            <button type="button" onClick={onContact}>
              Contact
            </button>
            <button type="button" onClick={() => onNavigate('more')}>
              Archive
            </button>
          </footer>

          <PortfolioFooter onContact={onContact} onNavigate={onNavigate} onTop={onTop} />
        </div>
      </section>
    </article>
  )
}

function PortfolioFooter({
  onContact,
  onNavigate,
  onTop,
}: {
  onContact: () => void
  onNavigate: (id: SectionId) => void
  onTop: () => void
}) {
  return (
    <footer className="portfolio-footer">
      <div className="portfolio-footer-links">
        <section>
          <p>(FOLLOW)</p>
          <div>
            <a className="portfolio-footer-menu-item" data-label="INSTAGRAM" href="https://www.instagram.com/" target="_blank" rel="noreferrer">
              <span>INSTAGRAM</span>
            </a>
            <a className="portfolio-footer-menu-item" data-label="EMAIL" href="mailto:wlsthf796@naver.com">
              <span>EMAIL</span>
            </a>
          </div>
        </section>

        <button className="portfolio-footer-top" type="button" onClick={onTop}>
          BACK TO TOP
        </button>

        <section className="portfolio-footer-navigation">
          <p>(NAVIGATION)</p>
          <div>
            <button className="portfolio-footer-menu-item" data-label="ABOUT" type="button" onClick={() => onNavigate('losnij')}>
              <span>ABOUT</span>
            </button>
            <button className="portfolio-footer-menu-item" data-label="WORKS" type="button" onClick={() => onNavigate('works')}>
              <span>WORKS</span>
            </button>
            <button className="portfolio-footer-menu-item" data-label="INDEX" type="button" onClick={() => onNavigate('more')}>
              <span>INDEX</span>
            </button>
            <button className="portfolio-footer-menu-item" data-label="CONTACT" type="button" onClick={onContact}>
              <span>CONTACT</span>
            </button>
          </div>
        </section>
      </div>

      <div className="portfolio-footer-marquee" aria-label="Thank you for visiting">
        <div>
          <span>THANK YOU FOR VISITING</span>
          <span>THANK YOU FOR VISITING</span>
        </div>
      </div>

      <div className="portfolio-footer-meta">
        <div>
          <span>SEOUL, KR</span>
          <span>LOSNIJ PORTFOLIO</span>
        </div>
        <span>©2026 ALL RIGHTS RESERVED</span>
      </div>
    </footer>
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
            LET&apos;S CONTACT
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
              <a href={import.meta.env.BASE_URL} aria-label="Portfolio home">
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
  const labelTargetRef = useRef<Element | null>(null)
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
      labelTargetRef.current = null
      scaleRef.current.target = 1
      initializedRef.current = false
      cursor.removeAttribute('data-cursor-label')
      cursor.classList.remove('is-visible', 'is-hover', 'is-hidden', 'has-label')
    }

    const setCursorLabel = (labelTarget: Element | null) => {
      if (labelTarget === labelTargetRef.current) {
        return
      }

      labelTargetRef.current = labelTarget
      const label = labelTarget?.getAttribute('data-cursor-label') ?? ''

      if (label) {
        cursor.setAttribute('data-cursor-label', label)
        cursor.classList.add('has-label')
        return
      }

      cursor.removeAttribute('data-cursor-label')
      cursor.classList.remove('has-label')
    }

    const handlePointerEnter = (event: globalThis.PointerEvent) => {
      handlePointerMove(event)
    }

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      const target = document.elementFromPoint(event.clientX, event.clientY)
      const isCursorArea = Boolean(target?.closest('.app, .contact-modal, .more-scroll-page'))

      if (!isCursorArea) {
        hideCursor()
        return
      }

      const position = positionRef.current
      position.targetX = event.clientX
      position.targetY = event.clientY

      const hoverTarget = target?.closest('a, button, .works-collage .section-media, [role="button"]') ?? null
      const isWorkImageTarget = Boolean(hoverTarget?.matches('.works-collage .section-media'))
      const labelTarget = isWorkImageTarget
        ? null
        : target?.closest('.section-close[data-cursor-label], .main-panel:not(.zoom-panel) .portfolio-section[data-cursor-label]') ?? null

      setCursorLabel(labelTarget)

      if (hoverTarget !== hoverTargetRef.current) {
        hoverTargetRef.current = hoverTarget

        if (hoverTarget) {
          scaleRef.current.target = labelTarget ? 1 : 1.28
          cursor.classList.add('is-hover')

          if (isWorkImageTarget) {
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
      const isWorkImageTarget = Boolean(hoverTarget?.matches('.works-collage .section-media'))
      const labelTarget = isWorkImageTarget
        ? null
        : target?.closest('.section-close[data-cursor-label], .main-panel:not(.zoom-panel) .portfolio-section[data-cursor-label]') ?? null

      setCursorLabel(labelTarget)

      if (!hoverTarget || hoverTarget === hoverTargetRef.current) {
        return
      }

      hoverTargetRef.current = hoverTarget
      scaleRef.current.target = labelTarget ? 1 : 1.28
      cursor.classList.add('is-hover')
      scheduleCursor()

      if (isWorkImageTarget) {
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
      setCursorLabel(null)
      scaleRef.current.target = 1
      cursor.classList.remove('is-hover', 'is-hidden', 'has-label')
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
        data-cursor-label={section.id === 'losnij' ? 'about' : section.title}
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
    tag.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, 14px)`

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
        <img src={assetPath(`tag0${index + 1}.png`)} alt="" />
      </div>
    </figure>
  )
}

function SectionContent({ isExpandedView, section }: { isExpandedView: boolean; section: PortfolioSection }) {
  return (
    <div className={`section-inner ${isExpandedView ? 'is-expanded-view' : ''}`}>
      <h1 data-title={section.title}>
        <span className="section-title-text" data-zoom-text={section.title}>
          {section.title}
        </span>
        {section.id === 'losnij' && (
          <span className="section-mark" aria-label="Signature mark">
            S
          </span>
        )}
      </h1>

      {section.id === 'losnij' && (
        <>
          <figure className="section-media portrait-media">
            <img src={assetPath('main-person.png')} alt="LOSNIJ portrait" />
          </figure>
          <div className="losnij-cover-info" aria-label="Portfolio cover information">
            <CoverInfoGroup title="2026 EDITION" items={['Jin Sol Portfolio', 'UI/UX Designer']} />
            <CoverInfoGroup title="FOCUS" items={['Brand Experience', 'Visual Direction', 'Editorial Layout', 'Digital Interface']} />
            <CoverInfoGroup title="CONTACT" items={['Email', 'wlsthf796@naver.com', 'Phone', '+82 1030256909']} />
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
            <img src={assetPath('more.png')} alt="More work" />
          </figure>
          <p className="index-closing-copy">
            <span className="index-closing-en" data-zoom-text={section.intro}>
              {section.intro}
            </span>
            <span className="index-closing-ko" data-zoom-text="조용하지만 분명한 화면을 디자인합니다.">
              조용하지만 분명한 화면을 디자인합니다.
            </span>
          </p>
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
