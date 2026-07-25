import {
  Fragment,
  type CSSProperties,
  type PointerEvent,
  type RefObject,
  type UIEvent,
  type WheelEvent as ReactWheelEvent,
  useEffect,
  useRef,
  useState,
} from 'react'

type SectionId = 'losnij' | 'works' | 'more'

type WorkItem = {
  src: string
  highResSrc?: string
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

type SimmonsKeyStageStyle = CSSProperties & {
  '--simmons-pan-x': string
  '--simmons-pan-y': string
  '--simmons-hover-x': string
  '--simmons-hover-y': string
}

type SimmonsKeyShotStyle = CSSProperties & {
  '--shot-x': string
  '--shot-y': string
  '--shot-width': string
  '--shot-ratio': string
}

type ArchiveImageStyle = CSSProperties & {
  '--archive-x': string
  '--archive-y': string
  '--archive-width': string
  '--archive-rotate': string
}

type ProjectKeyScreen = {
  screen: string
  x: string
  y: string
  width: string
  ratio: string
}

type ProjectProcessItem = {
  title: string
  body: string
}

type ProjectDetailContent = {
  title: string
  subtitle: string
  meta: string
  duration: string
  projectUrl?: string
  proposalUrl?: string
  hero: string
  heroAlt: string
  role: string
  tools: string
  contribution: string[]
  overview: string[]
  cxPoint?: string[]
  processItems?: ProjectProcessItem[]
  strategyImage: string
  strategyAlt: string
  strategyTitle: string
  strategyCopy: string[]
  keyTitle: string
  keyScreens: ProjectKeyScreen[]
  isKeyComingSoon?: boolean
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
    src: assetPath('work01.png'),
    highResSrc: assetPath('work01@4x.png'),
    title: 'SIMMONS',
    subtitle: '글로벌 브랜드 웹사이트 리디자인',
    category: 'Global Brand Website Redesign',
    role: 'UI/UX · Branding · Web',
    className: 'work-feature',
  },
  {
    src: assetPath('work02.png'),
    highResSrc: assetPath('work02@4x.png'),
    title: 'JUHAP',
    subtitle: '주류 페어링 앱 UX/UI 디자인',
    category: 'Liquor Pairing App UX/UI',
    role: 'Mobile App · UX/UI · AI Service',
    className: 'work-medium',
  },
  {
    src: assetPath('work000.png'),
    highResSrc: assetPath('work000@4x.png'),
    title: 'ARCHE',
    subtitle: '패션 아카이브 앱 UX/UI 디자인',
    category: 'Personal Fashion Archive App',
    role: 'UI/UX · Branding · Mobile App',
    className: 'work-tall',
  },
]

const defaultKeyScreenPlacements: Array<Omit<ProjectKeyScreen, 'screen' | 'ratio'>> = [
  { x: '-58vw', y: '-640px', width: '14vw' },
  { x: '-25vw', y: '-515px', width: '13vw' },
  { x: '14vw', y: '-650px', width: '14.5vw' },
  { x: '54vw', y: '-455px', width: '15.2vw' },
  { x: '-46vw', y: '-250px', width: '13.2vw' },
  { x: '-8vw', y: '-120px', width: '14.2vw' },
  { x: '33vw', y: '35px', width: '13.6vw' },
  { x: '66vw', y: '195px', width: '12vw' },
  { x: '-61vw', y: '270px', width: '12.2vw' },
  { x: '-24vw', y: '445px', width: '11.8vw' },
  { x: '18vw', y: '570px', width: '14vw' },
  { x: '52vw', y: '735px', width: '12.8vw' },
]

const juhapKeyScreenPlacements: Array<Omit<ProjectKeyScreen, 'screen' | 'ratio'>> = [
  { x: '-60vw', y: '-650px', width: '12.6vw' },
  { x: '-18vw', y: '-560px', width: '12.4vw' },
  { x: '25vw', y: '-690px', width: '12.8vw' },
  { x: '58vw', y: '-410px', width: '13.8vw' },
  { x: '-45vw', y: '-210px', width: '11.8vw' },
  { x: '4vw', y: '-35px', width: '13vw' },
  { x: '47vw', y: '245px', width: '11.6vw' },
  { x: '-56vw', y: '365px', width: '12.4vw' },
  { x: '-13vw', y: '610px', width: '12.8vw' },
]

const makeKeyScreens = (
  screens: Array<[string, string]>,
  placements: Array<Omit<ProjectKeyScreen, 'screen' | 'ratio'>> = defaultKeyScreenPlacements,
) =>
  screens.map(([screen, ratio], index) => ({
    screen,
    ratio,
    ...placements[index],
  }))

