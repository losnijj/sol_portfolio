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
    title: 'Index',
    intro: 'Quiet but Clear.',
    className: 'column-more',
  },
]

const aboutServices = [
  {
    title: 'About LOSNIJ',
    korean: [
      'LOSNIJ는 Jin Sol을 뒤집어 만든 개인 포트폴리오 브랜드입니다. 익숙한 이름을 다른 방향으로 바라보듯, 나의 작업도 화면과 정보를 새로운 시선으로 정리하는 과정에서 시작됩니다.',
      '이 공간은 작업물을 단순히 모아둔 곳이 아니라, 내가 디자인을 바라보는 방식과 화면을 구성하는 태도를 담은 개인 아카이브입니다.',
    ],
    english: [
      'LOSNIJ is a personal portfolio brand created by reversing the name Jin Sol. Just as a familiar name can be seen from a different direction, my work begins by reorganizing screens and information through a new perspective.',
      'This space is not simply a collection of projects. It is a personal archive that reflects how I approach design and how I build visual structure on screen.',
    ],
    tone: 'white',
  },
  {
    title: 'Design View',
    korean: [
      '나는 디자인을 예쁜 화면을 만드는 일에서 끝내지 않습니다. 사용자가 어떤 정보를 먼저 보고, 어디에 머무르며, 어떤 흐름으로 이동하는지를 함께 고민합니다.',
      '분위기 있는 비주얼과 명확한 구조가 균형을 이룰 때, 더 오래 기억되는 화면이 만들어진다고 생각합니다.',
    ],
    english: [
      'I don’t see design as simply making a screen look beautiful. I also consider what information users see first, where they pause, and how they move through the flow.',
      'I believe that when atmospheric visuals and a clear structure are well balanced, a screen becomes more memorable and lasting.',
    ],
    tone: 'beige',
  },
  {
    title: 'Attitude',
    subtitle: 'Quiet but Clear',
    korean: [
      '나는 과하게 설명하기보다, 조용하지만 분명하게 전달되는 디자인을 좋아합니다.',
      '여백, 정렬, 타이포그래피, 이미지의 분위기처럼 작은 요소들이 자연스럽게 맞물릴 때 사용자가 더 편하게 이해할 수 있다고 생각합니다.',
    ],
    english: [
      'I prefer design that communicates quietly but clearly, rather than explaining too much.',
      'I believe users can understand more comfortably when small elements such as spacing, alignment, typography, and the mood of images come together naturally.',
    ],
    tone: 'yellow',
  },
  {
    title: 'Keywords',
    keywords: [
      ['Structure', '정보가 자연스럽게 읽히는 구조', 'A structure that lets information read naturally'],
      ['Mood', '브랜드의 분위기를 담는 감각', 'A sense for capturing the brand’s atmosphere'],
      ['Flow', '사용자가 막힘없이 이동하는 흐름', 'A seamless flow that helps users move without friction'],
      ['Balance', '감성과 사용성 사이의 균형', 'A balance between emotion and usability'],
      ['Detail', '작은 요소까지 살피는 태도', 'An attitude of carefully observing even the smallest elements'],
    ],
    tone: 'black',
  },
  {
    title: 'Closing',
    korean: ['LOSNIJ는 지금의 내가 디자인을 바라보는 방식이자, 앞으로 쌓아갈 작업의 출발점입니다.'],
    english: ['Designed with structure, mood, and flow.'],
    tone: 'white',
  },
]

const indexPages = [
  {
    id: 'design-process',
    number: '01',
    title: 'Design Process',
    eyebrow: 'How each project takes shape',
  },
  {
    id: 'tools-skills',
    number: '02',
    title: 'Tools & Skills',
    eyebrow: 'A practical design toolkit',
  },
  {
    id: 'resume',
    number: '03',
    title: 'Resume',
    eyebrow: 'Selected profile',
  },
  {
    id: 'contact',
    number: '04',
    title: 'Contact',
    eyebrow: 'Let us make something useful',
  },
] satisfies Array<{
  id: IndexPageId
  number: string
  title: string
  eyebrow: string
}>

const designProcessSteps = [
  {
    title: 'Research',
    description: '브랜드, 사용자, 경쟁 서비스, 레퍼런스를 조사합니다.',
  },
  {
    title: 'Define',
    description: '서비스의 목적과 핵심 문제를 정리합니다.',
  },
  {
    title: 'Structure',
    description: 'IA, 사용자 흐름, 와이어프레임을 통해 화면 구조를 설계합니다.',
  },
  {
    title: 'Visual Design',
    description: '컬러, 타이포그래피, 이미지, 레이아웃을 바탕으로 실제 UI를 디자인합니다.',
  },
  {
    title: 'Refinement',
    description: '여백, 정렬, 반응형, 인터랙션 디테일을 다듬습니다.',
  },
]

