# Playwright E2E 환경

Playwright E2E 테스트 프로젝트입니다. `tests/`의 기존 테스트를 PC 브라우저 3종과 모바일 에뮬레이션 2종에서 실행할 수 있습니다.

## 설치

Node.js와 npm이 필요합니다. 현재 환경의 Node.js 24에서 설정을 확인했습니다.

```powershell
npm.cmd ci
npm.cmd run test:e2e:install
```

다른 PC에서 처음 구성하거나 Playwright 버전을 변경했을 때 위 명령으로 설치합니다.
무료체험 테스트의 기존 환경별 실행 결과와 수정 후 확인 범위는 `artifacts/work-vital-free-trial-fix-notes.md`에 기록되어 있습니다.
PowerShell 실행 정책으로 `npm.ps1`이 차단될 경우에도 `npm.cmd`를 사용할 수 있습니다.
다른 셸에서는 `npm`으로 실행해도 됩니다.

## 대상 URL

기본 URL은 `http://localhost:3000`입니다. 다른 주소는 실행할 터미널에서 설정합니다.

```powershell
$env:BASE_URL = 'https://your-app.example'
npm.cmd run test:e2e
```

이 설정은 테스트에서 상대 경로로 이동할 때 사용됩니다. 현재 테스트들은 절대 URL을 사용하므로 `BASE_URL`을 변경해도 접속 대상이 바뀌지 않습니다.
애플리케이션 서버는 별도로 실행해야 합니다. 이 프로젝트는 서버를 자동으로 실행하지 않습니다.
`.env` 파일은 자동으로 읽지 않습니다.

## 실행 명령

전체 환경 실행:

```powershell
npm.cmd run test:e2e
```

환경별 실행:

```powershell
# PC Chromium
npm.cmd run test:e2e -- --project=chromium

# PC Firefox
npm.cmd run test:e2e -- --project=firefox

# PC WebKit
npm.cmd run test:e2e -- --project=webkit

# Pixel 5 프리셋 / Chromium 모바일 에뮬레이션
npm.cmd run test:e2e -- --project=mobile-chrome

# iPhone 13 프리셋 / WebKit 모바일 에뮬레이션
npm.cmd run test:e2e -- --project=mobile-safari
```

각 프로젝트는 동일한 `tests/`의 테스트와 검증 조건을 사용합니다. 모바일용 테스트 제외, 건너뛰기 또는 검증 조건 완화는 적용하지 않았습니다.
특정 파일만 실행하려면 명령 끝에 파일 경로를 붙입니다. 예:

```powershell
npm.cmd run test:e2e -- --project=mobile-chrome tests/work-vital-login.spec.ts
```

추가 명령:

| 명령 | 기능 |
| --- | --- |
| `npm.cmd run test:e2e:ui` | Playwright UI 실행 |
| `npm.cmd run test:e2e:headed` | 브라우저 창을 표시하며 실행 |
| `npm.cmd run test:e2e:debug` | 디버거 실행 |
| `npm.cmd run test:e2e:list` | 테스트 목록 확인 |
| `npm.cmd run test:e2e:report` | HTML 리포트 열기 |

테스트 본문을 실행하거나 브라우저를 열지 않고, 환경별 테스트 수집 목록만 확인하려면:

```powershell
npm.cmd run test:e2e:list -- --reporter=list
```

## 실행 환경과 실제 기기 테스트의 차이

| 프로젝트 | 브라우저 엔진 | 프리셋 | 유형 |
| --- | --- | --- | --- |
| `chromium` | Chromium | Desktop Chrome | PC 브라우저 |
| `firefox` | Firefox | Desktop Firefox | PC 브라우저 |
| `webkit` | WebKit | Desktop Safari | PC 브라우저 |
| `mobile-chrome` | Chromium | Pixel 5 | 모바일 에뮬레이션 |
| `mobile-safari` | WebKit | iPhone 13 | 모바일 에뮬레이션 |

모바일 에뮬레이션은 PC에서 브라우저를 실행하면서 프리셋의 화면 크기, viewport, user agent, 픽셀 비율, 모바일 및 터치 설정을 적용합니다. 반응형 레이아웃과 모바일 UI 동작을 확인하는 데 사용합니다. [Playwright 에뮬레이션 공식 문서](https://playwright.dev/docs/emulation)

실제 기기 테스트는 물리적인 Android/iPhone과 그 기기의 브라우저에서 실행합니다. 에뮬레이션은 실제 Pixel 5나 iPhone 13을 구동하지 않으며, 실제 OS·브라우저 UI·키보드·하드웨어 성능·센서·통신 환경을 동일하게 재현하지 않습니다. `mobile-safari`도 실제 iPhone의 Safari 앱을 실행하는 것이 아니라 PC의 WebKit에 iPhone 13 프리셋을 적용합니다. 실제 기기의 성능이나 OS 연동 동작은 별도의 실제 기기 테스트가 필요합니다.

## 결과와 기본 동작

- HTML 리포트: `playwright-report/` (실행 후 명령으로 열기)
- 실패 스크린샷과 trace: `test-results/`
- 다섯 프로젝트 모두 공통 `BASE_URL`, 실패 시 스크린샷(`only-on-failure`) 및 trace(`retain-on-failure`) 설정 상속
- 로컬 재시도 없음, CI 재시도 2회 및 worker 1개
- CI에서 `test.only` 사용 시 실패
- 의존성, 실행 결과 및 인증 상태 경로는 `.gitignore`로 제외

설정 옵션은 [Playwright 공식 문서](https://playwright.dev/docs/test-configuration),
브라우저 설치는 [브라우저 문서](https://playwright.dev/docs/browsers)를 참고하세요.

## GitHub에서 관리

저장소: [thwans/WORK-VITAL_E2E_TEST](https://github.com/thwans/WORK-VITAL_E2E_TEST)

처음 업로드할 때는 일반 PowerShell에서 다음 스크립트에 작성자 이름과 이메일을 전달합니다.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\publish-github.ps1 -AuthorName '커밋 작성자 이름' -AuthorEmail 'Git 이메일'
```

스크립트는 이 저장소에만 작성자 정보를 설정하고, 원격 저장소가 비어 있을 때 첫 커밋과 `main` 브랜치 업로드를 진행합니다. 원격에 기존 브랜치가 있으면 내용을 덮어쓰지 않고 중단합니다. GitHub 인증 창이 표시되면 본인 계정으로 로그인합니다.

업로드 후 다른 PC에서 가져오기:

```powershell
git clone https://github.com/thwans/WORK-VITAL_E2E_TEST.git
cd WORK-VITAL_E2E_TEST
npm.cmd ci
npm.cmd run test:e2e:install
```

이후 변경 사항 저장과 업로드:

```powershell
git status
git diff
git add .
git commit -m "Describe the change"
git push
```

`node_modules/`, 테스트 결과·리포트, MCP 임시 파일, `.env` 및 인증 상태 파일은 Git에서 제외합니다. 직접 저장한 확인 기록과 스크린샷은 `artifacts/`에 포함합니다.
