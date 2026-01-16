// androidMain/src/androidMain/kotlin/.../Platform.android.kt
package com.akbobada.eartraining.eartraining
import android.webkit.WebView
import android.webkit.WebSettings
import android.webkit.WebChromeClient
import android.graphics.Color
import android.view.View
class AndroidPlatform : Platform {
    override val name: String = "Android ${android.os.Build.VERSION.SDK_INT}"

    // ✅ 안드로이드 웹뷰가 로컬 assets 폴더를 찾아가는 전용 주소입니다.
    override val htmlPath: String = "file:///android_asset/index.html"
}

actual fun getPlatform(): Platform = AndroidPlatform()

// androidMain/.../Platform.android.kt
// androidMain/.../Platform.android.kt
actual fun applyPlatformSettings(webView: Any) {
    if (webView is android.webkit.WebView) {
        println("🎹 [FORCE CONFIG] 보안 엔진 개방")

        // 설정을 가장 먼저 적용
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            allowFileAccessFromFileURLs = true
            allowUniversalAccessFromFileURLs = true
            mediaPlaybackRequiresUserGesture = false
        }

        // ✅ [추가] 리로드 방지 및 캐시 삭제
        webView.clearCache(true)
        webView.setBackgroundColor(android.graphics.Color.WHITE)
    }
}