const projectDetails: Record<string, ProjectDetailContent> = {
  ARCHE: {
    title: 'ARCHE Personal Fashion Archive App',
    subtitle: '옷과 착용 기록을 통해 개인의 스타일 취향을 발견하는 패션 아카이브 앱',
    meta: '개인 프로젝트',
    duration: 'Duration  2026 . 06 - Ongoing',
    hero: 'ar-hero.png',
    heroAlt: 'ARCHE fashion archive concept hero',
    role: 'Brand Concept / UX Planning / UI Design',
    tools: 'Figma / Photoshop',
    contribution: [
      '브랜드 콘셉트와 핵심 기능을 정의하고, 정보 구조와 사용자 흐름, UI 디자인 전반을 개인으로 진행했습니다.',
      '디지털 옷장, 스타일 DNA, 착용 기록 등의 기능이 하나의 패션 아카이브 경험으로 연결되도록',
      '주요 화면과 인터페이스를 설계했습니다.',
    ],
    overview: [
      'ARCHE는 사용자의 옷과 착용 경험을 기록해 개인의 스타일 취향을 발견할 수 있도록 기획한 패션 아카이브 앱입니다.',
      '옷을 단순히 등록하고 보관하는 것을 넘어, 착용 기록과 스타일 데이터를 통해 자신의 패션 흐름과 의류 활용 방식을 확인할 수 있도록 설계했습니다.',
    ],
    cxPoint: [
      '옷을 등록하고 착용 이력을 기록하는 과정이 단절되지 않도록 주요 기능과 화면 흐름을 연결했습니다.',
      '차분한 컬러와 이미지 중심의 레이아웃을 사용해 개인의 옷과 스타일 기록이 하나의 감각적인 아카이브로 보이도록 디자인했습니다.',
    ],
    processItems: [
      {
        title: 'Problem',
        body: '옷은 많지만 매일 무엇을 입을지 고민하거나, 구매한 옷을 충분히 활용하지 못하는 상황이 반복될 수 있다고 판단했습니다.',
      },
      {
        title: 'Approach',
        body: '디지털 옷장, 스타일 DNA, 착용 기록 기능을 중심으로 사용자가 자신의 옷과 취향을 기록하고, 패션 소비와 착용 흐름을 쉽게 파악할 수 있도록 구조를 설계했습니다.',
      },
      {
        title: 'Outcome',
        body: '주요 기능과 화면 흐름을 설계하고, 사용자의 옷과 착용 기록이 하나의 감각적인 패션 아카이브로 축적되는 앱 UI를 구성했습니다.',
      },
    ],
    strategyImage: 'ar00.webp',
    strategyAlt: 'ARCHE archive visual direction',
    strategyTitle: 'Brand & Visual Strategy',
    strategyCopy: [
      'ARCHE는 패션을 일회성 소비가 아닌 개인의 취향이 축적되는 기록으로 바라보았습니다.',
      '옷장, 착용 기록, 스타일 이미지가 하나의 아카이브처럼 연결되도록 서비스 구조를 설계하고, 차분한 컬러와 여백, 이미지 중심의 레이아웃을 통해 감도 있는 브랜드 무드를 구축했습니다.',
    ],
    keyTitle: 'Key Screen & Experience',
    keyScreens: [],
    isKeyComingSoon: true,
  },
  SIMMONS: {
    title: 'SIMMONS Global Brand Website Redesign',
    subtitle: '브랜드의 헤리티지와 기술력을 명확한 구조와 비주얼로 재구성한 글로벌 웹사이트 리디자인',
    meta: '팀 프로젝트',
    duration: 'Duration  2026 . 02 - 2026 . 03',
    projectUrl: 'https://yshnada-del.github.io/simmons/',
    proposalUrl: 'https://www.figma.com/deck/WnjfVFTOvpmgNQrW3aVJDM',
    hero: 'simmons-detail-hero.png',
    heroAlt: 'SIMMONS Offline experience hero',
    role: 'Brand Analysis / Information Architecture / UI Design',
    tools: 'Figma / Photoshop / Illustrator',
    contribution: [
      '브랜드 키워드와 콘텐츠 흐름을 정리하는 기획 과정에 참여하고, 오프라인 경험 및 이벤트 관련 페이지의 데스크톱·모바일 UI 디자인을 담당했습니다.',
      '이미지와 타이포그래피, 여백을 활용해 시몬스의 절제된 브랜드 무드를 구현하고,',
      '팀원들과 공통 디자인 기준을 조율해 화면 간 시각적 일관성을 맞췄습니다.',
    ],
    overview: [
      '시몬스의 브랜드 헤리티지와 수면 기술을 해외 사용자에게 전달하기 위해 진행한 글로벌 웹사이트 리디자인 프로젝트입니다.',
      '기존 브랜드의 프리미엄 이미지는 유지하면서 콘텐츠의 우선순위와 페이지 구조를 재정리하고, 브랜드 스토리가 자연스럽게 이어지는 웹·모바일 화면을 설계했습니다.',
    ],
    cxPoint: [
      '브랜드의 헤리티지, 기술력, 제품 관련 콘텐츠가 각각 분리되어 보이지 않도록 정보의 위계와 페이지 흐름을 정리했습니다.',
      '고해상도 이미지, 절제된 타이포그래피와 넓은 여백을 활용해 시몬스의 프리미엄 이미지를 화면 전반에 일관되게 구현했습니다.',
    ],
    processItems: [
      {
        title: 'Problem',
        body: '시몬스는 강한 브랜드 헤리티지와 기술력을 보유하고 있지만, 해외 사용자가 여러 콘텐츠의 관계와 중요도를 직관적으로 이해하기에는 정보 구조와 탐색 흐름을 더욱 명확하게 정리할 필요가 있었습니다.',
      },
      {
        title: 'Approach',
        body: '브랜드 키워드를 헤리티지, 수면 기술, 프리미엄 라이프스타일로 정리하고, 핵심 콘텐츠가 단계적으로 이어지도록 페이지 구조와 시각적 위계를 재구성했습니다.',
      },
      {
        title: 'Outcome',
        body: '브랜드의 절제된 이미지를 유지하면서 정보의 가독성과 콘텐츠 탐색 흐름을 개선한 웹·모바일 디자인을 완성했습니다.',
      },
    ],
    strategyImage: 'image.png',
    strategyAlt: 'Close-up hand pressing soft fabric',
    strategyTitle: 'Brand & Content Strategy',
    strategyCopy: [
      '시몬스가 가진 브랜드 자산을 단순한 제품 정보로 나열하기보다, 헤리티지와 수면 기술, 라이프스타일 콘텐츠가 하나의 브랜드 스토리로 이어지도록 구성했습니다.',
      '핵심 키워드를 기준으로 콘텐츠의 우선순위와 페이지 간 흐름을 정리하고, 이미지와 타이포그래피 중심의 절제된 비주얼 시스템을 적용했습니다.',
    ],
    keyTitle: 'Key Screen & Experience',
    keyScreens: makeKeyScreens([
      ['001.png', '465 / 566'],
      ['002.png', '968 / 1106'],
      ['003.png', '636 / 619'],
      ['004.png', '1860 / 1004'],
      ['005.png', '522 / 522'],
      ['006.png', '1550 / 986'],
      ['007.png', '1438 / 1082'],
      ['008.png', '1008 / 1210'],
      ['009.png', '557 / 636'],
      ['010.png', '842 / 1258'],
      ['011.png', '1828 / 1382'],
      ['012.png', '946 / 946'],
    ]),
  },
  JUHAP: {
    title: 'JUHAP AI Liquor Pairing App',
    subtitle: 'AI 추천과 커뮤니티 기능을 연결한 주류 페어링 모바일 앱',
    meta: '팀 프로젝트',
    duration: 'Duration  2026 . 04 - 2026 . 05',
    projectUrl: 'https://juhap-nmuh.vercel.app',
    proposalUrl: 'https://www.figma.com/deck/UFvEN19gtb5REMQ4ZonsMy',
    hero: 'ju-hero.jpg',
    heroAlt: 'JUHAP liquor pairing app hero',
    role: 'UX Planning / UI Design / Design System',
    tools: 'Figma / Photoshop',
    contribution: [
      '서비스 기획서 구성에 참여하고, 메인·랭킹·투표·AI 챗봇 등 주요 화면의 모바일 UI 디자인을 담당했습니다.',
      '기능 간 이동이 자연스럽게 이어지도록 정보 구조와 사용자 흐름을 정리했으며, 카드·버튼·태그 등 공통 컴포넌트를 구성해 화면 간 일관성을 높였습니다.',
    ],
    overview: [
      'JUHAP은 개인의 취향과 상황에 맞는 술과 안주 조합을 발견하고, 다른 사용자의 선택을 함께 탐색할 수 있도록 기획한 주류 페어링 앱입니다.',
      '추천, 랭킹, 투표, 커뮤니티 기능을 하나의 흐름으로 연결해 정보 탐색에서 참여와 공유까지 자연스럽게 이어지는 경험을 설계했습니다.',
    ],
    cxPoint: [
      '추천 결과 확인 이후에도 랭킹, 투표, 커뮤니티 탐색으로 자연스럽게 이어질 수 있도록 핵심 기능의 정보 구조와 화면 흐름을 설계했습니다.',
      '콘텐츠의 성격과 중요도에 따라 이미지, 텍스트, 태그의 위계를 정리하고, 반복되는 카드와 버튼 요소를 일관된 규칙으로 구성했습니다.',
    ],
    processItems: [
      {
        title: 'Problem',
        body: '사용자는 술과 안주를 선택할 때 취향, 상황, 음식 조합 등 여러 조건을 동시에 고려해야 하며, 다양한 정보 속에서 자신에게 맞는 조합을 빠르게 찾기 어렵습니다.',
      },
      {
        title: 'Approach',
        body: 'AI 추천, 랭킹, 투표 기능을 중심으로 핵심 사용자 흐름을 구성하고, 추천 결과와 커뮤니티 콘텐츠를 쉽게 비교하고 탐색할 수 있도록 화면의 정보 위계를 설계했습니다.',
      },
      {
        title: 'Outcome',
        body: '추천과 커뮤니티 기능이 연결되는 주요 사용자 흐름과 모바일 UI를 완성하고, 공통 컴포넌트를 정리해 서비스 전반의 시각적 일관성을 구축했습니다.',
      },
    ],
    strategyImage: 'ju1.jpg',
    strategyAlt: 'JUHAP visual strategy',
    strategyTitle: 'Service & Visual Strategy',
    strategyCopy: [
      'JUHAP은 주류 정보를 단순히 나열하는 데서 그치지 않고, 개인의 취향에 맞는 조합을 발견하고 다른 사용자의 선택까지 확장해 탐색할 수 있는 서비스로 기획했습니다.',
      '추천, 랭킹, 투표, 커뮤니티 기능을 하나의 흐름으로 연결하고, 주류 이미지와 간결한 정보 구성을 중심으로 직관적인 탐색 경험을 구성했습니다.',
    ],
    keyTitle: 'Key Screen & Experience',
    keyScreens: makeKeyScreens(
      [
        ['01.png', '240 / 240'],
        ['07.png', '650 / 1226'],
        ['08.png', '476 / 696'],
        ['09.png', '420 / 419'],
        ['0010.png', '656 / 1088'],
        ['0011.png', '610 / 1170'],
        ['0012.png', '574 / 1304'],
        ['013.png', '670 / 1014'],
        ['014.png', '636 / 1346'],
      ],
      juhapKeyScreenPlacements,
    ),
  },
}

