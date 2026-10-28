# Playwright MCP 화면 확인 결과

- 상단 GNB의 `무료체험` 링크 클릭 후 진단 선택 화면이 표시됨.
- 진단 선택은 별도의 메뉴 클릭이 아니라 무료체험 화면에 바로 표시되는 영역임.
- 선택 전 요약은 `0종`이며 `무료 체험 신청하기` 버튼은 비활성화 상태임.
- `스트레스 진단` 선택 후 요약에 해당 진단과 `1종`이 표시되고 신청 버튼이 활성화됨.
- 신청 버튼 클릭 후 `진단 1종 무료로 시작하세요` 제목의 무료체험 신청 화면에 도착함.
- 도착 화면의 `스트레스 진단` 체크박스가 선택된 상태임.
- 도착 이후 입력이나 추가 클릭은 진행하지 않음. 테스트 파일도 실행하지 않음.

주소창 URL:

```text
https://claude.ai/artifact/PDoCQjYmUNZMevge89onRq
```

실제 콘텐츠 iframe URL (관찰 시점의 버전 경로 포함):

```text
https://b3f2720b-e5ff-44ea-bb97-15d4468c1fc4.frame.claudeusercontent.com/_f/1793167301-d9db/apply.html?plan=free&dx=stress#trial
```

테스트는 iframe의 버전 경로를 고정하지 않고 `apply.html`, `plan=free`, `dx=stress`, `#trial`을 각각 검증함.

스크린샷: [work-vital-free-trial-arrival.png](work-vital-free-trial-arrival.png)

사용자가 테스트를 실행하면 환경별 `test-results/` 경로에 도착 화면 스크린샷을 저장하고 HTML 리포트에 URL 정보와 함께 첨부함.
