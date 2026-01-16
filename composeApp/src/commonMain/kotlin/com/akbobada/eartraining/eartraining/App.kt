package com.akbobada.eartraining.eartraining

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme // 추가
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import com.multiplatform.webview.web.WebView
import com.multiplatform.webview.web.rememberWebViewState

expect fun applyPlatformSettings(webView: Any)
// commonMain/src/commonMain/kotlin/.../App.kt
@Composable
fun App() {
    val platform = remember { getPlatform() }
    val webViewState = rememberWebViewState(platform.htmlPath)

    MaterialTheme { // 테마 적용 권장
        Box(modifier = Modifier.fillMaxSize()) {
            WebView(
                state = webViewState,
                modifier = Modifier.fillMaxSize(), // ✅ 반드시 추가
                onCreated = { nativeWebView ->
                    applyPlatformSettings(nativeWebView)
                }
            )
        }
    }
}