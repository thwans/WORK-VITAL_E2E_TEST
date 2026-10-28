# 무료체험 테스트 실패 원인 및 수정 확인

## 저장된 기존 실행 결과를 환경별로 확인

`playwright-report/index.html`에 포함된 리포트와 각 환경의 `test-results/.../error-context.md`를 확인했습니다. 새 테스트 실행 결과는 아닙니다.

| 환경 | 기존 결과 | 확인한 내용 |
| --- | --- | --- |
| chromium | 실패 | 도착 화면 검증 후 주소창의 `#top` 차이로 `toHaveURL` 실패 |
| firefox | 통과 | 저장된 리포트 outcome이 `expected`이며 신청 화면 스크린샷이 있음 |
| webkit | 실패 | Cloudflare `Performing security verification` 화면 및 `/api/challenge_redirect`로 이동하여 앱 요소를 찾지 못함 |
| mobile-chrome | 실패 | 헤더의 무료체험 링크를 찾지 못함 |
| mobile-safari | 실패 | 헤더의 무료체험 링크를 찾지 못함 |

## 이번 Playwright MCP 확인

MCP 브라우저 엔진은 Chromium입니다. PC 1280×720, 모바일 폭 393px 및 390px에서 화면 구조를 확인했습니다. 화면 크기 변경은 프로젝트의 실제 Pixel 5/iPhone 13 컨텍스트 또는 다른 브라우저 엔진의 재실행과 동일하지 않습니다.

- PC: GNB 무료체험 → 진단 선택 화면 → 스트레스 진단 → 무료 체험 신청하기 → 신청 화면 도착을 확인했습니다.
- 393×727: `전체 메뉴 열기` 버튼 클릭 후 `#drawer`가 열리고 `무료체험` 링크가 표시됩니다. 링크를 통해 위와 동일한 신청 화면까지 이동했으며 스트레스 진단 체크 상태를 확인했습니다.
- 390×664: `전체 메뉴 열기` 버튼과 열린 메뉴의 `무료체험` 링크를 별도로 확인했습니다. 이 크기에서는 이후 전체 흐름을 다시 진행하지 않았습니다.
- 메뉴 버튼에서 `aria-controls="drawer"`, 열린 상태에서 `aria-expanded="true"`를 확인했습니다.
- PC 도착 후 주소창에 `#top`이 남고 모바일 도착 후 해시가 없는 경우를 확인했습니다. 두 경우 모두 iframe은 `apply.html?plan=free&dx=stress#trial`의 동일한 신청 화면이었습니다. 따라서 주소창의 이 두 해시 상태만 허용합니다.
- 마지막 버튼 클릭 뒤 입력, 동의 또는 양식 제출은 진행하지 않았습니다.

## 수정 사항

- 모바일 컨텍스트에서는 메뉴 열림을 검증한 뒤 그 메뉴 내부의 무료체험 링크를 클릭합니다. PC는 기존 GNB 경로를 사용합니다.
- 주소창의 도메인·경로·쿼리는 정확히 비교하고 해시는 없음 또는 `#top`만 허용합니다. 다른 해시나 다른 페이지는 실패합니다.
- 첫 화면 제목, 진단 선택 화면 제목·URL, 스트레스 선택 상태·요약, 신청 화면 제목·체크 상태·URL을 검증합니다.
- 콘텐츠 URL은 최초 iframe의 실제 주소를 기준으로 계산하므로 서버의 버전 경로를 하드코딩하지 않습니다. 이후 목적지의 origin·경로·쿼리·해시는 정확히 일치해야 합니다.
- 강제 클릭, 예외 무시, 테스트 건너뛰기, 대기 시간 증가는 추가하지 않았습니다.
- 기존 테스트와 5개 프로젝트 설정은 변경하지 않았습니다.

## 남은 확인 사항

수정한 E2E 테스트는 실행하지 않았습니다. Firefox·WebKit 및 두 모바일 프리셋에서 수정 후 동작은 사용자의 재실행이 필요합니다. PC WebKit의 Cloudflare 차단은 메뉴/해시 수정으로 해결됐다고 볼 수 없으며, 테스트는 이 화면을 정상 화면으로 인정하거나 우회하지 않습니다.

스크린샷:

- [PC 도착 화면](work-vital-free-trial-desktop-recheck.png)
- [393px 모바일 메뉴](work-vital-free-trial-mobile-menu.png)
- [393px 모바일 도착 화면](work-vital-free-trial-mobile-recheck.png)
- [390px 모바일 메뉴](work-vital-free-trial-390px-menu.png)