const toolSkills = [
  { title: 'Figma', description: 'UI Design / Wireframe / Prototype / Component' },
  { title: 'Photoshop', description: 'Image Editing / Mood Visual / Mockup' },
  { title: 'Illustrator', description: 'Logo / Icon / Vector Graphic' },
  { title: 'UI/UX', description: 'User Flow / IA / Design System / Responsive Web' },
  { title: 'Development Understanding', description: 'HTML / CSS / JavaScript / React Basic / GitHub' },
  { title: 'AI Tools', description: 'Codex / Midjourney / Gemini / Claude' },
]

const resumeProjects = [
  {
    title: 'Jeju National University Hospital Redesign',
    description: '신뢰감 있는 의료 정보를 전달하는 병원 웹 리디자인',
  },
  {
    title: 'SIMMONS Global Website Redesign',
    description: '브랜드 헤리티지를 전달하는 글로벌 웹 리디자인',
  },
  {
    title: 'JUHAP',
    description: '상황과 취향에 맞는 주류 페어링 앱',
  },
  {
    title: 'ARCHE',
    description: '개인의 옷장과 취향을 기록하는 패션 아카이브 앱',
  },
  {
    title: 'LOSNIJ Portfolio',
    description: '매거진과 쇼룸 컨셉의 개인 포트폴리오 웹사이트',
  },
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
        const imageScrollLimit = Math.max(activeSection.expandedHeight - window.innerHeight, 0)
        const infoScroll = Math.min(Math.max(scrollRef.current.scrollTop, 0), imageScrollLimit)
        const hero = scrollRef.current.querySelector<HTMLElement>('.losnij-soro-hero')
        const heroEntry = scrollRef.current.querySelector<HTMLElement>('.losnij-soro-entry')
        const servicesReveal = scrollRef.current.querySelector<HTMLElement>('.losnij-services-reveal')

        scrollRef.current.style.setProperty('--losnij-info-scroll', `${infoScroll}px`)

        if (heroEntry) {
          const entryProgress = Math.min(Math.max((window.innerHeight - heroEntry.getBoundingClientRect().top) / window.innerHeight, 0), 1)
          const easedEntryProgress = entryProgress * entryProgress * (3 - 2 * entryProgress)

          heroEntry.style.setProperty('--about-entry-shift', `${((1 - easedEntryProgress) * 14).toFixed(2)}vh`)
        }

        if (servicesReveal) {
          const revealProgress = Math.min(
            Math.max((window.innerHeight - servicesReveal.getBoundingClientRect().top) / window.innerHeight, 0),
            1,
          )
          const easedRevealProgress = revealProgress * revealProgress * (3 - 2 * revealProgress)

          servicesReveal.style.setProperty('--services-reveal-shift', `${((1 - easedRevealProgress) * 100).toFixed(2)}vh`)
        }

        if (hero) {
          const heroProgress = Math.min(Math.max(-hero.getBoundingClientRect().top / (hero.offsetHeight - window.innerHeight), 0), 1)
          const isCompactViewport = window.innerWidth <= 720
          const initialFrameWidth = isCompactViewport ? 38 : 30
          const initialFrameHeight = isCompactViewport ? 32 : 38
          const initialFrameTop = isCompactViewport ? 56 : 51
          const smoothstep = (progress: number) => progress * progress * (3 - 2 * progress)
          const gatherProgress = smoothstep(Math.min(heroProgress / 0.68, 1))
          const coverProgress = smoothstep(Math.min(Math.max((heroProgress - 0.28) / 0.72, 0), 1))
          const gatheredFrameWidth = isCompactViewport ? 54 : 44
          const gatheredFrameHeight = isCompactViewport ? 40 : 50
          const downwardTravel = isCompactViewport ? 7 : 9
          const frameWidth =
            initialFrameWidth +
            (gatheredFrameWidth - initialFrameWidth) * gatherProgress +
            (100 - gatheredFrameWidth) * coverProgress
          const frameHeight =
            initialFrameHeight +
            (gatheredFrameHeight - initialFrameHeight) * gatherProgress +
            (100 - gatheredFrameHeight) * coverProgress
          const frameTop = initialFrameTop + downwardTravel * gatherProgress - (initialFrameTop + downwardTravel) * coverProgress
          const bottomTypeOffset = (isCompactViewport ? 12 : 19) * gatherProgress

          hero.style.setProperty('--about-frame-width', `${frameWidth.toFixed(2)}vw`)
          hero.style.setProperty('--about-frame-height', `${frameHeight.toFixed(2)}vh`)
          hero.style.setProperty('--about-frame-top', `${frameTop.toFixed(2)}vh`)
          hero.style.setProperty('--about-bottom-type-offset', `${bottomTypeOffset.toFixed(2)}vw`)
          hero.style.setProperty('--about-scroll-opacity', (1 - Math.min(heroProgress * 2.4, 1)).toFixed(4))
        }

        const serviceCards = Array.from(scrollRef.current.querySelectorAll<HTMLElement>('.losnij-service-card'))

        serviceCards.forEach((card, index) => {
          const rect = card.getBoundingClientRect()
          const progress = Math.min(Math.max((window.innerHeight - rect.top) / window.innerHeight, 0), 1)
          const nextCard = serviceCards[index + 1]
          const nextCardTop = nextCard?.getBoundingClientRect().top ?? window.innerHeight
          const stackProgress = Math.min(Math.max((window.innerHeight - nextCardTop) / window.innerHeight, 0), 1)
          const smoothstep = (value: number) => value * value * (3 - 2 * value)
          const reveal = (start: number, duration: number) =>
            smoothstep(Math.min(Math.max((progress - start) / duration, 0), 1))

          card.style.setProperty('--service-image-scale', (1.4 - progress * 0.4).toFixed(4))
          card.style.setProperty('--service-stack-progress', stackProgress.toFixed(4))
          card.style.setProperty('--service-number-reveal', reveal(0.04, 0.36).toFixed(4))
          card.style.setProperty('--service-title-reveal', reveal(0.1, 0.42).toFixed(4))
          card.style.setProperty('--service-primary-reveal', reveal(0.22, 0.48).toFixed(4))
          card.style.setProperty('--service-secondary-reveal', reveal(0.34, 0.52).toFixed(4))
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
                <LosnijDetailPage
                  isVisible={isExpanded && isSettled && !isClosing}
                  onBack={closeSection}
                  onContact={openContact}
                  onNavigate={navigateToSection}
                  onNext={goToWorks}
                  onTop={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                />
              ) : activeSection.id === 'more' ? (
                <IndexDetailPage
                  isMenuOpen={isExpanded && isSettled && !isClosing && !isIndexCollapsing}
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
                <IndexSubpageContent pageId={activePage.id} />
              </div>

            </div>
        </section>
      )}
    </article>,
    document.body,
  )
}

