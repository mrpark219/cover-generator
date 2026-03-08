import type { CoverTemplate } from "@cover-generator/shared";

export type Language = "en" | "ko";

export const languageStorageKey = "cover-generator-language";
export const languageOptions: Array<{ value: Language; label: string }> = [
  { value: "en", label: "EN" },
  { value: "ko", label: "KO" }
];

export const uiText = {
  en: {
    pageEyebrow: "cover-generator",
    pageTitle: "Generate Apple Music-style covers locally",
    pageDescription:
      "Upload photos, edit the text once, double-click the images you want to batch, then export PNG or ZIP.",
    steps: [
      "1 Upload photos",
      "2 Edit text",
      "3 Double-click to batch",
      "4 Download"
    ],
    language: "Language",
    preview: "Preview",
    noActiveImage: "No active image",
    noPreviewTitle: "No Preview Yet",
    noPreviewDescription: "Upload one or more images to start rendering covers.",
    selectedCount: (selected: number, total: number) =>
      total > 0 ? `${selected}/${total} selected` : "No upload",
    selectedGroup: "Selected Group",
    selectedGroupHint: (activeIndex: number, count: number) =>
      activeIndex >= 0
        ? `Previewing ${activeIndex + 1} of ${count} selected images.`
        : `${count} images are selected. Focus the group to preview them in order.`,
    shared: "Shared",
    previous: "Previous",
    next: "Next",
    focusSelectedGroup: "Focus Group",
    selectedGroupFocused: "Group Focused",
    downloadCurrentPng: "Download Current PNG",
    downloadSelectedZip: (count: number) =>
      count > 0 ? `Download Selected ZIP (${count})` : "Download Selected ZIP",
    exportCurrentBusy: "Exporting PNG...",
    exportBatchBusy: (count: number) =>
      count > 1 ? `Exporting ${count} covers...` : "Exporting selected cover...",
    settings: "Text & Layout",
    settingsDescription:
      "The active image uses these values. If it is selected, the same settings are shared by the selected group.",
    fields: {
      header: "Header",
      title: "Main Title",
      subtitle: "Subtitle",
      date: "Date Or Meta",
      footer: "Footer"
    },
    placeholders: {
      header: "APPLE MUSIC",
      title: "Han River",
      subtitle: "Seoul",
      date: "2026-03-01 or Vol. 01",
      footer: "SELF UPLOAD"
    },
    templates: {
      modern: {
        label: "Modern",
        description: "Top-left title stack with a clean Apple Music-style balance."
      },
      normal: {
        label: "Normal",
        description: "Centered composition with a softer, calmer text hierarchy."
      },
      classic: {
        label: "Classic",
        description: "More editorial contrast with stronger header and footer framing."
      }
    } satisfies Record<CoverTemplate, { label: string; description: string }>,
    template: "Template",
    resolution: "Resolution",
    quickSymbols: "Quick Symbols",
    insertsInto: (fieldLabel: string) => `Inserts into ${fieldLabel}`,
    effects: "Effects",
    useShadow: "Use shadow",
    useShadowDescription: "Adds contrast on bright photos.",
    useBlur: "Use blur",
    useBlurDescription: "Softens the background treatment.",
    images: "Images",
    sourceModes: {
      upload: "Self Upload",
      url: "Paste URL"
    },
    imagesTitle: "Bring in photos from your device or paste direct image URLs",
    imagesDescription:
      "Click a card to preview it. Double-click a card to include it in the shared batch.",
    uploadDropHint: "Drop image files here or choose them from disk.",
    urlTitle: "Paste one or more image URLs",
    urlDescription:
      "Use one URL per line. The browser can import only URLs that allow direct image access.",
    urlPlaceholder:
      "https://images.example.com/cover.jpg\nhttps://cdn.example.com/another.webp",
    addUrls: "Add URLs",
    chooseImages: "Choose Images",
    selectAll: "Select All",
    deselectAll: "Deselect All",
    clearAll: "Clear All",
    collection: "Collection",
    collectionHint:
      "Blue means active preview. Black means the card is inside the shared batch.",
    uploadedCount: (count: number) => (count > 0 ? `${count} uploaded` : "Empty"),
    selectedProgress: (activeIndex: number, count: number) =>
      activeIndex >= 0 ? `${activeIndex + 1}/${count} in group` : `${count} selected`,
    active: "Active",
    selected: "Selected",
    draft: "Draft",
    emptyCollection:
      "Upload multiple images to start. Each card keeps its own settings until you double-click it into the shared batch.",
    selectedIndex: (index: number) => `#${index}`,
    detailsSummary: "CLI parity and rendering notes",
    cliParity: "CLI Parity",
    renderingNotes: "Rendering Notes",
    renderingNoteOne: "Full-bleed image cropping stays inside the shared SVG renderer.",
    renderingNoteTwo: "Text wraps and shrinks until it fits each template safe area.",
    renderingNoteThree: "Blur and shadow remain optional and match the CLI flags.",
    cardActiveHint: "Active preview inside the shared group.",
    cardSelectedHint: "Shared batch",
    cardDraftHint: "Own settings",
    urlEmptyError: "Paste at least one valid image URL.",
    urlFetchError:
      "One or more URLs could not be imported. The host may block direct browser access.",
    uploadError: "Upload JPG, PNG, WebP, or AVIF images.",
    readError: "The file could not be read.",
    previewError: "Preview rendering failed.",
    pngError: "PNG export failed.",
    zipError: "ZIP export failed.",
    preparingImages: (count: number) =>
      count > 1 ? `Preparing ${count} images...` : "Preparing image...",
    importingUrls: (count: number) =>
      count > 1 ? `Importing ${count} URLs...` : "Importing URL...",
    coverPreviewAlt: "Cover preview",
    uploadedSourceAlt: "Uploaded source",
    templatePreviewAlt: (label: string) => `${label} template preview`
  },
  ko: {
    pageEyebrow: "cover-generator",
    pageTitle: "로컬에서 애플 뮤직 스타일 커버 생성",
    pageDescription:
      "사진을 올리고, 텍스트를 편집하고, 한 번에 처리할 이미지를 더블클릭으로 묶은 뒤 PNG나 ZIP으로 내보내세요.",
    steps: ["1 사진 업로드", "2 텍스트 편집", "3 더블클릭으로 묶기", "4 다운로드"],
    language: "언어",
    preview: "미리보기",
    noActiveImage: "활성 이미지 없음",
    noPreviewTitle: "아직 미리보기가 없습니다",
    noPreviewDescription: "하나 이상의 이미지를 올리면 바로 커버를 렌더링합니다.",
    selectedCount: (selected: number, total: number) =>
      total > 0 ? `${selected}/${total} 선택됨` : "업로드 없음",
    selectedGroup: "선택 그룹",
    selectedGroupHint: (activeIndex: number, count: number) =>
      activeIndex >= 0
        ? `선택된 이미지 ${count}장 중 ${activeIndex + 1}번째를 보고 있습니다.`
        : `${count}장이 선택되어 있습니다. 그룹 포커스로 순서대로 확인할 수 있습니다.`,
    shared: "공유",
    previous: "이전",
    next: "다음",
    focusSelectedGroup: "그룹 포커스",
    selectedGroupFocused: "그룹 포커스 중",
    downloadCurrentPng: "현재 PNG 다운로드",
    downloadSelectedZip: (count: number) =>
      count > 0 ? `선택한 ZIP 다운로드 (${count})` : "선택한 ZIP 다운로드",
    exportCurrentBusy: "PNG 내보내는 중...",
    exportBatchBusy: (count: number) =>
      count > 1 ? `${count}개 커버 내보내는 중...` : "선택한 커버 내보내는 중...",
    settings: "텍스트 및 레이아웃",
    settingsDescription:
      "현재 활성 이미지에 적용됩니다. 활성 이미지가 선택 상태라면 같은 설정이 선택 그룹 전체에 공유됩니다.",
    fields: {
      header: "헤더",
      title: "메인 제목",
      subtitle: "서브타이틀",
      date: "날짜 또는 메타",
      footer: "푸터"
    },
    placeholders: {
      header: "APPLE MUSIC",
      title: "Han River",
      subtitle: "Seoul",
      date: "2026-03-01 또는 Vol. 01",
      footer: "SELF UPLOAD"
    },
    templates: {
      modern: {
        label: "모던",
        description: "좌상단 텍스트 중심의 깔끔한 애플 뮤직 스타일 구도입니다."
      },
      normal: {
        label: "노멀",
        description: "가운데 정렬과 부드러운 위계가 중심인 차분한 구도입니다."
      },
      classic: {
        label: "클래식",
        description: "헤더와 푸터 대비가 더 강한 편집형 구도입니다."
      }
    } satisfies Record<CoverTemplate, { label: string; description: string }>,
    template: "템플릿",
    resolution: "해상도",
    quickSymbols: "빠른 심볼",
    insertsInto: (fieldLabel: string) => `${fieldLabel} 입력란에 삽입`,
    effects: "효과",
    useShadow: "그림자 사용",
    useShadowDescription: "밝은 사진에서 텍스트 대비를 높입니다.",
    useBlur: "블러 사용",
    useBlurDescription: "배경 처리를 더 부드럽게 만듭니다.",
    images: "이미지",
    sourceModes: {
      upload: "내 기기 업로드",
      url: "URL 붙여넣기"
    },
    imagesTitle: "기기 업로드 또는 직접 이미지 URL 붙여넣기로 불러오세요",
    imagesDescription:
      "카드를 클릭하면 미리보기, 더블클릭하면 공유 배치에 포함됩니다.",
    uploadDropHint: "이미지 파일을 드롭하거나 디스크에서 선택하세요.",
    urlTitle: "하나 이상의 이미지 URL을 붙여넣으세요",
    urlDescription:
      "한 줄에 하나씩 입력하세요. 브라우저에서 직접 접근 가능한 URL만 가져올 수 있습니다.",
    urlPlaceholder:
      "https://images.example.com/cover.jpg\nhttps://cdn.example.com/another.webp",
    addUrls: "URL 추가",
    chooseImages: "이미지 선택",
    selectAll: "전체 선택",
    deselectAll: "선택 해제",
    clearAll: "전체 제거",
    collection: "컬렉션",
    collectionHint: "파란 배지는 현재 미리보기, 검은 배지는 공유 배치 포함 상태입니다.",
    uploadedCount: (count: number) => (count > 0 ? `${count}장 업로드` : "비어 있음"),
    selectedProgress: (activeIndex: number, count: number) =>
      activeIndex >= 0 ? `그룹 ${count}장 중 ${activeIndex + 1}` : `${count}장 선택됨`,
    active: "활성",
    selected: "선택",
    draft: "개별",
    emptyCollection:
      "여러 이미지를 올리면 시작할 수 있습니다. 각 카드는 더블클릭으로 공유 배치에 넣기 전까지 개별 설정을 유지합니다.",
    selectedIndex: (index: number) => `#${index}`,
    detailsSummary: "CLI 동기화와 렌더링 메모",
    cliParity: "CLI 동기화",
    renderingNotes: "렌더링 메모",
    renderingNoteOne: "풀블리드 크롭은 공용 SVG 렌더러 안에서 처리됩니다.",
    renderingNoteTwo: "텍스트는 템플릿 안전 영역에 맞을 때까지 줄바꿈과 축소를 수행합니다.",
    renderingNoteThree: "블러와 그림자는 선택 사항이며 CLI 플래그와 동일하게 동작합니다.",
    cardActiveHint: "공유 그룹 안에서 현재 미리보기 중입니다.",
    cardSelectedHint: "공유 배치",
    cardDraftHint: "개별 설정",
    urlEmptyError: "유효한 이미지 URL을 하나 이상 붙여넣으세요.",
    urlFetchError:
      "하나 이상의 URL을 가져올 수 없습니다. 해당 호스트가 브라우저 직접 접근을 막고 있을 수 있습니다.",
    uploadError: "JPG, PNG, WebP, AVIF 이미지를 업로드하세요.",
    readError: "파일을 읽을 수 없습니다.",
    previewError: "미리보기 렌더링에 실패했습니다.",
    pngError: "PNG 내보내기에 실패했습니다.",
    zipError: "ZIP 내보내기에 실패했습니다.",
    preparingImages: (count: number) =>
      count > 1 ? `${count}개 이미지를 준비하는 중...` : "이미지를 준비하는 중...",
    importingUrls: (count: number) =>
      count > 1 ? `${count}개 URL을 가져오는 중...` : "URL을 가져오는 중...",
    coverPreviewAlt: "커버 미리보기",
    uploadedSourceAlt: "업로드된 원본",
    templatePreviewAlt: (label: string) => `${label} 템플릿 미리보기`
  }
} as const;
