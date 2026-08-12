# PWA 및 하이브리드 앱 구현 근거

## PWA

웹 앱 매니페스트는 설치형 PWA에 필요한 앱 이름·아이콘 등 정보를 브라우저에 제공하며, `name`, `short_name`, `icons`, `start_url`, `display`, `theme_color`, `background_color` 등을 지정할 수 있다. HTML `head`의 `<link rel="manifest">`로 배포한다.[1]

## Android WebView

Android WebView는 앱 내부에서 웹 앱을 표시할 수 있으며, 네트워크 콘텐츠를 읽으려면 `INTERNET` 권한이 필요하다. 웹 앱이 JavaScript를 사용하면 WebView에서 JavaScript를 명시적으로 활성화해야 한다. URL을 가로채는 `WebViewClient`를 이용해 자사 도메인은 WebView 내에서 유지하고, 결제사·외부 인증 URL은 시스템 브라우저에서 열도록 구성할 수 있다. Android 공식 문서는 well-formed custom scheme 또는 자사 HTTPS URL을 콜백 처리에 사용하도록 안내한다.[2]

## iOS 배포 유의사항

앱스토어 심사 제출물은 완성된 기능, 접근 가능한 백엔드, 유효한 지원 연락처를 갖춰야 한다. 앱 내 유료 기능 또는 디지털 구독을 제공할 경우 Apple의 결제·인앱 구매 관련 지침을 별도로 검토해야 하며, 단순 WebView에서 웹 결제로 우회하는 방식의 심사 승인 여부를 전제로 하면 안 된다.[3]

## 참고 자료

[1] [MDN — Web application manifest](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest)

[2] [Android Developers — Build web apps in WebView](https://developer.android.com/develop/ui/views/layout/webapps/webview)

[3] [Apple — App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
