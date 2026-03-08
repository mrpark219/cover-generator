import type { StudioCopy } from "./types";

export const koUiText: StudioCopy = {
  pageEyebrow: "cover-generator",
  pageTitle: "사진 한 장으로 커버를 만드세요.",
  pageDescription: "텍스트와 크롭을 조정하고 PNG 또는 ZIP으로 바로 저장하세요.",
  steps: ["1 업로드", "2 편집", "3 묶기", "4 다운로드"],
  language: "언어",
  preview: "미리보기",
  noActiveImage: "활성 이미지 없음",
  noPreviewTitle: "아직 미리보기가 없습니다",
  noPreviewDescription: "하나 이상의 이미지를 올리면 바로 커버를 렌더링합니다.",
  selectedCount: (selected, total) =>
    total > 0 ? `${selected}/${total} 선택됨` : "업로드 없음",
  selectedGroup: "선택 그룹",
  selectedGroupHint: (activeIndex, count) =>
    activeIndex >= 0
      ? `선택된 이미지 ${count}장 중 ${activeIndex + 1}번째를 보고 있습니다.`
      : `${count}장이 선택되어 있습니다. 그룹 포커스로 순서대로 확인할 수 있습니다.`,
  shared: "공유",
  previous: "이전",
  next: "다음",
  focusSelectedGroup: "그룹 포커스",
  selectedGroupFocused: "그룹 포커스 중",
  downloadCurrentPng: "PNG 저장",
  downloadSelectedZip: (count) =>
    count > 0 ? `ZIP 저장 (${count})` : "ZIP 저장",
  exportCurrentBusy: "PNG 내보내는 중...",
  exportBatchBusy: (count) =>
    count > 1 ? `${count}개 커버 내보내는 중...` : "선택한 커버 내보내는 중...",
  settings: "레이아웃",
  settingsDescription:
    "텍스트와 템플릿은 공유할 수 있고, 크롭은 이미지별로 유지됩니다.",
  fields: {
    header: "헤더",
    title: "제목",
    subtitle: "서브",
    date: "날짜 / 메타",
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
  },
  template: "템플릿",
  resolution: "해상도",
  position: "이미지 위치",
  positionDescription: "크롭 위치는 현재 이미지에만 적용됩니다.",
  horizontal: "가로",
  vertical: "세로",
  resetPosition: "초기화",
  quickSymbols: "빠른 심볼",
  insertsInto: (fieldLabel) => `${fieldLabel} 입력란에 삽입`,
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
  imagesTitle: "이미지 업로드 또는 URL 붙여넣기",
  imagesDescription:
    "클릭은 미리보기, 더블클릭은 공유 배치 포함입니다.",
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
  collectionHint: "클릭은 미리보기, 더블클릭은 배치 포함.",
  uploadedCount: (count) => (count > 0 ? `${count}장 업로드` : "비어 있음"),
  selectedProgress: (activeIndex, count) =>
    activeIndex >= 0 ? `그룹 ${count}장 중 ${activeIndex + 1}` : `${count}장 선택됨`,
  active: "활성",
  selected: "선택",
  draft: "개별",
  emptyCollection:
    "여러 이미지를 올리면 시작할 수 있습니다. 각 카드는 더블클릭으로 공유 배치에 넣기 전까지 개별 설정을 유지합니다.",
  selectedIndex: (index) => `#${index}`,
  detailsSummary: "CLI 동기화와 렌더링 메모",
  cliParity: "CLI 동기화",
  renderingNotes: "렌더링 메모",
  renderingNoteOne: "풀블리드 크롭은 공용 SVG 렌더러 안에서 처리됩니다.",
  renderingNoteTwo: "텍스트는 템플릿 안전 영역에 맞을 때까지 줄바꿈과 축소를 수행합니다.",
  renderingNoteThree: "블러와 그림자는 선택 사항이며 CLI 플래그와 동일하게 동작합니다.",
  cardActiveHint: "공유 그룹 안에서 현재 미리보기 중입니다.",
  cardSelectedHint: "공유 배치 설정",
  cardDraftHint: "개별 설정",
  urlEmptyError: "유효한 이미지 URL을 하나 이상 붙여넣으세요.",
  urlFetchError:
    "하나 이상의 URL을 가져올 수 없습니다. 해당 호스트가 브라우저 직접 접근을 막고 있을 수 있습니다.",
  uploadError: "JPG, PNG, WebP, AVIF 이미지를 업로드하세요.",
  readError: "파일을 읽을 수 없습니다.",
  previewError: "미리보기 렌더링에 실패했습니다.",
  pngError: "PNG 내보내기에 실패했습니다.",
  zipError: "ZIP 내보내기에 실패했습니다.",
  preparingImages: (count) =>
    count > 1 ? `${count}개 이미지를 준비하는 중...` : "이미지를 준비하는 중...",
  importingUrls: (count) =>
    count > 1 ? `${count}개 URL을 가져오는 중...` : "URL을 가져오는 중...",
  coverPreviewAlt: "커버 미리보기",
  uploadedSourceAlt: "업로드된 원본",
  templatePreviewAlt: (label) => `${label} 템플릿 미리보기`
};
