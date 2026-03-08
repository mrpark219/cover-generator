import type { StudioCopy } from "./types";

export const koUiText: StudioCopy = {
  pageEyebrow: "cover-generator",
  pageTitle: "사진은 한 장, 인상은 오래.",
  pageDescription: "텍스트와 크롭만 다듬으면, 바로 저장할 수 있는 커버가 됩니다.",
  steps: ["1 업로드", "2 편집", "3 묶기", "4 다운로드"],
  language: "언어",
  preview: "미리보기",
  noActiveImage: "활성 이미지 없음",
  noPreviewTitle: "아직 미리보기가 없습니다",
  noPreviewDescription: "이미지를 넣는 순간, 커버가 바로 보입니다.",
  selectedCount: (selected, total) =>
    total > 0 ? `${selected}/${total} 선택됨` : "업로드 없음",
  selectedGroup: "선택 그룹",
  selectedGroupHint: (activeIndex, count) =>
    activeIndex >= 0
      ? `묶인 이미지 ${count}장 중 ${activeIndex + 1}번째를 보고 있습니다.`
      : `${count}장이 묶여 있습니다. 그룹 포커스로 차례대로 확인하세요.`,
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
    "텍스트와 템플릿은 함께 움직이고, 크롭은 이미지마다 따로 기억합니다.",
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
    date: "VOL. 01",
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
  textColor: "글자 색상",
  resetColor: "초기화",
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
  imagesTitle: "이미지를 넣고, 바로 골라보세요.",
  imagesDescription:
    "클릭하면 미리보고, 더블클릭하면 묶음에 넣습니다.",
  uploadDropHint: "파일을 끌어놓거나 직접 고르세요.",
  urlTitle: "이미지 주소를 한 줄에 하나씩 붙여넣으세요",
  urlDescription:
    "대부분의 공개 이미지 주소를 가져올 수 있지만, 일부 호스트는 원격 가져오기를 막을 수 있습니다.",
  urlPlaceholder:
    "https://images.example.com/cover.jpg\nhttps://cdn.example.com/another.webp",
  addUrls: "URL 추가",
  chooseImages: "이미지 선택",
  selectAll: "전체 선택",
  deselectAll: "선택 해제",
  clearAll: "전체 제거",
  collection: "컬렉션",
  collectionHint: "클릭은 확인, 더블클릭은 묶음.",
  uploadedCount: (count) => (count > 0 ? `${count}장 업로드` : "비어 있음"),
  selectedProgress: (activeIndex, count) =>
    activeIndex >= 0 ? `그룹 ${count}장 중 ${activeIndex + 1}` : `${count}장 선택됨`,
  active: "활성",
  selected: "선택",
  draft: "개별",
  emptyCollection:
    "이미지를 몇 장 올리면 여기서 한 번에 정리할 수 있습니다. 더블클릭하기 전까지는 각 카드가 자기 설정을 그대로 갖고 있습니다.",
  selectedIndex: (index) => `#${index}`,
  detailsSummary: "CLI 명령과 렌더링 팁",
  detailsHint: "패널 열기",
  cliParity: "CLI 동기화",
  renderingNotes: "렌더링 팁",
  renderingNoteOne:
    "크롭은 공용 렌더러에서 처리돼서 웹과 CLI 결과가 같은 구도로 맞춰집니다.",
  renderingNoteTwo:
      "글자가 길면 먼저 줄바꿈하고, 그래도 길면 레이아웃에 자연스럽게 들어오도록 크기를 줄입니다.",
  renderingNoteThree:
    "블러는 배경을 부드럽게 만들고, 그림자는 밝은 사진에서 글자를 더 또렷하게 만듭니다.",
  cardActiveHint: "묶음 안에서 지금 보고 있는 카드입니다.",
  cardSelectedHint: "공유 묶음 설정 사용 중",
  cardDraftHint: "개별 설정 사용 중",
  urlEmptyError: "유효한 이미지 URL을 하나 이상 붙여넣으세요.",
  urlFetchError:
    "하나 이상의 URL을 가져올 수 없습니다. 해당 호스트가 원격 가져오기를 막고 있거나 이미지 주소가 아닐 수 있습니다.",
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