function IndexSubpageContent({ pageId }: { pageId: IndexPageId }) {
  if (pageId === 'design-process') {
    return <DesignProcessContent />
  }

  if (pageId === 'tools-skills') {
    return <ToolsSkillsContent />
  }

  if (pageId === 'resume') {
    return <ResumeContent />
  }

  return <ContactContent />
}

function DesignProcessContent() {
  return (
    <div className="design-process-content">
      <div className="design-process-intro">
        <p>My design process begins with understanding the purpose of the service and the user’s flow.</p>
        <p>화면을 만들기 전, 서비스의 목적과 사용자가 필요한 정보를 먼저 정리합니다.</p>
      </div>

      <div className="design-process-grid">
        {designProcessSteps.map((step, index) => (
          <section className="design-process-step" key={step.title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </section>
        ))}
      </div>

      <p className="design-process-closing">From structure to mood, I build clear and usable interfaces.</p>
    </div>
  )
}

function ToolsSkillsContent() {
  return (
    <div className="editorial-content">
      <div className="editorial-intro">
        <p>I use design tools to create interfaces, visual systems, and brand mood.</p>
        <p>UI/UX 디자인을 중심으로 화면 구조, 프로토타입, 비주얼 방향을 설계합니다.</p>
      </div>

      <div className="editorial-card-grid">
        {toolSkills.map((tool, index) => (
          <section className="editorial-card" key={tool.title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{tool.title}</h3>
            <p>{tool.description}</p>
          </section>
        ))}
      </div>

      <p className="editorial-closing">Tools are used to turn ideas into clear visual systems.</p>
    </div>
  )
}

function ResumeContent() {
  return (
    <div className="editorial-content resume-content">
      <div className="resume-profile">
        <div>
          <p>Jin Sol</p>
          <span>UI/UX Designer</span>
        </div>
        <p>
          사용자의 흐름을 이해하고, 브랜드의 분위기를 화면 안에 정리하는 디자이너를 지향합니다.
          <br />
          정보를 보기 쉽게 구성하는 구조와 감도 있는 비주얼의 균형을 중요하게 생각합니다.
        </p>
      </div>

      <section className="resume-section">
        <h3>Education</h3>
        <div className="resume-education">
          <span>Jeju National University</span>
          <span>UI/UX Design Course, EZEN Academy</span>
        </div>
      </section>

      <section className="resume-section">
        <h3>Selected Projects</h3>
        <div className="resume-project-grid">
          {resumeProjects.map((project, index) => (
            <article key={project.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h4>{project.title}</h4>
              <p>{project.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="resume-strength">
        <h3>Strength</h3>
        <p>Information Structure / Visual Direction / Detail-Oriented Design</p>
      </section>
    </div>
  )
}

function ContactContent() {
  return (
    <div className="editorial-content contact-content">
      <div className="contact-index-intro">
        <h3>Let’s Connect</h3>
        <p>
          좋은 디자인은 작은 관심에서 시작된다고 생각합니다.
          <br />
          사용자, 브랜드, 화면의 흐름을 세심하게 바라보며 더 나은 경험을 만들고 싶습니다.
        </p>
      </div>

      <div className="contact-index-grid">
        <section>
          <span>Name</span>
          <p>Jin Sol</p>
        </section>
        <section>
          <span>Email</span>
          <p>wlsthf796@naver.com</p>
        </section>
        <section>
          <span>Role</span>
          <p>UI/UX Designer</p>
        </section>
        <section>
          <span>Portfolio</span>
          <p>LOSNIJ</p>
        </section>
      </div>

      <p className="editorial-closing">Thank you for visiting LOSNIJ.</p>
    </div>
  )
}

function LosnijDetailPage({
  onBack,
  onContact,
  onNavigate,
  onNext,
  onTop,
}: {
  isVisible: boolean
  onBack: () => void
  onContact: () => void
  onNavigate: (id: SectionId) => void
  onNext: () => void
  onTop: () => void
}) {
  return (
    <article className="losnij-about">
      <div className="losnij-soro-entry">
        <section className="losnij-soro-hero">
          <div className="losnij-soro-hero-sticky">
            <div className="losnij-soro-frame">
              <img src={assetPath('main-person.png')} alt="" />
            </div>
            <div className="losnij-soro-type" aria-label="Welcome to Losnij">
              <span>WELCOME TO</span>
              <span className="losnij-soro-type-bottom">
                <b>LOS</b>
                <i className="losnij-soro-type-image-slot" aria-hidden="true" />
                <b>NIJ</b>
              </span>
            </div>
            <small>( Scroll Down )</small>
          </div>
        </section>
      </div>

      <section className="losnij-services-reveal">
        <div className="losnij-services-intro">
          <div className="losnij-services-intro-top">
            <p>
              <span>● LOSNIJ CREATIVE</span>
              <span>(LOSNIJ — 01)</span>
            </p>
            <h2>
              Clear structure and thoughtful details create interfaces that feel natural to use.
            </h2>
          </div>
          <strong>SERVICES</strong>
          <p className="losnij-services-intro-bottom">My process and capabilities include:</p>
        </div>
      </section>

      <section className="losnij-service-stack">
        {aboutServices.map((service, index) => (
          <section className={`losnij-service-card is-${service.tone}`} key={service.title}>
            <div className="losnij-service-content">
              <h2>
                <span>{String(index + 1).padStart(2, '0')}.</span>
                <b>{service.title}</b>
              </h2>
              {'subtitle' in service && <h3>{service.subtitle}</h3>}
              {'keywords' in service ? (
                <div className="losnij-service-keywords">
                  {service.keywords?.map(([keyword, korean, english]) => (
                    <div key={keyword}>
                      <strong>{keyword}</strong>
                      <p>{korean}</p>
                      <p>{english}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="losnij-service-copy">
                  <div lang="ko">
                    {service.korean.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  <div lang="en">
                    {service.english.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}
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
      <PortfolioFooter onContact={onContact} onNavigate={onNavigate} onTop={onTop} />
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
        <img src={assetPath(`tag${index + 1}.png`)} alt="" />
      </div>
    </figure>
  )
}

function SectionContent({ isExpandedView, section }: { isExpandedView: boolean; section: PortfolioSection }) {
  return (
    <div className={`section-inner ${isExpandedView ? 'is-expanded-view' : ''}`}>
      <h1 data-title={section.title}>
        {section.title}
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
            <CoverInfoGroup title="Issue" items={['진솔 포트폴리오', 'UI/UX · Web Design', '2026 Edition']} />
            <CoverInfoGroup title="Focus" items={['UI/UX Design', 'Web Design', 'Visual Direction', 'Brand Experience']} />
            <CoverInfoGroup title="Approach" items={['구조를 정리하고,', '분위기를 설계하며,', '흐름을 다듬습니다.']} />
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
