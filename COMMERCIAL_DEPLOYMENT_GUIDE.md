# 정산메이트 상용 전환 및 Vercel 배포 안내

## 현재 준비 상태

이 저장소에는 정적 웹 앱, Vercel 배포 설정, 토스페이먼츠 결제 API 뼈대, 비밀 값 제외 규칙, 우측 하단 문의 버튼이 포함되어 있습니다. 결제 키는 저장소에 포함하지 않았으며, 실제 결제 승인도 `PAYMENTS_LIVE_ENABLED=true`를 명시적으로 설정하기 전까지 차단됩니다.

| 구성 요소 | 위치 | 역할 |
|---|---|---|
| 정적 웹 앱 | `index.html` | 브라우저 내 정산 처리, 멀티 탭 UI, 문의 버튼 |
| 주문 생성 API | `api/payments/create-order.js` | 서버가 요금제·금액·주문번호를 생성 |
| 결제 승인 API | `api/payments/confirm.js` | 토스 시크릿 키를 서버에서만 사용해 결제를 승인 |
| 웹훅 엔드포인트 | `api/webhooks/toss.js` | 비동기 결제 상태 수신 구조 |
| 비밀 값 예시 | `.env.example` | 실제 키를 Vercel 환경 변수로 등록하기 위한 변수 목록 |
| Vercel 설정 | `vercel.json` | 정적 사이트와 서버리스 API를 함께 배포하고 기본 보안 헤더 적용 |

> 실제 결제를 켜기 전에는 주문·구독 상태를 영속적으로 보관할 데이터베이스와 사용자 인증을 추가해야 합니다. 현재 결제 모듈은 키 노출을 차단하고 안전한 승인 흐름을 준비한 **기반 구조**이며, 저장소 없이 브라우저가 보낸 금액만 신뢰해 권한을 부여하지 않도록 설계되어 있습니다.

## Vercel 자동 배포 연결

Vercel에서 **New Project**를 선택하고 GitHub 저장소 `cvgzz153-commits/seller-settlement-auto-web`을 Import합니다. Framework Preset은 `Other`로 두고 Root Directory는 저장소 최상위로 지정합니다. `main` 브랜치를 Production Branch로 유지하면, 이후 `main`에 병합되는 커밋은 운영 배포로 반영되고 다른 브랜치 푸시는 미리보기 배포로 생성됩니다.[1]

Vercel은 Git 저장소를 연결한 뒤 커밋 또는 풀 리퀘스트에 따라 새 배포를 만들며, Vercel이 발급한 `*.vercel.app` URL을 즉시 사용할 수 있습니다. 별도 도메인이 있다면 Vercel Project Settings의 Domains에서 연결할 수 있습니다.[1]

## 환경 변수 등록

Vercel Project Settings → Environment Variables에서 아래 값을 등록합니다. `TOSS_SECRET_KEY`는 **Production/Preview/Development** 중 필요한 환경에서만 등록하고, 브라우저 코드나 Git 커밋에 절대 넣지 않습니다. Vercel 환경 변수는 소스 코드 밖에서 저장되며, 새 값은 이후 배포에 적용됩니다.[2]

| 변수 | 필수 | 설정 위치 | 설명 |
|---|---:|---|---|
| `TOSS_CLIENT_KEY` | 결제창 연결 시 | 클라이언트/빌드 | 토스페이먼츠 Client Key. 공개 키이지만 환경별로 관리합니다. |
| `TOSS_SECRET_KEY` | 결제 승인 시 | 서버리스 함수 전용 | 토스페이먼츠 Secret Key. 절대 클라이언트 코드에 넣지 않습니다. |
| `PAYMENTS_LIVE_ENABLED` | 예 | 서버리스 함수 | 초기에는 `false`, 운영 준비가 끝난 뒤에만 `true`입니다. |
| `APP_ORIGIN` | 예 | 서버리스 함수 | 실제 Vercel 운영 URL 또는 연결한 커스텀 도메인입니다. |
| `CONTACT_URL` | 선택 | 운영 설정 | Google Form 또는 고객지원 채널 URL입니다. |

토스페이먼츠는 테스트 키(`test_sk` 또는 `test_gsk`)로 테스트 모드를 제공하고, 실제 수납에는 운영 키(`live_sk` 또는 `live_gsk`)를 사용합니다. 승인 API는 시크릿 키에 콜론을 붙인 Base64 값을 Basic 인증으로 사용하며, 중복 승인을 막기 위한 idempotency key를 사용하는 흐름이 권장됩니다.[3]

## 결제 운영 전 최종 체크

결제 승인 성공만으로 이용 권한을 부여하지 말고, 서버에서 주문 번호·요금제·금액·고객 계정·결제 상태를 데이터베이스에 저장하고 재검증해야 합니다. 월 구독은 토스페이먼츠의 빌링키 기반 반복 결제 흐름과 사용자 계정·해지·실패 결제 정책을 추가해야 합니다. 결제 상태 변경을 수신할 때는 `PAYMENT_STATUS_CHANGED` 웹훅을 등록하고, 이벤트가 중복 전송될 수 있다는 전제로 `eventId` 또는 결제 키를 기록해 중복 처리하지 않아야 합니다.[4]

토스페이먼츠 개발자센터에 웹훅 URL로 `https://<Vercel-운영-도메인>/api/webhooks/toss`를 등록하고, 성공·실패·비동기 결제 시나리오를 **테스트 키**로 먼저 점검합니다. 웹훅 수신 서버는 HTTP 200으로 수신을 응답해야 하며, 공급자는 실패한 전송을 재시도할 수 있습니다.[4]

## 문의 채널

현재 우측 하단 **문의하기** 버튼은 GitHub 이슈 작성 화면으로 연결됩니다. Google Form을 사용하려면 `index.html`의 `buildFeedbackLink()`가 반환하는 링크를 Google Form의 사전 작성 URL로 교체하거나, 추후 서버 설정에서 `CONTACT_URL`을 노출 가능한 공개 값으로 제공하는 API를 추가합니다. 문의 본문에는 주문 상세, 고객 실명, 전화번호, 카드·계좌 정보 같은 개인정보를 요청하거나 입력하지 않도록 운영합니다.

## 참고 자료

[1] [Vercel — Deploying Git Repositories](https://vercel.com/docs/git)

[2] [Vercel — Environment Variables](https://vercel.com/docs/environment-variables)

[3] [Toss Payments — Payment APIs](https://docs.tosspayments.com/en/api-guide)

[4] [Toss Payments — Webhooks](https://docs.tosspayments.com/en/webhooks)
