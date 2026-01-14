// commonMain/src/commonMain/kotlin/.../Platform.kt
package com.akbobada.eartraining.eartraining

interface Platform {
    val name: String
    val htmlPath: String // 이 부분을 추가하세요
}

expect fun getPlatform(): Platform