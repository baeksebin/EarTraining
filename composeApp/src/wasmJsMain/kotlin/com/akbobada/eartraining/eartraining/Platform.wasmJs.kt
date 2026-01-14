package com.akbobada.eartraining.eartraining

class WasmPlatform : Platform {
    override val name: String = "Web with Kotlin/Wasm"

    override val htmlPath: String = "/index.html"
}

actual fun getPlatform(): Platform = WasmPlatform()