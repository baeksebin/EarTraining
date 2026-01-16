package com.akbobada.eartraining.eartraining

import android.os.Bundle
import android.webkit.WebView
import android.view.View // ✅ 반드시 포함되어야 합니다
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        // 디버깅이 필요 없다면 제거해도 됩니다.
        // android.webkit.WebView.setWebContentsDebuggingEnabled(true)
        WebView.setWebContentsDebuggingEnabled(true)

        setContent {
            App()
        }
    }
}