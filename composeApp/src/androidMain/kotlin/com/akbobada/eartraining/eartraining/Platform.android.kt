// androidMain/src/androidMain/kotlin/.../Platform.android.kt
package com.akbobada.eartraining.eartraining

class AndroidPlatform : Platform {
    override val name: String = "Android ${android.os.Build.VERSION.SDK_INT}"

    // ✅ 안드로이드 웹뷰가 로컬 assets 폴더를 찾아가는 전용 주소입니다.
    override val htmlPath: String = "file:///android_asset/index.html"
}

actual fun getPlatform(): Platform = AndroidPlatform()