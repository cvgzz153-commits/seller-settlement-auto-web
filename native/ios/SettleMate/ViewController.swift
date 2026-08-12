import UIKit
import WebKit

class ViewController: UIViewController, WKNavigationDelegate, WKScriptMessageHandler {
    private var webView: WKWebView!
    private let appOrigin = URL(string: "https://your-domain.vercel.app")!
    private let appHost = "your-domain.vercel.app"

    override func viewDidLoad() {
        super.viewDidLoad()

        let contentController = WKUserContentController()
        contentController.add(self, name: "settleMate")

        let config = WKWebViewConfiguration()
        config.userContentController = contentController
        config.preferences.javaScriptEnabled = true
        config.preferences.javaScriptCanOpenWindowsAutomatically = false

        webView = WKWebView(frame: view.bounds, configuration: config)
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        webView.navigationDelegate = self
        view.addSubview(webView)

        webView.load(URLRequest(url: appOrigin))
    }

    // 결제 완료 화면(success.html / fail.html)에서 iOS 네이티브 브리지로 전달된 결과를 처리합니다.
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "settleMate", let body = message.body as? [String: Any] else { return }
        let type = body["type"] as? String ?? ""
        // 운영 전 필수: orderId를 앱 서버의 인증된 결제 상태 API로 재검증한 뒤 이용 권한을 갱신합니다.
        // JavaScript에서 전달된 body 자체만으로 결제 성공 또는 이용 권한을 확정하지 않습니다.
        print("[SettleMate] 결제 결과 수신: type=\(type), orderId=\(body["orderId"] ?? "")")
    }

    // 자사 도메인은 WebView 내에서 유지하고, 결제사·외부 URL은 Safari에서 엽니다.
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else { decisionHandler(.cancel); return }
        if url.host == appHost { decisionHandler(.allow); return }
        UIApplication.shared.open(url, options: [:], completionHandler: nil)
        decisionHandler(.cancel)
    }
}
