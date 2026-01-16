package com.akbobada.eartraining.eartraining

import platform.UIKit.UIDevice

class IOSPlatform: Platform {
    override val name: String = UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion
}

actual fun getPlatform(): Platform = IOSPlatform()
actual fun applyPlatformSettings(webView: Any) { /* iOS는 설정할 게 없으므로 비워둠 */ }