const sections: PortfolioSection[] = [
  {
    id: 'losnij',
    title: 'losnij',
    intro: 'Identity & Design Approach',
    className: 'column-losnij',
  },
  {
    id: 'works',
    title: 'Works',
    intro: 'Selected Design Projects',
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
  [
    'Brand Identity',
    '브랜드의 고유한 분위기와 기준이 화면 전반에 일관되게 전달되도록 설계합니다.',
  ],
  [
    'Visual Direction',
    '컬러, 타이포그래피, 이미지와 레이아웃을 바탕으로 프로젝트의 시각적 방향을 구체화합니다.',
  ],
  [
    'Content Structure',
    '정보의 우선순위와 관계를 정리해 사용자가 자연스럽게 이해할 수 있는 구조를 만듭니다.',
  ],
  [
    'Digital Interface',
    '브랜드의 감도와 사용성을 균형 있게 담은 웹·모바일 화면을 설계합니다.',
  ],
]

const aboutToolRows: Array<[string, Array<[string, string]>]> = [
  ['DESIGN', [['Figma', '1.png'], ['Photoshop', '2.png'], ['Illustrator', '3.png']]],
  ['WEB', [['HTML', '4.png'], ['CSS', '5.png'], ['JavaScript', '6.png'], ['GitHub', '7.png']]],
  ['AI & WORKFLOW', [['ChatGPT', '8.png'], ['claude', '9.png'], ['Gemini', '10.png'], ['Midjourney', '11.png']]],
]

const aboutExperienceItems: Array<[string, string, string]> = [
  [
    '01',
    'SIMMONS',
    '브랜드의 헤리티지와 기술력을 정보 구조와 절제된 비주얼로 재구성한 글로벌 웹사이트 리디자인',
  ],
  [
    '02',
    'ARCHE',
    '옷과 착용 기록을 통해 개인의 스타일 취향을 발견하는 패션 아카이브 앱 디자인',
  ],
  [
    '03',
    'JUHAP',
    'AI 추천과 커뮤니티 기능을 연결한 주류 페어링 모바일 앱 UX/UI 디자인',
  ],
  [
    '04',
    'losnij Portfolio',
    '개인의 디자인 태도와 작업을 매거진·쇼룸 콘셉트로 구현한 퍼스널 브랜딩 웹 포트폴리오',
  ],
]

const archiveImages = [
  '0128f79e-f28d-487b-b0b1-32c94f8c76fb.webp',
  '09e51b7c-4d8a-447e-947d-3d0f86a92c74.webp',
  '0a65b8aa-f559-4bb3-a110-22ce869f2b54.webp',
  '14d22e77-a71d-434b-a2d5-6afb258492b7.webp',
  '4fd8cf40-1997-4577-b339-b23a9179768b.webp',
  '5989e4a0-ffc4-4295-8352-dd81f1fb0c37.webp',
  '59baf4e3-96bd-4ba7-9fc8-a0e48e05e4e9.webp',
  '613b9352-8b21-4621-896d-6fd680d21718.webp',
  '79546ccd-97b7-434b-8e01-5607e6084d91.webp',
  '8310de03-36b3-4d69-bede-323b69a92a2c.webp',
  '85b58fe3-30eb-482b-91f2-16a9b5b66c03.webp',
  '94829af3-a80f-43f5-8d0b-77a1cffa0cf9.webp',
  '950cace7-6b9d-46ce-b839-5c64769aef39.webp',
  '986ba3e7-0b84-4203-80a0-661e3cd2eabe.webp',
  'a8b71e8b-5018-449c-9bde-4249290d67e3.webp',
  'bed42b35-24d0-4468-805d-f981c1c9ed65.webp',
  'ccf5bb7e-7e76-4f6b-b16e-4b02f696ba51.webp',
  'd2fe28ee-57aa-49c7-bae7-0f71cf610bb6.webp',
  'd3217e90-9eaf-41d3-af15-da7370616fde.webp',
  'e48ee559-ae1b-4d5b-b969-bb756528ad64.webp',
  'fcec4121-631b-4b9e-987c-64d796d6957c.webp',
  'image-130.png',
  'archive-screen-01.jpg',
  'archive-screen-02.jpg',
]

const archivePlacements: ArchiveImageStyle[] = [
  { '--archive-x': '6%', '--archive-y': '0px', '--archive-width': '20%', '--archive-rotate': '0deg' },
  { '--archive-x': '38%', '--archive-y': '76px', '--archive-width': '22%', '--archive-rotate': '0deg' },
  { '--archive-x': '72%', '--archive-y': '8px', '--archive-width': '18%', '--archive-rotate': '0deg' },
  { '--archive-x': '10%', '--archive-y': '620px', '--archive-width': '23%', '--archive-rotate': '0deg' },
  { '--archive-x': '45%', '--archive-y': '560px', '--archive-width': '18%', '--archive-rotate': '0deg' },
  { '--archive-x': '70%', '--archive-y': '690px', '--archive-width': '20%', '--archive-rotate': '0deg' },
  { '--archive-x': '5%', '--archive-y': '1230px', '--archive-width': '19%', '--archive-rotate': '0deg' },
  { '--archive-x': '34%', '--archive-y': '1320px', '--archive-width': '21%', '--archive-rotate': '0deg' },
  { '--archive-x': '67%', '--archive-y': '1190px', '--archive-width': '23%', '--archive-rotate': '0deg' },
  { '--archive-x': '12%', '--archive-y': '1880px', '--archive-width': '19%', '--archive-rotate': '0deg' },
  { '--archive-x': '43%', '--archive-y': '1810px', '--archive-width': '18%', '--archive-rotate': '0deg' },
  { '--archive-x': '70%', '--archive-y': '1960px', '--archive-width': '21%', '--archive-rotate': '0deg' },
  { '--archive-x': '5%', '--archive-y': '2500px', '--archive-width': '18%', '--archive-rotate': '0deg' },
  { '--archive-x': '33%', '--archive-y': '2570px', '--archive-width': '22%', '--archive-rotate': '0deg' },
  { '--archive-x': '68%', '--archive-y': '2460px', '--archive-width': '20%', '--archive-rotate': '0deg' },
  { '--archive-x': '11%', '--archive-y': '3140px', '--archive-width': '18%', '--archive-rotate': '0deg' },
  { '--archive-x': '42%', '--archive-y': '3050px', '--archive-width': '21%', '--archive-rotate': '0deg' },
  { '--archive-x': '72%', '--archive-y': '3180px', '--archive-width': '18%', '--archive-rotate': '0deg' },
  { '--archive-x': '6%', '--archive-y': '3710px', '--archive-width': '20%', '--archive-rotate': '0deg' },
  { '--archive-x': '36%', '--archive-y': '3810px', '--archive-width': '18%', '--archive-rotate': '0deg' },
  { '--archive-x': '66%', '--archive-y': '3680px', '--archive-width': '22%', '--archive-rotate': '0deg' },
  { '--archive-x': '12%', '--archive-y': '4340px', '--archive-width': '17%', '--archive-rotate': '0deg' },
  { '--archive-x': '41%', '--archive-y': '4260px', '--archive-width': '20%', '--archive-rotate': '0deg' },
  { '--archive-x': '72%', '--archive-y': '4380px', '--archive-width': '18%', '--archive-rotate': '0deg' },
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
  const [activeWork, setActiveWork] = useState<WorkItem | null>(null)
  const [isWorkDetailVisible, setIsWorkDetailVisible] = useState(false)
  const [isWorkDetailClosing, setIsWorkDetailClosing] = useState(false)
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
    const isMobileLayout = window.innerWidth <= 900

    if (isMobileLayout) {
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight
      const clipTop = Math.max(0, Math.min(sectionRect.top, viewportHeight))
      const clipRight = Math.max(0, window.innerWidth - Math.min(sectionRect.right, window.innerWidth))
      const clipBottom = Math.max(0, viewportHeight - Math.min(sectionRect.bottom, viewportHeight))
      const clipLeft = Math.max(0, Math.min(sectionRect.left, window.innerWidth))

      setActiveSection({
        id,
        sectionOffsetX: clipLeft + (window.innerWidth - clipLeft - clipRight) / 2,
        sectionOffsetY: clipTop + (viewportHeight - clipTop - clipBottom) / 2,
        sectionWidth: window.innerWidth,
        sectionHeight: viewportHeight,
        initialClipPath: `inset(${clipTop}px ${clipRight}px ${clipBottom}px ${clipLeft}px)`,
        panelRect: {
          left: 0,
          top: 0,
          width: window.innerWidth,
          height: viewportHeight,
        },
        expandedTransform: 'translate3d(0, 0, 0) scale(1)',
        expandedHeight: viewportHeight,
        expandedScale: 1,
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
      return
    }

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

    setActiveWork(null)
    setIsWorkDetailVisible(false)
    setIsWorkDetailClosing(false)

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

  const openWorkDetail = (work: WorkItem) => {
    if (activeSection?.id !== 'works' || !isExpanded || isClosing) {
      return
    }

    setActiveWork(work)
    setIsWorkDetailClosing(false)
    setIsWorkDetailVisible(false)
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setIsWorkDetailVisible(true)
      })
    })
  }

  const closeWorkDetail = () => {
    if (!activeWork) {
      return
    }

    setIsWorkDetailClosing(true)
    setIsWorkDetailVisible(false)
    window.setTimeout(() => {
      setActiveWork(null)
      setIsWorkDetailClosing(false)
    }, 720)
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
        const detailStart = Math.max(activeSection.expandedHeight - window.innerHeight * 0.5, window.innerHeight * 0.5)
        const isCoverPinned = scrollRef.current.scrollTop >= coverPinStart
        const innerScroll = Math.max(scrollRef.current.scrollTop - detailStart, 0)

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

        const copyLines = Array.from(scrollRef.current.querySelectorAll<HTMLElement>('.losnij-copy-line'))
        const scrollRect = scrollRef.current.getBoundingClientRect()
        const start = scrollRect.top + scrollRect.height * 0.82
        const end = scrollRect.top + scrollRect.height * 0.42

        copyLines.forEach((line) => {
          const lineRect = line.getBoundingClientRect()
          const lineCenter = lineRect.top + lineRect.height * 0.5
          const progress = Math.min(Math.max((start - lineCenter) / (start - end), 0), 1)

          line.style.setProperty('--copy-progress', progress.toFixed(4))
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

  const isMobileLayout = typeof window !== 'undefined' && window.innerWidth <= 900
  const overlayStyle: ZoomOverlayStyle | undefined = activeSection
    ? isMobileLayout
      ? {
          width: activeSection.panelRect.width,
          height: activeSection.panelRect.height,
          clipPath: isExpanded ? 'inset(0px)' : activeSection.initialClipPath,
          transform: isExpanded ? 'translate3d(0, 0, 0) scale(1)' : 'translate3d(0, 0, 0) scale(0.92)',
          transformOrigin: `${Math.min(Math.max(activeSection.sectionOffsetX, 0), window.innerWidth)}px ${
            Math.min(Math.max(activeSection.sectionOffsetY, 0), window.innerHeight)
          }px`,
          '--zoom-scale': 1,
          '--zoom-inverse': 1,
        }
      : isExpanded
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
  const detailCanvasOffset =
    activeSection && isExpanded
      ? activeSection.id === 'more'
        ? Math.min(activeSection.expandedHeight, Math.max(330, window.innerHeight * 0.38))
        : activeSection.id === 'losnij'
          ? Math.max(activeSection.expandedHeight - window.innerHeight * 0.5, window.innerHeight * 0.5)
          : activeSection.expandedHeight
      : '100vh'

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
                const isMobileClipTransition =
                  window.innerWidth <= 900 && event.propertyName === 'clip-path'

                if (
                  event.currentTarget !== event.target ||
                  (event.propertyName !== 'transform' && !isMobileClipTransition)
                ) {
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
                <PanelContent isExpandedView={isExpanded && (!isClosing || activeSection.id === 'more')} onWorkOpen={openWorkDetail} />
              </main>
            </div>
            <div
              className={`zoom-detail-canvas ${activeSection.id === 'losnij' ? 'has-losnij-detail' : ''} ${
                activeSection.id === 'more' ? 'has-index-detail' : ''
              } ${activeSection.id === 'works' ? 'has-works-detail' : ''
              }`}
              style={{
                marginTop: detailCanvasOffset,
                minHeight:
                  activeSection.id === 'losnij' || activeSection.id === 'works' || activeSection.id === 'more'
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
                  onContact={openContact}
                  onNavigate={navigateToSection}
                  onTop={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
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
            onClick={activeWork ? closeWorkDetail : closeSection}
          >
            <span className="section-close-icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
          {activeSection.id === 'works' && activeWork && (
            <>
              <button
                className={`work-detail-backdrop ${isWorkDetailVisible ? 'is-visible' : ''} ${
                  isWorkDetailClosing ? 'is-closing' : ''
                }`}
                type="button"
                aria-label="Close project detail"
                data-cursor-label="Close"
                onClick={closeWorkDetail}
              />
              <WorkDetailPage
                work={activeWork}
                isVisible={isWorkDetailVisible}
                isClosing={isWorkDetailClosing}
                onMoreProjects={closeWorkDetail}
              />
            </>
          )}
        </>
      )}
      <ContactModal isClosing={isContactClosing} isOpen={isContactOpen} onClose={closeContact} />
    </div>
  )
}

function WorkDetailPage({
  isClosing,
  isVisible,
  onMoreProjects,
  work,
}: {
  isClosing: boolean
  isVisible: boolean
  onMoreProjects: () => void
  work: WorkItem
}) {
  const [isFull, setIsFull] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const smoothScrollFrameRef = useRef<number | null>(null)
  const smoothScrollTargetRef = useRef(0)

  const updateOverviewReveal = () => {
    const container = scrollContainerRef.current

    if (!container) {
      return
    }

    const lines = Array.from(container.querySelectorAll<HTMLElement>('.simmons-overview-line'))
    const containerRect = container.getBoundingClientRect()
    const start = containerRect.top + containerRect.height * 0.78
    const end = containerRect.top + containerRect.height * 0.36

    lines.forEach((line) => {
      const lineRect = line.getBoundingClientRect()
      const lineCenter = lineRect.top + lineRect.height * 0.5
      const progress = Math.min(Math.max((start - lineCenter) / (start - end), 0), 1)

      line.style.setProperty('--overview-progress', progress.toFixed(4))
    })
  }

  const handleScroll = (event: UIEvent<HTMLElement>) => {
    setIsFull(event.currentTarget.scrollTop > 6)
    updateOverviewReveal()
  }

  const stopSmoothScroll = () => {
    if (smoothScrollFrameRef.current) {
      window.cancelAnimationFrame(smoothScrollFrameRef.current)
      smoothScrollFrameRef.current = null
    }
  }

  const animateSmoothScroll = () => {
    const container = scrollContainerRef.current

    if (!container) {
      smoothScrollFrameRef.current = null
      return
    }

    const next = container.scrollTop + (smoothScrollTargetRef.current - container.scrollTop) * 0.13
    container.scrollTop = next

    if (Math.abs(smoothScrollTargetRef.current - next) < 0.5) {
      container.scrollTop = smoothScrollTargetRef.current
      smoothScrollFrameRef.current = null
      return
    }

    smoothScrollFrameRef.current = window.requestAnimationFrame(animateSmoothScroll)
  }

  const handleDetailWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current

    if (!container) return

    event.preventDefault()
    event.stopPropagation()

    const maxScroll = container.scrollHeight - container.clientHeight
    const currentTarget = smoothScrollFrameRef.current ? smoothScrollTargetRef.current : container.scrollTop
    smoothScrollTargetRef.current = Math.max(0, Math.min(maxScroll, currentTarget + event.deltaY))

    if (!smoothScrollFrameRef.current) {
      smoothScrollFrameRef.current = window.requestAnimationFrame(animateSmoothScroll)
    }
  }

  const returnToMoreProjects = () => {
    const container = scrollContainerRef.current

    stopSmoothScroll()

    if (!container || container.scrollTop <= 4) {
      onMoreProjects()
      return
    }

    const initialScrollTop = container.scrollTop
    let startedAt: number | null = null
    const duration = 820

    const scrollToTop = (now: number) => {
      startedAt ??= now
      const progress = Math.min((now - startedAt) / duration, 1)
      const easedProgress = 1 - (1 - progress) ** 3

      if (!scrollContainerRef.current) {
        onMoreProjects()
        return
      }

      scrollContainerRef.current.scrollTop = initialScrollTop * (1 - easedProgress)

      if (progress < 1) {
        smoothScrollFrameRef.current = window.requestAnimationFrame(scrollToTop)
        return
      }

      smoothScrollFrameRef.current = null
      scrollContainerRef.current.scrollTop = 0
      onMoreProjects()
    }

    smoothScrollFrameRef.current = window.requestAnimationFrame(scrollToTop)
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(updateOverviewReveal)

    return () => {
      window.cancelAnimationFrame(frame)
      stopSmoothScroll()
    }
  }, [work.title])

  const projectDetail = projectDetails[work.title]

  return (
    <article
      className={`work-rising-page ${isVisible ? 'is-visible' : ''} ${isClosing ? 'is-closing' : ''} ${
        isFull ? 'is-full' : ''
      }`}
      onWheel={(event) => {
        event.stopPropagation()
      }}
    >
      <div
        className={`work-rising-scroll ${projectDetail ? 'has-simmons-detail' : ''}`}
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onWheel={handleDetailWheel}
      >
        {projectDetail ? (
          <ProjectWorkDetail detail={projectDetail} onMoreProjects={returnToMoreProjects} />
        ) : (
          <>
            <header className="work-rising-header">
              <h2>{work.title}</h2>
            </header>
            <div className="work-rising-hero">
              <p>{work.subtitle}</p>
            </div>
            <figure className="work-rising-media">
              <img src={work.src} alt={work.title} />
            </figure>
            <section className="work-rising-copy">
              <span>{work.category}</span>
              <p>{work.role}</p>
              <p>
                프로젝트의 구조, 화면 흐름, 시각 방향을 정리하는 상세 페이지입니다. 이미지와 설명이 하나의 페이지처럼
                아래에서 위로 올라오며, 선택한 프로젝트에 집중할 수 있게 구성했습니다.
              </p>
            </section>
          </>
        )}
      </div>
    </article>
  )
}

function ProjectWorkDetail({ detail, onMoreProjects }: { detail: ProjectDetailContent; onMoreProjects: () => void }) {
  const SIMMONS_KEY_LOOP_X = 2100
  const SIMMONS_KEY_LOOP_Y = 1650
  const dragStateRef = useRef<{ startX: number; startY: number; x: number; y: number } | null>(null)
  const keyStageRef = useRef<HTMLDivElement | null>(null)
  const keyStagePositionRef = useRef({ x: 0, y: 0 })
  const keyStageTargetRef = useRef({ x: 0, y: 0 })
  const keyStageFrameRef = useRef<number | null>(null)
  const keyStageHoverRef = useRef({ x: 0, y: 0 })
  const keyStageHoverTargetRef = useRef({ x: 0, y: 0 })
  const keyStageHoverFrameRef = useRef<number | null>(null)
  const [isDraggingKeyStage, setIsDraggingKeyStage] = useState(false)

  const wrapKeyStage = (value: number, loop: number) => {
    const wrapped = value % loop
    return wrapped > loop / 2
      ? wrapped - loop
      : wrapped < -loop / 2
        ? wrapped + loop
        : wrapped
  }

  const paintKeyStage = () => {
    const stage = keyStageRef.current

    if (!stage) return

    stage.style.setProperty('--simmons-pan-x', `${keyStagePositionRef.current.x}px`)
    stage.style.setProperty('--simmons-pan-y', `${keyStagePositionRef.current.y}px`)
    stage.style.setProperty('--simmons-hover-x', `${keyStageHoverRef.current.x}px`)
    stage.style.setProperty('--simmons-hover-y', `${keyStageHoverRef.current.y}px`)
  }

  const animateKeyStage = () => {
    const position = keyStagePositionRef.current
    const xDelta = wrapKeyStage(keyStageTargetRef.current.x - position.x, SIMMONS_KEY_LOOP_X)
    const yDelta = wrapKeyStage(keyStageTargetRef.current.y - position.y, SIMMONS_KEY_LOOP_Y)

    keyStagePositionRef.current = {
      x: wrapKeyStage(position.x + xDelta * 0.24, SIMMONS_KEY_LOOP_X),
      y: wrapKeyStage(position.y + yDelta * 0.24, SIMMONS_KEY_LOOP_Y),
    }
    paintKeyStage()

    if (Math.abs(xDelta) < 0.16 && Math.abs(yDelta) < 0.16) {
      keyStagePositionRef.current = keyStageTargetRef.current
      paintKeyStage()
      keyStageFrameRef.current = null
      return
    }

    keyStageFrameRef.current = window.requestAnimationFrame(animateKeyStage)
  }

  const animateKeyStageHover = () => {
    const position = keyStageHoverRef.current
    keyStageHoverRef.current = {
      x: position.x + (keyStageHoverTargetRef.current.x - position.x) * 0.2,
      y: position.y + (keyStageHoverTargetRef.current.y - position.y) * 0.2,
    }
    paintKeyStage()

    if (
      Math.abs(keyStageHoverTargetRef.current.x - keyStageHoverRef.current.x) < 0.12 &&
      Math.abs(keyStageHoverTargetRef.current.y - keyStageHoverRef.current.y) < 0.12
    ) {
      keyStageHoverRef.current = keyStageHoverTargetRef.current
      paintKeyStage()
      keyStageHoverFrameRef.current = null
      return
    }

    keyStageHoverFrameRef.current = window.requestAnimationFrame(animateKeyStageHover)
  }

  const moveKeyStageHover = (x: number, y: number) => {
    keyStageHoverTargetRef.current = { x, y }

    if (!keyStageHoverFrameRef.current) {
      keyStageHoverFrameRef.current = window.requestAnimationFrame(animateKeyStageHover)
    }
  }

  const moveKeyStage = (xDelta: number, yDelta: number) => {
    keyStageTargetRef.current = {
      x: wrapKeyStage(keyStageTargetRef.current.x + xDelta, SIMMONS_KEY_LOOP_X),
      y: wrapKeyStage(keyStageTargetRef.current.y + yDelta, SIMMONS_KEY_LOOP_Y),
    }

    if (!keyStageFrameRef.current) {
      keyStageFrameRef.current = window.requestAnimationFrame(animateKeyStage)
    }
  }

  const handleKeyStageWheel = (event: ReactWheelEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
    moveKeyStage(-event.deltaX, -event.deltaY)
  }

  const handleKeyStagePointerDown = (event: PointerEvent<HTMLElement>) => {
    dragStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      x: keyStagePositionRef.current.x,
      y: keyStagePositionRef.current.y,
    }
    setIsDraggingKeyStage(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handleKeyStagePointerMove = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    moveKeyStageHover(
      ((event.clientX - rect.left) / rect.width - 0.5) * 24,
      ((event.clientY - rect.top) / rect.height - 0.5) * 18,
    )

    const dragState = dragStateRef.current

    if (!dragState) return

    const next = {
      x: wrapKeyStage(dragState.x + event.clientX - dragState.startX, SIMMONS_KEY_LOOP_X),
      y: wrapKeyStage(dragState.y + event.clientY - dragState.startY, SIMMONS_KEY_LOOP_Y),
    }
    keyStageTargetRef.current = next
    keyStagePositionRef.current = next
    paintKeyStage()
  }

  const handleKeyStagePointerLeave = () => {
    if (!dragStateRef.current) {
      moveKeyStageHover(0, 0)
    }
  }

  const stopKeyStageDrag = (event: PointerEvent<HTMLElement>) => {
    dragStateRef.current = null
    setIsDraggingKeyStage(false)

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  useEffect(
    () => () => {
      if (keyStageFrameRef.current) {
        window.cancelAnimationFrame(keyStageFrameRef.current)
      }

      if (keyStageHoverFrameRef.current) {
        window.cancelAnimationFrame(keyStageHoverFrameRef.current)
      }
    },
    [],
  )

  return (
    <div className="simmons-detail">
      <header className="simmons-detail-header">
        <h2>{detail.title}</h2>
        <p>{detail.subtitle}</p>
      </header>

      <div className="simmons-detail-meta" aria-label="Project information">
        <span>{detail.meta}</span>
        <span>{detail.duration}</span>
        {(detail.projectUrl || detail.proposalUrl) && (
          <nav aria-label="Project links">
            {detail.projectUrl && (
              <a href={detail.projectUrl} target="_blank" rel="noreferrer">
                프로젝트 보기↗
              </a>
            )}
            {detail.proposalUrl && (
              <a href={detail.proposalUrl} target="_blank" rel="noreferrer">
                기획서 보기↗
              </a>
            )}
          </nav>
        )}
      </div>

      <figure className="simmons-detail-hero">
        <img src={assetPath(detail.hero)} alt={detail.heroAlt} />
      </figure>

      <section className="simmons-credit-list">
        <strong>PROJECT ROLE</strong>
        <dl>
          <div>
            <dt>ROLE</dt>
            <dd>{detail.role}</dd>
          </div>
          <div>
            <dt>TOOLS</dt>
            <dd>{detail.tools}</dd>
          </div>
          <div>
            <dt>CONTRIBUTION</dt>
            <dd>
              {detail.contribution.map((line, index) => (
                <Fragment key={line}>
                  {index > 0 && <br />}
                  {line}
                </Fragment>
              ))}
            </dd>
          </div>
        </dl>
      </section>

      <section className="simmons-detail-overview">
        <h3>Project Overview</h3>
        <p className="simmons-overview-copy">
          {detail.overview.map((line) => (
            <span className="simmons-overview-line" key={line}>
              <span>{line}</span>
              <span aria-hidden="true">{line}</span>
            </span>
          ))}
        </p>
      </section>

      {detail.cxPoint && (
        <section className="simmons-cx-point">
          <h3>Design Focus</h3>
          {detail.cxPoint.map((copy) => (
            <p key={copy}>{copy}</p>
          ))}
        </section>
      )}

      {detail.processItems && (
        <section className="simmons-process-list" aria-label="Problem Approach Outcome">
          {detail.processItems.map((item) => (
            <article className="simmons-process-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </section>
      )}

      <section className="simmons-strategy">
        <figure>
          <img src={assetPath(detail.strategyImage)} alt={detail.strategyAlt} />
        </figure>
        <div>
          <h3>{detail.strategyTitle}</h3>
          {detail.strategyCopy.map((copy) => (
            <p key={copy}>{copy}</p>
          ))}
        </div>
      </section>

      <section
        className={`simmons-key-experience ${detail.isKeyComingSoon ? 'is-coming-soon' : ''}`}
        aria-label="Key Screen and Experience"
      >
        <div
          ref={keyStageRef}
          className={`simmons-key-stage ${isDraggingKeyStage ? 'is-dragging' : ''}`}
          onWheel={handleKeyStageWheel}
          onWheelCapture={handleKeyStageWheel}
          onPointerDown={handleKeyStagePointerDown}
          onPointerMove={handleKeyStagePointerMove}
          onPointerLeave={handleKeyStagePointerLeave}
          onPointerUp={stopKeyStageDrag}
          onPointerCancel={stopKeyStageDrag}
          style={{
            '--simmons-pan-x': '0px',
            '--simmons-pan-y': '0px',
            '--simmons-hover-x': '0px',
            '--simmons-hover-y': '0px',
          } as SimmonsKeyStageStyle}
        >
          <div className="simmons-key-title">
            <h3>{detail.keyTitle}</h3>
            <button
              className="simmons-more-projects"
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onMoreProjects()
              }}
              onPointerDown={(event) => {
                event.stopPropagation()
              }}
            >
              [ MORE PROJECTS ]
            </button>
          </div>
          {detail.isKeyComingSoon ? (
            <div className="simmons-key-coming-soon" aria-hidden="true">
              <span>COMING SOON</span>
              <p>Key screens are being prepared.</p>
            </div>
          ) : (
            <div className="simmons-key-canvas" aria-hidden="true">
              {[-1, 0, 1].map((xOffset) =>
                [-1, 0, 1].map((yOffset) =>
                  detail.keyScreens.map((shot) => (
                    <figure
                      className="simmons-key-shot"
                      key={`${xOffset}-${yOffset}-${shot.screen}`}
                      style={{
                        '--shot-x': `calc(${shot.x} + ${xOffset * SIMMONS_KEY_LOOP_X}px)`,
                        '--shot-y': `calc(${shot.y} + ${yOffset * SIMMONS_KEY_LOOP_Y}px)`,
                        '--shot-width': shot.width,
                        '--shot-ratio': shot.ratio,
                      } as SimmonsKeyShotStyle}
                    >
                      <img src={assetPath(shot.screen)} alt="" draggable="false" />
                    </figure>
                  )),
                ),
              ).flat(2)}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function IndexDetailPage({
  isVisible,
  onContact,
  onNavigate,
  onTop,
  pageRef,
}: {
  isVisible: boolean
  onContact: () => void
  onNavigate: (id: SectionId) => void
  onTop: () => void
  pageRef: RefObject<HTMLElement | null>
}) {
  return (
    <article className={`more-scroll-page ${isVisible ? 'is-visible' : ''}`} ref={pageRef}>
      <section className="archive-photo-stage" aria-label="Archive images">
        <ArchiveImageGrid className="archive-detail-grid" />
      </section>
      <PortfolioFooter
        onContact={onContact}
        onNavigate={onNavigate}
        onTop={onTop}
      />
    </article>
  )
}

function ArchiveImageGrid({ className = 'archive-photo-grid' }: { className?: string }) {
  return (
    <div className={className}>
      {archiveImages.map((image, index) => (
        <figure className="archive-photo-item" key={image} style={archivePlacements[index]}>
          <img
            src={assetPath(`archive/${image}`)}
            alt={`Archive image ${index + 1}`}
            loading={index < 8 ? 'eager' : 'lazy'}
            decoding="async"
          />
        </figure>
      ))}
    </div>
  )
}

function AboutRevealCopy({ className = '', lines }: { className?: string; lines: string[] }) {
  return (
    <p className={`losnij-copy-flow ${className}`.trim()}>
      {lines.map((line) => (
        <span className="losnij-copy-line" key={line}>
          <span>{line}</span>
          <span aria-hidden="true">{line}</span>
        </span>
      ))}
    </p>
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
  const aboutRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const about = aboutRef.current

    if (!about) {
      return
    }

    const revealItems = Array.from(about.querySelectorAll<HTMLElement>('.losnij-scroll-reveal'))

    if (!revealItems.length) {
      return
    }

    revealItems.forEach((item) => item.classList.remove('is-visible'))

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealItems.forEach((item) => item.classList.add('is-visible'))
      return
    }

    const scrollRoot = about.closest<HTMLElement>('.zoom-scroll')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return
          }

          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      {
        root: scrollRoot,
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.1,
      },
    )

    revealItems.forEach((item) => observer.observe(item))

    return () => observer.disconnect()
  }, [])

  return (
    <article className="losnij-about" ref={aboutRef}>
      <section className="losnij-rising-page">
        <header className="losnij-rising-header" aria-hidden="true" />

        <div className="losnij-rising-content">
          <div className="losnij-rising-body">
            <p className="losnij-rising-masthead" aria-hidden="true">
              About me
            </p>
            <div className="losnij-rising-chapter losnij-scroll-reveal">
              <span>CHAPTER 1</span>
            </div>
            <div className="losnij-rising-left losnij-scroll-reveal">
              <h2>Identity</h2>
              <span aria-hidden="true" />
            </div>
            <div className="losnij-rising-copy">
              <h3 className="losnij-scroll-reveal">Quiet but Clear</h3>
              <p className="losnij-rising-subtitle losnij-scroll-reveal">
                조용하지만 분명한 디자인을 지향합니다.
              </p>
              <div>
                <AboutRevealCopy
                  className="losnij-scroll-reveal"
                  lines={['losnij는 진솔의 시선과 작업 방식을 담은 개인 디자인 아카이브입니다.']}
                />
                <AboutRevealCopy
                  className="losnij-scroll-reveal"
                  lines={[
                    '브랜드가 가진 분위기와 정보의 구조가 자연스럽게 연결되는 방식을 고민합니다.',
                    '콘텐츠의 우선순위를 정리하고 이미지와 타이포그래피, 여백을 세심하게 다듬으며',
                    '브랜드의 감도를 명확하고 일관된 시각 언어로 구현하고자 합니다.',
                  ]}
                />
                <AboutRevealCopy
                  className="losnij-scroll-reveal"
                  lines={['화려하게 설명하기보다, 조용하지만 분명하게 전달되는 디자인을 지향합니다.']}
                />
              </div>
            </div>
          </div>

          <section className="losnij-tools-section">
            <div className="losnij-section-chapter losnij-scroll-reveal">
              <span>CHAPTER 2</span>
            </div>
            <div className="losnij-section-left losnij-scroll-reveal">
              <h2>Tools</h2>
              <span aria-hidden="true" />
            </div>
            <div className="losnij-section-copy">
              <h3 className="losnij-scroll-reveal">Tool &amp; Focus</h3>
              <AboutRevealCopy
                className="losnij-scroll-reveal"
                lines={[
                  '브랜드의 방향과 정보를 화면 안에 구체화하기 위해 사용하는 도구와 작업 방식입니다.',
                  '장식적인 표현에 앞서 콘텐츠의 구조와 사용 흐름을 정리하고,',
                  '브랜드의 감도와 기능이 조화를 이루는 디지털 인터페이스를 설계합니다.',
                ]}
              />
            </div>

            <div className="losnij-focus-list">
              <div className="losnij-list-heading losnij-scroll-reveal">
                <span>FOCUS</span>
              </div>
              <div className="losnij-focus-grid">
                {aboutFocusItems.map(([title, body]) => (
                  <div className="losnij-scroll-reveal" key={title}>
                    <h4>{title}</h4>
                    {body.split('\n').map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="losnij-tool-list">
              <div className="losnij-list-heading losnij-scroll-reveal">
                <span>TOOLS</span>
              </div>
              {aboutToolRows.map(([label, tools]) => (
                <div className="losnij-tool-row losnij-scroll-reveal" key={`${label}-${tools.map(([name]) => name).join('-')}`}>
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
            <div className="losnij-section-chapter losnij-scroll-reveal">
              <span>CHAPTER 3</span>
            </div>
            <div className="losnij-section-left losnij-scroll-reveal">
              <h2>Experience</h2>
              <span aria-hidden="true" />
            </div>
            <div className="losnij-section-copy">
              <h3 className="losnij-scroll-reveal">Selected Projects</h3>
              <AboutRevealCopy
                className="losnij-scroll-reveal"
                lines={[
                  '브랜드의 방향과 정보 구조를 함께 고민하며,',
                  '콘셉트 기획부터 비주얼 시스템, UI 디자인까지',
                  '각 프로젝트에 맞는 디지털 경험을 설계해왔습니다.',
                ]}
              />
            </div>
            <div className="losnij-project-list">
              {aboutExperienceItems.map(([number, title, body]) => (
                <div className="losnij-project-row losnij-scroll-reveal" key={number}>
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
            <a className="portfolio-footer-menu-item" data-label="Instagram" href="https://www.instagram.com/" target="_blank" rel="noreferrer">
              <span>Instagram</span>
            </a>
            <a className="portfolio-footer-menu-item" data-label="Email" href="mailto:wlsthf796@naver.com">
              <span>Email</span>
            </a>
          </div>
        </section>

        <button className="portfolio-footer-top portfolio-footer-menu-item" data-label="[ BACK TO TOP ]" type="button" onClick={onTop}>
          <span>[ BACK TO TOP ]</span>
        </button>

        <section className="portfolio-footer-navigation">
          <p>(NAVIGATION)</p>
          <div>
            <button className="portfolio-footer-menu-item" data-label="About" type="button" onClick={() => onNavigate('losnij')}>
              <span>About</span>
            </button>
            <button className="portfolio-footer-menu-item" data-label="Works" type="button" onClick={() => onNavigate('works')}>
              <span>Works</span>
            </button>
            <button className="portfolio-footer-menu-item" data-label="Archive" type="button" onClick={() => onNavigate('more')}>
              <span>Archive</span>
            </button>
            <button className="portfolio-footer-menu-item" data-label="Contact" type="button" onClick={onContact}>
              <span>Contact</span>
            </button>
          </div>
        </section>
      </div>

      <div className="portfolio-footer-marquee" aria-label="SOL portfolio">
        <div>
          <span>SOL PORTFOLIO</span>
          <span>SOL PORTFOLIO</span>
        </div>
      </div>

      <div className="portfolio-footer-meta">
        <div>
          <span>SEOUL, KR</span>
          <span>SOL PORTFOLIO</span>
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
            <p>Jin Sol</p>
            <span>진솔</span>
          </section>

          <section>
            <h3>EMAIL</h3>
            <a href="mailto:wlsthf796@naver.com">wlsthf796@naver.com</a>
          </section>

          <section>
            <h3>LINK</h3>
            <div className="contact-links">
              <a href={import.meta.env.BASE_URL} aria-label="Portfolio home">
                Portfolio
              </a>
              <a href="https://github.com/" target="_blank" rel="noreferrer">
                GitHub
              </a>
            </div>
          </section>

          <section>
            <h3>FIELD</h3>
            <ul className="contact-field-inline">
              <li>UI/UX Design</li>
              <li>Visual Design</li>
              <li>Brand Design</li>
            </ul>
          </section>
        </div>

        <p className="contact-card-note">
          브랜드의 분위기와 정보의 구조를 조용하지만 분명한 디자인으로 연결합니다.
        </p>
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
      const shouldUseNativeCursor = Boolean(target?.closest('.simmons-key-stage'))

      if (!isCursorArea || shouldUseNativeCursor) {
        hideCursor()
        return
      }

      const position = positionRef.current
      position.targetX = event.clientX
      position.targetY = event.clientY

      const hoverTarget = target?.closest('a, button, .work-detail-backdrop[data-cursor-label], .works-collage .section-media, [role="button"]') ?? null
      const isWorkImageTarget = Boolean(hoverTarget?.matches('.works-collage .section-media'))
      const isClickableWorkImage = Boolean(hoverTarget?.matches('.works-collage .section-media.is-clickable[data-cursor-label]'))
      const labelTarget = isClickableWorkImage
        ? (hoverTarget as Element)
        : isWorkImageTarget
          ? null
          : target?.closest(
              '.work-detail-backdrop[data-cursor-label], .section-close[data-cursor-label], .main-panel:not(.zoom-panel) .portfolio-section[data-cursor-label]',
            ) ?? null

      setCursorLabel(labelTarget)

      if (hoverTarget !== hoverTargetRef.current) {
        hoverTargetRef.current = hoverTarget

        if (hoverTarget) {
          scaleRef.current.target = labelTarget ? 1 : 1.28
          cursor.classList.add('is-hover')

          if (isWorkImageTarget && !isClickableWorkImage) {
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
      const hoverTarget = target?.closest('a, button, .work-detail-backdrop[data-cursor-label], .works-collage .section-media, [role="button"]') ?? null
      const isWorkImageTarget = Boolean(hoverTarget?.matches('.works-collage .section-media'))
      const isClickableWorkImage = Boolean(hoverTarget?.matches('.works-collage .section-media.is-clickable[data-cursor-label]'))
      const labelTarget = isClickableWorkImage
        ? hoverTarget
        : isWorkImageTarget
          ? null
          : target?.closest(
              '.work-detail-backdrop[data-cursor-label], .section-close[data-cursor-label], .main-panel:not(.zoom-panel) .portfolio-section[data-cursor-label]',
            ) ?? null

      setCursorLabel(labelTarget)

      if (!hoverTarget || hoverTarget === hoverTargetRef.current) {
        return
      }

      hoverTargetRef.current = hoverTarget
      scaleRef.current.target = labelTarget ? 1 : 1.28
      cursor.classList.add('is-hover')
      scheduleCursor()

      if (isWorkImageTarget && !isClickableWorkImage) {
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
  onWorkOpen,
}: {
  isExpandedView?: boolean
  openSection?: (id: SectionId) => void
  setSectionRef?: (id: SectionId, node: HTMLButtonElement | null) => void
  onWorkOpen?: (work: WorkItem) => void
}) {
  return (
    <div className="book-pages">
      <section className="book-page book-page-left">
        <InteractiveSection
          isExpandedView={isExpandedView}
          section={sections[0]}
          openSection={openSection}
          setSectionRef={setSectionRef}
          onWorkOpen={onWorkOpen}
        />
      </section>
      <section className="book-page book-page-right">
        <InteractiveSection
          isExpandedView={isExpandedView}
          section={sections[1]}
          openSection={openSection}
          setSectionRef={setSectionRef}
          onWorkOpen={onWorkOpen}
        />
        <InteractiveSection
          isExpandedView={isExpandedView}
          section={sections[2]}
          openSection={openSection}
          setSectionRef={setSectionRef}
          onWorkOpen={onWorkOpen}
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
  onWorkOpen,
}: {
  isExpandedView: boolean
  section: PortfolioSection
  openSection?: (id: SectionId) => void
  setSectionRef?: (id: SectionId, node: HTMLButtonElement | null) => void
  onWorkOpen?: (work: WorkItem) => void
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
        <SectionContent isExpandedView={isExpandedView} onWorkOpen={onWorkOpen} section={section} />
      </button>
    )
  }

  return (
    <div className={`portfolio-section ${section.className}`}>
      <SectionContent isExpandedView={isExpandedView} onWorkOpen={onWorkOpen} section={section} />
    </div>
  )
}

function WorkProject({ onOpen, work, index }: { onOpen?: (work: WorkItem) => void; work: WorkItem; index: number }) {
  const tagRef = useRef<HTMLDivElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const initializedRef = useRef(false)
  const boundsRef = useRef<DOMRect | null>(null)
  const positionRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })
  const detail = projectDetails[work.title]
  const captionTitle = detail?.title ?? work.title
  const captionSubtitle = detail?.subtitle ?? work.subtitle
  const hoverTag = work.title === 'JUHAP' ? 'tag03.png' : work.title === 'ARCHE' ? 'tag02.png' : `tag0${index + 1}.png`

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
      className={`section-media ${work.className} ${onOpen ? 'is-clickable' : ''}`}
      data-num={String(index + 1).padStart(2, '0')}
      data-title={captionTitle}
      data-desc={work.category}
      data-keywords={work.role}
      data-cursor-label={onOpen ? 'Click!' : undefined}
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={() => onOpen?.(work)}
      onKeyDown={(event) => {
        if (!onOpen || (event.key !== 'Enter' && event.key !== ' ')) {
          return
        }

        event.preventDefault()
        onOpen(work)
      }}
      onPointerEnter={startTracking}
      onPointerMove={updateTagPosition}
      onPointerLeave={stopTracking}
    >
      <img src={work.src} alt={captionTitle} loading="eager" decoding="async" fetchPriority={onOpen ? 'high' : 'auto'} />
      <figcaption>
        <span className="work-caption-title" data-zoom-text={captionTitle}>
          {captionTitle}
        </span>
        <span className="work-caption-subtitle" data-zoom-text={captionSubtitle}>
          {captionSubtitle}
        </span>
      </figcaption>
      <div className="project-hover-tag" aria-hidden="true" ref={tagRef}>
        <img src={assetPath(hoverTag)} alt="" />
      </div>
    </figure>
  )
}

function SectionContent({
  isExpandedView,
  onWorkOpen,
  section,
}: {
  isExpandedView: boolean
  onWorkOpen?: (work: WorkItem) => void
  section: PortfolioSection
}) {
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
            <img src={assetPath('main-person.png')} alt="losnij portrait" />
          </figure>
          <div className="losnij-cover-info" aria-label="Portfolio cover information">
            <CoverInfoGroup title="2026 EDITION" items={['Jin Sol Portfolio', 'UI/UX · Visual Design']} />
            <CoverInfoGroup title="FOCUS" items={['Brand Identity', 'Visual Direction', 'Content Structure', 'Digital Interface']} />
            <CoverInfoGroup title="CONTACT" items={['Email', 'wlsthf796@naver.com', 'Phone', '+82 1030256909']} />
          </div>
        </>
      )}

      {section.id === 'works' && (
        <>
          <p className="works-expanded-label">Selected Projects</p>
          <div className="works-collage">
            {works.map((work, index) => (
              <WorkProject onOpen={isExpandedView ? onWorkOpen : undefined} work={work} index={index} key={work.title} />
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
            <span className="index-closing-ko" data-zoom-text="조용하지만 분명한 브랜드 경험을 고민합니다.">
              조용하지만 분명한 브랜드 경험을 고민합니다.
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
