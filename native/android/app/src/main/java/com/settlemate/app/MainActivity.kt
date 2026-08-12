package com.settlemate.app

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.ComponentActivity

class MainActivity : ComponentActivity() {
    private lateinit var webView: WebView
    private val appOrigin = "https://your-domain.vercel.app"
    private val appHost = "your-domain.vercel.app"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        webView = WebView(this)
        setContentView(webView)

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = false
            allowContentAccess = false
            mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_NEVER_ALLOW
            setSupportMultipleWindows(false)
        }
        webView.addJavascriptInterface(NativePaymentBridge(), "SettleMateNative")
        webView.webViewClient = SafeWebViewClient()

        val incoming = intent?.data
        if (incoming != null && incoming.host == appHost && incoming.path?.startsWith("/payment/") == true) {
            webView.loadUrl(incoming.toString())
        } else {
            webView.loadUrl(appOrigin)
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        val incoming = intent.data ?: return
        if (incoming.host == appHost && incoming.path?.startsWith("/payment/") == true) webView.loadUrl(incoming.toString())
    }

    private inner class SafeWebViewClient : WebViewClient() {
        override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
            val uri = request.url
            if (uri.scheme == "https" && uri.host == appHost) return false

            // 결제사·간편결제·외부 인증은 OS 브라우저 또는 설치된 결제 앱에서 처리합니다.
            return try {
                startActivity(Intent(Intent.ACTION_VIEW, uri))
                true
            } catch (_: Exception) {
                true
            }
        }
    }

    private inner class NativePaymentBridge {
        @JavascriptInterface
        fun onPaymentResult(payload: String) {
            runOnUiThread {
                Toast.makeText(this@MainActivity, "결제 결과를 확인하고 있습니다.", Toast.LENGTH_SHORT).show()
                // 운영 전 필수: 앱 서버의 인증된 결제 상태 API로 orderId를 재검증한 뒤 이용 권한을 갱신합니다.
                // JavaScript에서 전달된 payload 자체만으로 결제 성공 또는 이용 권한을 확정하지 않습니다.
            }
        }
    }

    override fun onBackPressed() {
        if (::webView.isInitialized && webView.canGoBack()) webView.goBack() else super.onBackPressed()
    }
}
