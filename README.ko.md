# cover-generator

`cover-generator`는 한 장의 이미지로 Apple Music 스타일의 정사각형 커버를 만드는 로컬 모노레포입니다. Next.js 웹 스튜디오와 CLI를 함께 제공하고, 두 환경 모두 같은 공용 렌더러를 사용합니다.

## 기술 스택

- `npm` workspaces
- Next.js App Router
- TypeScript
- Tailwind CSS
- Sharp
- Commander

## 프로젝트 구조

```text
cover-generator/
├── apps/
│   ├── cli/                 # Node.js CLI 진입점과 출력 처리
│   └── web/                 # Next.js 기반 원페이지 커버 스튜디오
├── packages/
│   ├── cover-renderer/      # 공용 SVG 합성 및 템플릿 로직
│   └── shared/              # 공용 타입, 템플릿 메타데이터, 유틸리티
├── package.json             # 루트 스크립트와 CLI bin 노출
├── README.md                # 언어 선택용 README
├── README.en.md             # 영어 문서
└── README.ko.md             # 한국어 문서
```

## 요구 사항

- Node.js `20.18+`
- npm `11+`

## 설치

```bash
npm install
```

## 웹 앱 실행

```bash
npm run dev
```

`http://localhost:3000`을 열면 됩니다.

웹 앱은 다음 기능을 지원합니다.

- 직접 업로드와 이미지 URL 붙여넣기
- 여러 이미지 가져오기
- 컬렉션 영역에서 드래그 앤 드롭 그룹 분류
- 이미지별 개별 편집과 그룹별 공통 편집
- 체크박스 기반 ZIP 일괄 저장
- `1200`, `1600`, `2048` 해상도 선택
- 이미지별 크롭 위치 조정
- 한국어/영어 UI 전환
- `header`, `title`, `subtitle`, `date/meta`, `footer` 편집
- 실시간 정사각형 미리보기
- `modern`, `normal`, `classic` 템플릿
- `shadow`, `blur` 효과
- 로컬 PNG 저장

## CLI 실행

먼저 CLI를 빌드합니다.

```bash
npm run build
```

웹만 확인하려면 아래 명령으로 충분합니다.

```bash
npm run build -w @cover-generator/web
```

저장소에서 직접 실행:

```bash
./apps/cli/dist/index.js generate ./input/photo.jpg \
  --header "@mrpark219" \
  --title "SungHwan Park" \
  --subtitle "cover-generator" \
  --date "KOREA · 2026" \
  --footer "made by mrpark219"
```

루트 `bin`으로 명령을 노출하려면:

```bash
npm link
cover-generator generate ./input/photo.jpg --title "SungHwan Park"
```

자주 쓰는 CLI 옵션:

- `--template <modern|normal|classic>`
- `--size <1200|1600|2048>`
- `--focus-x <0-100>`
- `--focus-y <0-100>`
- `--header <text>`
- `--subtitle <text>`
- `--footer <text>`
- `--text-color <hex>`
- `--shadow`
- `--blur`
- `-o, --output <path>`

예시:

```bash
cover-generator generate ./input/photo.jpg --header "@mrpark219" --title "SungHwan Park" --subtitle "cover-generator" --date "KOREA · 2026" --footer "made by mrpark219"
cover-generator generate ./input/photo.jpg --template classic --title "Night Walk" --subtitle "Mapo" --date "VOL. 02" --shadow --blur
cover-generator generate ./input/photo.jpg --template normal --size 2048 --focus-x 45 --focus-y 35 --text-color "#F8FAFC" --output ./exports/cover.png
```

기본 출력 경로는 `./output/<generated-file-name>.png`입니다.

## 스크립트

```bash
npm run dev
npm run build
npm run lint
```

워크스페이스 단축 명령:

```bash
npm run build -w @cover-generator/web
npm run lint -w @cover-generator/web
npm run build -w @cover-generator/cli
npm run lint -w @cover-generator/cli
```

## 렌더링 구조

핵심 설계는 이미지 합성 로직을 웹 UI나 CLI가 아니라 `packages/cover-renderer`에 두는 것입니다.

흐름은 다음과 같습니다.

1. 웹 앱 또는 CLI가 원본 이미지를 data URL로 변환합니다.
2. 공용 렌더러가 선택한 템플릿 기준으로 정사각형 SVG를 생성합니다.
3. 웹 앱은 그 SVG를 바로 미리보기로 사용하고, 저장할 때 브라우저에서 PNG로 변환합니다.
4. CLI는 같은 SVG를 Sharp로 PNG로 변환합니다.

공용 렌더러가 맡는 일:

- 템플릿 레이아웃
- 이미지 크롭과 프레이밍
- 텍스트 줄바꿈
- 글자 크기 축소
- 글자 색상과 효과 처리

웹 UI 문구는 `apps/web/lib/i18n/` 아래에 정리돼 있어서, 언어를 추가할 때는 새 언어 파일을 만들고 등록하면 됩니다.

## 템플릿

- `modern`: 좌상단 중심의 타이포 스택과 간결한 Apple Music 스타일 위계
- `normal`: 가운데 정렬 기반의 부드러운 균형
- `classic`: 상하 메타 정보 대비가 더 강한 편집형 구도

모든 템플릿은 같은 텍스트 입력 모델을 공유합니다.

- `header`
- `title`
- `subtitle`
- `date`
- `footer`

## 텍스트 처리 방식

긴 텍스트는 공용 렌더러에서 대략적인 텍스트 측정을 통해 처리합니다.

- 먼저 단어 기준으로 줄바꿈
- 너무 긴 토큰은 필요할 때 문자 단위로 분리
- 영역에 맞을 때까지 글자 크기 축소
- 마지막 수단으로만 말줄임 처리

목표는 캔버스 밖으로 넘치지 않으면서도 읽기 좋은 결과를 유지하는 것입니다.

## 가정한 사항

- `date` 필드는 날짜 전용이 아니라 자유 입력 메타 텍스트로 그대로 렌더링합니다.
- 구현은 CoverX의 공개 동작과 분위기를 참고하되, 로컬에서 동작하는 독자 구현입니다.
- 렌더링은 전부 로컬에서 처리되며 별도 백엔드는 필요하지 않습니다.

## 검증

로컬에서 확인한 항목:

- 웹 lint
- 웹 프로덕션 빌드
- CLI lint
- CLI 프로덕션 빌드
- CLI PNG 생성과 `output/` 출력
